const config = require("./config");
const fspath = require("path");

var codeName = "";//代码名称
var codePath = '';//代码路径
var codeUuid = "";//生成的脚本uuid;
var cptUuid = "";//挂载成组件后的uuid
var uiConfg = {};//codePath,exportPath,uiLayer,isDestroy
var importComponent = "";


module.exports = {
    'auto-create': async function (event) {
        let uuid = Editor.Selection.curSelection("node");
        Editor.Ipc.sendToPanel("dy-createcode", "dy-createcode:getConfig", (target, config) => {
            uiConfg = config;
            autoCreate(uuid, uiConfg.codePath);
        });
    }
};


//自动生成
async function autoCreate(uuid, path) {

    let node = cc.engine.getInstanceById(uuid);
    let prefabuid = Editor.Selection.curActivate("asset");//预制体uuid
    let path2 = Editor.remote.assetdb.uuidToUrl(prefabuid);//预制体路径
    uiConfg.uiPath = (path2.split("db://assets/resources/")[1]).split(".")[0];
    if (!node || node.parent._name != "New Node") {
        Editor.error("没有打开预制体或选中根节点");
        return;
    }
    codeName = node.name + "Prefab";//生成的脚本名称
    Editor.log("开始生成...", codeName);
    codePath = `db://assets/${path}/${codeName}.ts`;//生成路径

    createClass(node);
    let res = await createCode(codePath);
    if (!res) {
        return;
    }
    Editor.log("代码生成完毕,path:", codePath);

    //编辑器刷新后node会被销毁,需重新找节点;
    let timeout = setInterval(async () => {
        let node1 = cc.engine.getInstanceById(uuid);
        if (node1) {
            clearInterval(timeout);
            await WaitMoment();
            Editor.log("开始添加组件");
            node = cc.engine.getInstanceById(uuid);
            AddComponent(node1);
            AddProperty();
            Editor.log(`组件${codeName}添加成功`);
        }
    }, 1000)


}

var nodedict = {};

//生成需要获取的节点
function createClass(node) {
    try {
        for (let i = 0; i < node.children.length; i++) {
            let cNode = node.children[i];
            let [type, cname] = cNode.name.split("_");

            let keydic = config.exportKey[type];
            if (!keydic || !cname) {
                createClass(cNode);
                continue;
            }

            if (type == "Node") {
                let propertyInfo = new PropertyInfo(cNode, config.exportName["cc.Node"] + cname, "cc.Node",cNode.uuid);
                nodedict[cNode.name + "cc.Node"] = propertyInfo;
                continue;
            }

            for (let j = 0; j < cNode._components.length; j++) {
                let cpt = cNode._components[j];
                let cptName = cpt.__classname__;
                if (keydic[cptName]) {
                    let propName = config.exportName[cptName];
                    let propertyInfo = new PropertyInfo(cNode, propName + cname, cptName,cpt.uuid);
                    nodedict[cNode.name + cptName] = propertyInfo;
                }

                if (cpt.__scriptUuid != "") {
                    let propertyInfo = new PropertyInfo(cNode, cptName + "_" + cname, cptName, cpt.uuid);
                    nodedict[cNode.name + cptName] = propertyInfo;
                    let url = GetRelativePath(Editor.url(codePath), Editor.url(Editor.remote.assetdb.uuidToUrl(cpt.__scriptUuid)));
                    let importstr = `import ${cptName} from "${url}";`;
                    if(importComponent.indexOf(importstr) == -1){
                        importComponent += importstr + "\r\n";
                    }
                }
            }

            createClass(cNode);
        }
    } catch (e) {
        Editor.error(e);
    }

}

//生成文本代码
function createCode(codePath) {
    let content = "import ccclass = cc._decorator.ccclass;\r\n" +
        "import property = cc._decorator.property;\r\n\r\n";
    content += `import {EnumUILayer, UIPrefab} from "${uiConfg.exportPath}";\r\n\r\n`;
    content += importComponent;
    content += `@ccclass\r\nexport class ${codeName} extends UIPrefab{\r\n\r\n`;
    let onLoadText = `\tprotected onLoad(): void {\r\n`;
    let onClickText = "";
    for (let name in nodedict) {
        let info = nodedict[name];
        content += `\t@property(${info.cptName})\r\n`;
        content += `\t${info.propName}:${info.cptName} = null;\r\n\r\n`;
        if (info.cptName == "cc.Button") {
            onLoadText += `\t\tthis.${info.propName}.node.on("click",this.ClickEvent,this);\r\n`;
            if (onClickText == "") {
                onClickText += '\tpublic OnClick(btnName:string,btnNode:cc.Node){\r\n';
                onClickText += `\t\tif(btnName == "${info.nodeName}"){\r\n\t\t}`;
            } else {
                onClickText += `else if(btnName == "${info.nodeName}"){\r\n\t\t}`;
            }
        }
    }
    content += "\tpublic static get uiPath(){return " + `"${uiConfg.uiPath}"` + ";}\r\n\r\n";//路径
    content += "\tpublic get isDestroy(){return " + (uiConfg.isDestroy == "0" ? "false" : "true") + ";}\r\n\r\n";//是否销毁
    content += "\tpublic get uiLayer(){return EnumUILayer." + config.uiLayer[uiConfg.uiLayer] + ";}\r\n\r\n";//层级

    //点击事件
    onLoadText += "\t}\r\n\r\n";
    onClickText += "\r\n\t}\r\n";
    content += onLoadText + onClickText;
    content += "}\r\n";
    return new Promise((resolve, reject) => {
        Editor.assetdb.createOrSave(codePath, content, (err, res) => {
            if (err) {
                Editor.error(err);
                reject(false);
            }
            codeUuid = Editor.remote.assetdb.urlToUuid(codePath);
            if (!codeUuid) {
                Editor.warn("找不到生成脚本的uuid");
                reject(false);
            }
            resolve(true);
        })
    })
}

function AddComponent(node) {
    let cpt = node.getComponent(codeName);
    if (!cpt) {
        cpt = node.addComponent(codeName);
    }
    cptUuid = cpt.uuid;
    if (!cptUuid) {
        Editor.error("组件添加失败:", codeName);
    }

}

function AddProperty() {
    for (let name in nodedict) {
        let info = nodedict[name];
        Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
            id: cptUuid,
            path: info.propName,//要修改的属性
            type: info.cptName,
            value: {uuid: info.uuid},
            isSubProp: false,
        });
    }
    Editor.Ipc.sendToPanel('scene', 'scene:undo-commit');
}

//

//属性信息
function PropertyInfo(node, propName, cpt, scriptuuid = "") {
    this.nodeName = node.name;
    this.propName = propName;
    this.cptName = cpt;
    this.uuid = scriptuuid;
}

/**
 * 获取pathB相对于pathA的路径
 * @param {string} pathA
 * @param {string} pathB
 * @returns {string} 相对路径
 */
function GetRelativePath(pathA, pathB) {
    let pathDirA = fspath.dirname(pathA);
    let pathDirB = fspath.dirname(pathB);
    let obj = fspath.parse(pathB);
    let relativeDirPath = fspath.relative(pathDirA, pathDirB);
    let path_arr = relativeDirPath.split(fspath.sep).concat([obj.name]);
    let relativePath = path_arr.join("/");
    (relativePath[0] != ".") && (relativePath = "." + relativePath);
    cc.log(relativePath);
    return relativePath;
}


function WaitMoment() {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, 1000)
    });
}

