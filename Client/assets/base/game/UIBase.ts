import {Singleton} from "../Singleton";
import {LoadManager} from "../manager/LoadManager";
import {GameData} from "./GameData";


export class UIPrefab extends cc.Component{


    //获取界面资源路径
    public static get uiPath(){
        return "";
    }

    //获取是否销毁界面
    public get isDestroy(){
        return false;
    }

    //获取层级
    public get uiLayer(){
        return 3;
    }

    public ClickEvent(event){
        let node:cc.Node = event.node;
        this.OnClick(node.name,node);
    }

    public OnClick(btnName:string,btnNode:cc.Node){};

    
}


//UI界面基类
export abstract class AbsUI<T extends UIPrefab> extends Singleton{

    public jsName = "UIBase";
    public isShow:boolean = false;
    public node:cc.Node = null;
    protected ui:T = null;


    //需要重写的方法
    protected abstract get uiPath():string;//资源路径
    protected abstract onShow();//界面显示后调用
    protected abstract initUI();//初始化界面
    protected abstract OnClick(btnName:string,btnNode:cc.Node);//点击事件回调

    show(){
        if(this.isShow){
            return;
        }
        if(this.ui && this.node != null){
            this.node.active = true;
            this.onShow();
            return;
        }
        this.isShow = true;
        LoadManager.ins().loadRes(this.uiPath,cc.Prefab).then((res)=>{
            let node = cc.instantiate(res);
            if(!this.node){
                this.ui = node.getComponent(UIPrefab);
                this.node = this.ui.node;
            }
            this.node.setParent(GameData.uiRoot);
            this.node.active = true;
            this.ui.OnClick = (btnName, btnNode) => {
                this.OnClick(btnName,btnNode);
            }
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










}