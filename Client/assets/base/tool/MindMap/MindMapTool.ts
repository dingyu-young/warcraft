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
        let data = ComTool.GetLocalItem("stroy911", 0);
        if (!data) {
            let asset = await LoadManager.ins().loadRes("table/story911", cc.JsonAsset);
            data = asset.json;
        }
        this.jsonMap = data;
        this.storyMap = this.jsonMap["story"] || {};
        this.groupMap = this.jsonMap["group"] || {};
        this.groupList = Object.keys(this.groupMap);
        if (this.groupList.length > 0) {
            this.ui.loadScene(this.groupList[this.groupList.length - 1]);
        } else {
            this.ui.onAddNewScene(null);
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
            isChoose: true
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
        ComTool.SetLocalItem("stroy911", this.jsonMap);
        cc.log("保存场景", this.groupMap[this.ui.currentId].Name)

    }

    download() {
        ComTool.saveForBrowser(JSON.stringify(this.jsonMap), "story911", ".json");
        this.writeExcel();
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