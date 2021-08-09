import {BaseClass} from "./BaseClass";



export class Singleton extends BaseClass {
    mName: string = "Singleton";
    static ins<T extends Singleton>(this: new () => T): T {
        if (!(<any>this)._instance) {
            (<any>this)._instance = new this();
            window[(<any>this)._instance.jsName] = (<any>this)._instance;
        }
        return (<any>this)._instance;
    }
}