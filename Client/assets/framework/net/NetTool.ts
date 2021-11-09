import {WebNet} from "./WebNet";


export class NetTool {
    private static webNet:WebNet = new WebNet();
    private static requestQueId:number = 0;//请求序列id
    private static acceptQueId:number = 0;//返回请求id


    public static Connect(){

        this.webNet.Connect("127.0.0.1","9001");

    }

    public static getAcceptId(){
        NetTool.acceptQueId++;
        return NetTool.acceptQueId;
    }

    //外部请求数据接口
    public static async AsyncRequest<T>(req: any){
        let resp = await NetTool.Request(req.mName,req);
        return resp as T;
    }

    private static async Request(reqName:string,data:any){
        return new Promise<any>(async (resolve, reject) => {
            NetTool.requestQueId++;
            //监听消息返回
            NetTool.webNet.ListenResponse(NetTool.requestQueId,(data)=>{
                resolve(data);
            })
            NetTool.webNet.Request(reqName,data);
        })
    }


}