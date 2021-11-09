import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import EventTouch = cc.Event.EventTouch;
import {AstarGrid, EnumGridType} from "./AstarGrid";
import {AStar} from "./AStar";

var SIDE: number = 15;//每个格子大小


@ccclass()
export class AStarTool extends cc.Component {

    @property(cc.Graphics)
    pen: cc.Graphics = null;

    private astar:AStar = null;

    public row = 0;//行
    public col = 0;//列


    public penState: EnumGridType = EnumGridType.none;
    public grids: AstarGrid[][] = [];
    public gridMap: Map<number,AstarGrid> = new Map();

    public startGrid: AstarGrid = null;
    public endGrid: AstarGrid = null;

    public blockGrids:Map<number,AstarGrid> = new Map();

    protected onLoad(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, this.touchEvent, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchEvent, this);
        window["AStarTool"] = this;
    }

    touchEvent(event: EventTouch) {
        if(this.penState == EnumGridType.none){
            return;
        }
        let pos = event.getLocation();
        let grid = this.getTouchGrid(pos);
        if (!grid) {
            return;
        }

        grid.type = this.penState;
        if (this.penState == EnumGridType.start) {
            this.startGrid && this.drawGrid(this.startGrid, cc.Color.WHITE);
            this.startGrid = grid;
        } else if (this.penState == EnumGridType.end) {
            this.endGrid && this.drawGrid(this.endGrid, cc.Color.WHITE);
            this.endGrid = grid;
        }

        this.drawGrid(grid);

        if(grid.type == EnumGridType.block){
            this.blockGrids.set(grid.id,grid);
        }else if(grid.type == EnumGridType.empty){
            this.blockGrids.delete(grid.id);
        }
        cc.log(grid.x,grid.y);

    }


    //获取触摸的格子
    getTouchGrid(touchPos: cc.Vec2) {
        let pos = this.node.convertToNodeSpaceAR(touchPos);
        let x = pos.x / SIDE << 0;
        let y = pos.y / SIDE << 0;
        return this.grids[x][y];
    }

    protected start(): void {
        this.astar = new AStar(this.gridMap,this);
        this.Init();
    }

    set strokColor(color: cc.Color) {
        this.pen.strokeColor = color;
    }

    set fillColor(color: cc.Color) {
        this.pen.fillColor = color;
    }

    Init() {

        this.row = this.node.height / SIDE << 0;
        this.col = this.node.width / SIDE << 0;
        this.astar.setRowCol(this.row,this.col+1);
        cc.log(`行:${this.row},列${this.col}`);

        this.strokColor = cc.Color.BLACK;
        for (let i = 0; i <= this.row; i++) {
            this.pen.moveTo(0, i * SIDE);
            this.pen.lineTo(SIDE * this.col, i * SIDE);
        }
        for (let i = 0; i <= this.col; i++) {
            this.pen.moveTo(i * SIDE, 0);
            this.pen.lineTo(i * SIDE, SIDE * this.row);
        }
        this.pen.stroke();

        for (let i = 0; i < this.col; i++) {
            this.grids[i] = [];
        }

        let id = 1;
        for (let i = 0; i < this.row; i++) {
            for (let j = 0; j < this.col; j++) {
                let grid = new AstarGrid(j, i,id);
                this.grids[j][i] = grid;
                this.gridMap.set(id,grid);
                id++;
            }
            id++;//使横向id多一个,便于计算
        }
    }


    drawGrid(grid: AstarGrid, color?: cc.Color) {
        let beforColor = this.pen.fillColor;
        if (color) {
            this.fillColor = color;
        }

        this.pen.circle(grid.x * SIDE + SIDE / 2, grid.y * SIDE + SIDE / 2, SIDE / 2 << 0);
        this.pen.fill();

        if (color) {
            this.fillColor = beforColor;
        }
    }


    setBlock() {
        this.fillColor = cc.Color.BLACK;
        this.penState = EnumGridType.block;
    }

    setEmpty() {
        this.fillColor = cc.Color.WHITE;
        this.penState = EnumGridType.empty;

    }

    setStart() {
        this.fillColor = cc.Color.RED;
        this.penState = EnumGridType.start;

    }

    setEnd() {
        this.fillColor = cc.Color.BLUE;
        this.penState = EnumGridType.end;

    }

    addGrid(){
        SIDE --;
        this.clear()
    }

    subGrid(){
        SIDE ++;
        this.clear();
    }

    search(){
        if(!this.startGrid || !this.endGrid){
            return;
        }
        this.astar.Search(this.startGrid,this.endGrid);
        this.startGrid = null;
        this.endGrid = null;
    }

    searchNoDraw(){
        if(!this.startGrid || !this.endGrid){
            return;
        }
        this.astar.Search(this.startGrid,this.endGrid,false);
        this.startGrid = null;
        this.endGrid = null;
    }

    clear(){
        this.startGrid = null;
        this.endGrid = null;
        this.penState = EnumGridType.none;
        this.pen.clear();
        this.Init();

        this.fillColor = cc.Color.BLACK;
        this.blockGrids.forEach(value => {
            this.grids[value.x][value.y].type = EnumGridType.block;
            this.drawGrid(value);
        })

        this.fillColor = cc.Color.WHITE;

    }


}
