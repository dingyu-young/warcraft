
//字节流写入类
import {ComTool} from "../ComTool";

export class WriteByteArray {

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
