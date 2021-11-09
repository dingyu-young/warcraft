
export enum EnumGridType {
    empty,
    block,
    start,
    end,
    none,
}



export class AstarGrid {
    x:number;
    y:number;
    id:number;//唯一键
    type:EnumGridType;

    private _from:AstarGrid = null;//从哪个格子过来的
    public get from():AstarGrid { return this._from }
    public set from(val:AstarGrid) { this._from = val}

    private _F:number = 0;//评估值  到起点和终点的总评估值
    public get F():number { return this._F}
    public set F(val:number) { if(val < this._F || 0 == this._F){ this._F = val; } }

    // private _G:number = 0;//G值 离起点的评估值
    // public get G():number { return this._G}
    // public set G(val:number) { if(val < this._G || 0 == this._G){ this._G = val; } }

    constructor(x:number,y:number,id,type:EnumGridType = EnumGridType.empty){
        this.x = x;
        this.y = y;
        this.id = id;
        this.type = type
    }

    public setF(val,from:AstarGrid){
        if(val < this._F || 0 == this._F){
            this._F = val;
            this._from = from;
        }
    }




}