// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import {EventManager} from "../base/manager/EventManager";
import {GameData} from "../base/game/GameData";
import Game = cc.Game;
import {UILogin} from "./login/UILogin";

const {ccclass, property} = cc._decorator;

@ccclass
export default class app extends cc.Component {
    @property(cc.Node)
    uiRoot:cc.Node = null;

    @property(cc.Node)
    uiScene:cc.Node = null;

    @property(cc.Node)
    nd_tool:cc.Node = null;


    private static _instance:app = null;
    public static instance(){
        return this._instance;
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        app._instance = this;
        EventManager.ins().regEvent("test1",this.show,this);
        GameData.uiRoot = this.uiRoot;
        GameData.uiScene = this.uiScene;
    }

    start () {
        // UILogin.ins().show();

    }

    show(){
    }
    // update (dt) {}
}
