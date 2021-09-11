import {MindBox} from "./MindBox";
import {MindMap} from "./MindMap";

var LineCOLOR1 = cc.color(184, 222, 249);//正常颜色
var LineCOLOR2 = cc.color(255, 0, 0);//选中颜色
export class MindLine {
    node:cc.Node;
    parent:MindBox;
    child:MindBox;

    cpt:MindMap;

    constructor(cpt:MindMap,parent:MindBox, child:MindBox){
        this.cpt = cpt;
        this.node = cc.instantiate(cpt.prefabLine);
        this.node.active = true;
        let nd_lines = cpt.currentScene.getChildByName("lines");
        if(!nd_lines){
            cc.error("不存在线条父节点");
        }
        this.node.setParent(nd_lines);
        this.parent = parent;
        this.child = child;
        this.resetPos();
        this.node.on(cc.Node.EventType.TOUCH_START,this.onTouch,this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE,this.onTouchMove,this);
        this.node.on(cc.Node.EventType.TOUCH_END,this.onTouchEnd,this);
        // this.node.on(cc.Node.EventType.TOUCH_CANCEL,this.onTouchEnd,this);
    }

    moveType:number = 0; // 1 头部,2尾部
    onTouch(event){
        if(this.cpt.isDelete){
            return;
        }
        let pos = event.getLocation();
        let realPos = this.node.convertToNodeSpaceAR(pos);
        // cc.log(realPos.x,realPos.y);
        if(realPos.y  < -this.node.height / 2){
            this.moveType = 2;
            cc.log("移动线尾");
        }else{
            this.moveType = 1;
            cc.log("移动线头");
        }
        this.changColor(LineCOLOR2);
        this.cpt.moveLine = this;
    }

    changColor(color:cc.Color = LineCOLOR1){
        this.node.color = color;
    }

    onTouchMove(){
    }

    onTouchEnd(){
        if(!this.node || !this.cpt){
            return;
        }
        this.changColor();
        if(this.cpt.isDelete){
            this.deletSelf();
        }
        this.cpt.moveLine = null;
    }

    //重新定位位置
    resetPos(){
        if(this.parent && this.child){
            let top = this.parent.getLineDownPos();
            let down = this.child.getLineTopPos();
            this.node.setPosition(this.node.parent.convertToNodeSpaceAR(top));
            let vec = top.sub(down);
            this.node.height = vec.len() / this.cpt.currentScene.scale;
            // let angle = top.signAngle(down);
            let tan = Math.atan2(top.y-down.y,top.x-down.x);
            this.node.angle = tan / Math.PI * 180 - 90;
        }else if (this.parent){
            let top = this.parent.getLineDownPos();
            this.node.setPosition(this.node.parent.convertToNodeSpaceAR(top));
            this.node.height = 150;
        }else if(!this.parent && !this.child){
            this.node.setPosition(0,cc.winSize.height / 2 - 150);
            this.node.angle = Math.random() * 360;
        }
    }

    //删除线
    deletSelf(){
        if(this.parent){
            let index = this.parent.lines.indexOf(this);
            if(index > -1){
                if(this.child){
                    cc.log("删除线:",this.parent.value,this.child.value);
                    this.child.deleteParent(this.parent);
                    this.parent.deletChild(this.child);
                }
                this.parent.lines.splice(index,1);
            }
        }
        this.node.active = false;
        this.node = null;
        this.parent = null;
        this.child = null;
        this.cpt = null;
    }
}