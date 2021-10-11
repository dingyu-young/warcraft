'use strict';

const Fs = require('fs');
const Path = require('path');

function readDir(path, data) {
    Editor.log("检测路径:",path)
    let files = Fs.readdirSync(path);
    files.forEach((item, index) => {
        let fPaht = path + "/" + item;
        let stat = Fs.statSync(fPaht)
        if (stat.isDirectory()) {
            readDir(fPaht, data);
        } else if (item.endsWith(".png")) {
            data[item] = fPaht;
        }
    })
}

function checkPath(path){
    let folder = Editor.url("db://assets") + "\\" + path;
    folder = folder.split("\\").join("/")
    if(!Fs.existsSync(folder)){
        Editor.log("创建文件夹",folder)
        Fs.mkdirSync(folder)
    }
}


module.exports = {
    load() {
        // 当 package 被正确加载的时候执行


    },

    unload() {
        // 当 package 被正确卸载的时候执行
    },

    messages: {
        'dy-psdtool:open'() {
            Editor.Panel.open("dy-psdtool")
        },

        'dy-psdtool:exportpsd'(e, cfg) {

            let filePath = cfg.config.psdPath;//psd路径
            let psdName = cfg.config.psdName.split(".")[0];//psd名称
            let exportPath = "db://assets/" + cfg.config.imgPath;
            checkPath(cfg.config.imgPath);

            let checkPathList = []
            if(cfg.config.checkPath)
                checkPathList = cfg.config.checkPath.split(",");


            //执行python脚本
            let callFile = require('child_process');
            let url = Editor.url("packages://dy-psdtool//tool//psdtool.exe");
            let cmd = url + " " + filePath + " " + psdName + ".psd";
            Editor.log(cmd);
            let ret = callFile.exec(cmd, function (err, stdOut) {
                if (err) {
                    Editor.error("[PSD导出生成失败:] " + err);
                } else {
                }
                // Editor.remote.assetdb.refresh(refreshpath);
                Editor.log("PSD导出成功...,开始生成节点树");


                let jsonPath = filePath + psdName + "\\json\\psdnode.json";
                var text = Fs.readFileSync(jsonPath, 'utf8');
                let psdConfig = JSON.parse(text);
                let imgList = psdConfig["imgList"];
                let allPng = {};
                let path = Editor.url(exportPath);
                // readDir(path, allPng);

                let checkPng = {}//检测通用ui
                for (let i = 0; i < checkPathList.length; i++) {
                    readDir(Editor.url("db://assets/" + checkPathList[i]), checkPng)
                }


                let importList = [];
                let pngDict = {};
                for (let i = 0; i < imgList.length; i++) {
                    let png = imgList[i] + ".png";

                    if (checkPng[png]) {
                        pngDict[imgList[i]] = Editor.assetdb.fspathToUrl(checkPng[png])
                    } else {
                        pngDict[imgList[i]] = exportPath + "/" + png
                        if (!allPng[png]) {
                            importList.push(filePath + psdName + "\\img\\" + png)
                        }
                    }
                }
                if (importList.length > 0) {
                    Editor.assetdb.import(importList, "db://assets/texture/export", function () {
                        Editor.Scene.callSceneScript("dy-psdtool", "create-node", {
                            config: psdConfig,
                            pngDict: pngDict
                        }, () => {
                        },);
                    })
                } else {
                    Editor.Scene.callSceneScript("dy-psdtool", "create-node", {
                        config: psdConfig,
                        pngDict: pngDict
                    }, () => {
                    },);
                }

            }.bind(this));


        }
    },
};


//




























