var xlsxList = ["qichexinxi", "SpringOutingConfig"];
import {LoadManager} from "../manager/LoadManager";

enum EnumTableType {
    json = 1,
    txt = 2
}
var tableType = EnumTableType.json;

export class TableTool {
    static tableInfo: { [key: string]: any } = {}

    public static RegirsterTable(obj): void {
        TableTool.tableInfo[obj.mName] = obj;
    }

    public static async initTable() {
        let path = "table/";
        if (tableType == EnumTableType.json) {
            for (let i = 0; i < xlsxList.length; i++) {
                let xlsxName = xlsxList[i];
                let data = await LoadManager.ins().loadRes(path + xlsxName, cc.JsonAsset)
                if (!data) {
                    cc.error("不存在配置表:", xlsxName)
                    continue
                }
                this.initJson(data.json);
            }
        } else if (tableType == EnumTableType.txt) {
            for (let i = 0; i < xlsxList.length; i++) {
                let xlsxName = xlsxList[i];
                let data = await LoadManager.ins().loadRes(path + xlsxName, cc.TextAsset)
                if (!data) {
                    cc.error("不存在配置表:", xlsxName)
                    continue
                }
                this.initTxt(data.text);
            }
        }
    }

    //解析json
    public static initJson(json) {
        for (let key in json) {
            let obj = TableTool.tableInfo[key];
            if (!obj) {
                cc.error("不存在表的类结构:", key)
                continue
            }
            TableTool.tableInfo[key].init(json[key])
        }
    }

    //解析文本txt
    public static initTxt(text: string) {
        let textList = text.split("##");
        for (let i = 1; i < textList.length; i++) {//这里为一张表
            let list = textList[i].split("\r\n");
            let className = list[0];
            let keys = list[1].split("\t");
            let table = {};
            for (let j = 3; j < list.length; j++) {//解析表数据
                if(!list[j]){
                    continue;
                }
                let values = list[j].split('\t');
                let id = values[0];
                table[id] = {};
                for (let l = 0; l < keys.length; l++) {
                    if(!keys[l]){
                        continue;
                    }
                    let value: any = values[l];
                    let [key, type] = keys[l].split(":");
                    if (type == "Int" || type == "Float") {
                        value = value ? Number(value) : 0;
                    } else if (type == "Bool") {
                        value = value ? !!parseInt(value) : false;
                    } else if (type == "Array") {
                        value = value ? JSON.parse(value) : null;
                    } else if (type == "String"){
                        value = value;
                    } else {
                        value = value ? JSON.parse(value) : null;
                    }
                    table[id][key] = value;
                }
            }

            let obj = TableTool.tableInfo[className];
            if (!obj) {
                cc.error("不存在表的类结构:", className)
                continue
            }else {
                TableTool.tableInfo[className].init(table)
            }
        }
    }
}

class BaseTable {
    public static mName: string = "";
    public static table: { [key: string]: any } = {}

    public static init(data) {
        this.table = data
    }
}
@TableTool.RegirsterTable
export class CarInfo extends BaseTable {
	public static mName: string = "CarInfo";
	ID : number;	//ID
	Speed : number;	//速度
	Price : number;	//价格
	Type : EnumCarType;	//类型
	TestList : [];	//测试列表
	Des : string;	//描述
	public static getConfig(key): CarInfo{
		return this.table[key] as CarInfo;
	}
}


export enum EnumCarType {
	ePoliceCar = 0, 	//警车
	eDoctorCar = 1, 	//救护车
	eFireCar = 2, 	//消防车
}


@TableTool.RegirsterTable
export class SpringOutingConfig extends BaseTable {
	public static mName: string = "SpringOutingConfig";
	ID : number;	//配置id
	PROGRESS : number;	//春游进度值
	ONE : number;	//单次抽奖消耗油桶数
	TEN : number;	//10次抽奖消耗油桶数
	DIAMOND : [];	//购买学雷锋所需钻石
	public static getConfig(key): SpringOutingConfig{
		return this.table[key] as SpringOutingConfig;
	}
}


@TableTool.RegirsterTable
export class SpringPoolsConfig extends BaseTable {
	public static mName: string = "SpringPoolsConfig";
	ID : number;	//id
	LEVEL : number;	//校长等级
	AWARDTYPE : number;	//奖励类型
	AWARDID : number;	//奖励id
	COUNT : number;	//奖励数量
	RATE : number;	//概率值
	public static getConfig(key): SpringPoolsConfig{
		return this.table[key] as SpringPoolsConfig;
	}
}


@TableTool.RegirsterTable
export class SpringEventConfig extends BaseTable {
	public static mName: string = "SpringEventConfig";
	ID : number;	//id
	LEVEL : number;	//所需学校等级
	AWARD1 : [];	//写游记奖励
	AWARD2 : [];	//学雷锋奖励固定奖励
	RATE : [];	//写游记的n倍奖励
	public static getConfig(key): SpringEventConfig{
		return this.table[key] as SpringEventConfig;
	}
}


@TableTool.RegirsterTable
export class SpringNoteScoreConfig extends BaseTable {
	public static mName: string = "SpringNoteScoreConfig";
	ID : number;	//idX
	EVENTTIMES : [];	//游记事件次数
	BASE_SCORE : number;	//文科成绩基础要求
	SCORE_GROWTH : number;	//成绩增长值
	public static getConfig(key): SpringNoteScoreConfig{
		return this.table[key] as SpringNoteScoreConfig;
	}
}

