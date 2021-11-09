import {AbsUI} from "../../framework/ui/UIBase";
import {RQ_Login, RQ_Register, RS_Login} from "../../framework/Socket/MsgData";
import {NetTool} from "../../framework/net/NetTool";
import {WebNet} from "../../framework/net/WebNet";
import {UILoginPrefab} from "../export/UILoginPrefab";
import {SpringNoteScoreConfig, SpringPoolsConfig} from "../table/TableConfig";


export class UILogin extends AbsUI<UILoginPrefab> {
    jsName = "UILogin";

    protected initUI() {
    }

    private async login() {

        let req = new RQ_Login();
        req.password = this.ui.edit_pwd.string;
        req.userName = this.ui.edit_name.string;
        let res = await NetTool.AsyncRequest<RS_Login>(req);
        cc.log(res);
    }

    private async register() {
        let req = new RQ_Register();
        req.password = this.ui.edit_pwd.string;
        req.userName = this.ui.edit_name.string;
        let res = await NetTool.AsyncRequest<RS_Login>(req);
        cc.log(res);
    }


    protected onShow() {
        // this.hardtest();
    }

    protected hardtest(){
        let netList:WebNet[] = [];
        for (let i = 0; i < 250; i++) {
            let net = new WebNet();
            net.Connect("127.0.0.1","9001");
            netList.push(net);
        }
        let req = new RQ_Login();
        req.password = "123456";
        req.userName = "丁宇";
        setInterval(()=>{
            for (let i = 0; i < netList.length; i++) {
                netList[i].Request("RQ_Login",req)
            }
        },2000)
    }

    protected OnClick(btnName: string, btnNode: cc.Node) {
        if(btnName == "btn_connect"){
            NetTool.Connect();
        }else if(btnName == "btn_login"){
            this.login();
        }else if(btnName == "btn_register"){
            this.register();
        }
    }


    protected get uiPath() {
        return UILoginPrefab.uiPath;
    }

}