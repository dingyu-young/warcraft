import {UIBase} from "../../base/game/UIBase";
import {RQ_Login, RQ_Register, RS_Login} from "../../base/Socket/MsgData";
import {NetTool} from "../../base/net/NetTool";
import {WebNet} from "../../base/net/WebNet";


export class UILogin extends UIBase {
    jsName = "UILogin";
    edit_name:cc.EditBox;
    edit_pwd:cc.EditBox;

    protected initUI() {
        this.node.getChildByName("connect").on("click", () => {
            NetTool.Connect();
        }, this)
        this.node.getChildByName("login").on("click", this.login, this);
        this.node.getChildByName("register").on("click", this.register, this);
        this.edit_name = this.node.getChildByName("name").getComponent(cc.EditBox);
        this.edit_pwd = this.node.getChildByName("pwd").getComponent(cc.EditBox);
        // this.node.getChildByName("mind").on("click", () => {
        //     app.instance().nd_tool.active = true;
        //     this.close();
        // }, this)
    }

    async login() {
        let req = new RQ_Login();
        req.password = this.edit_pwd.string;
        req.userName = this.edit_name.string;
        let res = await NetTool.AsyncRequest<RS_Login>(req);
        cc.log(res);
    }

    async register() {
        let req = new RQ_Register();
        req.password = this.edit_pwd.string;
        req.userName = this.edit_name.string;
        let res = await NetTool.AsyncRequest<RS_Login>(req);
        cc.log(res);
    }


    protected onShow() {
        // this.hardtest();
    }

    hardtest(){
        let netList:WebNet[] = [];
        for (let i = 0; i < 250; i++) {
            let net = new WebNet();
            net.Connect("127.0.0.1","9001");
            netList.push(net);
        }
        let req = new RQ_Login();
        req.password = 123456;
        req.userName = "丁宇";
        setInterval(()=>{
            for (let i = 0; i < netList.length; i++) {
                netList[i].Request("RQ_Login",req)
            }
        },2000)
    }


    protected get uiPath() {
        return "ui/UILogin"
    }

}