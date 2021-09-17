import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;

import {UIPrefab} from "../../base/game/UIBase";

@ccclass
export class UIMainPrefabPrefab extends UIPrefab{

	@property(cc.Node)
	nd_top:cc.Node = null;

	@property(cc.Sprite)
	sp_white:cc.Sprite = null;

	@property(cc.Button)
	btn_start:cc.Button = null;

	@property(cc.Label)
	lb_time:cc.Label = null;

	@property(cc.RichText)
	rich_text:cc.RichText = null;

	@property(cc.EditBox)
	edit_box:cc.EditBox = null;

}
