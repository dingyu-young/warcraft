import {Singleton} from "../Singleton";
import {LoadManager} from "../manager/LoadManager";
import {GameData} from "./GameData";



//UI界面基类
export abstract class UIBase extends Singleton{

    jsName = "UIBase";
    node:cc.Node = null;
    isShow:boolean = false;



    show(){
        if(this.isShow){
            return;
        }
        if(this.node != null){
            this.node.active = true;
            this.onShow();
            return
        }
        this.isShow = true;
        LoadManager.ins().loadRes(this.uiPath,cc.Prefab).then((res)=>{
            let node = cc.instantiate(res);
            if(!this.node){
                this.node = node;
            }
            this.node.setParent(GameData.uiRoot);
            this.node.active = true;
            this.initUI();
            this.onShow();
        })
    }

    close(){
        this.onClose();
        if(this.isDestroy){
            this.node.destroy();
            this.node = null;
        }else {
            this.node.active = false;
        }
    }


    openAction(){

    }

    closeAction(){

    }

    protected get isDestroy():boolean{
        return true;
    }

    onClose(){

    }
    protected abstract get uiPath():string;
    protected abstract onShow();
    protected abstract initUI();









}