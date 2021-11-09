import Session = require('./Session');
import {NetWaitingMananger} from "./NetWaitingMananger";
import {ReqMsgData} from "./MsgData";

export class RoomNetManager extends Session {

    private NewSysMsg: any;

    private netWait: NetWaitingMananger;

    constructor() {
        super(false, "Room");
    }

    //发起连接的时候   要将连接加入等待网络列表
    protected _onConnect() {
        this.netWait.EnqueueWaiting(this);
    }

    //发起重连的时候   要将连接加入等待网络列表
    protected _onReconnect() {
        // this.netWait.EnqueueWaiting(this);
    }

    protected _onDisconnect() {
        // this.netWait.DequeueWaiting(this);
    }

    //所有消息接受完毕  从网络等待列表移出
    protected _onReceiveAll() {
        // this.netWait.DequeueWaiting(this);
    }

    //发送协议
    protected _onWaitPack() {
        // this.netWait.EnqueueWaiting(this);
    }

    //广播重连失败  从网络等待列表移出
    protected _onReconectError() {
        // this.netWait.DequeueWaiting(this);
        // app.SysNotifyManager().ShowSysMsg("Net_ReconnectFail");
    }

    //广播丢包  无法正常游戏  从网络等待列表移出  并弹窗提示无法正常游戏
    protected _onLostPack() {
        // this.netWait.DequeueWaiting(this);
        // app.Client.LogOutGame();
        // app.SysNotifyManager().ShowSysMsg("Net_LostPushPack");
    }

    //发送超时
    protected _onSendTimeOut() {
        // this.netWait.DequeueWaiting(this);
        // app.SysNotifyManager().ShowSysMsg("Net_SendTimeOut");
        // App.instance().emit("SendTimeOut", {"ServerName": "RoomServer"});
    }

    protected _onHeartBeat() {

    }

    //---------------------- 连接触发事件 ------------------------
    //服务器连接成功
    protected _onConnectSuccess() {
        //从网络等待列表移出
        // this.netWait.DequeueWaiting(this);
        cc.log("连接成功")
        this.OnReload();
        // App.instance().emit("ConnectRoom", {"ServerName": "RoomServer"});
    }

    protected _onReconnectSuccess() {
        //从网络等待列表移出
        // this.netWait.DequeueWaiting(this);
        this.OnReload();
        // App.instance().emit("ReconnectRoom", {"ServerName": "RoomServer"});
    }

    protected _onConnectClose(): void {
        //从网络等待列表移出
        // this.netWait.DequeueWaiting(this);
        // App.instance().emit("CloseRoom", {"ServerName": "RoomServer"});
    }

    //连接失败
    protected _onConnectError() {
        //从网络等待列表移出
        // this.netWait.DequeueWaiting(this);
        // App.instance().emit("ConnectRoomFail", {"ServerName": "RoomServer", "EventType": "OnError"});
    }

    //-----------===--错误广播事件----------------

    //服务器返回错误消息回调   message {"Msg": xxxxxx}
    protected NotifyErrorMessage(name: string, errorCode: number, message: { [key: string]: any }, sendMsg: {}) {
        // this.SysLog("OnCodeError(%s) (%s):", name, errorCode, message);
        // App.instance().emit("CodeError", {
        //     "Code": errorCode,
        //     "EventName": name,
        //     "Result": message
        // });
    }

    //------------------自己单独新增接口--------------------
    //注册封包事件(需要字符串封包头,才可以避免RegHttpNetPack相同封包头注册事件区分)
    public RegNetPack(head: string, func: (pack?: { [key: string]: any }, send?: { [key: string]: any }) => void, target: any) {
        this.RegisterHandler(head, func, target);
    }

    //注册封包事件(需要字符串封包头,才可以避免RegHttpNetPack相同封包头注册事件区分)
    public RegUINetPack(head: string, func: (pack?: { [key: string]: any }, send?: { [key: string]: any }) => void, target: any) {
        this.RegisterUIHandler(head, func, target);
    }

    //取消封包注册
    public UnRegNetPack(head: string, func: Function) {
        this.UnregisterHandler(head, func);
    }

    //向服务器发起请求
    public SendPack(eventName: string, sendPack: {}, callback?: Function, errorCallback?: Function, needWait = true) {
        this.Send(eventName, sendPack, callback, errorCallback, needWait);
    }

    public SendGMPack(cmdString: string) {
        let sendPack = {"cmdString": cmdString};
        this.SendPack("player.C1010GMPack", sendPack)
    }


}