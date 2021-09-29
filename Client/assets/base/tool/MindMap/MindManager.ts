import {MindMap} from "./MindMap";
import {MindBox} from "./MindBox";
import {MindLine} from "./MindLine";


export type ChangeInfo = {
    type:0|1;
    target:MindBox| MindLine;
    value:{[key:string]:any}
}


export class MindManager {
    static _instance:MindManager = null
    public static ins():MindManager{
        if (!MindManager._instance){
            MindManager._instance = new MindManager();
        }
        return MindManager._instance
    }

    ui:MindMap = null

    changeScene(){
        this.stepList = [];
        this.step = 0;
    }
    stepList = [];
    step:number = 0;

    deleteLine(line:MindLine) {
        if(line.parent && line.child){
            let data = {
                opt:"deleteLine",
                parent:line.parent,
                child:line.child
            }
            this.addOpt(data);
        }
    }

    deleteBox(box:MindBox){
        let data = {
            opt:"deleteBox",
            parents: box.parents.concat([]),
            children: box.children.concat([]),
            pos: box.node.getPosition(),
            value:box.value
        }
        this.addOpt(data);
    }

    addLine(line:MindLine) {
        let data = {
            opt:"addLine",
            line:line
        }
        this.addOpt(data);

    }

    addBox(box:MindBox){
        let data = {
            opt:"addBox",
            mindBox:box
        }
        this.addOpt(data);
    }

    moveLine(line:MindLine){
        let data = {
            opt:"moveLine",
            parent:line.parent,
            child:line.child,
            line:line
        }
        this.addOpt(data);

    }


    private addOpt(data){
        this.stepList[this.step] = data;
        this.step ++;
        this.stepList = this.stepList.slice(0,this.step);
    }

    private resetStep(opt:string,data){
        if(opt == "deleteLine") {
            let parent = data.parent;
            let child = data.child;
            this.ui.boxLineBox(parent, child);
        } else if(opt == "deleteBox"){

            let parents = data.parents;
            let children = data.children;
            let box = new MindBox(this.ui,null);
            box.node.setPosition(data.pos);
            box.setVale(data.value);
            for (let i = 0; i < parents.length; i++) {
                this.ui.boxLineBox(parents[i],box);
            }
            for (let i = 0; i < children.length; i++) {
                this.ui.boxLineBox(box,children[i]);
            }
        } else if (opt == "addLine") {
            let line = data.line;
            line.deletSelf();
        } else if (opt == "addBox") {
            let box = data.mindBox;
            box.deletSelf();
        } else if (opt == "moveLine"){
            let parent = data.parent;
            let child = data.child;
            let line = data.line;
            line.deletSelf();
            this.ui.boxLineBox(parent,child);
        }
    }

    //回退到上一步: Ctrl + Z
    preStep(){
        if(this.step < 1){
            return;
        }
        this.step--;
        let data = this.stepList[this.step];
        this.resetStep(data.opt,data);

    }

    //撤销回退操作:Ctrl + Shift + Z
    nextStep(){
        this.step ++;
        let dataList:ChangeInfo[] = this.stepList[this.step];
        if(!dataList){
            return;
        }
        // this.resetStep(dataList);
    }







}