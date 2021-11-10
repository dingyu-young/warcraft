import {MindMap} from "./MindMap";
import {ComTool} from "../../framework/util/ComTool";
import {MindBox} from "./MindBox";


class TableMindMapGroup {
    GroupId: number
    ID: number
    Name: string
    Content:string
    isChoose: boolean
    isTheme:boolean
    RewardId:number
    MaxLen:number
}

class TableMindMap {
    ID: number;
    GroupId: number;
    ChildIdList: number[];
    EventID: number;
    IsSubSocre: number;
    Text: string;
    Sound:string;
    PosX: number;
    PosY: number;
}

export class MindMapTool {
    ui: MindMap = null;
    public wirtPath = "D:\\temp"

    constructor(ui: MindMap) {
        this.ui = ui;
    }

    jsonMap = null;
    storyMap:{[key:string]:TableMindMap} = null;
    groupMap:{[key:string]:TableMindMapGroup} = null;
    groupList = [];


    async init() {
        let data = ComTool.GetLocalItem("story911", 0);
        if (!data) {
            // let asset = await LoadManager.ins().loadRes("table/story911", cc.JsonAsset);
            // data = asset.json;
            // this.jsonMap = data;
            let asset = await this.loadRes("911group", cc.JsonAsset);
            data = asset.json;
            let group = {};
            for (let key in data["normal"]){
                group[key] = data["normal"][key];
            }
            for (let key in data["theme"]) {
                group[key] = data["theme"][key];
            }
            this.jsonMap = {group:group,story:{}};
        }else {
            this.jsonMap = data;
        }
        this.storyMap = this.jsonMap["story"] || {};
        this.groupMap = this.jsonMap["group"] || {};
        this.groupList = Object.keys(this.groupMap);
        if (this.groupList.length > 0) {
            this.ui.loadScene(this.groupList[this.groupList.length - 1]);
        } else {
            this.ui.onAddNewScene(null);
        }
    }

    async loadStroy(group){
        let asset = await this.loadRes(group, cc.JsonAsset);
        let data = asset.json;
        cc.log(`剧情组${group}有`,Object.keys(data).length)
        for(let key in data){
            data[key].Text = data[key].Text.replace("警察","治安员");
            data[key].Text = data[key].Text.replace("救护车","医护");
            data[key].Text = data[key].Text.replace("医疗","医护");
            data[key].Text = data[key].Text.replace("消防员","工程员");
            data[key].Text = data[key].Text.replace("你好，应急指挥中心","应急中心，有事儿您说话！");
            data[key].Text = data[key].Text.replace("你好,应急指挥中心","应急中心，有事儿您说话！");
            this.storyMap[key] = data[key];
        }
    }

    getGroupInfo(id): TableMindMapGroup {
        return this.groupMap[id] as TableMindMapGroup;
    }

    getStoryInfo(id): TableMindMap {
        return this.storyMap[id] as TableMindMap;
    }

    addScene(groupid, id) {
        this.groupList.push(groupid);
        this.groupMap[groupid] = {
            GroupId: groupid,
            ID: id,
            Name: "场景" + groupid,
            Content:"",
            isChoose: true,
            isTheme:false,
            RewardId:0,
            MaxLen:0
        }
    }

    deleteBox(box: MindBox) {
        if (this.storyMap[box.id]) {
            delete this.storyMap[box.id];
        }
    }

    saveScene() {
        if (this.ui.rootBoxList[this.ui.currentId] == null) {
            cc.error("场景没有初始父节点");
            return
        }
        let rootBox: MindBox = this.ui.rootBoxList[this.ui.currentId];
        let fun = (box: MindBox) => {
            let childList = [];
            box.children.forEach(value => childList.push(value.id));
            let [content, event] = box.value.split(";");
            let eventid = event ? parseInt(event) : 0;
            let isSubsocre = box.isSubSocre ? 1 : 0;//是否扣分
            let data = {
                ID: box.id,
                GroupId: box.groupId,
                ChildIdList: childList,
                EventID: eventid,
                IsSubSocre: isSubsocre,
                Text: content,
                Sound:"",
                PosX: box.node.x,
                PosY: box.node.y,
            }
            this.storyMap[box.id] = data;
            for (let i = 0; i < box.children.length; i++) {
                fun(box.children[i]);
            }
        }
        fun(rootBox);
        ComTool.SetLocalItem("story911", this.jsonMap);
        cc.log("保存场景", this.groupMap[this.ui.currentId].Name)

    }

    async download() {
        for (let key in this.groupMap){
            let id = this.groupMap[key].ID;
            if(!this.storyMap[id]){
                await this.loadStroy(key);
            }
        }
        ComTool.saveForBrowser(JSON.stringify(this.jsonMap), "story911", ".json",this.wirtPath);
        this.writeExcel();
    }

    downloadOne(group){
        group = Number(group);
        let data:any = {};
        let rootid = this.groupMap[group].ID;
        this.getChild(rootid,data,group);
        if(Object.keys(data).length > 0){
            if(this.groupMap[group].isTheme && group < 10000){
                let data1 = JSON.parse(JSON.stringify(data));
                for (let key in data1){
                    data1[key].GroupId = 10000 + group;
                }
                ComTool.saveForBrowser(JSON.stringify(data1), 10000+group, ".json",this.wirtPath);
            }else{
                ComTool.saveForBrowser(JSON.stringify(data), group, ".json",this.wirtPath);
            }
        }
    }

    async downChoose(){
        this.saveScene();
        for (let key in this.groupMap){
            if(this.groupMap[key].isChoose){
                this.downloadOne(key)
                await ComTool.Await(0.2);
            }
        }
    }

    downGroup(){
        let normal = {};
        let theme = {};
        for (let key in this.groupMap){
            // if(!this.groupMap[key].isChoose){
            //     continue
            // }
            let maxLen = this.getGroupLen(Number(key));
            cc.log(key," 最大长度:", maxLen);
            if(maxLen){
                this.groupMap[key].MaxLen = maxLen;
            }
            // this.groupMap[key].isChoose = true;
            if(this.groupMap[key].isTheme){
                let group = this.groupMap[key].GroupId < 10000 ? this.groupMap[key].GroupId + 10000 : this.groupMap[key].GroupId;
                theme[group] = JSON.parse(JSON.stringify(this.groupMap[key]));
                theme[group].GroupId = group;
            }else {
                this.groupMap[key].isTheme = false;
                normal[key] = this.groupMap[key];
            }
        }
        let data = {normal:normal,theme:theme};
        ComTool.saveForBrowser(JSON.stringify(data), "911group", ".json",this.wirtPath);

    }

    getChild(id,data,group){
        if(this.storyMap[id]){
            data[id] = this.storyMap[id];
            let child = this.storyMap[id].ChildIdList;
            for (let i = 0; i < child.length; i++) {
                this.getChild(child[i],data,group);
            }
        }else {
            cc.error("组id",group,"剧情id:",id,"不存在");
        }
    }

    getGroupLen(group:number){
        let maxlen = 0;
        let dict = {};
        let fun = (id,parent:number)=>{
            if(parent == null){
                dict[id] = 0;
            }else {
                let txt = this.storyMap[id].Text;
                if(txt.endsWith("_1") && (txt.includes("{") || txt.includes("｛"))){
                    dict[id] = dict[parent] + 1;
                }else {
                    dict[id] = dict[parent];
                }
            }
            let childList = this.storyMap[id].ChildIdList;
            if(childList.length == 0){
                if(dict[id] > maxlen){
                    maxlen = dict[id];
                }
                return;
            }
            for (let i = 0; i < childList.length; i++){
                fun(childList[i],id);
            }
        }
        let id = this.groupMap[group].ID;
        if(!this.storyMap[id]){
            return null;
        }
        fun(id,null);
        return maxlen;
    }

    writeExcel(){
        let txt = "Int\tInt\tArray\tInt\tBool\tString\tString\tInt\tInt\r\n"
        txt += "ID\tGroupId\tChildIdList\tEventID\tIsSubSocre\tText\tSound\tPosX\tPosY\r\n"
        txt += "id\t组ID\t子节点列表\t触发的事件ID\t是否扣分\t剧情内容\t语音名\t编辑位置x\t编辑位置y\r\n"
        for (let key in this.storyMap){
            let val = this.storyMap[key] as TableMindMap;
            let list = [
                val.ID,val.GroupId,val.ChildIdList.join("|"),val.EventID,val.IsSubSocre ? 1 : 0,
                val.Text,val.Sound ? val.Sound : "",val.PosX,val.PosY
            ]
            let t = list.join("\t") + "\r\n"
            txt += t;
        }
        ComTool.saveForBrowser(txt,"story911",".xlsx",this.wirtPath);

        // GroupId: groupid,
        //     ID: id,
        //     Name: "场景" + groupid,
        //     Content:"",
        //     isChoose: true
        let txt1 = "int\tint\tstring\tstring\tBool\r\n";
        txt1 += "GroupId\tID\tName\tContent\tisChoose\r\n";
        txt1 += "组ID\t剧情id\t剧情名\t剧情内容\t是否开启这个剧情\r\n";
        txt1 += "组ID\t剧情id\t剧情名\t剧情内容\t是否开启这个剧情\r\n";
        for (let key in this.groupMap){
            let val = this.groupMap[key] as TableMindMapGroup;
            let list = [
                val.GroupId,val.ID,val.Name,val.Content ? val.Content : "",val.isChoose
            ]
            let t = list.join("\t") + "\r\n";
            txt1 += t;
        }
        ComTool.saveForBrowser(txt1,"story911group",".xlsx",this.wirtPath);
    }

    public async loadRes(path: string, type: typeof cc.Asset):Promise<any>{
        if (cc.sys.isNative) {
            cc.log(this.wirtPath + "   路径");
            let str_data = jsb.fileUtils.getStringFromFile(this.wirtPath + "\\" + path + ".json");
            if (str_data) {
                return Promise.resolve({ json: JSON.parse(str_data) });
            }
            return;
        }
        path = "table/" + path;
        return new Promise((resolve: Function, reject: Function) => {
            cc.log("加载资源:" + path);
            cc.resources.load(path, type, (err, res) => {
                if (err) {
                    cc.error(err);
                    resolve(null);
                    return;
                }
                resolve(res);
            })
        })
    }

    //截图并保存或下载图片
    ScreenShot(shotNode: cc.Node = null, name:string,call: Function = null) {
        let width = 0;
        let height = 0;
        let camera = cc.Camera.main;
        if (!shotNode) {
            let size = cc.winSize;
            width = size.width;
            height = size.height;
        } else {
            camera = shotNode.getComponent(cc.Camera);
            if (!camera)
                camera = shotNode.addComponent(cc.Camera);
            width = shotNode.width || 2000;
            height = shotNode.height || 2000;
        }
        let texture = new cc.RenderTexture();
        let gl = cc.game["_renderContext"];
        texture.initWithSize(width, height, gl.STENCIL_INDEX8);
        camera.zoomRatio = cc.winSize.height / height;
        camera.targetTexture = texture;
        if (shotNode) {
            shotNode.scaleY *= -1;
        } else {
            cc.Canvas.instance.node.scaleY *= -1;
        }
        camera.render(shotNode);
        if (shotNode) {
            shotNode.scaleY *= -1;
        } else {
            cc.Canvas.instance.node.scaleY *= -1
        }
        camera.targetTexture = null;

        let picData: Uint8Array = texture.readPixels();
        //截图完成后 删除照相机组件
        if (shotNode) {
            shotNode.removeComponent(cc.Camera);
        }
        //浏览器,直接调用下载
        if (cc.sys.isBrowser) {
            let canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            let context = canvas.getContext('2d');
            let imageData = context.createImageData(width || cc.winSize.width, height || cc.winSize.height);
            imageData.data.set(picData);
            context.putImageData(imageData, 0, 0);
            const base64 = canvas.toDataURL();
            const href = base64.replace(/^data:image[^;]*/, "data:image/octet-stream");
            // document.location.href = href;/
            //创建一个下载标签
            let link: HTMLElement = document.createElement('a');
            link.setAttribute("href", href);
            link.setAttribute("download", `${name}.png`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            //下载
            link.click();
            document.body.removeChild(link);
            cc.log("截图保存成功");
            return;
        }
        let sharePath = this.wirtPath + "\\" + name + ".png";
        cc.log("图片保存路径:", sharePath);
        //如果有存在这个路径,则删除路径,再创建路径
        if (!jsb.fileUtils.isDirectoryExist(sharePath)) {
            if (!jsb.fileUtils.createDirectory(sharePath)) {
                cc.log("InitShareFile createDirectory(%s) fail", sharePath);
                return;
            }
        }

        let savePath = sharePath + "/" + name + '.png';
        cc.log("截图保存成功", savePath);
        let success = jsb.fileUtils.writeDataToFile(picData, savePath);
        if (success) {
            if (call) {
                call(savePath, texture);
            }
        } else {
            cc.log("截图失败")
        }
    }


}