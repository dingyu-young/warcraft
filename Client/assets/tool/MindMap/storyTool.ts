import {AbsUI} from "../../framework/ui/UIBase";
import {showViewPrefab} from "../../script/export/showViewPrefab";
import {TableMindMap, TableMindMapGroup} from "./MindMapTool";


export default class ShowView extends AbsUI<showViewPrefab> {

    private mCurStorList: { [key: number]: TableMindMap } = {};

    private mCurChooseList: number[] = [];

    private mCurGrop: TableMindMapGroup = null;
    private chooseStepNum: number = 0;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

    }

    onShow(grop: TableMindMapGroup, stoy: { [key: number]: TableMindMap }) {
        this.chooseStepNum = 0;
        this.mCurGrop = grop;
        this.mCurStorList = stoy;
        this.ShowTalk(this.mCurStorList[grop.ID]);
        this.ui.btnList.children.forEach((node, index) => {
            node["index"] = index;
            node.on(cc.Node.EventType.TOUCH_END, this.clickChoose, this);
        });

        this.ui.btnReset.on(cc.Node.EventType.TOUCH_END, () => {
            this.ui.talkScrollView.content.destroyAllChildren();
            this.onShow(this.mCurGrop, this.mCurStorList);
        });

        this.ui.btnClose.on(cc.Node.EventType.TOUCH_END, () => {
            this.Close();
        });

        this.ui.labelStorId.string = "当前故事：" + grop.GroupId;
        this.ui.sumJinDu.string = "总进度：" + grop.MaxLen;
        this.ui.overLbl.string = "产生事件：" + 0;
        this.ui.curJinDu.string = "当前进度：" + this.chooseStepNum;
    }

    updateChooseList(chooseList: number[]) {
        this.ui.btnList.active = true;
        this.mCurChooseList = chooseList;
        this.ui.btnList.children.forEach((node, index) => {
            node.active = index < chooseList.length;
            if (index < chooseList.length) {
                node.getComponentInChildren(cc.Label).string = this.GetTxtConfig(this.mCurStorList[chooseList[index]].Text, true).showTxt;
            }
        });
    }

    clickChoose(evet: cc.Event.EventTouch) {
        let index = evet.target["index"];
        cc.log("选择： " + index);
        let chooseId = this.mCurChooseList[index];
        this.ShowTalk(this.mCurStorList[chooseId]);
        this.ui.btnList.active = false;
        if (this.GetIsShowBoom(chooseId)) {
            this.ui.curJinDu.string = "当前进度：" + "暴击";
            return;
        }
        if (this.IsAddPre(chooseId)) {
            this.GetAddProgressValue();
        }
    }

    ShowTalk(stroy: TableMindMap) {
        let newTxt = cc.instantiate(this.ui.txtItem);
        newTxt.active = true;
        this.ui.talkScrollView.content.addChild(newTxt);
        let config = this.GetTxtConfig(stroy.Text);
        newTxt.color = config.txtColor;
        newTxt.getComponent(cc.Label).string = config.showTxt;
        if (stroy.ChildIdList.length == 0) {

            this.ui.overLbl.string = "产生事件：" + stroy.EventID;
            if (stroy.IsSubSocre == 1) {
                this.ui.isReaward.string = `是否获得奖励：未获得`;
            } else {
                this.ui.isReaward.string = `是否获得奖励：获得`;
            }

        } else if (stroy.ChildIdList.length == 1) {
            let isChoose = this.isChoose(this.mCurStorList[stroy.ChildIdList[0]].Text);
            if (isChoose) {
                this.updateChooseList(stroy.ChildIdList);
            } else {
                setTimeout(() => {
                    this.ShowTalk(this.mCurStorList[stroy.ChildIdList[0]]);
                }, 300);
            }
        } else {
            this.updateChooseList(stroy.ChildIdList);
        }
        this.ui.talkScrollView.scrollToBottom(0.1);
    }

    //获得文本配置
    public GetTxtConfig(txt: string, isChoose: boolean = false): { txtColor: cc.Color, showTxt: string } {
        let arrTxt: string[] = txt.split("|");
        let isSelf: boolean = arrTxt[0] == "0";
        let showTxt: string = isChoose ? "" : "- ";
        let isbrief: boolean = false;
        let curTxt: string = arrTxt[1] ? arrTxt[1] : arrTxt[0];
        for (let i = 0; i < curTxt.length; i++) {
            if (curTxt[i] == "｛" || curTxt[i] == "{") {
                isbrief = true;
                continue;
            }
            if ((curTxt[i] == "｝" || curTxt[i] == "}") && isbrief) {
                if (isChoose) {
                    break;
                } else {
                    isbrief = false;
                    continue;
                }

            }
            if (isbrief && !isChoose) {
                continue;
            }
            showTxt = showTxt + curTxt[i];
        }
        showTxt = showTxt.split("_")[0];
        let txtColor: cc.Color = isSelf ? cc.color(254, 80, 82) : cc.color(80, 255, 212);
        return {
            txtColor,
            showTxt
        };
    }

    //是否添加进度
    public IsAddPre(id: number) {
        let txt: string = this.mCurStorList[id].Text;
        let isGet: string = txt.split("_")[1];
        return isGet == "1";
    }

    //获得累加的进度值
    public GetAddProgressValue() {
        this.chooseStepNum++;
        this.ui.curJinDu.string = "当前进度：" + this.chooseStepNum;
    }

    //是否暴击
    public GetIsShowBoom(id: number): boolean {
        let storyData: TableMindMap = this.mCurStorList[id];
        if (storyData.ChildIdList.length == 1) {
            storyData = this.mCurStorList[storyData.ChildIdList[0]];
            let isChoose = this.isChoose(storyData.Text);
            if (isChoose) {
                return false;
            }
            return this.GetIsShowBoom(storyData.ID);
        }
        let last: boolean = storyData.ChildIdList.length == 0 && storyData.IsSubSocre == 0;
        return (this.chooseStepNum < (this.mCurGrop.MaxLen - 1)) && last;
    }

    public isChoose(txt: string) {
        return txt.indexOf("｛") >= 0 || txt.indexOf("{") >= 0;
    }

    protected get uiPath(): string {
        return showViewPrefab.uiPath;
    }

    protected initUI() {

    }

    protected OnClick(btnName: string, btnNode: cc.Node) {

    }

    // update (dt) {}
}
