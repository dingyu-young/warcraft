import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;

import {EnumUILayer, UIPrefab} from "../../framework/ui/UIBase";

import List from "../component/list/List";
@ccclass
export class UILoginPrefab extends UIPrefab{

	@property(cc.Button)
	btn_connect:cc.Button = null;

	@property(cc.Button)
	btn_login:cc.Button = null;

	@property(cc.Button)
	btn_register:cc.Button = null;

	@property(cc.EditBox)
	edit_name:cc.EditBox = null;

	@property(cc.EditBox)
	edit_pwd:cc.EditBox = null;

	@property(cc.Sprite)
	sp_list:cc.Sprite = null;

	@property(List)
	List_list:List = null;

	public static get uiPath(){return "ui/UILogin";}

	public get isDestroy(){return false;}

	public get uiLayer(){return EnumUILayer.eSecond;}

	protected onLoad(): void {
		this.btn_connect.node.on("click",this.ClickEvent,this);
		this.btn_login.node.on("click",this.ClickEvent,this);
		this.btn_register.node.on("click",this.ClickEvent,this);
	}

	public OnClick(btnName:string,btnNode:cc.Node){
		if(btnName == "Btn_connect"){
		}else if(btnName == "Btn_login"){
		}else if(btnName == "Btn_register"){
		}
	}
}
