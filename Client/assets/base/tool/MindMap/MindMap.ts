import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {MindBox} from "./MindBox";
import {MindLine} from "./MindLine";
import {MindManager} from "./MindManager";
import List from "../../../script/list/List";
import {MindMapTool} from "./MindMapTool";

export enum ColorEnum {
    BlueColor1 = 0,
    BlueColor2 = 1,
    RedColor1 = 2,
    RedColor2 = 3,

}

@ccclass()
export class MindMap extends cc.Component {

    @property(cc.Node)
    prefabBox: cc.Node = null;

    @property(cc.Node)
    prefabLine: cc.Node = null;

    @property(cc.Node)
    prefabScene: cc.Node = null;

    @property(cc.EditBox)
    edit: cc.EditBox = null;

    @property(cc.Label)
    autoLabel: cc.Label = null;

    @property(cc.Node)
    btn_scene: cc.Node = null;

    @property(cc.Node)
    view_content: cc.Node = null;

    @property(cc.Label)
    lb_tip: cc.Label = null;

    @property(cc.Node)
    view: cc.Node = null;

    @property(cc.Node)
    introduce:cc.Node = null;

    listView: List;

    color: cc.Color[] = [cc.color(127, 171, 203), cc.color(0, 150, 255),
        cc.color(164, 52, 52), cc.color(255, 0, 0)]


    sceneNode: cc.Node = null;
    currentId: number = -1;

    sceneNodeDict: { [key: string]: cc.Node } = {};

    chooseBox: MindBox = null;

    rootBoxList: MindBox[] = [];
    allBoxlist: MindBox[] = [];

    mgr: MindManager = MindManager.ins();
    tool: MindMapTool = new MindMapTool(this);

    mindBoxIdList = [];

    getBoxId() {
        let id = this.mindBoxIdList[this.currentId] || this.currentId * 1000;
        id += 1;
        this.mindBoxIdList[this.currentId] = id;
        return id
    }

    get currentScene() {
        return this.sceneNodeDict[this.currentId];
    }

    protected onLoad(): void {
        this.sceneNode = this.node.getChildByName("scene");
        this.node.on(cc.Node.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouch, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onHideEdit, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        this.prefabLine.active = this.prefabBox.active = this.edit.node.active = false;
        this.autoLabel.node.opacity = 0;
        this.edit.node.zIndex = 99;
        this.lb_tip.node.zIndex = 99;
        this.mgr.ui = this;
        this.listView = this.view.getComponent(List);
        this.listView.SetItemUpdateFunc(this.UpdateItem.bind(this));
        this.listView.node.zIndex = 99;
        this.listView.node.active = false;
        this.introduce.zIndex = 99;
        this.introduce.active = false;
    }


    protected start(): void {
        this.tool.init();
    }

    //添加父节点
    onAddParent() {
        let newBox = new MindBox(this, null);
        if (!this.rootBoxList[this.currentId]) {
            this.rootBoxList[this.currentId] = newBox;
            this.tool.groupMap[this.currentId].ID = newBox.id;
        } else {
            this.mgr.addBox(newBox);
        }
    }


    //添加子节点
    onAddChild() {
        if (this.chooseBox) {
            let newBox = new MindBox(this, this.chooseBox);
            let newline = new MindLine(this, this.chooseBox, newBox);
            this.chooseBox.addLine(newline);
            this.mgr.addBox(newBox);
        }
    }

    onAddLine() {
        let newLine = new MindLine(this, null, null);
    }

    OnOpenScene() {
        this.listView.node.active = !this.listView.node.active;
        if (this.listView.node.active) {
            this.listView.numItems = this.tool.groupList.length;
        }
    }

    UpdateItem(item: cc.Node, list_id: number) {
        let id = this.tool.groupList[list_id];
        let data = this.tool.getGroupInfo(id);
        item.getChildByName("name").getComponent(cc.Label).string = (list_id) + ":  " + data.Name;
        let toggle = item.getChildByName("toggle").getComponent(cc.Toggle);
        let toggle2 = item.getChildByName("toggle2").getComponent(cc.Toggle);
        let edit = item.getChildByName("edit");
        let edit1 = item.getChildByName("edit2");
        let reward = item.getChildByName("reward").getComponent(cc.EditBox);
        let content = item.getChildByName("content").getComponent(cc.Label);
        content.string = data.Content ? data.Content : "";
        reward.string = data.RewardId ? data.RewardId + "" : '';
        toggle.isChecked = data.isChoose;
        toggle2.isChecked = data.isTheme;
        toggle.node.targetOff(this);
        toggle2.node.targetOff(this);
        edit.targetOff(this);
        edit1.targetOff(this);
        reward.node.targetOff(this);
        edit.on("click",()=>{
            this.view.active = false;
            this.loadScene(id);
        },this)
        edit1.on("click",()=>{
            this.edit.node.active = true;
            this.edit.string = content.string;
            this.edit["contents"] = content;
            this.edit["group"] = id;
        },this)
        toggle.node.on("click", () => {
            this.tool.groupMap[id].isChoose = toggle.isChecked;
        }, this)
        toggle2.node.on("click", () => {
            this.tool.groupMap[id].isTheme = toggle2.isChecked;
        }, this)
        reward.node.on("editing-did-ended",()=>{
            this.tool.groupMap[id].RewardId = reward.string;
        },this)
    }

    //创建新场景
    onAddNewScene(event, id = null) {
        let isNew = false;
        if (!id) {
            id = this.tool.groupList.length;
            isNew = true;
        }
        let node = new cc.Node("scene" + id);
        node.addChild(new cc.Node("lines"));
        node.setParent(this.node);
        this.sceneNodeDict[id] = node;
        this.btn_scene.getComponentInChildren(cc.Label).string = "场景" + id;
        this.chooseBox = null;
        this.moveLine = null;
        if (isNew) {
            if (this.currentScene)
                this.currentScene.active = false;
            this.currentId = id;
            let newbox = new MindBox(this, null);
            this.rootBoxList[id] = newbox;
            newbox.groupId = id;
            newbox.resetId();
            this.tool.addScene(id, newbox.id);
        }
    }

    getSceneBtnLable(index: number): cc.Label {
        return this.view_content.children[index].getComponentInChildren(cc.Label);
    }


    //鼠标滚轮
    onMouseWheel(event) {
        let scrollY = event.getScrollY();
        if (scrollY > 0) {
            this.onBig();
        } else {
            this.onSmall();
        }
    }

    private isTouch: boolean = false;

    onTouch() {
        this.isTouch = true;
    }

    //移动
    onMove(event) {
        if (this.isTouch && this.currentScene) {
            let delta = event.getDelta();
            this.currentScene.x += delta.x;
            this.currentScene.y += delta.y;
        }
    }

    editBox: MindBox = null;

    onEdit(box: MindBox) {
        this.onHideEdit();
        this.editBox = box;
        this.edit.node.setPosition(this.node.convertToNodeSpaceAR(box.node.convertToWorldSpaceAR(cc.Vec2.ZERO)));
        this.edit.node.active = true;
        this.edit.string = box.value;
    }

    //输入结束
    onHideEdit() {
        this.introduce.active = false;
        this.view.active = !!this.edit["contents"];
        if (this.editBox) {
            this.edit.string && this.editBox.resetWidthHeight(this.getStringWidthHeight(this.edit.string));
            this.editBox.setVale(this.edit.string);
            this.edit.string = "";
        } else if (this.edit["scene"]) {
            let scene: cc.Label = this.edit["scene"];
            scene.string = this.edit.string;
            this.tool.groupMap[this.currentId].Name = this.edit.string;
            this.edit.string = "";
            this.edit["scene"] = null;
        } else if (this.edit["contents"]){
            let label = this.edit["contents"];
            label.string = this.edit.string;
            let id = this.edit["group"];
            this.tool.groupMap[id].Content = this.edit.string;
            this.edit.string = "";
            this.edit["contents"] = null;
            this.edit["group"] = null;
        }
        this.edit.node.active = false;
        this.editBox = null;
        this.isTouch = false;
    }

    onEditScene() {
        if (this.isCtrl) {
            this.edit["scene"] = this.btn_scene.getComponentInChildren(cc.Label);
            this.edit.node.active = true;
            this.edit.string = this.btn_scene.getComponentInChildren(cc.Label).string;
        }
    }

    onShowIntroduce(){
        this.introduce.active = !this.introduce.active;
    }
    //场景放大
    onBig() {
        this.currentScene.scale += 0.1;
    }

    //场景缩小
    onSmall() {
        if (this.currentScene.scale >= 0.4) {
            this.currentScene.scale -= 0.1;
        }
    }

    onChangeColor(box: MindBox) {
        if (this.chooseBox == box) {
            return
        }
        this.chooseBox && this.chooseBox.node && this.chooseBox.setColor(this.color[ColorEnum.BlueColor1]);
        box.setColor(this.color[ColorEnum.BlueColor2]);
        this.chooseBox = box;
    }

    lineBox: MindBox = null;

    //连接两个box
    onLineTwoBox(box: MindBox) {
        if (!this.lineBox) {
            this.lineBox = box;
        } else if (box != this.lineBox) {
            let line = this.boxLineBox(this.lineBox, box);
            if (line) {
                this.mgr.addLine(line);
            }
            this.lineBox = null;
        }
    }

    boxLineBox(box1: MindBox, box2: MindBox) {
        if (box1.checkLoop(box2)) {
            cc.error("出现循环!!!!!!!!!!!!!!!!");
            this.showTip("出现循环!!!!!!!!!!!!!!!!");
            return null;
        }
        let line = new MindLine(this, box1, box2);
        box1.addLine(line);
        line.resetPos();
        box1.addChild(box2, false);
        return line
    }

    showTip(tip: string) {
        this.lb_tip.string = tip;
        this.lb_tip.node.active = true;
        this.lb_tip.node.opacity = 255;
        this.lb_tip.node.setPosition(0, 0);
        cc.tween(this.lb_tip.node)
            .to(0.5, {position: cc.v3(0, 100, 0)})
            .to(0.5, {opacity: 0})
            .start();
    }

    //
    isCtrl: boolean = false;//文本输入状态
    isDelete: boolean = false;//删除状态
    isAlt: boolean = false;//连线状态
    onKeyDown(event) {
        this.isDelete = false;
        switch (event.keyCode) {
            case cc.macro.KEY.ctrl:
                this.isCtrl = true;
                break;
            case cc.macro.KEY.Delete:
                this.isDelete = true;
                break;
            case cc.macro.KEY.alt:
                this.isAlt = true;
                break;
            case cc.macro.KEY.z:
                if (this.isCtrl) {
                    this.mgr.preStep();
                }
                break;
            case cc.macro.KEY.s:
                if (this.isCtrl) {
                    this.onSave();
                }
                break;
        }
    }

    onKeyUp(event) {
        this.isDelete = false;
        this.isAlt = false;
        switch (event.keyCode) {
            case cc.macro.KEY.n://新的父节点
                this.onAddParent();
                break;
            case cc.macro.KEY.c://新的子节点
                this.onAddChild();
                break;
            case cc.macro.KEY.l://新的线条
                this.onAddLine();
                break;
            case cc.macro.KEY.r://事件扣分
                this.boxChangeState();
                break;
            case cc.macro.KEY.alt:
                this.lineBox = null;
                break;
            case cc.macro.KEY.ctrl:
                this.isCtrl = false;
                break;
        }
    }

    //使box减分
    boxChangeState() {
        if (this.chooseBox) {
            this.chooseBox.isSubSocre = !this.chooseBox.isSubSocre;
            this.chooseBox.setColor(this.color[ColorEnum.BlueColor2]);
        }
    }

    getStringWidthHeight(str: string) {
        if (str.length < 5) {
            return cc.v2(120, 25);
        } else {
            this.autoLabel.overflow = cc.Label.Overflow.NONE;
            this.autoLabel.string = str;
            this.autoLabel["_forceUpdateRenderData"]();
            if (this.autoLabel.node.width > 200) {
                this.autoLabel.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
                this.autoLabel.node.width = 200;
                this.autoLabel["_forceUpdateRenderData"]();
                // if (this.autoLabel.node.height > 150) {
                //     return cc.v2(200, 150);
                // }
                return cc.v2(200, this.autoLabel.node.height);
            }
            return cc.v2(this.autoLabel.node.width, 25);


        }
    }

    //线条移动
    moveLine: MindLine = null;

    //存储和读取
    //保存
    onSave() {
        this.tool.saveScene()
        this.showTip("保存成功")
    }

    onDownload() {
        this.tool.download()
    }

    onDownloadOne(){
        this.tool.saveScene();
        this.tool.downloadOne(this.currentId);
    }

    onDownloadChoose(){
        this.tool.downChoose()
    }

    onDownGroup(){
        this.tool.downGroup();
    }

    onResetPos(){
        let box = this.rootBoxList[this.currentId];
        let func = (box:MindBox)=>{
            let children = box.children;
            for (let i = 0; i < children.length; i++) {
                let pos = box.getChildCurrentPos(i);
                children[i].setPos(pos);
                func(children[i])
            }
            box.resetLine();
            // for (let i = 0; i < box.lines.length; i++) {
            //     box.lines[i].resetPos();
            // }
        }
        func(box)
    }

    async loadScene(groupId) {
        if (Number(groupId) == this.currentId) {
            return;
        }
        this.mgr.changeScene();
        if (this.currentId >= 0) {
            this.sceneNodeDict[this.currentId].active = false;
            this.tool.saveScene();
        }
        let scene = this.sceneNodeDict[groupId];
        this.currentId = Number(groupId);
        let groupInfo = this.tool.getGroupInfo(groupId);
        if (scene) {
            scene.active = true;
            this.btn_scene.getComponentInChildren(cc.Label).string = groupInfo.Name;
            return;
        }
        this.onAddNewScene(null, groupId);
        this.btn_scene.getComponentInChildren(cc.Label).string = groupInfo.Name;

        let boxmap = {};
        let id = groupInfo.ID;
        let config = this.tool.getStoryInfo(id);
        if(!config){
            await this.tool.loadStroy(groupId);
            config = this.tool.getStoryInfo(id);
            if(!config){
                cc.error("组id: "+groupId+" 未找到剧情文件");
                this.showTip("组id: "+groupId+" 未找到剧情文件");
                return;
            }
        }
        let box = new MindBox(this, null);
        box.id = config.ID;
        this.mindBoxIdList[this.currentId] = box.id;

        box.groupId = config.GroupId;
        box.isSubSocre = config.IsSubSocre;
        box.setVale(config.Text);
        let children = config.ChildIdList;
        this.rootBoxList[this.currentId] = box;
        box.resetWidthHeight(this.getStringWidthHeight(config.Text));
        let pos = config.PosX ? true : false;
        if (pos) {
            box.node.setPosition(config.PosX, config.PosY);
        }
        boxmap[config.ID] = box;
        this.createSceneBox(box, children, boxmap);
        box.setColor(this.color[ColorEnum.BlueColor1]);

    }

    createSceneBox(box: MindBox, children: number[], boxmap) {
        if (children.length > 0) {
            for (let i = 0; i < children.length; i++) {
                let config = this.tool.getStoryInfo(children[i]);
                let newbox: MindBox;
                if (boxmap[config.ID]) {
                    newbox = boxmap[config.ID];
                } else {
                    newbox = new MindBox(this, null)
                }
                newbox.id = config.ID;
                if(newbox.id > this.mindBoxIdList[this.currentId]){
                    this.mindBoxIdList[this.currentId] = newbox.id;
                }
                newbox.groupId = config.GroupId;
                newbox.isSubSocre = config.IsSubSocre;
                let text = config.Text;
                if (config.EventID) {
                    text += (";" + config.EventID);
                }
                newbox.setVale(text);
                let pos = config.PosX ? true : false;
                if (pos) {
                    newbox.node.setPosition(config.PosX, config.PosY);
                }
                if (box.children.indexOf(newbox) == -1) {
                    let line = new MindLine(this, box, newbox);
                    box.addLine(line);
                    box.addChild(newbox, !pos);
                }
                let newChildren = config.ChildIdList;
                boxmap[config.ID] = newbox;
                newbox.resetWidthHeight(this.getStringWidthHeight(text));

                this.createSceneBox(newbox, newChildren, boxmap);
            }
        }
        box.resetLine();
    }
}
