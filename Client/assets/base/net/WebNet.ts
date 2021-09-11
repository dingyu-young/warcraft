

//websocket客户端
import {ComTool} from "../ComTool";
import {WriteByteArray} from "./WriteByteArray";
import {ReadByteArray} from "./ReadByteArray";
import {NetTool} from "./NetTool";

export class WebNet {
    private socket:WebSocket;//
    private url:string;//连接地址
    private _isConnect:boolean;//是否连接

    private requestMap:Map<number,Function> = new Map();

    public ListenResponse(requestId:number, callback:Function){
        this.requestMap.set(requestId,callback);
    }


    //连接
    public Connect(ip:string,port:string){
        //连接前先关闭之前的socket;
        this.Close();
        this.url = ["ws://",ip,":",port].join("");
        this.socket = new WebSocket(this.url);
        this.socket.binaryType = "arraybuffer";
        this.socket.onopen = this.OnSocketOpen.bind(this);
        this.socket.onclose = this.OnSocketClose.bind(this);
        this.socket.onerror = this.OnSocketError.bind(this);
        this.socket.onmessage = this.OnSocketMessage.bind(this);
    }

    //重新连接
    public ReConnect(){
        this.Close();
        if(!this.url){
            cc.error("没有初始化socket的url")
            return;
        }
        this.socket = new WebSocket(this.url);
        this.socket.binaryType = "arraybuffer";
        this.socket.onopen = this.OnSocketReConnect.bind(this);//重连成功回调;
        this.socket.onclose = this.OnSocketClose.bind(this);
        this.socket.onerror = this.OnSocketError.bind(this);
        this.socket.onmessage = this.OnSocketMessage.bind(this);
    }

    public Close(){
        if (!this.socket) {
            return;
        }
        this._isConnect = false;
        this.socket.onopen = null;
        this.socket.onerror = null;
        this.socket.onclose = null;
        this.socket.onmessage = null;
        try {
            this.socket.close();
            // this.Log("连接断开:%s", this.url, "w-g");
        } catch (error) {
            cc.error("关闭网络链接错误: message:%s", error.message);
        }
        this.socket = null;
    }

    //socket连接打开
    OnSocketOpen(event: Event){
        cc.log("socket连接成功");
        this._isConnect = true;

    }

    //socket连接关闭
    OnSocketClose(event: CloseEvent){
        cc.log("socket关闭",event);
        this._isConnect = false;
    }

    //连接出错
    OnSocketError(event: ErrorEvent){
        cc.log("socket出现错误",event);
        this._isConnect = true;
    }

    //收到socket消息
    OnSocketMessage(event: MessageEvent){
        try{
            let byteArray = new ReadByteArray(event.data);//将收到的数据存入一个读取对象中
            let msgType = byteArray.readInt();//消息类型
            let body = byteArray.readCompressUTF();
            try {
                let repData = JSON.parse(body);
                cc.log("收到消息:");
                if(repData == "error"){
                    cc.error("协议出现错误");
                    repData = null;
                }

                //消息类型为2是服务端推送消息
                if(msgType == 2){

                }else {
                    let accptId = NetTool.getAcceptId();
                    let callback = this.requestMap.get(accptId);
                    if(callback){
                        callback.call(this,repData);
                        this.requestMap.delete(accptId);
                    }else {
                        // cc.error("请求回复收到但没有对应处理回调!");
                    }
                }
            }catch (e) {
                cc.error(e);
                return;
            }

            // let msg = ComTool.strdecode(event.data);
            // cc.log("收到服务端消息",JSON.parse(msg));
            return;
        }catch (e) {
            cc.error(e);
        }

    }



    //重连成功
    OnSocketReConnect(){

    }

    //协议格式
    //内容长度4字节  魔术4字节   协议名长度4字节   协议名称   数据
    //      99           12345           16         RQ_Login
    Request(reqName:string,data:any){
        //
        let msg:string = null;
        try {
            msg = JSON.stringify(data);
        } catch (error) {
            cc.error("发送协议json转string错误 error:%s ", error.stack);
            return
        }
        let length = 4 + 4 + 4;

        let msgBuf = ComTool.strencode(msg);
        let reqNameBuf = ComTool.strencode(reqName);
        length += reqNameBuf.length;
        length += msgBuf.length;
        //创建 ByteArray 对象
        let byte = new WriteByteArray(length);
        byte.writeInt(length);
        byte.writeInt(12345);//魔术,判断是否是有效包
        byte.writeInt(reqNameBuf.length);//协议名长度
        byte.writeUTFByByte(reqNameBuf);//消息名
        byte.writeUTFByByte(msgBuf);//消息体
        cc.log("发送字节数:",length);
        this.socket.send(byte.getBuffer());
    }
}