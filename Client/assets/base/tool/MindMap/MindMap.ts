import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {MindBox} from "./MindBox";
import {MindLine} from "./MindLine";
import {ComTool} from "../../ComTool";
import {TableMindMap, TableManager, TableMindMapGroup} from "../../manager/TableManager";

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
    lb_tip: cc.Label = null

    color: cc.Color[] = [cc.color(127, 171, 203), cc.color(0, 150, 255),
        cc.color(164, 52, 52), cc.color(255, 0, 0)]


    sceneNodeList: cc.Node[] = [];
    currentId: number = 0;

    chooseBox: MindBox = null;

    rootBoxList: MindBox[] = [];
    allBoxlist: MindBox[] = [];

    get currentScene() {
        return this.sceneNodeList[this.currentId];
    }

    protected onLoad(): void {
        this.sceneNodeList.push(this.node.getChildByName("scene"));
        this.node.on(cc.Node.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouch, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onHideEdit, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        this.prefabLine.active = this.prefabBox.active = this.edit.node.active = false;
        this.autoLabel.node.opacity = 0;
        this.btn_scene.on("click", this.changScene.bind(this, 0), this);
        this.InitBoxMap();
        this.edit.node.zIndex = 99;
        this.lb_tip.node.zIndex = 99;
    }


    protected start(): void {
    }

    //添加父节点
    onAddParent() {
        let newBox = new MindBox(this, null);
        if (!this.rootBoxList[this.currentId]) {
            this.rootBoxList[this.currentId] = newBox;
        }
    }


    //添加子节点
    onAddChild() {
        if (this.chooseBox) {
            let newBox = new MindBox(this, this.chooseBox);
            let newline = new MindLine(this, this.chooseBox, newBox);
            this.chooseBox.addLine(newline);
        }
    }

    onAddLine() {
        let newLine = new MindLine(this, null, null);
    }

    //创建新场景
    onAddNewScene() {
        let node = new cc.Node("scene" + this.sceneNodeList.length + 1);
        node.addChild(new cc.Node("lines"));

        node.setParent(this.node);
        this.sceneNodeList.push(node);
        this.changScene(this.sceneNodeList.length - 1 );
        let btn = cc.instantiate(this.btn_scene);
        btn.setParent(this.view_content);
        btn.targetOff(this);
        btn.on("click", this.changScene.bind(this, this.currentId))
        btn.getComponentInChildren(cc.Label).string = "场景" + (this.sceneNodeList.length);
        this.chooseBox = null;
        this.moveLine = null;
    }

    getSceneBtnLable(index:number):cc.Label{
        return this.view_content.children[index].getComponentInChildren(cc.Label);
    }

    changScene(index: number) {
        if(this.isCtrl){
            this.edit.node.active = true;
            this.editBox = null;
            this.edit["scene"] = this.getSceneBtnLable(index);
            return;
        }
        for (let i = 0; i < this.sceneNodeList.length; i++) {
            this.sceneNodeList[i].active = false;
        }
        this.sceneNodeList[index].active = true;
        this.currentId = index;
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
        if (this.isTouch) {
            let delta = event.getDelta();
            this.currentScene.x += delta.x;
            this.currentScene.y += delta.y;
        }
    }

    editBox: MindBox = null;

    onEdit(box: MindBox) {
        this.editBox = box;
        this.edit.node.setPosition(this.node.convertToNodeSpaceAR(box.node.convertToWorldSpaceAR(cc.Vec2.ZERO)));
        this.edit.node.active = true;
        this.edit.string = box.value;
    }

    //输入结束
    onHideEdit() {
        if (this.editBox) {
            this.edit.string && this.editBox.resetWidthHeight(this.getStringWidthHeight(this.edit.string));
            this.editBox.setVale(this.edit.string);
            this.edit.string = "";
        }else if(this.edit["scene"]){
            let scene:cc.Label = this.edit["scene"];
            scene.string = this.edit.string;
            this.edit.string = "";
            this.edit["scene"] = null;
        }
        this.edit.node.active = false;
        this.editBox = null;
        this.isTouch = false;
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
            if (this.lineBox.checkLoop(box)) {
                cc.error("出现循环!!!!!!!!!!!!!!!!");
                this.showTip("出现循环!!!!!!!!!!!!!!!!");
                return;
            }
            let line = new MindLine(this, this.lineBox, box);
            this.lineBox.addLine(line);
            line.resetPos();
            this.lineBox.addChild(box, false);
            this.lineBox = null;
        }
    }

    showTip(tip:string) {
        this.lb_tip.string = tip;
        this.lb_tip.node.active = true;
        this.lb_tip.node.opacity = 255;
        this.lb_tip.node.setPosition(0,0);
        cc.tween(this.lb_tip.node)
            .to(0.5,{position:cc.v3(0,100,0)})
            .to(0.5,{opacity:0})
            .start();
    }

    //
    isCtrl: boolean = false;//文本输入状态
    isDelete: boolean = false;//删除状态
    isAlt: boolean = false;//连线状态
    onKeyDown(event) {
        this.isCtrl = false;
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
        }
    }

    onKeyUp(event) {
        this.isCtrl = false;
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
            case cc.macro.KEY.r://新的线条
                this.boxChangeState();
                break;
            case cc.macro.KEY.alt:
                this.lineBox = null;
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
                if (this.autoLabel.node.height > 150) {
                    return cc.v2(200, 150);
                }
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
        let text1 = this.getMindMapFile();
        ComTool.SetLocalItem("mindmap", text1);
        let text2 = this.getMindGroupFile();
        ComTool.SetLocalItem("mindmapgroup", text2);
        let posmap = {};
        for (let i = 0; i < this.allBoxlist.length; i++) {
            let box = this.allBoxlist[i];
            posmap[box.id] = [box.node.x << 0, box.node.y << 0];
        }
        ComTool.SetLocalItem("mindmappos", posmap);

        cc.log("保存成功")
    }

    onDownload() {
        let text1 = this.getMindMapFile();
        ComTool.saveForBrowser(text1, "mindmap", ".txt");
        let text2 = this.getMindGroupFile();
        ComTool.saveForBrowser(text2, "mindmapgroup", ".txt");
        let posmap = {};
        for (let i = 0; i < this.allBoxlist.length; i++) {
            let box = this.allBoxlist[i];
            posmap[box.id] = [box.node.x << 0, box.node.y << 0];
        }
        ComTool.saveForBrowser(JSON.stringify(posmap), "mindmappos", ".txt");

        cc.log("下载成功")

    }

    getMindMapFile() {
        let idList = [];
        let text = "ID:INT\tGroupId:INT\tChildIDList:ARRAYDATA\tEventID:INT\tIsSubSocre:BOOL\tText:STRING\r\n";
        text += "id\t分组id\t下一组id\t触发事件类型id\t是否扣分\t对话内容\r\n";
        this.allBoxlist.sort((a,b)=>{
            return a.groupId - b.groupId;
        })
        for (let i = 0; i < this.allBoxlist.length; i++) {
            let box = this.allBoxlist[i];
            if (!box || (box.parents.length == 0 && box.children.length == 0)) {
                continue;
            }
            if (idList.indexOf(box.id) > -1) {
                continue;
            }
            idList.push(box.id);
            let nextIdlist = [];
            for (let j = 0; j < box.children.length; j++) {
                nextIdlist.push(box.children[j].id);
            }
            let isSubsocre = box.isSubSocre ? 1 : 0;
            let [content, event] = box.value.split(";");
            let eventid = event ? parseInt(event) : 0;
            text += `${box.id}\t${JSON.stringify(box.groupId)}\t${JSON.stringify(nextIdlist)}\t${eventid}\t${isSubsocre}\t${content}\r\n`;
        }
        return text;
    }

    getMindGroupFile() {
        //下载组表
        let text2 = "GroupId:INT\tID:INT\tName:STRING\r\n";
        text2 += "分组id\tmindmap ID\t分组名称\r\n";
        for (let i = 0; i < this.rootBoxList.length; i++) {
            if (!this.rootBoxList[i]) {
                cc.error("不存在组:", this.rootBoxList);
                continue;
            }
            let name = "场景" + i;
            let label = this.getSceneBtnLable(i);
            if(label){
                name = label.string;
            }

            text2 += `${i}\t${this.rootBoxList[i].id}\t${name}\r\n`;
        }
        return text2;
    }

    async InitBoxMap() {
        // TableManager.Init();
        await ComTool.Await(1);
        if (!TableMindMapGroup.table || !TableMindMap.table) {
            if (!ComTool.GetLocalItem("mindmap", "")) {
                return;
            } else {//读取浏览器缓存
                let mindmap = ComTool.GetLocalItem("mindmap", "");
                let mindGroup = ComTool.GetLocalItem("mindmapgroup", "");
                TableManager.LoadTable(mindmap, "mindmap")
                TableManager.LoadTable(mindGroup, "mindmapgroup");
                TableMindMap.Init(TableManager.tables["mindmap"]);
                TableMindMapGroup.Init(TableManager.tables["mindmapgroup"]);
            }
        }
        let maxId = 0;
        let boxmap = {};
        let posmap = ComTool.GetLocalItem("mindmappos", {});
        if (!posmap) {
            posmap = {};
        }
        let fun = (box: MindBox, children: number[]) => {
            if (children.length > 0) {
                for (let i = 0; i < children.length; i++) {
                    let config = TableMindMap.GetConfig(children[i]);
                    let newbox: MindBox;
                    if (boxmap[config.ID]) {
                        newbox = boxmap[config.ID];
                    } else {
                        newbox = new MindBox(this, null)
                    }
                    newbox.id = config.ID;
                    newbox.groupId = config.GroupId;
                    newbox.isSubSocre = config.IsSubSocre;
                    let text = config.Text;
                    if (config.EventID) {
                        text += (";" + config.EventID);
                    }
                    newbox.setVale(text);
                    let pos = posmap[config.ID];
                    if (pos) {
                        newbox.node.setPosition(pos[0], pos[1]);
                    }

                    if (box.children.indexOf(newbox) == -1) {
                        let line = new MindLine(this, box, newbox);
                        box.addLine(line);
                        box.addChild(newbox, !pos);
                    }
                    let newChildren = config.ChildIDList;
                    if (config.ID > maxId) {
                        maxId = config.ID;
                    }
                    newbox.intId(maxId);
                    boxmap[config.ID] = newbox;
                    newbox.resetWidthHeight(this.getStringWidthHeight(text));

                    fun(newbox, newChildren);
                }
            }
            box.resetLine();
        }
        for (let key in TableMindMapGroup.table) {
            let groupconfig = TableMindMapGroup.GetConfig(key);
            let config = TableMindMap.GetConfig(groupconfig.ID);
            if (!config || config.GroupId != groupconfig.GroupId) {
                cc.error("发现组id不一致,请查明原因", groupconfig, config);
                continue;
            }
            if (!this.sceneNodeList[groupconfig.GroupId]) {
                this.onAddNewScene();
            }
            let label = this.getSceneBtnLable(groupconfig.GroupId);
            if(label){
                label.string = groupconfig.Name || "场景" + (groupconfig.GroupId +1);
            }
            let box = new MindBox(this, null);
            box.id = config.ID;
            box.groupId = config.GroupId;
            box.isSubSocre = config.IsSubSocre;
            box.setVale(config.Text);
            let children = config.ChildIDList;
            if (config.ID > maxId) {
                maxId = config.ID;
            }
            this.rootBoxList[this.currentId] = box;
            boxmap[config.ID] = box;
            box.resetWidthHeight(this.getStringWidthHeight(config.Text));
            let pos = posmap[config.ID];
            if (pos) {
                box.node.setPosition(pos[0], pos[1]);
            }
            fun(box, children);
            box.setColor(this.color[ColorEnum.BlueColor1]);
            await ComTool.Await(0.1);
        }
        boxmap = null;

    }
}