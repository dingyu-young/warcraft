

export class TableManager {
    static tables: any = {};


    static tableRes: string[] = ["mindmap","mindmapgroup"];

    private static _init() {
        TableMindMap.Init(this.tables["mindmap"]);
        TableMindMapGroup.Init(this.tables["mindmapgroup"]);
    }

    static async Init() {
        this.tables = {};
        for (let i = 0; i < this.tableRes.length; i++) {
            let res = this.tableRes[i];
            let file: cc.TextAsset = await this.loadText("table/" + res, cc.TextAsset);
            this.LoadTable(file.text, res);
        }
        this._init();
    }

    static loadText(path,type){
        return new Promise<any>((resolve, reject) => {
            cc.resources.load(path, cc.TextAsset, (err, res) => {
                if (err) {
                    reject(null);
                    cc.log("加载本地资源失败,path:",path);
                    return;
                }
                resolve(res);
            })
        })
    }

    static LoadTable(text: string, name: string) {
        let txtList = text.split("\r\n");
        let keys = txtList[0].split("\t");
        let table = {};
        for (let i = 2; i < txtList.length; i++) {
            let txt = txtList[i];
            if (txt) {
                let values = txt.split("\t");
                let id = values[0];
                table[id] = {};
                for (let j = 0; j < keys.length; j++) {
                    let value: any = values[j]
                    let [key, type] = keys[j].split(":");
                    if (type == "INT") {
                        value = value ? parseInt(value) : 0;
                    } else if (type == "BOOL") {
                        value = value ? !!parseInt(value) : false;
                    } else if (type == "ARRAYDATA") {
                        value = value ? JSON.parse(value) : null;
                    }
                    table[id][key] = value;
                }
            }
        }
        if(this.tables == null){
            this.tables = {};
        }
        this.tables[name] = table;
    }
}

//剧情表
export class TableMindMap {
    ID: number;
    GroupId:number;
    ChildIDList:number[];
    EventID:number;
    IsSubSocre:boolean;
    Text:string;

    private static _table: { [key: string]: TableMindMap } = null;

    static Init(table: any) {
        this._table = table
    }

    static get table():{ [key: string]: TableMindMap }{
        return this._table;
    }

    static GetConfig(key: any): TableMindMap {
        return this.table[key] as TableMindMap;
    }
}
//剧情组表表
export class TableMindMapGroup {
    GroupId:number;
    ID: number;
    Name:string;

    private static _table: { [key: string]: TableMindMapGroup } = null;

    static Init(table: any) {
        this._table = table
    }

    static get table():{ [key: string]: TableMindMapGroup }{
        return this._table;
    }

    static GetConfig(key: any): TableMindMapGroup {
        return this.table[key] as TableMindMapGroup;
    }
}

