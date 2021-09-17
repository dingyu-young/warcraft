import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;

import {UIPrefab} from "../../base/game/UIBase";

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

	public static get uiPath(){return "ui/UILogin";}

	public get isDestroy(){return false;}

	public get uiLayer(){return 3;}

	protected onLoad(): void {
		this.btn_connect.node.on("click",this.ClickEvent,this);
		this.btn_login.node.on("click",this.ClickEvent,this);
		this.btn_register.node.on("click",this.ClickEvent,this);
	}

	public OnClick(btnName:string,btnNode:cc.Node){
		if(btnName == "btn_connect"){
		}else if(btnName == "btn_login"){
		}else if(btnName == "btn_register"){
		}
	}
}
