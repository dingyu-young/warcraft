/**
 * 字幕文件导出json
 */
const fs = require("fs");
class SrtToJsonTool {

    static mIntance = new SrtToJsonTool();

    makeDurationToSeconds(time) {
        var str = time;
        var arr = str.split(':');
        var hs = parseInt(arr[0] * 3600);
        var ms = parseInt(arr[1] * 60);
        var ss = parseInt(arr[2]);
        var seconds = hs + ms + ss;
        return seconds;
    }

    start() {

        fs.readdir("./srt", (err, files) => {
            if (err) {
                console.error(err);
                return;
            }
            files.forEach((fileName) => {
                var name = fileName.split(".")[0];
                var data = fs.readFileSync("./srt/" + fileName, "utf-8");
                var strData = data;
                strData = strData.split("\n");
                var jsonData = [];
                for (let i = 0; i < strData.length; i += 4) {
                    let id = strData[0 + i];
                    let time = strData[i + 1] && strData[i + 1].split("-->");
                    let txt = strData[i + 2];
                    let startTime = 0;
                    let endTime = 0;
                    if (time) {
                        let sTime = time[0].split(",")[0];
                        let eTime = time[1].split(",")[0];
                        startTime = sTime;
                        endTime = eTime;
                        // let startTime = this.makeDurationToSeconds(sTime);
                        // let endTime = this.makeDurationToSeconds(eTime);
                        // playTime = endTime - startTime;
                    }
                    if (id && time && txt) {
                        id = id.split("\r")[0];
                        txt = txt.split("\r")[0];
                        jsonData.push({
                            id: ~~id,
                            startTime,
                            endTime,
                            txt
                        });
                    }
                }
                console.log("导出: " + name);
                fs.writeFileSync(`./json/${name}.json`, JSON.stringify(jsonData, null, 2), () => { });
            })
        });
    }
}


SrtToJsonTool.mIntance.start();
