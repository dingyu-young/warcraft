
export class ReqMsgData {
    mName:string = "ReqMsgData";
}

export class RQ_Login extends ReqMsgData{
    mName:string = "RQ_Login";
    userName:string;
    password:string;
}

export class RS_Login extends ReqMsgData{
    mName:string = "RS_Login";
    code:number = 0;
    mData:UserInfo = null;
}

export class RQ_Register extends ReqMsgData{
    mName:string = "RQ_Register";
    userName:string;
    password:string;

}

export class UserInfo {
    userId:number;
    username:string;
    mLv:number;
    mVip:number;
}