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
        },

        'dy-createcode:callscript' (){

        },

        'dy-createcode:startCreate' (event){
            try {
                Editor.Scene.callSceneScript("dy-createcode","auto-create");
            }catch (e) {
                Editor.log(e);

            }
        }
    },
};


//




























