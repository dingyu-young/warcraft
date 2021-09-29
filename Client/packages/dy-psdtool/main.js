'use strict';

const Fs = require('fs');
const Path = require('path');

function readDir(path,data){
    let files = Fs.readdirSync(path);
    files.forEach((item,index)=>{
        let fPaht = path + "/" + item;
        let stat = Fs.statSync(fPaht)
        if(stat.isDirectory()){
            readDir(fPaht,list);
        }else if(item.endsWith(".png")){
            data[item] = fPaht;
        }
    })
}


module.exports = {
    load () {
        // 当 package 被正确加载的时候执行


    },

    unload () {
        // 当 package 被正确卸载的时候执行
    },

    messages: {
        'dy-psdtool:open' (){
            Editor.Panel.open("dy-psdtool")
        },

        'dy-psdtool:exportpsd' (e,cfg) {

            let filePath = cfg.config.psdPath;//psd路径
            let psdName = cfg.config.psdName.split(".")[0];//psd名称
            let exportPath = "db://assets/" + cfg.config.imgPath;
            let checkPath = "db://assets/" + cfg.config.checkPath;

            //执行python脚本
            let callFile = require('child_process');
            let url = Editor.url("packages://dy-psdtool//tool//psdtool.exe");
            let cmd = url + " " + filePath + " " + psdName + ".psd";
            let ret = callFile.exec(cmd, function (err, stdOut) {
                if (err) {
                    Editor.error("[PSD导出生成失败:] " + err);
                } else {
                }
                // Editor.remote.assetdb.refresh(refreshpath);
                Editor.log("PSD导出成功...,开始生成节点树");


                let jsonPath = filePath + psdName +"\\json\\psdnode.json";
                var text = Fs.readFileSync(jsonPath, 'utf8');
                let psdConfig = JSON.parse(text);
                let imgList = psdConfig["imgList"];
                let allPng = {};
                let path = Editor.url(exportPath);
                Editor.log(path);
                readDir(path,allPng);
                console.log(allPng);
                let importList = [];
                for (let i = 0; i < imgList.length; i++) {
                    let png = imgList[i] + ".png";
                    if(!allPng[png]){
                        importList.push(filePath + psdName + "\\img\\" +png)
                    }
                }
                if(importList.length > 0){
                    Editor.assetdb.import(importList,"db://assets/texture/export",function () {
                        Editor.Scene.callSceneScript("dy-psdtool","create-node",{config:psdConfig},()=>{},);
                    })
                }else {
                    Editor.Scene.callSceneScript("dy-psdtool","create-node",{config:psdConfig},()=>{},);
                }

            }.bind(this));


        }
    },
};


//




























