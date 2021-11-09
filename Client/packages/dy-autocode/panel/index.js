
const Fs = require('fs');
const Path = require('path');
const config = require("../config");
// panel/index.js

Editor.Panel.extend({
    style: `
    :host { margin: 5px; }
    h2 { color: #f90; }
  `,

    template: `
    <div class="layout horizontal center-justified">
    <h2>代码自动生成器</h2>
    </div>
    <div class="layout horizontal center-justified">
    <span>代码路径: </span>
    <ui-input id="codePath" placeholder="asset目录下路径"></ui-input>
    </div>
    <hr />
    <div class="layout horizontal center-justified">
    <span>基类地址: </span>
    <ui-input id="exportPath" placeholder="asset目录下路径"></ui-input>
    </div>
    <hr />
    <div class="layout horizontal center-justified">
    <span>是否销毁: </span>
    <ui-input id="isDestroy" placeholder="0-不销毁"></ui-input>
    </div>
    <hr />
    <div class="layout horizontal center-justified">
    <span>界面层级: </span>
    <ui-secect id="uiLayer">
        <select tabindex="2">
        <option value="0">eFirst</option>
        <option value="1">eSecond</option>
        <option value="2">eThird</option>
        <option value="3">eTop</option>
        <option value="4">eEffect</option>
        </select>
    </ui-secect>
    </div>
    <hr />
    <div class="layout horizontal center-justified">
    <ui-button id="btn" class="green" sytle="width:100px">生成脚本</ui-button>
    </div>
  `,

    $: {
        btn: '#btn',
        exportPath: "#exportPath",
        codePath: "#codePath",
        isDestroy:"#isDestroy",
        uiLayer:"#uiLayer"
    },

    ready() {
        this.$exportPath.value = config.config.uiBasePath;
        this.$codePath.value = config.config.codePath;
        this.$uiLayer.value = "2";
        this.$isDestroy.value = 0;
        this.$btn.addEventListener('confirm', () => {
            Editor.Ipc.sendToMain("dy-createcode:startCreate")
        });
    },

    messages: {
        'dy-createcode:getConfig': function (event, callback) {
            let config={
                codePath:this.$codePath.value,
                exportPath:this.$exportPath.value,
                uiLayer:this.$uiLayer.value,
                isDestroy:this.$isDestroy.value,
            }
            event.reply(null,config);
        }
    }


});


//
// function saveConfig(prefabPath,codePath) {
//     const configPath = Editor.url('packages://path.json');
//     if (!Fs.existsSync(configPath)) Fs.mkdirSync(configPath);
//     var config = {
//         prefabPath:prefabPath,
//         codePath:codePath
//     }
//     Fs.writeFileSync(configPath,JSON.stringify(config));
//     Editor.log("配置路径保存成功",config);
// }
//
// function loadConfig() {
//     const configPath = Editor.url('packages://path.json');
//     if (!Fs.existsSync(configPath)) Fs.mkdirSync(configPath);
//     var config = Fs.readFileSync(configFilePath, 'utf8')
//     return JSON.parse(config);
// }