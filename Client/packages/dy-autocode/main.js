'use strict';

const Fs = require('fs');
const Path = require('path');
// const scene = require(Editor.url("packages://createcode/scene.js"));
module.exports = {
    load () {
        // 当 package 被正确加载的时候执行
    },

    unload () {
        // 当 package 被正确卸载的时候执行
    },

    messages: {
        'dy-createcode:openwindow' () {
            Editor.Panel.open("dy-createcode")
        },

        'dy-createcode:getmessage' (event,msg){
            Editor.log(msg);
            // Editor.Ipc.sendToPanel("dy-createcode","CreateCode:pannelcallback","回调")
        },

        'dy-createcode:callscript' (){

            // Editor.Scene.callSceneScript("dy-createcode","get-canvas-children",function (err,length) {
            //     Editor.log(`get-canvas-children callback : length - ${length}`);
            // })
        },

        'dy-createcode:startCreate' (event){
            try {
                // let url = "db://assets/" + prefabpath + ".prefab.meta";
                // Editor.log(url);
                // let meta = Fs.readFileSync(Editor.url(url,"utf8"));
                // let uuid = JSON.parse(meta).uuid;
                // Editor.log(uuid);

                // Editor.Ipc.sendToAll('scene:enter-prefab-edit-mode', uuid);
                // Editor.Ipc.sendToPanel("scene","scene:create-node-by-prefab",uuid)
                Editor.Scene.callSceneScript("dy-createcode","auto-create");
            }catch (e) {
                Editor.log(e);

            }
        }
    },
};


//




























