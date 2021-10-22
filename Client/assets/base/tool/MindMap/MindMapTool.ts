import {MindMap} from "./MindMap";
import {ComTool} from "../../ComTool";
import {LoadManager} from "../../manager/LoadManager";
import {TableMindMap, TableMindMapGroup} from "../../manager/TableManager";
import {MindBox} from "./MindBox";


export class MindMapTool {
    ui: MindMap = null;

    constructor(ui: MindMap) {
        this.ui = ui;
    }

    jsonMap = null;
    storyMap = null;
    groupMap = null;
    groupList = [];


    async init() {
        let data = ComTool.GetLocalItem("story911", 0);
        if (!data) {
            // let asset = await LoadManager.ins().loadRes("table/911group", cc.JsonAsset);
            // data = asset.json;
            // this.jsonMap = data;
            let asset = await LoadManager.ins().loadRes("table/911group", cc.JsonAsset);
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
        let asset = await LoadManager.ins().loadRes("table/" + group, cc.JsonAsset);
        let data = asset.json;
        for(let key in data){
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
                PosY: box.node.y
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

    download() {
        ComTool.saveForBrowser(JSON.stringify(this.jsonMap), "story911", ".json");
        this.writeExcel();
    }

    downloadOne(group){
        let data = {};
        let rootid = this.groupMap[group].ID;
        this.getChild(rootid,data,group);
        if(Object.keys(data).length > 0){
            ComTool.saveForBrowser(JSON.stringify(data), group, ".json");
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
            if(!this.groupMap[key].isChoose){
                continue
            }
            this.groupMap[key].isChoose = true;
            if(this.groupMap[key].isTheme){
                theme[key] = this.groupMap[key];
            }else {
                this.groupMap[key].isTheme = false;
                normal[key] = this.groupMap[key];
            }
        }
        let data = {normal:normal,theme:theme};
        ComTool.saveForBrowser(JSON.stringify(data), "911group", ".json");

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
        ComTool.saveForBrowser(txt,"story911",".xlsx");

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
                val.GroupId,val.ID,val.Content ? val.Content : "",val.isChoose
            ]
            let t = list.join("\t") + "\r\n";
            txt1 += t;
        }
        ComTool.saveForBrowser(txt1,"story911group",".xlsx");
    }


    getSaveData() {
        let idList = [];
        this.ui.allBoxlist.sort((a, b) => {
            return a.groupId - b.groupId;
        })
        let saveData = {};
        let story = {};
        let group = {};
        let boxList = this.ui.allBoxlist;
        //故事线
        for (let i = 0; i < boxList.length; i++) {
            let box = boxList[i];
            if (!box || (box.parents.length == 0 && box.children.length == 0)) {
                continue;
            }
            let id = box.groupId * 1000 + box.id;
            if (idList.indexOf(id) > -1) {
                continue;
            }
            idList.push(id);
            let nextIdlist = [];//下一组的id列表
            for (let j = 0; j < box.children.length; j++) {
                nextIdlist.push(box.children[j].id + box.children[j].groupId * 1000);
            }
            let isSubsocre = box.isSubSocre ? 1 : 0;//是否扣分
            let [content, event] = box.value.split(";");
            let eventid = event ? parseInt(event) : 0;
            story[id] = {
                ID: id,
                GroupId: box.groupId,
                ChildIdList: nextIdlist,
                EventID: eventid,
                IsSubSocre: isSubsocre,
                Text: content,
                PosX: box.node.x,
                PosY: box.node.y
            }
        }

        //组
        let groupList = this.ui.rootBoxList
        for (let i = 0; i < groupList.length; i++) {
            let box = groupList[i];
            if (!box) {
                cc.error("不存在组:", groupList);
                continue;
            }
            let name = "场景" + i;
            let label = this.ui.getSceneBtnLable(i);
            if (label) {
                name = label.string;
            }
            group[i] = {
                GroupId: i,
                ID: box.id + i * 1000,
                Name: name,
                isChoose: false
            }
        }
        saveData["story"] = story;
        saveData["group"] = group;
        //
        this.jsonMap = saveData;
    }

}