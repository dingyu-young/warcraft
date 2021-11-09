import {SocketClient} from './ClientConnector'
import {Singleton} from "../base/Singleton";
import app from "../../script/app";
import {ReqMsgData} from "./MsgData";

//请求丢失推送封包的最大数量
const MaxAllowRequestLostPush = 5;
//最大推送ID
const MaxPushSeqID = 20000;

//重连最大允许尝试重连次数
const AllowReConnectCount = 2;

//客户端请求最大参数次数
const MaxTryRequestCount = 3;

//丢失封包检测时间
const LostPackTick = 300;

var HasInit = false;

//末尾推送ID列表[19996,19997,19998,19999,20000]
var TailPushIDList = [19996, 19997, 19998, 19999, 20000];
//头[1, 2, 3, 4, 5]
var HeadPushIDList = [1, 2, 3, 4, 5];

//需要立即处理的协议  无需等待
var ImmediatelyDealList = ["kickout", "base.c1003heartbeat", "base.c1004login"];

const HeartBeatPackName = "base.c1003heartbeat";


//协议封装包体
class NetPackage {
    public seq: number;
    public name: string;
    public dataPackage: {};
    public callback: Function;//回调
    public errorCallback: Function;//错误回调
    public sendMsg: {};
    public errorCode: number;//错误码
    public alreadyNotify: boolean;

    constructor(seq: number, name: string, dataPackage: {}, errorCode?: number, callback?: Function, errorCallback?: Function, sendMsg?: {}) {
        this.seq = seq;
        this.name = name;
        this.dataPackage = dataPackage;
        this.callback = callback;
        this.errorCode = errorCode;
        this.errorCallback = errorCallback;
        this.alreadyNotify = false;
        this.sendMsg = sendMsg || {};
    }
}

abstract class Session extends Singleton {

    //负责连接模块
    private netConnector: SocketClient;
    private emitter ;//广播对象
    private emitterUI;//ui广播对象

    private reconnectTimeId: number;//启动重连产生的定时器ID
    private tryReconnectTimes: number;

    //发送包体是否需要压缩
    private needCompress: boolean;
    //当前连接名称
    private sessionName: string;

    private sendTimeId: number;//发送协议启动的定时器ID
    private trySendTimes: number;

    private sendSeqId = 0;//当前发送到的序列号
    private sendPackage: { [key: number]: NetPackage };//当前等待回包的请求
    private waitSeqMap: { [key: number]: number };

    private serverPushPackage: { [key: number]: NetPackage };//服务器主动推送的消息
    private dealPushSeq = 0;//等待处理的下一个推送消息序列号

    private serverReturnPackage: { [key: number]: NetPackage };//服务器请求返回的消息
    private dealReturnSeq = 0;//等待处理的下一个消息序列号

    private waitServerPushList: { [key: number]: { [key: string]: any } };//正在等待的推送列表  由客户端主动向服务器请求丢包列表

    //心跳包相关定时器
    private heartBeatTimeId = 0;
    private heartBeatTimeOutId = 0;
    private delayTimeList = [];

    private RequestTimeOutTick = 3000;//请求协议超时  3000毫秒

    private HeartBeatTimeOutTick = 1500;//心跳超时

    private HeartBeatInterval = 3000;//心跳检测间隔

    get isSocketOpen(): boolean {
        return this.netConnector.isSocketOpen;
    }

    get isConnect(): boolean {
        return this.netConnector.isConnect;
    }

    protected constructor(needCompress: boolean, sessionName: string) {
        super();
        if (!HasInit) {
            for (let pushID = MaxPushSeqID - MaxAllowRequestLostPush + 1; pushID <= MaxPushSeqID; pushID++) {
                TailPushIDList.push(pushID);
            }
            for (let pushID = 1; pushID <= MaxAllowRequestLostPush; pushID++) {
                HeadPushIDList.push(pushID);
            }
            HasInit = true;
        }
        this.needCompress = needCompress;//协议是否需要压缩
        this.sessionName = sessionName;//连接名称
        this.netConnector = new SocketClient();
        //连接成功回调事件
        this.netConnector.OnConnect = this.ConnectSuccess.bind(this);
        this.netConnector.OnReconnect = this.ReconnectSuccess.bind(this);
        this.netConnector.OnSocketClose = this.ConnectClose.bind(this);
        this.netConnector.OnSocketError = this.ConnectError.bind(this);
        this.netConnector.OnReconnectError = this.ReconnectError.bind(this);
        this.netConnector.OnServerPush = this.PushMessage.bind(this);
        this.netConnector.OnServerRequest = this.ReturnMessage.bind(this);
        this.OnReload();
    }

    get Ping() {
        var count = this.delayTimeList.length;

        var pingCount = 0;
        for (var i = 0; i < count; i++) {
            pingCount += this.delayTimeList[i];
        }

        return count > 0 ? Math.ceil(pingCount / count) : 0;
    }

    //重新载入游戏
    public OnReload() {
        clearTimeout(this.sendTimeId);
        clearTimeout(this.reconnectTimeId);
        clearTimeout(this.heartBeatTimeId);
        clearTimeout(this.heartBeatTimeOutId);
        this.sendTimeId = null;
        this.reconnectTimeId = null;
        this.heartBeatTimeId = null;
        this.heartBeatTimeOutId = null;
        this.trySendTimes = 0;
        this.tryReconnectTimes = 0;
        this.sendPackage = {};
        this.waitSeqMap = {};
        this.serverPushPackage = {};
        this.dealPushSeq = -1;//初始推送id设置-1
        this.serverReturnPackage = {};
        this.dealReturnSeq = -1;//初始推送id设置-1
        this.waitServerPushList = {};
        this.delayTimeList = [];
    }

    //定时处理
    public OnTimer() {
        if (this.netConnector.isConnect) {
            this.DealServerPushPack();//处理服务器推送

            this.DealServerReturnPack();//处理服务器返回消息

            this.FindLostPushPack();//寻找丢失的推送ID列表  向服务器主动请求丢失的协议

            this.RequestLostPush();//请求丢失的推送包
        }
    }

    //启动连接
    protected abstract _onConnect(): void;

    //启动重新连接
    protected abstract _onReconnect(): void;

    //启动断开连接
    protected abstract _onDisconnect(): void;

    //当服务器回复所有客户端请求的包
    protected abstract _onReceiveAll(): void;

    protected abstract _onWaitPack(): void;

    //------------------内部处理函数----------------
    //当连接成功回调
    protected abstract _onConnectSuccess(): void;

    protected abstract _onReconnectSuccess(): void;

    protected abstract _onConnectClose(): void;

    //当连接错误回调
    protected abstract _onConnectError(): void;

    //广播重连失败
    protected abstract _onReconectError(): void;

    //广播丢包
    protected abstract _onLostPack(): void;

    //发送多次超时
    protected abstract _onSendTimeOut(): void;

    //收到心跳包数据
    protected abstract _onHeartBeat(serverPack: any): void;

    //--------------------------网络连接模块-------------------------

    //login   主动进行连接
    public Connect(_server: string, _port: string) {
        // this.OnReload();//重置所有数据
        this.netConnector.Connect(_server, _port);
        // this._onConnect();
    }

    //重连
    public Reconnect() {
        clearTimeout(this.heartBeatTimeId);
        clearTimeout(this.heartBeatTimeOutId);
        if (this.netConnector.Reconnect()) {
            // this._onReconnect();
        }
    }

    public Disconnect() {
        // this.netConnector.Disconnect();
        this.OnReload();
        this._onDisconnect();
    }

    //和服务器连接产生丢包
    private LostConnect() {
        // this.netConnector.Disconnect();
        this.OnReload();
        this._onLostPack();
    }

    //--------------内部调用模块----------------------------------
    //获取发送协议序列号
    private GetRquestSequenceId(): number {
        if (this.sendSeqId <= 0) {
            this.sendSeqId = 1
        } else {
            ++this.sendSeqId;
        }
        if (this.sendSeqId > MaxPushSeqID) {
            this.sendSeqId = 1;
        }
        if (this.dealReturnSeq < 0) {
            this.dealReturnSeq = this.sendSeqId - 1;
        }
        return this.sendSeqId;
    }

    //判断推送是否已经处理过
    private AlreadyDealPush(pushID: number, dealSeq: number) {
        //判断当前收到的推送ID和最后一次处理的推送id
        //如果接收到的推送ID比当前处理的小
        if (pushID < dealSeq) {
            //判断分发的ID是否在末尾 并且接收的ID在开头,则允许
            if (TailPushIDList.indexOf(dealSeq) >= 0
                && HeadPushIDList.indexOf(pushID) >= 0) {
                return false;
            } else {
                this.ErrLog("IsAllowPushID 接收到已经处理过的推送(%s) < (%s)", pushID, dealSeq);
                return true;
            }
        }
        //如果接收到的推送ID比当前分发的大
        else if (pushID > dealSeq) {
            //判断分发的ID是否在开头 并且接收的ID在开末尾,则不允许
            if (HeadPushIDList.indexOf(dealSeq) >= 0
                && TailPushIDList.indexOf(pushID) >= 0) {
                this.ErrLog("IsAllowPushID 接收到已经处理过的推送(%s) > (%s)", pushID, dealSeq);
                return true;
            }
        } else {
            this.ErrLog("IsAllowPushID 接收到已经处理过的推送(%s) == (%s)", pushID, dealSeq);
            return true;
        }
    }

    protected DealNetPackage(netPackage: NetPackage) {
        if (netPackage.alreadyNotify)//如果已经处理过这个协议
            return;

        netPackage.alreadyNotify = true;//将协议设置成已经处理

        if (!netPackage.dataPackage)//如果数据不存在
            return;

        try {
            if (netPackage.errorCode) {//如果返回报错
                let errorFunc = netPackage.errorCallback;
                if (errorFunc) {//根据请求消息时注册的回调函数进行处理
                    errorFunc(netPackage.dataPackage, netPackage.sendMsg);
                }
            } else {
                let callback = netPackage.callback;//根据请求消息时注册的回调函数处理
                if (callback) {
                    callback(netPackage.dataPackage, netPackage.sendMsg);
                }
            }
        } catch (error) {
            this.ErrLog("Deal Request Function error:%s", error.stack);
        }

        try {
            if (netPackage.errorCode) {//广播协议处理错误
                this.NotifyErrorMessage(netPackage.name, netPackage.errorCode, netPackage.dataPackage, netPackage.sendMsg);//请求消息返回错误,调用错误处理
            } else {
                this.NotifyMessage(netPackage.name, netPackage.dataPackage, netPackage.sendMsg);//正常消息下发
            }
        } catch (error) {
            this.ErrLog("Deal Notify Message error:%s", error.stack);
        }
    }

    //------------------定时处理函数----------------
    //处理服务器返回消息
    private DealServerReturnPack() {
        let nextReturnSeq = this.dealReturnSeq + 1;//继续处理下一个序列号
        //如果已经大于最大了,从1开始
        if (nextReturnSeq > MaxPushSeqID) {
            nextReturnSeq = 1;
        }

        //根据服务器返回协议序列号按顺序处理
        while (this.serverReturnPackage.hasOwnProperty(nextReturnSeq.toString())) {//如果寻找的下一个推送存在
            let netPackage = this.serverReturnPackage[nextReturnSeq];
            this.DealNetPackage(netPackage);
            delete this.serverReturnPackage[nextReturnSeq];//从map中丢弃已经处理过的推送

            this.dealReturnSeq = nextReturnSeq;//保存当前已经处理到的推送序列号
            ++nextReturnSeq;//继续下一个
            //如果已经大于最大了,从1开始
            if (nextReturnSeq > MaxPushSeqID) {
                nextReturnSeq = 1;
            }
        }

        var waitDealList = Object.keys(this.serverReturnPackage);
        if (waitDealList.length > 0) {
            for (var i = 0; i < waitDealList.length; i++) {
                var waitSeq = waitDealList[i];
                var returnPack = this.serverReturnPackage[waitSeq];
                // app.UMengManager().SetEventID("net_wait", [returnPack.name, waitSeq, this.dealReturnSeq].join("_"));
                if (this.AlreadyDealPush(Number(waitSeq), this.dealReturnSeq))
                    delete this.serverReturnPackage[waitSeq];
            }
            this.Log("等待处理的返回协议  当前处理的seq:%s,  等待处理列表:%s", this.dealReturnSeq, waitDealList.join(","));
        }
    }

    //处理服务器推送消息
    private DealServerPushPack() {
        let nextPushSeq = this.dealPushSeq + 1;//继续处理下一个序列号
        //如果已经大于最大了,从1开始
        if (nextPushSeq > MaxPushSeqID) {
            nextPushSeq = 1;
        }

        while (this.serverPushPackage.hasOwnProperty(nextPushSeq.toString())) {//如果寻找的下一个推送存在
            let netPackage = this.serverPushPackage[nextPushSeq];
            this.DealNetPackage(netPackage);
            delete this.serverPushPackage[nextPushSeq];//从map中丢弃已经处理过的推送

            this.dealPushSeq = nextPushSeq;//保存当前已经处理到的推送序列号
            ++nextPushSeq;//继续下一个
            //如果已经大于最大了,从1开始
            if (nextPushSeq > MaxPushSeqID) {
                nextPushSeq = 1;
            }
        }
    }

    // 找回服务器推送丢包
    private FindLostPushPack() {
        //设置重新请求推送包超时时间
        let timeOutTick = Date.now() + LostPackTick;

        //剩余未处理的推送id列表
        let leftPushIDList = Object.keys(this.serverPushPackage);

        if (leftPushIDList.length <= 0) {
            return;//所有推送消息处理完成  不需要寻找中间断掉的推送
        }

        //如果有剩余的推送没有处理完  代表中间断掉了某个推送消息
        this.Log("剩余未处理的推送协议序列号 leftPushIDList(%s)", JSON.stringify(leftPushIDList));

        //  从当前已经处理的推送下一条开始
        let nextPushSeq = this.dealPushSeq + 1;

        let dealLeftCount = 0;//剩余未处理的
        //循环  寻找丢失的推送报序列号
        while (dealLeftCount < leftPushIDList.length) {
            if (leftPushIDList.indexOf(nextPushSeq.toString()) >= 0) {
                ++dealLeftCount;
            } else {
                if (!this.waitServerPushList.hasOwnProperty(nextPushSeq.toString())) {
                    this.waitServerPushList[nextPushSeq] = {"isSend": false, "timeOutTick": timeOutTick};
                }
            }
            //查找下一个
            ++nextPushSeq;
            if (nextPushSeq > MaxPushSeqID) {
                nextPushSeq = 1;
            }
        }
    }

    private RequestLostPush() {
        //下面是重新请求  推送丢包信息
        let nowTick = Date.now();
        let lostPushIDList = [];
        //遍历所有等待推送结果的列表   记录所有序列号
        for (let key in this.waitServerPushList) {
            let waitInfo = this.waitServerPushList[key];
            let endTick = waitInfo["timeOutTick"];
            let isSend = waitInfo["isSend"];
            //如果已经申请了
            if (isSend) {
                continue;
            }
            if (endTick <= nowTick) {
                lostPushIDList.push(key);
                waitInfo["isSend"] = true;
            }
        }

        //所有推送消息正常处理
        if (lostPushIDList.length <= 0) {
            return;
        }

        //如果查到丢包太多,断线重新登录(并与由于leftPushIDList错误,已经查找2w次)
        if (lostPushIDList.length > MaxAllowRequestLostPush * 2) {
            this.ErrLog("丢包超过限制最大数量:%s", JSON.stringify(Object.keys(this.waitServerPushList)));
            this.LostConnect();
            return;
        }

        this.Log("请求丢包数据 allWaitPushIDList(%s)", JSON.stringify(this.waitServerPushList));

        this.Send("base.C1012GetPushCache", {"sequences": lostPushIDList}, this.OnRequestPushSuccess.bind(this), this.OnRequestPushFail.bind(this));
    }

    private OnRequestPushSuccess(serverPack: { [key: string]: any }) {
        this.Log("重新获得服务器推送消息 serverPack:", serverPack);

        let sequences = serverPack["sequences"];

        let dataString = serverPack["jsonData"];

        let allJsonData: { [key: number]: any } = {};
        try {
            allJsonData = JSON.parse(dataString);
        } catch (error) {
            this.ErrLog("OnSuccessRequestPushCache:%s", dataString);
            this.LostConnect();
            return
        }

        let receivePushIDList = Object.keys(allJsonData);
        receivePushIDList.sort();
        sequences.sort();

        //设置重新请求推送包超时时间
        let timeOutTick = Date.now() + LostPackTick;
        //如果请求的push和接收到的push不一样,漏包
        if (sequences.join("") != receivePushIDList.join("")) {
            this.ErrLog("请求的推送序列号列表和服务器返回的列表不一致 sequences(%s)!=(%s)", JSON.stringify(sequences), JSON.stringify(receivePushIDList));
            this.LostConnect();
            return
        }

        for (let seq of sequences) {
            this.waitServerPushList[seq] = {"isSend": false, "timeOutTick": timeOutTick};//收到结果的同时将对应等待的发送状态改成false
        }

        for (let key in allJsonData) {
            delete this.waitServerPushList[key];//清除正在等待的推送消息

            if (this.AlreadyDealPush(Number(key), this.dealPushSeq)) {//如果推送已经处理过了
                continue;//继续下一条
            }

            let packInfo = allJsonData[key];//

            let eventName = packInfo["route"];
            eventName = eventName.toLocaleLowerCase();

            let body = JSON.parse(packInfo["message"]);
            this.serverPushPackage[key] = new NetPackage(Number(key), eventName, body);
        }
    }

    private OnRequestPushFail(serverPack: {}) {
        this.LostConnect();
    }

    //启动心跳包
    public StartHeartBeat() {
        if (this.heartBeatTimeId) {//已经启动发送心跳包的定时器  返回
            return;
        }

        //this.Log("启动心跳", "w-g");
        //心跳包发送
        var sendFunc = () => {
            this.Send(HeartBeatPackName, {"sendTick": Date.now()}, this.OnSendHeartBeatSuccess.bind(this), this.OnSendHeartBeatFail.bind(this));
            this.heartBeatTimeOutId = setTimeout(this.OnSendHeartBeatTimeOut.bind(this), this.HeartBeatTimeOutTick);
        };

        //启动心跳包定时器
        this.heartBeatTimeId = setTimeout(sendFunc, this.HeartBeatInterval);
    }

    //心跳包请求成功
    private OnSendHeartBeatSuccess(serverPack: { [key: string]: any }) {
        clearTimeout(this.heartBeatTimeId);
        this.heartBeatTimeId = null;
        clearTimeout(this.heartBeatTimeOutId);
        this.heartBeatTimeOutId = null;

        //继续下一个心跳
        this.StartHeartBeat();

        let pushSeq = serverPack["seq"];//服务器返回当前的推送序列号

        var sendTick = serverPack["sendTick"];
        if (sendTick) {
            var delayTime = Date.now() - sendTick;
            this.delayTimeList.push(delayTime / 2);
            if (this.delayTimeList.length > 5) {
                this.delayTimeList.shift();
            }
        }

        this._onHeartBeat(serverPack);

        this.CheckPushSeq(pushSeq);
    }

    CheckPushSeq(pushSeq) {
        //如果是-1，异常
        if (pushSeq <= 0) {
            //this.ErrLog("心跳包检测丢包序列号错误:%s error", pushSeq);
            return
        }

        //没有增加推送  或者已经收到该推送只是还没有处理
        if (this.dealPushSeq <= 0//如果是刚建立的连接
            || this.dealPushSeq == pushSeq//如果当前处理序列号相同
            || this.serverPushPackage.hasOwnProperty(pushSeq)/*如果序列号已经收到了*/
            || this.AlreadyDealPush(pushSeq, this.dealPushSeq)) /*已经处理过的seq*/ {
            return;
        }

        this.Log("丢包处理  客户端处理序列号:%s  心跳返回序列号:%s error", this.dealPushSeq, pushSeq);
        let pushSeqList: number[] = [];

        //如果是递增阶段
        if (this.dealPushSeq < pushSeq) {
            for (let nextPushSeq = this.dealPushSeq + 1; nextPushSeq <= pushSeq; nextPushSeq++) {
                pushSeqList.push(nextPushSeq);
            }
        } else {
            //先执行递增到2w
            for (let nextPushSeq = this.dealPushSeq + 1; nextPushSeq <= MaxPushSeqID; nextPushSeq++) {
                pushSeqList.push(nextPushSeq);
            }
            //执行从1开始递增
            for (let nextPushSeq = 1; nextPushSeq <= pushSeq; nextPushSeq++) {
                pushSeqList.push(nextPushSeq);
            }
        }

        if (pushSeqList.length <= 0) {
            return;
        }

        let timeOutTick = Date.now() + LostPackTick;

        //检测所有需要判断的序列号  如果丢包  加入等到请求列表  下次一并请求
        for (let index = 0; index < pushSeqList.length; index++) {
            let checkPushSeq = pushSeqList[index];

            //记录丢包,有可能最大的推送ID没有推送下来,只能通过心跳获取当前最大推送ID，如果有漏包,则追加等待字典

            //如果需要请求的序列号已经处理过 或者已经收到了
            if (this.AlreadyDealPush(checkPushSeq, this.dealPushSeq)
                || this.serverPushPackage.hasOwnProperty(checkPushSeq.toString())) {
                continue
            }

            //已经记录丢包
            if (this.waitServerPushList.hasOwnProperty(checkPushSeq.toString())) {
            } else {
                this.waitServerPushList[checkPushSeq] = {"isSend": false, "timeOutTick": timeOutTick}
            }
        }
    }

    //心跳包请求失败
    private OnSendHeartBeatFail(serverPack: { [key: string]: any }) {
        clearTimeout(this.heartBeatTimeId);
        this.heartBeatTimeId = null;
        clearTimeout(this.heartBeatTimeOutId);
        this.heartBeatTimeOutId = null;
        this.StartHeartBeat();//请求失败  继续请求心跳
    }

    //心跳包请求超时
    private OnSendHeartBeatTimeOut() {
        clearTimeout(this.heartBeatTimeId);
        this.heartBeatTimeId = null;
        clearTimeout(this.heartBeatTimeOutId);
        this.heartBeatTimeOutId = null;

        //心跳超时  ping为1500ms
        this.delayTimeList.push(this.HeartBeatTimeOutTick / 2);
        if (this.delayTimeList.length > 5) {
            this.delayTimeList.shift();
        }

        if (this.netConnector.isConnect) {
            this.StartHeartBeat();//
        } else {
            //心跳超时即重连
            this.netConnector.OutputClientInfo();
            this.Reconnect();
        }
    }

    //-----------消息处理------------------------
    //服务器返回错误消息回调   message {"Msg": xxxxxx}
    protected abstract NotifyErrorMessage(name: string, errorCode: number, message: {}, sendMsg: {}): void;

    //服务器正常下发消息
    public NotifyMessage(name: string, message: {}, sendMsg: {}) {
        try {
            this.emitter.emit(name, message, sendMsg);
        } catch (error) {
            this.ErrLog("Notify \"%s\" Message Error :%s", name, error.stack);
            // app.instance().DingDingMessage(`处理逻辑错误 协议:${name},内容:${JSON.stringify(message)},发送:${JSON.stringify(sendMsg)}`, error.message + "\n" + error.stack)
        }
        try {
            this.emitterUI.emit(name, message, sendMsg);
        } catch (error) {
            this.ErrLog("Notify \"%s\" Message Error :%s", name, error.stack);
            // app.instance().DingDingMessage(`处理界面错误 协议:${name},内容:${JSON.stringify(message)},发送:${JSON.stringify(sendMsg)}`, error.message + "\n" + error.stack)
        }
    }

    //单独处理逻辑消息
    public NotifyLogicMessage(name: string, message: {}) {
        try {
            this.emitter.emit(name, message);
        } catch (error) {
            this.ErrLog("Notify \"%s\" Message Error :%s", name, error.stack);
        }
    }

    //------------------监听网络连接----------------
    private ConnectSuccess(event: Event) {
        if (this.reconnectTimeId) {
            clearTimeout(this.reconnectTimeId);
            this.reconnectTimeId = null;
        }
        this.tryReconnectTimes = 0;
        this._onConnectSuccess();
    }

    private ReconnectSuccess(event: Event) {
        if (this.reconnectTimeId) {
            clearTimeout(this.reconnectTimeId);
            this.reconnectTimeId = null;
        }
        this.tryReconnectTimes = 0;
        this._onReconnectSuccess();
    }

    private ConnectClose() {
        this._onConnectClose();
    }

    private ConnectError(event: ErrorEvent) {
        this._onConnectError();
    }

    private ReconnectError(event: ErrorEvent) {
        this.tryReconnectTimes += 1;

        this.Log("重连次数 :%s", this.tryReconnectTimes);

        //如果重试次数大于最大值,则主动断线重连
        if (this.tryReconnectTimes > AllowReConnectCount) {
            this.Log("重连超过最大次数 (%s) MaxTryRequestCount", this.tryReconnectTimes);
            this.tryReconnectTimes = 0;
            //提示请求失败,确定重连网络
            this._onReconectError();
        } else {
            //再次发送请求
            this.Reconnect();
        }
    }

    //记录服务器返回推送消息  后序按照顺序处理
    private PushMessage(seq: number, name: string, errorCode: number, message: {}) {
        //输出日志
        let receivePack = JSON.parse(JSON.stringify(message));
        this.Log("[Push:%s] [seq:%s] [%s] [code:%s]:", new Date(Date.now()).toLocaleTimeString(), seq, name, errorCode, receivePack, "b-gb1");

        if (this.dealPushSeq < 0) {//初次收到推送
            this.dealPushSeq = seq - 1;//第一次保存上一次处理序列号
        }

        delete this.waitServerPushList[seq];//协议到了  把丢包请求处理掉

        if (!this.AlreadyDealPush(seq, this.dealPushSeq)) {//已经处理过的序列号  直接返回
            this.serverPushPackage[seq] = new NetPackage(seq, name, message);
            if (ImmediatelyDealList.indexOf(name) >= 0) {
                this.DealNetPackage(this.serverPushPackage[seq]);
            }
        }

        this.DealServerPushPack();

        this.FindLostPushPack();//寻找丢失的推送ID列表  向服务器主动请求丢失的协议

        this.RequestLostPush();//请求丢失的推送包
    }

    //服务器返回消息  记录本消息,  等待后续按照返回消息列表顺序处理
    private ReturnMessage(seq: number, name: string, errorCode: number, message: {}) {
        //输出日志
        if (name != HeartBeatPackName) {
            let receivePack = JSON.parse(JSON.stringify(message));
            this.Log("[Recv:%s] [seq:%s] [%s] [code:%s]:", new Date(Date.now()).toLocaleTimeString(), seq, name, errorCode, receivePack, "b-gb");
        }

        // if (errorCode == ErrorCode.WaitResponse) {
        //     this.ErrLog("正在等待服务器处理结果, 跳过当前处理");
        //     return;
        // }

        let sendPack = this.sendPackage[seq];
        delete this.sendPackage[seq];//删除正在等待的协议包
        delete this.waitSeqMap[seq];
        if (sendPack) {//防止回复的协议在重复请求之前就已经回来了
            if (this.dealReturnSeq < 0) {//初次连接
                this.dealReturnSeq = seq - 1;//记录上一个请求的序列号
            }
            if (!this.AlreadyDealPush(seq, this.dealReturnSeq)) {//如果是已经处理到后面的协议了   不需要再处理前面的协议
                this.serverReturnPackage[seq] = new NetPackage(seq, name, message, errorCode, sendPack.callback, sendPack.errorCallback, sendPack.dataPackage);
                //如果需要立即处理的协议  无需等待  立即处理
                if (ImmediatelyDealList.indexOf(name) >= 0) {
                    this.DealNetPackage(this.serverReturnPackage[seq]);
                }
            }
        }

        //如果当前所有消息接受完毕   清除定时器
        if (Object.keys(this.waitSeqMap).length <= 0) {
            this.trySendTimes = 0;//所有协议处理完成才会重置重试次数
            if (this.sendTimeId) {
                clearTimeout(this.sendTimeId);
                this.sendTimeId = null;
            }
            this._onReceiveAll();
        }

        this.DealServerReturnPack();
    }

    //---------------------注册协议--------------------
    protected RegisterHandler(name: string, callback: Function, target: any) {
        name = name.toLocaleLowerCase();
        let valueType = Object.prototype.toString.call(name).slice("[object ".length, -1);
        if (valueType != 'String') {
            this.ErrLog("RegNetPack need String head");
            return;
        }

        if (!callback || !target) {
            this.ErrLog("RegNetPack head:%s error", name);
            return
        }
        this.emitter.on(name, callback, target);
    }

    protected RegisterUIHandler(name: string, callback: Function, target: any) {
        name = name.toLocaleLowerCase();
        let valueType = Object.prototype.toString.call(name).slice("[object ".length, -1);
        if (valueType != 'String') {
            this.ErrLog("RegNetPack need String head");
            return;
        }

        if (!callback || !target) {
            this.ErrLog("RegNetPack head:%s error", name);
            return
        }
        this.emitterUI.on(name, callback, target);
    }

    protected UnregisterHandler(name: string, callback: Function) {
        name = name.toLocaleLowerCase();
        let valueType = Object.prototype.toString.call(name).slice("[object ".length, -1);
        if (valueType != 'String') {
            this.ErrLog("RegNetPack need String head");
            return;
        }

        if (!callback) {
            this.ErrLog("RegNetPack head:%s error", name);
            return
        }
        this.emitter.off(name, callback);
        this.emitterUI.off(name, callback);
    }

    //---------------------发送数据--------------------
    //根据参数发送协议
    public Send(eventName: string, sendPack: {}, callback?: Function, errorCallback?: Function, needWait = false): boolean {
        let newRequestId = this.GetRquestSequenceId();
        let netPackage: NetPackage = new NetPackage(newRequestId, eventName, sendPack, 0, callback, errorCallback);
        let result = null;
        if (true) {
            if (netPackage.name != HeartBeatPackName) {//除了心跳包  其他需要打印日志
                this.Log("[Request:%s] [seq:%s] [%s] : ", new Date(Date.now()).toLocaleTimeString(), newRequestId, netPackage.name, netPackage.dataPackage, "b-g");
            }
            this.netConnector.Send(newRequestId, netPackage.name, netPackage.dataPackage);
            // if (ImmediatelyDealList.indexOf(eventName) < 0)//不是特殊协议需设置超时
            //     this.StartWaitTime([eventName]);
            // result = netPackage;
        } else {
            this.netConnector.OutputClientInfo();
            if (ImmediatelyDealList.indexOf(eventName) < 0)//不是特殊协议需自动重连
                this.Reconnect();
        }
        this.sendPackage[newRequestId] = netPackage;
        if (result && needWait) {
            this.waitSeqMap[newRequestId] = 1;
            this._onWaitPack();
        }
        return result;
    }

    //发送网络中断时堆积的网络包
    public SendStacking() {
        if (!this.netConnector.isConnect) {//发送堆积的协议时主动重连
            this.netConnector.OutputClientInfo();
            this.Reconnect();//发送堆积的协议时主动重连
            return false;
        }

        let needStartWait = false;
        let sendList = [];
        for (let key in this.sendPackage) {//遍历所有堆积协议  进行逐个发送
            sendList.push(key);
            let netPackage = this.sendPackage[key];
            if (ImmediatelyDealList.indexOf(netPackage.name) < 0)//不是特殊协议需设置超时
                needStartWait = true;
            if (netPackage.name != HeartBeatPackName) {//除了心跳包其他需要打印日志
                this.Log("[Request%s] [seq:%s] [%s] : ", new Date(Date.now()).toLocaleTimeString(), key, netPackage.name, netPackage.dataPackage, "b-g");
            }
            this.netConnector.Send(Number(key), netPackage.name, netPackage.dataPackage);
        }
        if (needStartWait)
            this.StartWaitTime(sendList);
        return true;
    }

    //启动等待回包
    private StartWaitTime(sendList: string[]) {
        if (this.sendTimeId) {
            clearTimeout(this.sendTimeId);
            this.sendTimeId = null;
        }
        let self = this;
        this.sendTimeId = setTimeout(function () {
            self.SendTimeOut(sendList);
        }, this.RequestTimeOutTick)
    }

    private SendTimeOut(sendList: string[]) {
        this.trySendTimes += 1;

        this.Log("重复请求次数 :%s  等待协议: %s", this.trySendTimes, sendList.join(" , "));

        //如果重试次数大于最大值,则主动断线重连
        if (this.trySendTimes >= MaxTryRequestCount) {
            this.Log("重连超过最大次数 (%s) MaxTryRequestCount", this.trySendTimes);
            this.trySendTimes = 0;
            clearTimeout(this.heartBeatTimeId);
            this.heartBeatTimeId = null;
            clearTimeout(this.heartBeatTimeOutId);
            this.heartBeatTimeOutId = null;
            this.netConnector.Close();
            //提示请求失败,确定重连网络
            this._onSendTimeOut();
        } else {
            //再次发送请求
            this.SendStacking();
        }
    }

    public async Reqest<T1 extends ReqMsgData,T2 extends ReqMsgData>(req: T1,res:T2){
        cc.log("发送数据:",req);
        this.netConnector.Request(req.mName,req);
    }
}

export = Session;