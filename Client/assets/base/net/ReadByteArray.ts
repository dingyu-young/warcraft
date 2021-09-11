import {ComTool} from "../ComTool";
import * as gzip from "../lib/gzip/gzip-js"


export class ReadByteArray {

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
        //
        // var compressed = this.dataview.getUint8(this.offset);
        // this.offset += 1;
        var compressed = false;
        var tempBuffer = this.buffer.slice(this.offset, this.offset + length);
        //cc.error("length",this.offset, length, tempBuffer, tempBuffer.byteLength);
        this.offset += length;

        if (compressed) {
            var tempArray = new Uint8Array(tempBuffer);
            // var unzipBuffer = gzip.unzip(tempArray);
            return ComTool.strdecode(tempArray);
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