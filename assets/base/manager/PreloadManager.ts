import {Singleton} from "../Singleton";


export class PreloadManager extends Singleton{

    private resCache;//已经加载数据
    private loading;//正在加载数据

    preload(path:string,type:typeof cc.Asset){
        cc.resources.preload(path,type);
    }

    loadRes(path:string,type:typeof cc.Asset){
        //如果已经加载
        if(this.resCache[path]){
            let res = this.resCache[path];
            return Promise.resolve(res);
        }
        //如果正在加载
        if(this.loading[path]){
            return this.loading[path];
        }

        this.loading[path] = new Promise((resolve:Function,reject:Function)=>{
            cc.log("加载资源:" + path);
            cc.resources.load(path,type,(err,res)=>{
                if(err){
                    delete this.loading[path];
                    cc.error(err);
                    reject(err);
                    return;
                }
                res.addRef();
                this.resCache[path] = res;
                resolve(res);
                delete this.loading[path];
            })
        })
    }
    loadHttpRes(){

    }

}