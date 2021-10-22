/*
 * 	ComTool.js
 * 	工具函数管理器模块
 *
 *	author:hongdian
 *	date:2014-10-28
 *	version:1.0
 *
 * 修改时间 修改人 修改内容:
 *
 */



export class ComTool {

    static readonly phoneRexp = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;

    static regExpDict: { [key: string]: any } = {};

    /**
     * client decode
     * msg String data
     * return Message Object
     */
    static strdecode(buffer) {
        var bytes = new Uint8Array(buffer);
        var out = [], pos = 0, c = 0;
        while (pos < bytes.length) {
            var c1 = bytes[pos++];
            if (c1 < 128) {
                out[c++] = String.fromCharCode(c1);
            } else if (c1 > 191 && c1 < 224) {
                var c2 = bytes[pos++];
                out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
            } else if (c1 > 239 && c1 < 365) {
                // Surrogate Pair
                var c2 = bytes[pos++];
                var c3 = bytes[pos++];
                var c4 = bytes[pos++];
                var u = ((c1 & 7) << 18 | (c2 & 63) << 12 | (c3 & 63) << 6 | c4 & 63) -
                    0x10000;
                out[c++] = String.fromCharCode(0xD800 + (u >> 10));
                out[c++] = String.fromCharCode(0xDC00 + (u & 1023));
            } else {
                var c2 = bytes[pos++];
                var c3 = bytes[pos++];
                out[c++] = String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
            }
        }
        return out.join('');
    }

    /**
     *
     * @param str
     */
    static strencode(str) {
        var out = [], p = 0;
        for (var i = 0; i < str.length; i++) {
            var c = str.charCodeAt(i);
            if (c < 128) {
                out[p++] = c;
            } else if (c < 2048) {
                out[p++] = (c >> 6) | 192;
                out[p++] = (c & 63) | 128;
            } else if (
                ((c & 0xFC00) == 0xD800) && (i + 1) < str.length &&
                ((str.charCodeAt(i + 1) & 0xFC00) == 0xDC00)) {
                // Surrogate Pair
                c = 0x10000 + ((c & 0x03FF) << 10) + (str.charCodeAt(++i) & 0x03FF);
                out[p++] = (c >> 18) | 240;
                out[p++] = ((c >> 12) & 63) | 128;
                out[p++] = ((c >> 6) & 63) | 128;
                out[p++] = (c & 63) | 128;
            } else {
                out[p++] = (c >> 12) | 224;
                out[p++] = ((c >> 6) & 63) | 128;
                out[p++] = (c & 63) | 128;
            }
        }
        return out;
    }

    //更新版本比较函数
    static VersionCompare(versionA, versionB) {
        var vA = versionA.split('.');
        var vB = versionB.split('.');

        for (var i = 0; i < vA.length; ++i) {
            var a = parseInt(vA[i]);
            var b = parseInt(vB[i] || 0);
            if (a === b) {

            } else {
                return a - b;
            }
        }
        if (vB.length > vA.length) {
            return -1;
        } else {
            return 0;
        }
    }

    //更新文件md5校验
    //resPath:资源完整路径
    static ResMD5Verify(resPath, asset) {
        // When asset is compressed, we don't need to check its md5, because zip file have been deleted.
        var compressed = asset.compressed;
        // Retrieve the correct md5 value.
        var expectedMD5 = asset.md5;
        // asset.path is relative path and resPath is absolute.
        var relativePath = asset.path;
        // The size of asset file, but this value could be absent.
        var size = asset.size;

        var ext = cc.path.extname(relativePath);

        //文件不需要校验
        if (compressed || ext == ".manifest") {
            return true;
        } else {
            try {
                let fileSize = jsb.fileUtils.getFileSize(resPath);
                if (fileSize == size) {
                    return true;
                } else {
                    return false;
                }
            } catch (e) {
                return true;
            }
        }
    }


    /**
     * 替换消息文本  格式  {S1}{S2}{S3}....{S?}  传入数组替换{S1}至{Sn}
     * @param msgID 消息ID
     * @return 无返回值
     * @remarks
     */
    static TranslateMsgContent(msgContent: string, paramList: any[]) {
        let count = paramList.length;

        // 替换文本
        for (let index = 0; index <= count; index++) {

            let param = paramList[index];
            let argIndex = index + 1;
            let regExpObj = null;

            let regKeyString = this.StringAddNumSuffix("S", argIndex, 1);
            if (msgContent.indexOf(regKeyString) != -1) {

                if (this.regExpDict.hasOwnProperty(regKeyString)) {
                    regExpObj = this.regExpDict[regKeyString];
                } else {
                    regExpObj = new RegExp("{" + regKeyString + "}", "g");
                    this.regExpDict[regKeyString] = regExpObj
                }
                msgContent = msgContent.replace(regExpObj, param);
            }
        }

        return msgContent
    }

    //--------------引擎判断接口-------------
    //是否微信小游戏平台
    static IsWeChatGame() {
        return cc.sys.platform === cc.sys.WECHAT_GAME;
    }

    //是否是QQ玩一玩
    static IsQQPlay() {
        var browserType = cc.sys.browserType;

        if (browserType && browserType == cc.sys.BROWSER_TYPE_QQ) {
            return true;
        }

        return false;
    }

    //是否是微信浏览器环境
    static IsWeChatBrowser() {

        var browserType = cc.sys.browserType;

        //mqqbrowser 安卓中微信浏览器标示
        if (browserType && browserType == cc.sys.BROWSER_TYPE_MOBILE_QQ) {
            return true
        }
        //怕异常多处理wechat的判断 一般wechat是ios中微信标示
        else if (browserType && browserType == cc.sys.BROWSER_TYPE_WECHAT) {
            return true
        }

        return false
    }

    /**
     * 是否是ios平台
     * @returns {Boolean}
     */
    static IsIOS() {
        return cc.sys.isNative && cc.sys.os == cc.sys.OS_IOS
    }

    // static UNKNOWN: number;		//cc.sys.platform
    // static WIN32: number;		//cc.sys.platform
    // static LINUX: number;		//cc.sys.platform
    // static MACOS: number;		//cc.sys.platform
    // static ANDROID: number;		//cc.sys.platform
    // static IPHONE: number;		//cc.sys.platform
    // static IPAD: number;		//cc.sys.platform
    // static BLACKBERRY: number;		//cc.sys.platform
    // static NACL: number;		//cc.sys.platform
    // static EMSCRIPTEN: number;		//cc.sys.platform
    // static TIZEN: number;		//cc.sys.platform
    // static WINRT: number;		//cc.sys.platform
    // static WP8: number;		//cc.sys.platform
    // static MOBILE_BROWSER: number;		//cc.sys.platform
    // static DESKTOP_BROWSER: number;		//cc.sys.platform
    // /** Indicates whether executes in editor's window process (Electron's renderer context) */
    // static EDITOR_PAGE: number;		//cc.sys.platform
    // /** Indicates whether executes in editor's main process (Electron's browser context) */
    // static EDITOR_CORE: number;		//cc.sys.platform
    // static WECHAT_GAME: number;		//cc.sys.platform

    //是否是安卓
    static IsAndroid() {
        return cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID
    }

    //是否是win
    static IsWindows() {
        return cc.sys.isNative && cc.sys.os == cc.sys.OS_WINDOWS;
    }

    //是否是纯数字
    static CheckIsInteger(content) {
        let r, re;
        re = /\d*/i; //\d表示数字,*表示匹配多个数字
        r = content.match(re);
        return (r == content) ? true : false;
    }

    //----------------列表方法---------------
    //数组平均值
    static average(targetList: number[]) {
        if (targetList == null || targetList.length == 0)
            return 0;
        let value = 0;
        for (let i = 0; i < targetList.length; i++) {
            value += targetList[i];
        }
        return value / targetList.length;
    }

    //权重随机
    static WeightedRandom(arr: number[]) {
        let total = 0;

        for (let i = 0; i < arr.length; i++) {
            total += arr[i];
        }

        let random = Math.random() * total;

        for (let i = 0; i < arr.length; i++) {
            random -= arr[i];
            if (random <= 0)
                return i
        }
        return arr.length - 1;
    }

    //随机打乱一个数组
    static shuffle(arr: number[]) {
        var len = arr.length;
        for (var i = 0; i < len - 1; i++) {
            var index = Math.floor(Math.random() * (len - i));
            var temp = arr[index];
            arr[index] = arr[len - i - 1];
            arr[len - i - 1] = temp;
        }
        return arr;
    }

    //列表随机1个出来
    static ListChoice(targetList: any[]) {
        var length = targetList.length;
        if (length < 1) {
            return null;
        }
        return targetList[Math.floor(Math.random() * (length))];
    }

    //求列表的最大值
    static ListMaxNum(targetList: any[]) {
        return Math.max.apply(null, targetList);
    }

    //求列表的最小值
    static ListMinNum(targetList: any[]) {
        return Math.min.apply(null, targetList);
    }

    static ReadString(keyName, value) {
        if (typeof (value) == "string") {
            value = value.replace(/(^\s*)|(\s*$)/g, "");
            //如果是List或者Dict
            if (keyName.endsWith("List")) {
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    value = [];
                }
            } else if (keyName.endsWith("Dict")) {
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    value = {};
                }
            }
            //如果是纯数字取整
            else if (!isNaN(value)) {
                //如果是空字符串
                if (value == "") {
                }
                //如果包含小数点,不取整,资源版本可能是浮点数
                else if (value.indexOf(".") > -1) {

                } else {
                    value = Math.floor(value);
                }
            }
        }
        return value;
    }

    static Number2String(number: number) {
        if (number == undefined) {
            return "";
        }
        if (number >= 0) {
            return "+" + number;
        } else {
            return number.toString();
        }
    }

    //比较版本号
    //第一个是否比第二个大
    static CompareResVersion(curV, reqV) {
        if (curV && reqV) {
            //将两个版本号拆成数字
            var arr1 = curV.split('.'),
                arr2 = reqV.split('.');
            var minLength = Math.min(arr1.length, arr2.length),
                position = 0,
                diff = 0;
            while (position < minLength && ((diff = parseInt(arr1[position]) - parseInt(arr2[position])) == 0)) {
                position++;
            }
            diff = (diff != 0) ? diff : (arr1.length - arr2.length);
            //若curV大于reqV，则返回true
            return diff > 0;
        } else {
            //输入为空
            cc.log("版本号不能为空");
            return false;
        }
    }

    //----------------字符串方法------------------

    //增加字符串数字后缀 ("btnFight", 1, 2)) - > "btnFight01"
    static StringAddNumSuffix(targetString: string, num: number, suffixLen: number) {
        var numString = "" + num;
        if (suffixLen) {
            var numLen = numString.length;
            numString = numLen < suffixLen ? (Array(suffixLen - numLen + 1).join('0') + num) : numString;
        }

        return [targetString, numString].join("");
    }

    //替换字符串中的文本("第{1}次", 10)) - > "第10次"
    static StringReplace(targetString: string, argList: any[]) {

        var formatStr = targetString;
        var argumentsLen = argList.length;
        for (var index = 1; index <= argumentsLen; index++) {
            formatStr = formatStr.replace(new RegExp("\\{" + index + "\\}", "g"), argList[index - 1]);
        }
        return formatStr
    }

    //去除左空格
    static StringLeftTrim(targetString: string) {
        return targetString.replace(/(^\s*)/g, "");
    }

    //去除右空格
    static StringRightTrim(targetString: string) {
        return targetString.replace(/(\s*$)/g, "");
    }

    //去除2边空格
    static StringTrim(targetString: string) {
        return targetString.replace(/(^\s*)|(\s*$)/g, "");
    }

    //替换指定位置的字符
    static StringReplacePos(strObj, pos, replacetext) {
        return strObj.substr(0, pos - 1) + replacetext + strObj.substring(pos, strObj.length);
    }

    //10000 -> 1万
    static simplifyNum(num: number) {
        if (num >= 100000000) {
            return [Math.floor(num / 100000000), "亿"].join("");
        } else if (num >= 10000) {
            return [Math.floor(num / 10000), "万"].join("");
        } else {
            return num
        }
    }

    //exactNum:保留几位小数点 eg:exactNum =1,1234567 => 123.1万
    static simplifyExactNum(num: number, exactNum: number) {
        if (num >= 100000000) {
            if (exactNum > 0) {
                return (Math.floor(num / 100000000 * Math.pow(10, exactNum)) / Math.pow(10, exactNum)).toFixed(exactNum) + "亿";
            } else {
                return num / 100000000 + "亿";
            }
        } else if (num >= 10000) {
            if (exactNum > 0) {
                return (Math.floor(num / 10000 * Math.pow(10, exactNum)) / Math.pow(10, exactNum)).toFixed(exactNum) + "万";
            } else {
                return num / 10000 + "万";
            }
        } else {
            return num
        }
    }

    //exactNum:保留几位(整数和小数一共多少位) eg:exactNum =4, 1234567 => 123.1万 12345 => 1.234万
    static simplifyFixedDigits(num, exactNum) {
        if (num >= 100000000) {
            num = parseInt(num);
            let stNum = num.toString();
            let num1 = stNum.slice(0, stNum.length - 8);
            if (num1.length >= exactNum) {
                return num1 + "亿";
            } else {
                let needCnt = Math.max(0, exactNum - num1.length);
                let num2 = stNum.slice(stNum.length - 8, stNum.length - 8 + needCnt);
                return [parseFloat([num1, ".", num2].join("")), "亿"].join("");
            }
        } else if (num >= 10000) {
            num = parseInt(num);
            let stNum = num.toString();
            let num1 = stNum.slice(0, stNum.length - 4);
            if (num1.length >= exactNum) {
                return num1 + "万";
            } else {
                let needCnt = Math.max(0, exactNum - num1.length);
                let num2 = stNum.slice(stNum.length - 4, stNum.length - 4 + needCnt);
                return [parseFloat([num1, ".", num2].join("")), "万"].join("");
            }
        } else {
            return num
        }
    }


    //---------------对象方法----------------
    //深拷贝(列表,字典)
    static DeepCopy(target: any) {
        return JSON.parse(JSON.stringify(target));
    }

    /**
     * json转url
     * @param dataDict
     * @constructor
     */
    static GetUrlStr(dataDict: any) {

        if (!dataDict) {
            return ""
        }
        var strList = [];
        for (var key in dataDict) {
            strList.push(key + '=' + dataDict[key]);
        }

        return strList.length > 0 ? '?' + strList.join('&') : "";
    }

    /**
     * url转json
     * @param para
     * @constructor
     */
    static GetUrlData(para) {
        let dataDict = {};
        //url启动参数
        if (!para) {
            para = "";
        }
        let paraList = [];
        if (para.length) {
            paraList = para.split("&");
        }
        //如果本次获取的启动参数是空的会保留上一次启动的参数,有新的启动参数才会覆盖旧的
        //可以保证应用已经启动的情况下 url跳转进来可以更新最新启动参数
        let count = paraList.length;

        for (let index = 0; index < count; index++) {
            let paraInfo = paraList[index];
            let paraDataList = paraInfo.split("=");
            if (paraDataList.length != 2) {
                continue
            }
            try {
                dataDict[paraDataList[0]] = JSON.parse(decodeURIComponent(paraDataList[1]));
            } catch (e) {
                dataDict[paraDataList[0]] = decodeURIComponent(paraDataList[1]);
            }
        }

        return dataDict;
    }

    /**
     * 获得一个随机整数 ：start<= randValue <= end
     * @return {Number}
     * @remarks {}
     * @param start
     * @param end
     */
    static RandInt(start: number, end: number) {
        return Math.floor(Math.random() * (end + 1 - start) + start);
    }

    static RandIntList(start: number, end: number, number) {
        let list = [];
        for (let i = start; i < end + 1; i++) {
            list.push(i);
        }
        let result = [];
        for (let i = 0; i < number; i++) {
            result.push(list.splice(this.RandInt(0, list.length - 1), 1)[0])
        }
        return result
    }

    //------------------------时间方法--------------------------
    /**
     * 本地时间转换成北京时间: 2020-9-24
     * @constructor
     */
    static GetBJDate() {
        let date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        date.setHours(date.getHours() + date.getTimezoneOffset() / 60 + 8)
        return [this.StringAddNumSuffix("", year, 4),
            this.StringAddNumSuffix("", month, 2),
            this.StringAddNumSuffix("", day, 2)].join("-");
    }

    /**
     *    获取时间天数差
     *    tick_1:毫秒值
     *    tick_2:毫秒值
     */
    static GetDeltaDayByTick(tick_1: number, tick_2: number) {
        var dateTime_1, dateTime_2;

        dateTime_1 = new Date(tick_1);
        dateTime_2 = new Date(tick_2);

        dateTime_1 = Date.parse((dateTime_1.getMonth() + 1) + "/" + dateTime_1.getDate() + "/" + dateTime_1.getFullYear());
        dateTime_2 = Date.parse((dateTime_2.getMonth() + 1) + "/" + dateTime_2.getDate() + "/" + dateTime_2.getFullYear());
        return Math.abs(dateTime_1 - dateTime_2) / (24 * 60 * 60 * 1000);
    }

    /**
     * 获取时间差 1天10：23：23
     */
    static GetDeltaTimeByTick(tick_1: number, tick_2: number) {
        let diffTime = Math.abs(tick_1 - tick_2);
        let hour = Math.floor(diffTime / 3600);
        let diffmin = diffTime - hour * 3600;
        let min = this.StringAddNumSuffix("", Math.floor(diffmin / 60), 2);
        let diffsec = diffmin - Math.floor(diffmin / 60) * 60;
        let sec = this.StringAddNumSuffix("", diffsec, 2);
        let day = 0;
        if (hour >= 24) {
            day = Math.floor(hour / 24);
            hour = hour - day * 24
        }
        if (hour) {
            if (day) {
                return [day, "天", hour, ":", min, ":", sec].join("");
            }
            return [hour, ":", min, ":", sec].join("");
        } else {
            if (day) {
                return [day, "天", 0, ":", min, ":", sec].join("");
            }
            return [min, ":", sec].join("");
        }

    }

    /**
     * 获取当前时间字符串格式: 4月8日
     * 毫秒值
     */
    static GetMonthDay(time: number) {
        var date = new Date(time);
        var month = date.getMonth() + 1;
        var day = date.getDate();
        return this.StringAddNumSuffix("", month, 2) + "月" + this.StringAddNumSuffix("", day, 2) + "日";
    }

    /**
     * 获取当前时间字符串格式: 4月8日 18:14
     */
    static GetMonthDayHourMinuteString(time: number) {
        var date = new Date(time);
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var houes = date.getHours();
        var minutes = date.getMinutes();

        return this.StringAddNumSuffix("", month, 2) + "月" + this.StringAddNumSuffix("", day, 2) + "日 " + this.StringAddNumSuffix("", houes, 2) + ":" + this.StringAddNumSuffix("", minutes, 2);
    }

    /**
     * 获取日期+时间字符串格式: 2017-3-28 11:11
     * 精确到分钟
     */
    static GetDateYearMonthDayHourMinuteString(time: number) {
        var date = new Date(time);
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var houes = date.getHours();
        var minutes = date.getMinutes();

        var dateString = [this.StringAddNumSuffix("", year, 4),
            this.StringAddNumSuffix("", month, 2),
            this.StringAddNumSuffix("", day, 2)].join("-");
        dateString += " ";
        dateString += [this.StringAddNumSuffix("", houes, 2),
            this.StringAddNumSuffix("", minutes, 2)].join(":");
        return dateString;
    }

    /**
     * 获取日期字符串格式: 2017-3-28
     */
    static GetDateString(time: number, separator: string = "-") {
        var date = new Date(time);
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();

        return [this.StringAddNumSuffix("", year, 4),
            this.StringAddNumSuffix("", month, 2),
            this.StringAddNumSuffix("", day, 2)].join(separator);
    }

    /**
     * 获取日期+时间字符串格式: 2017-3-28 11:11:11
     * 精确到秒钟
     */
    static GetDateYearMonthDayHourMinuteSecondString(time: number) {
        var date = new Date(time);
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var houes = date.getHours();
        var minutes = date.getMinutes();
        var second = date.getSeconds();

        var dateString = [this.StringAddNumSuffix("", year, 4),
            this.StringAddNumSuffix("", month, 2),
            this.StringAddNumSuffix("", day, 2)].join("-");
        dateString += " ";
        dateString += [this.StringAddNumSuffix("", houes, 2),
            this.StringAddNumSuffix("", minutes, 2),
            this.StringAddNumSuffix("", second, 2)].join(":");
        return dateString;
    }

    /**
     * 获取时间字符串格式: 11:11:11
     * 精确到秒钟
     */
    static GetDateHourMinuteSecondString(time: number) {
        var date = new Date(time);
        var houes = date.getHours();
        var minutes = date.getMinutes();
        var second = date.getSeconds();

        return [this.StringAddNumSuffix("", houes, 2),
            this.StringAddNumSuffix("", minutes, 2),
            this.StringAddNumSuffix("", second, 2)].join(":");
    }

    //----------------------通用接口-------------------------
    static SetLocalImage(node: cc.Node | cc.Component, key: string) {
        if (node instanceof cc.Component) {
            node = node.node;
        }
        let comp: any = node.getComponent("SpriteIconSet");
        if (!comp) comp = node.addComponent("SpriteIconSet");
        comp.SetImage(DownloadImage.image, key);
    }

    static SetRemoteImage(node: cc.Node | cc.Component, key: string, type: DownloadImage) {
        if (!node) {
            return;
        }
        if (!key && type == DownloadImage.wechatHead) {
            this.SetLocalImage(node, "headImg");
            return;
        }
        if (!key) {
            this.ClearImage(node);
            return;
        }
        DownImageManager.instance().DownImage(key, type);
        let comp: any = node.getComponent("SpriteIconSet");
        if (!comp) comp = node.addComponent("SpriteIconSet");
        comp.SetImage(type, MD5(key, null).toString().toUpperCase());
    }

    static ClearImage(node: cc.Node | cc.Component) {
        if (!node) {
            return;
        }
        if (node.getComponent(cc.Sprite)) {
            node.getComponent(cc.Sprite).spriteFrame = null;
        }
    }

    //拷贝字符串到剪贴板
    static CopyToClipboard(content: string) {
        if (cc.sys.isNative) {
            jsb.copyTextToClipboard(content);
        } else if (this.IsWeChatGame()) {//微信小游戏环境
            window["wx"].setClipboardData({
                data: content
            })
        } else {
            var save = function (e) {
                e.clipboardData.setData('text/plain', content);
                e.preventDefault();
            };
            document.addEventListener('copy', save);
            document.execCommand('copy');
            document.removeEventListener('copy', save);
        }
        if (content) {
            UIAlert.instance().show("复制成功");
        }
    }

    //获取剪贴板
    static GetClipboard(call?: (data: string) => any) {
        if (cc.sys.isNative) {
            var content = NativeManager.instance().CallToNative("GetClipboard", [], "String");
            if (call) call(content);
            return content;
        } else if (this.IsWeChatGame()) {//微信小游戏环境
            window["wx"].getClipboardData({
                success: (res) => {
                    if (call) call(res.data);
                },
            });
            return null;
        } else {
            return null;
        }
    }

    static ShowMessageTip(title, content, type: MessageType, target?, confirm?, cancel?, priority?) {
        UIMessage.instance().showMessage({
            title: title,
            content: content,
            type: type,
            confirm: confirm,
            cancel: cancel,
            target: target,
            priority: priority
        })
    }

    //获取贝塞尔曲线，pos1起点 pos2终点,返回控制点
    static GetbezierPos(pos1: cc.Vec2, pos2: cc.Vec2) {
        //先判断是否为竖或横；
        if (pos1.x == pos2.x) {
            let distance = (pos1.y - pos2.y) || 100;
            let x = pos1.x + distance;

            return cc.v2(x, (pos2.y + pos1.y) / 2)
        }
        if (pos1.y == pos2.y) {
            let distance = (pos1.x - pos2.x) || 100;
            let y = pos1.y - distance;
            return cc.v2((pos1.x + pos2.x) / 2, y)
        }

        let distance = pos1.sub(pos1).mag();

        let k = (pos1.y - pos2.y) / (pos1.x - pos2.x);
        let center = cc.v2((pos1.x + pos2.x) / 2, (pos1.y + pos2.y));
        k = (1 / k) * -1;//斜率 y = kx + b;
        let b = center.y - k * center.x;//b;
        let x = 0;

        if (pos1.x > pos2.x) {
            x = center.x + distance;
        } else {
            x = center.x - distance;
        }
        // x = pos1.x;
        return cc.v2(x, k * x + b);

    }

    //获取距离
    static Distance(posList: cc.Vec3[]) {
        if (posList.length == 0) {
            return 0;
        }
        let distance = 0;
        for (let i = 1; i < posList.length; i++) {
            distance += posList[i].sub(posList[i - 1]).mag()
        }
        return distance;
    }

    //截屏
    static ScreenShotAndShare(call, shotNode: cc.Node = null) {
        let width = 0;
        let height = 0;
        let camera = cc.Camera.main;
        if (!shotNode) {
            let size = cc.winSize;
            width = size.width;
            height = size.height;
        } else {
            camera = shotNode.getComponent(cc.Camera);
            if (!camera)
                camera = shotNode.addComponent(cc.Camera);
            width = shotNode.width;
            height = shotNode.height;
        }
        let texture = new cc.RenderTexture();
        let gl = cc.game["_renderContext"];
        texture.initWithSize(width, height, gl.STENCIL_INDEX8);
        camera.zoomRatio = cc.winSize.height / height;
        camera.targetTexture = texture;
        if (shotNode) {
            shotNode.scaleY *= -1;
        } else {
            cc.Canvas.instance.node.scaleY *= -1
        }
        camera.render(shotNode);
        if (shotNode) {
            shotNode.scaleY *= -1;
        } else {
            cc.Canvas.instance.node.scaleY *= -1
        }
        camera.targetTexture = null;

        let picData: Uint8Array = texture.readPixels();
        // picData: Uint8Array = this.filpYImage(data, texture.width, texture.height);
        //截图完成后 删除照相机组件
        if (shotNode) {
            shotNode.removeComponent(cc.Camera);
        }
        if (!cc.sys.isNative) {
            App.instance().ErrLog("ShareScreen not native");
            call("", texture);
            return;
        }
        let sharePath = [jsb.fileUtils.getWritablePath(), "share"].join("");
        //如果有存在这个路径,则删除路径,再创建路径
        if (!jsb.fileUtils.isDirectoryExist(sharePath)) {
            if (!jsb.fileUtils.createDirectory(sharePath)) {
                App.instance().ErrLog("InitShareFile createDirectory(%s) fail", sharePath);
                return;
            }
        }

        let savePath = sharePath + "/" + Math.floor(Date.now()) + '.jpg';
        let success = jsb.saveImageData(picData, texture.width, texture.height, savePath);
        if (success) {
            if (call) {
                call(savePath, texture);
            }
        } else {
            App.instance().ErrLog("截图失败")
        }
    }

    // This is a temporary solution
    static filpYImage(data: Uint8Array, width, height) {
        // create the data array
        let picData = new Uint8Array(width * height * 4);
        let rowBytes = width * 4;
        for (let row = 0; row < height; row++) {
            let srow = height - 1 - row;
            let start = srow * width * 4;
            let reStart = row * width * 4;
            // save the piexls data
            for (let i = 0; i < rowBytes; i++) {
                picData[reStart + i] = data[start + i];
            }
        }
        return picData;
    }

    //保存图片到本地相册
    static saveTextureToLocal(filePath) {
        if (cc.sys.isNative) {
            let argList = [{"Name": "pngPath", "Value": filePath}];
            NativeManager.instance().CallToNative("saveTextureToLocal", argList);
            UIAlert.instance().showContent("下载成功")
            return;
        }
        UIAlert.instance().showContent("请打开APP");
    }

    // 保存字符串内容到文件。
    // 效果相当于从浏览器下载了一个文件到本地。
    // textToWrite - 要保存的文件内容
    // fileNameToSaveAs - 要保存的文件名
    static saveForBrowser(textToWrite, fileName,type:string = ".txt") {
        if (cc.sys.isBrowser) {
            let textFileAsBlob = new Blob([textToWrite], {type: 'application/json'});
            let downloadLink = document.createElement("a");
            downloadLink.download = fileName + type;
            downloadLink.innerHTML = "Download File";
            if (window["webkitURL"] != null) {
                downloadLink.href = window["webkitURL"].createObjectURL(textFileAsBlob);
            } else {
                downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                downloadLink.onclick = fileName;
                downloadLink.style.display = "none";
                document.body.appendChild(downloadLink);
            }
            downloadLink.click();
            cc.log("文件生成成功")
        }
    }


    // 注意使用 await 调用
    public static async Await(waitSce:number): Promise<void> {
        var promise = new Promise<void>(resolve => {
            setTimeout(()=>{ resolve();}, waitSce*1000);
        });
        return promise;
    }


    /**
     *
     * @param parent
     * @param flyNodeList
     * @param startNodeList
     * @param endNodeList
     * @param callback
     * @param count
     * @param isInit
     * @constructor
     */
    static FlyNode(parent, flyNodeList: cc.Node[], startNodeList: cc.Node[], endNodeList: cc.Node[], callback: () => void, count = 1, isInit = true) {
        for (let j = 0; j < flyNodeList.length; j++) {
            const flyNode = flyNodeList[j];
            let startPos = parent.convertToNodeSpaceAR((startNodeList[j] || startNodeList[0]).convertToWorldSpaceAR(cc.Vec2.ZERO));
            let endPos = parent.convertToNodeSpaceAR((endNodeList[j] || endNodeList[0]).convertToWorldSpaceAR(cc.Vec2.ZERO));
            for (let i = 0; i < count; i++) {
                let node = cc.instantiate(flyNode);
                if (!isInit) {
                    node = flyNode;
                }
                let offset = i * ComTool.RandInt(1, 2);
                node.setPosition(startPos.x + offset, startPos.y);
                // node.setPosition(startPos);
                node.setParent(parent);
                node.zIndex = 99;
                node.setSiblingIndex(99)
                node.active = true;
                cc.tween(node)
                    .delay(0.06 * i)
                    .to(0.5, {scale: 1.5})
                    .to(0.5, {scale: 0.5, position: endPos})
                    .to(0.2, {scale: 1})
                    .call(() => {
                        node.destroy();
                        if (callback)
                            callback.call(parent);
                    })
                    .start()
            }
        }
    }

    /**本地存储数据
     * key:键
     * value:值
     * isGame:存储游戏数据还是个人数据
     * */
    static SetLocalItem(key: string, value: any, isGame = false) {
        // let keys = isGame ? "game" : GlobalData.mID + GlobalData.mName;
        let keys = "911game";
        let data = JSON.parse(cc.sys.localStorage.getItem(keys));
        if (!data) {
            data = {};
        }
        data[key] = value;
        cc.sys.localStorage.setItem(keys, JSON.stringify(data));
    }

    static GetLocalItem(key: string, defaultVuale: any, isGame = false) {
        // let keys = isGame ? "game" : GlobalData.mID + GlobalData.mName;
        let keys = "911game";
        let data = JSON.parse(cc.sys.localStorage.getItem(keys));
        if (!data || data[key] == undefined) {
            ComTool.SetLocalItem(key, defaultVuale, isGame);
            return defaultVuale;
        }
        return data[key];
    }
}

var g_ComTool: ComTool = null;

/**
 * 绑定模块外部方法
 */
export function GetModel() {
    if (!g_ComTool) {
        g_ComTool = new ComTool();
    }
    return g_ComTool;
}