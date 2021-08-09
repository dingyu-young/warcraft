import {Singleton} from "../Singleton";


interface EventInfo {
    callBack: Function;
    target: any;
}

//全局事件管理器
export class EventManager extends Singleton {

    jsName = "EventManager";

    eventData: { [key: string]: EventInfo[] } = {};


    //注册事件
    /**
     *
     * @param eventName 事件名
     * @param eventCallback 回调
     * @param target
     */
    regEvent(eventName: string, eventCallback: Function, target: any) {
        if (!this.eventData[eventName]) {
            this.eventData[eventName] = [];
        }
        this.eventData[eventName].push({callBack: eventCallback, target: target});
    }


    //发送事件
    emitEvent(eventName: string, ...arg) {
        let eventList = this.eventData[eventName] || [];
        for (let i = 0; i < eventList.length; i++) {
            let event = eventList[i];
            let callBack = event.callBack;
            callBack.call(event.target, ...arg);
        }
    }

    //注销事件
    removeEvent(eventName: string, callBack: Function, target: any) {
        let eventList = this.eventData[eventName] || [];
        for (let i = 0; i < eventList.length; i++) {
            let event = eventList[i];
            if (callBack == event.callBack && target == event.target) {
                eventList.splice(i, 1);
                break;
            }
        }
    }

}



