import {BaseClass} from "./BaseClass";


export class Singleton extends BaseClass{

    static instance<T extends Singleton>(this:new () => T): T{
        if(!(<any>this)._instance){
            (<any>this)._instance = new this();
            window[(<any>this)._instance.jsName] = (<any>this)._instance;
        }
        return (<any>this)._instance;
    }

}