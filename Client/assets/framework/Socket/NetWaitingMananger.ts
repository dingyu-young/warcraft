import Session = require("./Session");
import app from "../../script/app";


export class NetWaitingMananger {

    private currentWaitingList: Session[] = [];

    private sendEvent;

    private receiveEvent;

    constructor(send, receive) {
        this.sendEvent = send;
        this.receiveEvent = receive;
    }

    public EnqueueWaiting(net: Session) {
        let index = this.currentWaitingList.indexOf(net);
        if (index >= 0)//已经在列表中了
            return;

        if (this.currentWaitingList.length == 0) {
            // app.instance().emit("ModalLayer", this.sendEvent)
        }

        this.currentWaitingList.push(net);
    }


    public DequeueWaiting(net: Session) {
        let index = this.currentWaitingList.indexOf(net);
        if (index < 0)//在列表中不存在
            return;

        this.currentWaitingList.splice(index, 1);

        if (this.currentWaitingList.length == 0) {
            // App.instance().emit("ModalLayer", this.receiveEvent)
        }
    }
}