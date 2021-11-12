import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;

import { EnumUILayer, UIPrefab } from "../../framework/ui/UIBase";

@ccclass
export class showViewPrefab extends UIPrefab {

	@property(cc.Node)
	btnList: cc.Node = null;

	@property(cc.Node)
	txtItem: cc.Node = null;

	@property(cc.ScrollView)
	talkScrollView: cc.ScrollView = null;

	@property(cc.Node)
	btnReset: cc.Node = null;

	@property(cc.Node)
	btnClose: cc.Node = null;

	@property(cc.Label)
	labelStorId: cc.Label = null;

	@property(cc.Label)
	curJinDu: cc.Label = null;

	@property(cc.Label)
	sumJinDu: cc.Label = null;
	
	@property(cc.Label)
	overLbl: cc.Label = null;

	@property(cc.Label)
	isReaward: cc.Label = null;

	public static get uiPath() { return "ui/showView"; }

	public get isDestroy() { return false; }

	public get uiLayer() { return EnumUILayer.eSecond; }

	protected onLoad(): void {
	}


}

