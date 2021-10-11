// data["type"] = self.type
// data["name"] = self.name
// data["src"] = self.src
// data["pos"] = self.pos
// data["size"] = self.size
// if data["type"] == "cc.Label":
// data["font"] = self.font
// # data["fontSize"] = self.font["fontSize"]
// # data["isRich"] = self.font["isRich"]
// # data["outColor"] = self.font["outColor"]
// # data["colors"] = self.font["colors"]
let font = null
let pngDict = null

async function loadFont() {
    return new Promise((resolve, reject) => {
        let fontuuid = Editor.remote.assetdb.urlToUuid('db://assets/resources/font/fzcy.TTF');
        cc.AssetLibrary.loadAsset(fontuuid, (err, res) => {
            if (err) {
                reject(null)
            }
            resolve(res);
        })
    })
}

function RGBToHex(rgb) {
    let r = Math.round(rgb[0])
    let g = Math.round(rgb[1])
    let b = Math.round(rgb[2])
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function addComponent(node, data) {
    if (data.type == "cc.Label") {
        let fontData = data["font"];
        let cpt = null;
        let outColor = fontData.outColor;
        let hasOutLine = fontData.outColor != 0 && !(outColor[0] > 245 && outColor[1] > 245 && outColor[2] > 245);//是否有描边
        let outCol = hasOutLine ? RGBToHex(outColor) : null//描边颜色
        if (fontData.isRich) {
            node.name = "rich_" + node.name;
            cpt = node.addComponent(cc.RichText);
            let colorList = fontData["colors"];
            let str = ""
            for (let i = 0; i < colorList.length; i++) {
                let col = RGBToHex(colorList[i]);
                if (hasOutLine) {
                    str += `<color=${col}><outline color=${outCol} width=2>` + data.src[i] + "</outline></c>"
                } else {
                    str += `<color=${col}>` + data.src[i] + "</c>"
                }
            }
            str += data.src.substring(colorList.length)
            cpt.string = str

        } else {
            node.name = "label_" + node.name;
            cpt = node.addComponent(cc.Label);
            cpt.string = data.src;
            cpt.verticalAlign = cc.Label.VerticalAlign.CENTER;
            let col = fontData.colors[0];
            node.color = cc.color(col[0], col[1], col[2]);
            if (hasOutLine) {
                let outCpt = node.addComponent(cc.LabelOutline);
                outCpt.width = 2;
                outCpt.color = cc.color(outColor[0], outColor[1], outColor[2]);
            }
        }
        cpt.font = font;
        cpt.fontSize = Number(fontData["fontSize"]);
        cpt.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        cpt.lineHeight = fontData.fontSize;


    } else if (data.type == "cc.Sprite") {
        node.name = "sprite_" + node.name;
        let cpt = node.addComponent(cc.Sprite)

        // let imgSrc = 'db://assets/texture/export/' + data.name + ".png";
        let imgSrc = pngDict[data.name];
        // Editor.log("---",imgSrc)

        let meta = Editor.remote.assetdb.loadMeta(imgSrc);
        let metaUuid = meta["__subMetas__"][data.name]["uuid"];
        cc.AssetLibrary.loadAsset(metaUuid, function (err, texture) {
            cpt.spriteFrame = texture;
        })
    }
}


module.exports = {
    'get-canvas-children': function (event) {
        var canvas = cc.find('Canvas');
        Editor.log('children length : ' + canvas.children.length);

        if (event.reply) {
            event.reply(null, canvas.children.length);
        }
    },
    'create-node': async function (event, arg) {
        let config = arg.config;
        pngDict = arg.pngDict
        let canvas = cc.find("Canvas")
        let root = new cc.Node("scene");
        root.setParent(canvas);
        // root.addComponent("")
        font = await loadFont();
        Editor.log("开始生成节点")
        for (let key in config) {
            if (key == "imgList") {
                continue
            }
            let data = config[key];
            let node = new cc.Node(data.name.slice(0, 5))
            node.setParent(root);
            node.setPosition(data.pos[0], data.pos[1]);
            node.width = data.size[0];
            node.height = data.size[1];
            node.opacity = data.opacity;
            addComponent(node, data)
        }
        Editor.log("节点生成成功!");

    }
};
