
export var ChromeLogColorDict = {
    //黑色背景,蓝绿文本(收包)
    "b-gb1": 'background: #255; color: #ff80ff',
    "b-gb": 'background: #255; color: #00ffff',
    //黑色背景,绿文本(发包)
    "b-g": 'background: #255; color: #00ff00',
    //白色背景,绿文本(连接)
    "w-g": 'background: #0; color: #007f00'
};
export class BaseClass {
    jsName:string;
    constructor() {
        this.jsName = cc.js.getClassName(this);
    }

    //获取包装后的log文本
    GetLogFormatList(argList) {
        var len = argList.length;
        var logText = argList[0];
        //第一个不是文本格式
        if (typeof (logText) != "string") {
            return argList
        }
        var colorType = argList[len - 1];
        if (typeof (colorType) == "string") {
            var color = ChromeLogColorDict[colorType];
            //如果是谷歌浏览器,包装颜色
            if (color) {
                if (cc.sys.browserType == "chrome") {
                    //如果末尾有携带颜色配置
                    //如果存在颜色,替换最后一个参数为颜色值
                    //删除末尾的颜色标示
                    argList.pop();

                    //文本开头添加颜色标示%c
                    logText = "%c" + logText;

                    //在文本后面插入一个颜色值
                    argList.splice(1, 0, color);
                } else {
                    //删除末尾的颜色标示
                    argList.pop();
                }
            }
        }

        //第一个默认是字符串加上文件标示
        argList[0] = this.jsName + "\t" + logText;
        return argList
    }

    //接收不定参
    Log(...argList: any[]) {
        argList = this.GetLogFormatList(argList);
        cc.log.apply(null, argList)
    }

    //接收不定参
    WarnLog(...argList: any[]) {
        argList = this.GetLogFormatList(argList);
        cc.warn.apply(null, argList)
    }

    //接收不定参
    ErrLog(...argList: any[]) {
        argList = this.GetLogFormatList(argList);
        cc.error.apply(null, argList)
    }

}