import {ColorEnum, MindMap} from "./MindMap";
import {MindLine} from "./MindLine";

var SUBCOROL1 = cc.color(164, 52, 52);
var SUBCOROL2 = cc.color(255, 0, 0);
var mindBoxID = 0;

export class MindBox {
    node: cc.Node;//当前节点
    parents: MindBox[] = [];//父节点
    children: MindBox[] = [];//子节点
    lines: MindLine[] = [];//线列表
    value: string = "";
    lb_value: cc.Label = null;

    id: number = 0;
    groupId: number = 0;

    cpt: MindMap;//组件

    isSubSocre: boolean = false;

    intId(id: number) {
        if (id > mindBoxID) {
            mindBoxID = id;
        }
    }

    constructor(cpt: MindMap, parent: MindBox) {
        this.cpt = cpt;
        this.node = cc.instantiate(cpt.prefabBox);
        this.node.active = true;
        this.id = ++mindBoxID;
        this.groupId = cpt.currentId;
        this.lb_value = this.node.getChildByName("label").getComponent(cc.Label);
        if (!parent) {
            this.parents = [];
            this.node.setParent(cpt.currentScene)
            this.node.setPosition(0, cc.winSize.height / 2 - 200 - cpt.currentScene.y);
        } else {
            this.parent = parent;
            this.node.setParent(cpt.currentScene);
            parent.addChild(this);
        }
        cpt.allBoxlist.push(this);
        this.node.targetOff(this);
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchuStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchuMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.MOUSE_UP, this.omMouseUp, this);
    }

    set parent(box: MindBox) {
        if (this.parents.indexOf(box) == -1) {
            this.parents.push(box);
        }
    }


    //添加子节点
    addChild(child: MindBox, isChangPos: boolean = true) {
        if (this.children.indexOf(child) == -1) {
            this.children.push(child);
            if (isChangPos) {
                let pos = this.getChildCurrentPos(this.children.length - 1);
                child.setPos(pos);
            }
            child.parent = this;
            let isChoose = this.node.color["_val"] == this.cpt.color[ColorEnum.BlueColor2]["_val"];
            this.setColor(isChoose ? this.cpt.color[ColorEnum.BlueColor2] : this.cpt.color[ColorEnum.BlueColor1]);
        }
    }

    addLine(line: MindLine) {
        if (this.lines.indexOf(line) == -1) {
            this.lines.push(line);
        }
    }

    deletChild(child: MindBox) {
        if (!child) {
            return;
        }
        let index = this.children.indexOf(child);
        if (index > -1) {
            this.children.splice(index, 1);
        }
    }

    deleteParent(box: MindBox) {
        let index = this.parents.indexOf(box);
        if (index > -1) {
            this.parents.splice(index, 1)
        }
    }

    deletSelf() {
        let index = this.cpt.allBoxlist.indexOf(this);
        if (index > -1) {
            this.cpt.allBoxlist.splice(index, 1);
        }
        for (let i = 0; i < this.lines.length;) {
            this.lines[i].deletSelf();
        }
        for (let i = 0; i < this.parents.length;) {
            let line = this.parents[i].getLineByBox(this);
            if (line) {
                line.deletSelf();
            }
        }
        cc.log("删除节点:", this.id, this.value);
        this.parents = null;
        this.children = null;
        this.lines = [];
        this.node.active = false;
        this.node = null;
        this.cpt = null;
        this.id = null;
        this.value = null;
        this.lb_value = null;
        this.isMove = false;
        this.isClick = false;
    }

    getLineByBox(box: MindBox) {
        for (let i = 0; i < this.lines.length; i++) {
            let line = this.lines[i];
            if (line.child == box) {
                return line;
            }
        }
    }

    resetLine() {
        for (let i = 0; i < this.lines.length; i++) {
            this.lines[i].resetPos();
        }
        if (this.parents.length > 0) {
            this.parents.forEach(value1 => value1.resetLine());
        }
    }

    getLineTopPos(): cc.Vec2 {
        return this.node.convertToWorldSpaceAR(cc.v2(0, this.node.height / 2))
    }

    getLineDownPos(): cc.Vec2 {
        return this.node.convertToWorldSpaceAR(cc.v2(0, -this.node.height / 2))
    }

    getChildCurrentPos(index: number) {
        let x = 0;
        if (index > 0) {
            //                   5  3  1  0  2  4  6
            let spac = Math.floor(index / 2) + 1;
            x = index % 2 != 0 ? spac * -180 : (index / 2) * 180;
        }
        return this.node.convertToWorldSpaceAR(cc.v2(x, -200));
    }

    setPos(pos: cc.Vec2) {
        this.node.setPosition(this.node.parent.convertToNodeSpaceAR(pos));
    }

    //设置内容
    setVale(val: string) {
        if (val) {
            this.value = val;
        }
        this.lb_value.string = val;
    }

    resetWidthHeight(vec: cc.Vec2) {
        this.lb_value.node.width = Math.max(120, vec.x + 25);
        this.lb_value["_forceUpdateRenderData"]();
        this.node.getChildByName("label").height = vec.y;
        this.node.height = Math.max(50, vec.y + 25);
        this.node.width = Math.max(120, vec.x + 25);
        this.resetLine();
    }

    setColor(color: cc.Color) {
        let mColor = color;
        if (this.isSubSocre) {
            if (color["_val"] == this.cpt.color[ColorEnum.BlueColor1]["_val"]) {
                mColor = this.cpt.color[ColorEnum.RedColor1];
            } else if (color["_val"] == this.cpt.color[ColorEnum.BlueColor2]["_val"]) {
                mColor = this.cpt.color[ColorEnum.RedColor2];
            }
        }
        if (this.node) this.node.color = mColor;
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].setColor(color);
        }
    }


    isClick: boolean = false;
    isMove: boolean = false;

    onTouchuStart() {
        if (this.cpt.isAlt) {
            this.cpt.onLineTwoBox(this);
            this.isMove = false;
        } else {
            this.isClick = true;
        }
    }

    onTouchuMove(event) {
        if (this.isClick) {
            let delta = event.getDelta();
            this.node.x += delta.x;
            this.node.y += delta.y;
            this.isMove = true;
        }
    }

    clicktime: number = 0;

    onTouchEnd() {
        if (!this.isClick) {
            return
        }

        if (this.cpt.isDelete) {
            this.deletSelf();
            return;
        }
        let now = new Date().getTime();
        let isquickclick = false;
        if (!this.clicktime) {
            this.clicktime = now;
        }else {
            isquickclick = now - this.clicktime < 300;
            if(!isquickclick){
                this.clicktime = now;
            }
        }
        if (this.isMove) {
            this.resetLine();
        } else {
            this.cpt.onChangeColor(this);
        }
        if (this.cpt.isCtrl || isquickclick) {
            this.clicktime = 0;
            this.cpt.onEdit(this);
            this.lb_value.string = "";
        }
        this.isMove = false;
        this.isClick = false;
    }

    deleteLine(line: MindLine) {
        let index = this.lines.indexOf(line);
        if (index > -1) {
            this.lines.splice(index, 1);
        }
    }

    omMouseUp() {
        if (this.cpt.moveLine) {
            let line = this.cpt.moveLine;
            if (line.moveType == 1 && line.parent != this) {//移动线头,添加子节点
                if (this.checkLoop(line.child)) {
                    this.cpt.showTip("移动会出现循环!!!!!");
                    line.moveType = 0;
                    line.changColor();
                    this.cpt.moveLine = null;
                    return;
                }
                this.addLine(line);
                if (line.child) {
                    this.addChild(line.child, false);
                    if (line.parent) {
                        line.parent.deletChild(line.child);
                        line.parent.deleteLine(line);
                    }
                }
                line.parent = this;
                this.resetLine();
            } else if (line.moveType == 2 && line.child != this && line.parent) {//移动线尾
                if (line.parent.checkLoop(this)) {
                    this.cpt.showTip("移动会出现循环!!!!");
                    line.moveType = 0;
                    line.changColor();
                    this.cpt.moveLine = null;
                    return;
                }
                if (line.child) {
                    line.parent.deletChild(line.child);
                }
                line.parent.addChild(this, false);
                line.child = this;
                line.parent.resetLine();

            }
            line.moveType = 0;
            line.changColor();
            this.cpt.moveLine = null;
        }
    }

    checkLoop(box: MindBox) {
        cc.log("检测是否循环....");
        for (let i = 0; i < box.children.length; i++) {
            let ch1 = box.children[i];
            if (ch1 == this) {
                return true;
            } else if (this.checkLoop(ch1)) {
                return true;
            }
        }
        cc.log("检查结束...");
        return false;

    }
}