import {Singleton} from "../Singleton";


export class LoadManager extends Singleton {

    private resCache = {};//已经加载数据
    private loading = {};//正在加载数据

    preload(path: string, type: typeof cc.Asset) {
        cc.resources.preload(path, type);
    }

    /**
     *
     * @param path  路径
     * @param type 类型
     * @param isSave  是否保存加载的资源
     */
    loadRes(path: string, type: typeof cc.Asset, isSave: boolean = true):Promise<any> {
        //如果正在加载
        if(this.resCache[path]){
            return new Promise(resolve => resolve(this.resCache[path]));
        }
        if (this.loading[path]) {
            return this.loading[path];
        }
        this.loading[path] = new Promise((resolve: Function, reject: Function) => {
            cc.log("加载资源:" + path);
            cc.resources.load(path, type, (err, res) => {
                if (err) {
                    delete this.loading[path];
                    cc.error(err);
                    reject(err);
                    return;
                }
                if (isSave)
                    this.resCache[path] = res;
                resolve(res);
                delete this.loading[path];
            })
        })
        return this.loading[path];
    }

    loadHttpRes() {

    }

}