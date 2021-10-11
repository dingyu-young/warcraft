
const Fs = require('fs');
const Path = require('path');
// panel/index.js

Editor.Panel.extend({
    style: `
    :host { margin: 5px; }
    h2 { color: #f90; }
  `,

    template: `
    <div class="layout horizontal center-justified">
    <h2>PSD转Prefab</h2>
    </div>
    <div class="layout horizontal center-justified">
    <span>PSD路径: &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</span>
    <ui-input id="psdPath" placeholder="绝对路径"></ui-input>
    </div>
    <hr />
    <div class="layout horizontal center-justified">
    <span>PSD名称: &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</span>
    <ui-input id="psdName" placeholder="psd名称"></ui-input>
    </div>
    <hr />
    <div class="layout horizontal center-justified">
    <span>图片存放地址:&nbsp </span>
    <ui-input id="imgPath" placeholder="asset目录下路径"></ui-input>
    </div>
    <hr />
    <div class="layout horizontal center-justified">
    <span>检测路径: &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</span>
    <ui-input id="checkPath" placeholder="检测文件夹下所有资源"></ui-input>
    </div>
    <hr />
    <div class="layout horizontal center-justified">
    <ui-button id="btn" class="green" sytle="width:100px">开始生成</ui-button>
    </div>
  `,

    $: {
        btn: '#btn',
        psdPath: "#psdPath",
        imgPath: "#imgPath",
        checkPath:"#checkPath",
        psdName:"#psdName",
    },

    ready() {
        let configPath = Editor.url("packages://dy-psdtool/config.json")
        let file = Fs.readFileSync(configPath, 'utf8');
        let config = JSON.parse(file);
        this.$psdPath.value = config.psdPath;
        this.$imgPath.value = config.imgPath;
        this.$checkPath.value = config.checkPath;
        this.$btn.addEventListener('confirm', () => {
            let newConfig = {
                psdPath:this.$psdPath.value,
                imgPath:this.$imgPath.value,
                checkPath:this.$checkPath.value,
                psdName: this.$psdName.value
            }
            // Fs.writeFileSync(configPath,JSON.stringify(newConfig));
            Editor.Ipc.sendToMain("dy-psdtool:exportpsd",{config:newConfig});
        });
    },
});

