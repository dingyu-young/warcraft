// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import {GameData} from "./game/GameData";
import {UILogin} from "./login/UILogin";
import {TableTool} from "./table/TableConfig";

const {ccclass, property} = cc._decorator;

@ccclass
export default class app extends cc.Component {
    @property(cc.Node)
    uiRoot: cc.Node = null;

    @property(cc.Node)
    uiScene: cc.Node = null;


    private static _instance: app = null;

    public static ins() {
        return this._instance;
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

    }

    start() {
        this.init();
    }

    private async init() {
        app._instance = this;
        GameData.uiRoot = this.uiRoot;
        GameData.uiScene = this.uiScene;
        await TableTool.initTable();

        this.enterGame();
    }

    private enterGame() {
        UILogin.ins().Show();
    }

}
