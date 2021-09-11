package com.dy.springboot.message;


import java.lang.reflect.Method;

public class RequestInfo {
    private Object requestObj;
    private Method requestMethod;
    RequestInfo(Object obj, Method method){
        this.requestMethod = method;
        this.requestObj = obj;

    }


    public Object getRequestObj() {
        return requestObj;
    }

    public Method getRequestMethod() {
        return requestMethod;
    }

}
