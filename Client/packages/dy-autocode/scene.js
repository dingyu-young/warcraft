

var codeName = "";//代码名称
var codePath = '';//代码路径
// var exportName = "";//代码中导入基类
var codeUuid = "";//生成的脚本uuid;
var cptUuid = "";//挂载成组件后的uuid
var uiConfg = {};//codePath,exportPath,uiLayer,isDestroy
module.exports = {
    'get-canvas-children': function (event) {
        var canvas = cc.find('Canvas');
        Editor.log('children length : ' + canvas.children.length);

        if (event.reply) {
            event.reply(null, canvas.children.length);
        }
    },
    'auto-create':async function (event) {
        let path = "script/export/";
        let uuid=Editor.Selection.curSelection("node");
        Editor.Ipc.sendToPanel("dy-createcode","dy-createcode:getConfig",(target,config)=>{
            uiConfg = config;
            autoCreate(uuid,uiConfg.codePath);
        });
    }
};



//自动生成
async function autoCreate(uuid,path) {

    let node = cc.engine.getInstanceById(uuid);
    let prefabuid = Editor.Selection.curActivate("asset");//预制体uuid
    let path2 = Editor.remote.assetdb.uuidToUrl(prefabuid);//预制体路径
    uiConfg.uiPath = (path2.split("db://assets/resources/")[1]).split(".")[0];
    if(!node || node.parent._name != "New Node"){
        Editor.error("没有打开预制体或选中根节点");
        return;
    }
    codeName = node.name+"Prefab";//生成的脚本名称
    Editor.log("开始生成...",codeName);
    codePath = `db://assets/${path}/${codeName}.ts`;//生成路径

    createClass(node);
    let res = await createCode(codePath);
    if(!res){
        return;
    }
    Editor.log("代码生成完毕,path:",codePath);

    //编辑器刷新后node会被销毁,需重新找节点;
    let timeout = setInterval(async ()=>{
        let node1 = cc.engine.getInstanceById(uuid);
        if(node){
            clearInterval(timeout);
            await WaitMoment();
            Editor.log("开始添加组件");
            node = cc.engine.getInstanceById(uuid);
            AddComponent(node1);
            AddProperty();
            Editor.log(`组件${codeName}添加成功`);
        }
    },1000)



}
var nodedict = {};
//生成需要获取的节点
function createClass(node) {
    try {
        for (let i = 0; i < node.children.length; i++) {
            let cNode = node.children[i];
            let type = cNode.name.split("_")[0];
            let propertyInfo = null;
            switch (type) {
                case "nd":
                    propertyInfo=new PropertyInfo(cNode);
                    break;
                case "lb":
                    propertyInfo=new PropertyInfo(cNode,"cc.Label",);
                    break;
                case "btn":
                    propertyInfo=new PropertyInfo(cNode,"cc.Button");
                    break;
                case "sp":
                    propertyInfo=new PropertyInfo(cNode,"cc.Sprite");
                    break;
                case "sv":
                    propertyInfo=new PropertyInfo(cNode,"cc.ScrollView");
                    break;
                case "edit":
                    propertyInfo=new PropertyInfo(cNode,"cc.EditBox");
                    break;
                case "page":
                    propertyInfo=new PropertyInfo(cNode,"cc.PageView");
                    break;
                case "tgl":
                    propertyInfo=new PropertyInfo(cNode,"cc.Toggle");
                    break;
                case "ly":
                    propertyInfo=new PropertyInfo(cNode,"cc.Layout");
                    break;
                case "tgl":
                    propertyInfo=new PropertyInfo(cNode,"cc.Toggle");
                    break;
                case "rich":
                    propertyInfo=new PropertyInfo(cNode,"cc.RichText");
                    break;
            }
            if(propertyInfo != null)nodedict[cNode.name] = propertyInfo;
            createClass(cNode);
        }
    }catch (e) {
        Editor.error(e);
    }

}

//生成文本代码
function createCode(codePath) {
    let content = "import ccclass = cc._decorator.ccclass;\r\n"+
        "import property = cc._decorator.property;\r\n\r\n";
    content +=  `import {UIPrefab} from "${uiConfg.exportPath}";\r\n\r\n`;
    content +=`@ccclass\r\nexport class ${codeName} extends UIPrefab{\r\n\r\n`;
    let onLoadText = `\tprotected onLoad(): void {\r\n`;
    let onClickText = "";
    for (let name in nodedict){
        let info = nodedict[name];
        content +=`\t@property(${info.cptName})\r\n`;
        content += `\t${info.nodeName}:${info.cptName} = null;\r\n\r\n`;
        if(info.cptName == "cc.Button"){
            onLoadText += `\t\tthis.${info.nodeName}.node.on("click",this.ClickEvent,this);\r\n`;
            if(onClickText == ""){
                onClickText += '\tpublic OnClick(btnName:string,btnNode:cc.Node){\r\n';
                onClickText += `\t\tif(btnName == "${info.nodeName}"){\r\n\t\t}`;
            }else {
                onClickText += `else if(btnName == "${info.nodeName}"){\r\n\t\t}`;
            }
        }
    }
    content += "\tpublic static get uiPath(){return " + `"${uiConfg.uiPath}"` +  ";}\r\n\r\n";//路径
    content += "\tpublic get isDestroy(){return " + (uiConfg.isDestroy == "0" ? "false" : "true") + ";}\r\n\r\n";//是否销毁
    content += "\tpublic get uiLayer(){return " +  uiConfg.uiLayer + ";}\r\n\r\n";//层级

    //点击事件
    onLoadText += "\t}\r\n\r\n";
    onClickText += "\r\n\t}\r\n";
    content += onLoadText + onClickText;
    content +="}\r\n";
    return new Promise((resolve, reject) => {
        Editor.assetdb.createOrSave(codePath,content,(err,res)=>{
            if(err){
                Editor.error(err);
                reject(false);
            }
            codeUuid = Editor.remote.assetdb.urlToUuid(codePath);
            if(!codeUuid){
                Editor.warn("找不到生成脚本的uuid");
                reject(false);
            }
            resolve(true);
        })
    })
}

function AddComponent(node) {
    let cpt = node.getComponent(codeName);
    if(!cpt){
        cpt = node.addComponent(codeName);
    }
    cptUuid = cpt.uuid;
    if(!cptUuid){
        Editor.error("组件添加失败:",codeName);
    }

}

function AddProperty() {
    for (let name in nodedict){
        let info = nodedict[name];
        Editor.Ipc.sendToPanel('scene', 'scene:set-property',{
            id: cptUuid,
            path: info.nodeName,//要修改的属性
            type: info.cptName,
            value: { uuid: info.uuid },
            isSubProp: false,
        });
    }
    Editor.Ipc.sendToPanel('scene', 'scene:undo-commit');
}

//

//属性信息
function PropertyInfo(node,cpt) {
    this.nodeName = node.name;
    let isCpt = !!cpt;
    this.cptName = isCpt ?  cpt : "cc.Node";
    this.uuid = isCpt ? "" : node.uuid;
    if(isCpt){
        for (let i = 0; i < node._components.length; i++) {
            let c = node._components[i];
            if(c.__classname__ == cpt){
                this.uuid = c.uuid;
                break;
            }
        }
        if(!this.uuid){
            Editor.error(`节点${this.nodeName}不存在组件${cpt}`);
        }
    }
}


function WaitMoment()
{
    return new Promise((resolve,reject)=>
    {
        setTimeout(resolve,1000)
    });
}

