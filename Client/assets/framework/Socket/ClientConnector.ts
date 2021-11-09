
//字节流读取类
import {BaseClass} from "../base/BaseClass";
import {ComTool} from "../util/ComTool";
import * as gzip from "../net/lib/gzip/gzip-js"

class EgretReadByteArray {

    private buffer: ArrayBuffer;
    private dataview: DataView;
    private offset: number;

    constructor(buffer: ArrayBuffer) {
        this.buffer = buffer;
        this.dataview = new DataView(this.buffer);
        this.offset = 0;
    }

    readByte(): number {
        var ret = this.dataview.getUint8(this.offset);
        this.offset += 1;
        return ret;
    }

    readShort(): number {
        var ret = this.dataview.getInt16(this.offset);
        this.offset += 2;
        return ret;
    }

    readInt(): number {
        var ret = this.dataview.getInt32(this.offset);
        this.offset += 4;
        return ret;
    }

    readUTF(): string {
        var length = this.dataview.getInt16(this.offset);
        this.offset += 2;
        var tempBuffer = this.buffer.slice(this.offset, this.offset + length);
        //cc.error("length",this.offset, length, tempBuffer, tempBuffer.byteLength);
        this.offset += length;
        var ret = ComTool.strdecode(tempBuffer);
        return ret;
    }

    readCompressUTF(): string {
        var length = this.dataview.getInt32(this.offset);
        this.offset += 4;

        var compressed = this.dataview.getUint8(this.offset);
        this.offset += 1;

        var tempBuffer = this.buffer.slice(this.offset, this.offset + length);
        //cc.error("length",this.offset, length, tempBuffer, tempBuffer.byteLength);
        this.offset += length;

        if (compressed) {
            var tempArray = new Uint8Array(tempBuffer);
            var unzipBuffer = gzip.unzip(tempArray);
            return ComTool.strdecode(unzipBuffer);
        } else {
            return ComTool.strdecode(tempBuffer);
        }
    }

    readBuffer(): ArrayBuffer {
        var length = this.readShort();
        var tempBuffer = this.buffer.slice(this.offset, this.offset + length);
        this.offset += length;
        return tempBuffer;
    }

    // // ArrayBuffer转为字符串，参数为ArrayBuffer对象
    // ab2str:function(buf) {
    //     return String.fromCharCode.apply(null, new Uint16Array(buf));
    // },
}

//字节流写入类
class EgretWriteByteArray {

    private buffer: ArrayBuffer;
    private dataview: DataView;
    private offset: number;

    constructor(length: number) {
        this.buffer = new ArrayBuffer(length);
        this.dataview = new DataView(this.buffer);
        this.offset = 0;
    }

    getBuffer(): ArrayBuffer {
        //cc.error(this.buffer.byteLength, this.offset);
        var retBuffer = this.buffer.slice(0, this.offset);
        //cc.error("getBuffer", retBuffer);
        return this.buffer;
    }

    writeByte(value: number) {
        var ret = this.dataview.setUint8(this.offset, value);
        this.offset += 1;
        //cc.error('offset:', this.offset);
    }

    writeShort(value: number) {
        var ret = this.dataview.setInt16(this.offset, value);
        this.offset += 2;
        //cc.error('offset:', this.offset);
    }

    writeInt(value: number) {
        var ret = this.dataview.setInt32(this.offset, value);
        this.offset += 4;
        //cc.error('offset:', this.offset);
    }

    writeUTF(str: string) {
        //cc.error(this.dataview, str, str.length);
        var strBuffer = ComTool.strencode(str);
        // this.writeShort(strBuffer.length);
        this.copyArray(new Uint8Array(this.buffer), this.offset, strBuffer, 0, strBuffer.length);
        this.offset += strBuffer.length;

        //cc.error(this.dataview, strBuffer.length);
        //cc.error('offset:', this.offset);
    }

    writeUTFByByte(buf:number[]){
        this.copyArray(new Uint8Array(this.buffer), this.offset, buf, 0, buf.length);
        this.offset += buf.length;
    }

    writeBuffer(buffer: ArrayBuffer) {
        var byteBuffer = new Uint8Array(buffer);
        this.writeShort(byteBuffer.length);
        this.copyArray(new Uint8Array(this.buffer), this.offset, byteBuffer, 0, byteBuffer.length);
        this.offset += byteBuffer.length;
    }

    copyArray(dest: Uint8Array, doffset: number, src: number[] | Uint8Array, soffset: number, length: number) {
        // Uint8Array
        for (var index = 0; index < length; index++) {
            dest[doffset++] = src[soffset++];
        }
    }

    // // 字符串转为ArrayBuffer对象，参数为字符串
    // str2ab(str) {
    //     var buf = new ArrayBuffer(str.length * 2); // 每个字符占用2个字节
    //     var bufView = new Uint16Array(buf);
    //     for (var i = 0, strLen = str.length; i < strLen; i++) {
    //         bufView[i] = str.charCodeAt(i);
    //     }
    //     return buf;
    // }
}

//客户端连接公共类 
export class SocketClient extends BaseClass {

    private socket: WebSocket;

    private url: string;
    private connected: boolean;

    public OnConnect: (event: Event) => any;
    public OnReconnect: (event: Event) => any;
    public OnSocketError: (event: ErrorEvent) => any;
    public OnReconnectError: (event: ErrorEvent) => any;

    public OnSocketClose: (ev: CloseEvent) => any;
    public OnServerPush: (seq: number, name: string, errorCode: number, message: {}) => any;
    public OnServerRequest: (seq: number, name: string, errorCode: number, message: {}) => any;

    public netSizeDict = {};

    get isConnect(): boolean {
        try {
            WebSocket.CONNECTING;
            WebSocket.CLOSED;
            WebSocket.CLOSING;
            return this.socket != null && this.connected && this.socket.readyState == WebSocket.OPEN;
        } catch (error) {
            this.ErrLog("获取网络状态错误: message:%s stack:%s", error.message);
            return false;
        }
    }

    get isSocketOpen(): boolean {
        return this.socket != null;
    }

    Init() {
        // this.JS_Name = "ClientConnector";
    }

    Close() {
        if (!this.socket) {
            return;
        }
        this.connected = false;
        this.socket.onopen = null;
        this.socket.onerror = null;
        this.socket.onclose = null;
        this.socket.onmessage = null;
        //链接存在的时候才会调用断开连接接口
        try {
            this.socket.close();
            // this.Log("连接断开:%s", this.url, "w-g");
        } catch (error) {
            this.ErrLog("关闭网络链接错误: message:%s stack:%s", error.message)
        }
        this.socket = null;
    }

    OutputClientInfo() {
        try {
            if (this.socket) {
                // this.Log("链接socket状/态: %s ,  %s", this.connected, this.socket.readyState, "b-gb");
            } else {
                // this.Log("链接socket为空", "b-gb");
            }
        } catch (error) {
            this.ErrLog("获取网络状态错误: message:%s stack:%s", error.message)
        }
    }

    Connect(ip: string, port: string) {
        this.Close();

        // if (ComTool.IsWeChatGame()) {
        //     this.url = ['wss://', ip].join("");
        // } else {
        //     this.url = ['ws://', ip, ':', port].join("");
        // }
        this.url = ['ws://', ip, ':', port].join("");
        this.url = "ws://192.168.3.91:9001";
        this.socket = new WebSocket(this.url);
        this.socket.binaryType = 'arraybuffer';
        this.socket.onopen = this.OnConnectEvent.bind(this);
        this.socket.onmessage = this.OnReceiveEvent.bind(this);
        this.socket.onerror = this.OnErrorEvent.bind(this);
        this.socket.onclose = this.OnCloseEvent.bind(this);
        // this.Log("开始连接:%s", this.url, "w-g");
    }

    Reconnect() {
        this.Close();

        if (!this.url) {
            this.ErrLog("连接地址为url空:%s", this.url, "w-g");
            return false;
        }
        this.socket = new WebSocket(this.url);
        this.socket.binaryType = 'arraybuffer';
        this.socket.onopen = this.OnReconnectEvent.bind(this);
        this.socket.onmessage = this.OnReceiveEvent.bind(this);
        this.socket.onerror = this.OnReconnectErrorEvent.bind(this);//重连不需要监听错误回调  因为有监听超时事件
        this.socket.onclose = this.OnCloseEvent.bind(this);
        // this.Log("开始重连:%s", this.url, "w-g");
        return true;
    }

    Disconnect() {
        this.Close();
        this.url = null;
    }

    //发送协议
    Send(seqId: number, reqName: string, sendPack: {}) {
        reqName = reqName.toLocaleLowerCase();
        let strMsg = null;
        try {
            strMsg = JSON.stringify({userId:123,userName:"丁宇"});
        } catch (error) {
            this.ErrLog("发送协议json转string错误 error:%s ", error.stack);
            return
        }
        // let length = 1 + 2 + 2 + reqName.length * 3 + 2 + strMsg.length * 3;
        let length = strMsg.length * 3;
        let byte = new EgretWriteByteArray(length);
        //创建 ByteArray 对象
        // byte.writeByte(2);//消息类型
        // byte.writeShort(seqId);//消息序列号
        // byte.writeUTF(reqName);//数据类型
        byte.writeUTF(strMsg);//消息体
        //发送数据
        // this.socket.send(reqName);
        this.socket.send(byte.getBuffer());
    }

    //协议格式
    //内容长度4字节  魔术4字节   协议名长度4字节   协议名称   数据
    //      99           12345           16         Rq_Login
    async Request(reqName:string,data:any){
        //
        let msg:string = null;
        try {
            msg = JSON.stringify(data);
        } catch (error) {
            this.ErrLog("发送协议json转string错误 error:%s ", error.stack);
            return
        }

        let length = 4 + 4 + 4;

        let msgBuf = ComTool.strencode(msg);
        let reqNameBuf = ComTool.strencode(reqName);
        length += reqNameBuf.length;
        length += msgBuf.length;
        //创建 ByteArray 对象
        let byte = new EgretWriteByteArray(length);
        byte.writeInt(length);
        byte.writeInt(12345);//魔术,判断是否是有效包
        byte.writeInt(reqNameBuf.length);//协议名长度
        byte.writeUTFByByte(reqNameBuf);//消息名
        byte.writeUTFByByte(msgBuf);//消息体
        cc.log("发送字节数:",length);
        this.socket.send(byte.getBuffer());
    }

    OnConnectEvent(event: Event) {
        this.Log("连接成功:%s", this.url, "w-g");
        this.connected = true;
        if (this.OnConnect)
            this.OnConnect(event);
    }

    OnReconnectEvent(event: Event) {
        this.Log("连接成功:%s", this.url, "w-g");
        this.connected = true;
        if (this.OnReconnect)
            this.OnReconnect(event);
    }

    //当连接产生错误
    OnErrorEvent(event: ErrorEvent) {
        this.Log("连接发生错误:%s", this.url, event, "w-g");
        this.connected = false;
        if (this.OnSocketError)
            this.OnSocketError(event);
    }

    OnReconnectErrorEvent(event: ErrorEvent) {
        this.Log("重连发生错误:%s", this.url, event, "w-g");
        this.connected = false;
        if (this.OnReconnectError)
            this.OnReconnectError(event);
    }

    //当连接断开
    OnCloseEvent(event: CloseEvent) {
        this.Log("连接断开:%s", this.url, "w-g");
        this.connected = false;
        if (this.OnSocketClose)
            this.OnSocketClose(event);
    }

    //当收到服务器数据
    OnReceiveEvent(event: MessageEvent) {

        try {
            let byteArray = new EgretReadByteArray(event.data);//将收到的数据存入一个读取对象中
            // var tempArray = new Uint8Array(event.data);
            // var unzipBuffer = gzip.unzip(tempArray);
            let msg = ComTool.strdecode(event.data);
            cc.log("收到服务端消息",JSON.parse(msg));
            return;
            byteArray.readByte();//读取版本号
            let messageType = byteArray.readByte();//读取消息类型
            byteArray.readByte();//协议兼容
            (byteArray.readInt() << 32) + byteArray.readInt();//协议兼容
            byteArray.readByte();//协议兼容
            (byteArray.readInt() << 32) + byteArray.readInt();//协议兼容

            let eventName = byteArray.readUTF().toLocaleLowerCase();

            let preSize = this.netSizeDict[eventName] || 0;
            this.netSizeDict[eventName] = preSize + event.data.byteLength / 1024;

            let sequence = byteArray.readShort();
            let errorCode = byteArray.readShort();
            let strBody = byteArray.readCompressUTF();
            let body = null;
            if (errorCode) {
                body = {"Msg": strBody};
            } else {
                try {
                    body = JSON.parse(strBody);
                } catch (error) {
                    this.ErrLog("解析服务器返回数据错误 strBody:%s,error:%s", strBody, error.stack);
                    return
                }
            }
            cc.log(body);

            //消息类型为2时属于服务器主动推送消息
            if (messageType == 2) {
                if (this.OnServerPush != null) {
                    // this.OnServerPush(sequence, eventName, errorCode, body);
                }
            } else {
                if (this.OnServerRequest != null) {
                    // this.OnServerRequest(sequence, eventName, errorCode, body);
                }
            }
        } catch (error) {
            this.ErrLog(error);
        }
    }

}
