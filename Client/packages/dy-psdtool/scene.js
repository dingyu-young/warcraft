

async function loadFont(){
    return new Promise((resolve,reject)=>{
        let fontuuid = Editor.remote.assetdb.urlToUuid('db://assets/resources/font/fzcy.TTF');
        cc.AssetLibrary.loadAsset(fontuuid,(err,res) => {
            if(err){
                reject(null)
            }
            resolve(res);
        })
    })
}



module.exports = {
    'get-canvas-children': function (event) {
        var canvas = cc.find('Canvas');
        Editor.log('children length : ' + canvas.children.length);

        if (event.reply) {
            event.reply(null, canvas.children.length);
        }
    },
    'create-node': async function (event,arg) {
        let config = arg.config;
        let canvas = cc.find("Canvas")
        let root = new cc.Node("scene");
        root.setParent(canvas);
        // root.addComponent("")
        let font = await loadFont();
        for (let key in config){
            if(key == "imgList"){
                continue
            }
            let data = config[key];
            let node = new cc.Node(data.name.slice(0,5))
            node.setParent(root);
            node.setPosition(data.pos[0],data.pos[1]);
            node.width = data.size[0];
            node.height = data.size[1];
            node.opacity = data.opacity;
            if(data.type == "cc.Label"){
                let cpt = node.addComponent(cc.Label);
                cpt.string = data.src;
                cpt.font = font;
                cpt.fontSize = Number(data.fontsize);
                cpt.lineHeight = cpt.fontSize;
                cpt.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
                cpt.verticalAlign = cc.Label.VerticalAlign.CENTER;
            }else if (data.type == "cc.Sprite"){
                let cpt = node.addComponent(cc.Sprite)
                let imgSrc = 'db://assets/texture/export/' + data.name + ".png";
                // let imgSrc = 'db://assets/resources/texture/' + data.name + '.png';

                let meta = Editor.remote.assetdb.loadMeta(imgSrc);
                let metaUuid = meta["__subMetas__"][data.name]["uuid"];
                // Editor.Ipc.sendToPanel('scene', 'scene:set-property',{
                //     id: cpt.uuid,
                //     path: "spriteFrame",//要修改的属性
                //     type: 'cc.spriteFrame',
                //     value: {uuid:metaUuid},
                //     isSubProp: false,
                // });
                cc.AssetLibrary.loadAsset(metaUuid,function (err,texture) {
                    cpt.spriteFrame = texture;
                })
            }
        }
        Editor.log("节点生成成功!");

    }
};
