import {AstarGrid, EnumGridType} from "./AstarGrid";
import {AStarTool} from "./AStarTool";
import {ComTool} from "../../framework/util/ComTool";


export class AStar {
    row:number;//总行
    col:number;//总列,比实际列数多1,便于id计算和取值
    maxX:number//x最大值
    maxY:number//y最大值

    ui:AStarTool = null;
    isDraw:boolean = true;


    gridMap:Map<number,AstarGrid> = new Map();//所有格子
    openList:Map<number,AstarGrid> = new Map();//开放字典,待检测
    closeList:Map<number,AstarGrid> = new Map();//关闭字典,已检测

    startGrid:AstarGrid = null;
    endGrid:AstarGrid = null;

    constructor(gridMap:Map<number,AstarGrid>,ui:AStarTool){
        this.gridMap = gridMap;
        this.ui = ui;
        window["Astar"] = this;
    }

    public setRowCol(row:number,col:number){
        this.row = row;
        this.col = col;
        this.maxX = this.col - 2;
        this.maxY = this.row - 1;
    }

    clear(){
        this.startGrid = null;
        this.endGrid = null;

        this.openList.forEach(value => {
            value.from = null;
            value.F = 0;
        })
        this.closeList.forEach(value => {
            value.from = null;
            value.F = 0;
        })
        this.openList.clear();
        this.closeList.clear();

    }


    public async Search(startGrid:AstarGrid,endGrid:AstarGrid,isDraw:boolean = true){
        if(startGrid == endGrid){
            return;
        }

        this.clear();

        this.startGrid = startGrid;
        this.endGrid = endGrid;
        this.isDraw = isDraw;


        this.openList.set(this.startGrid.id,this.startGrid);

        this.ui.fillColor = cc.Color.YELLOW;

        console.time("search-time");

        let isEnd = false;
        while (!isEnd){
            let bestGrid:AstarGrid = this.findBest();

            if (bestGrid != this.startGrid){
                this.ui.drawGrid(bestGrid,cc.Color.CYAN);
            }
            if(this.isDraw){
                await ComTool.Await(0.01);
            }

            let roundGrids = this.findRoundGrid(bestGrid);
            isEnd = this.calcRoundGrid(bestGrid,roundGrids);

            this.openList.delete(bestGrid.id);
            this.closeList.set(bestGrid.id,bestGrid);

            if(this.isDraw){
                await ComTool.Await(0.01);
            }
        }
        console.timeEnd("search-time");

        let path:AstarGrid[] = [this.endGrid];
        this.ui.fillColor = cc.Color.GREEN;
        this.getPath(this.endGrid.from,path);
        cc.log(path);

        this.clear();
        this.ui.fillColor = cc.Color.WHITE;
    }

    public G(grid1:AstarGrid,grid2:AstarGrid):number{
        return (Math.abs(grid1.x - grid2.x) + Math.abs(grid1.y - grid2.y)) * 10;
    }

    public H(grid:AstarGrid):number{
        return (Math.abs(grid.x - this.endGrid.x) + Math.abs(grid.y - this.endGrid.y)) * 10;
    }

    //寻找最佳格子
    private findBest(){
        let bestGrid:AstarGrid = null;

        this.openList.forEach(value => {
            if(!bestGrid)bestGrid = value;

            if(value.F < bestGrid.F){
                bestGrid = value;
            }
        })
        return bestGrid;
    }

    //寻找周边8个格子列表
    private findRoundGrid(grid:AstarGrid):AstarGrid[]{
        let result:AstarGrid[] = [];

        let x = grid.x;
        let y = grid.y;

        //上
        let id = grid.id + this.col;
        if(y < this.maxY && !this.closeList.has(id) ){
            result.push(this.gridMap.get(id))
        }

        //下
        id = grid.id - this.col;
        if(y > 0  && !this.closeList.has(id) ){
            result.push(this.gridMap.get(id))
        }

        //左
        id = grid.id - 1;
        if(x > 0 && !this.closeList.has(id) ){
            result.push(this.gridMap.get(id))
        }

        //右
        id = grid.id + 1;
        if(x < this.maxX && !this.closeList.has(id) ){
            result.push(this.gridMap.get(id))
        }

        //左上
        id = grid.id + this.col - 1;
        if(x > 0 &&  y < this.maxY && !this.closeList.has(id) ){
            result.push(this.gridMap.get(id))
        }

        //右上
        id = grid.id + this.col + 1;
        if(x < this.maxX && y < this.maxY && !this.closeList.has(id) ){
            result.push(this.gridMap.get(id))
        }

        //左下
        id = grid.id - this.col - 1;
        if(x > 0 && y > 0 && !this.closeList.has(id) ){
            result.push(this.gridMap.get(id))
        }

        //右下
        id = grid.id - this.col + 1;
        if(x < this.maxX && y > 0 && !this.closeList.has(id) ){
            result.push(this.gridMap.get(id))
        }

        return result
    }

    private calcRoundGrid(bestGrid:AstarGrid,grids:AstarGrid[]):boolean{
        let isEnd = false;

        grids.forEach(value => {

            if(value.type == EnumGridType.block){
                return;
            }

            value.setF(this.G(value,bestGrid) + this.H(value),bestGrid);
            this.openList.set(value.id,value);

            if(value == this.endGrid){
                isEnd = true;
            }

            if(!isEnd && this.isDraw){
                this.ui.drawGrid(value)
            }
        })

        return isEnd;
    }


    private getPath(grid:AstarGrid,path:AstarGrid[]){
        if(!grid.from){
            return;
        }
        path.push(grid);
        this.ui.drawGrid(grid);
        this.getPath(grid.from,path);
    }




}