package com.dy.springboot.message;

import com.dy.springboot.annotation.GameRequest;
import com.dy.springboot.annotation.GameRequestMethod;
import io.netty.channel.ChannelHandlerContext;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashMap;

@Service(value = "GameRequestSever")
public class GameRequestSever {
    private final Logger logger = Logger.getLogger(this.getClass());


    @Autowired
    private ApplicationContext context;

    private HashMap<String, RequestInfo> requestMap = new HashMap<>();

    //所有请求初始化到map
    @PostConstruct
    public void init() {
        String[] beanNames = context.getBeanNamesForAnnotation(GameRequest.class);
        if (beanNames != null && beanNames.length > 0) {
            for (String beanName : beanNames){
                Object object = context.getBean(beanName);
                Method[] methods = object.getClass().getMethods();
                if(methods != null && methods.length > 0){
                    for (Method method : methods){
                        GameRequestMethod requestMethod = method.getAnnotation(GameRequestMethod.class);
                        if(requestMethod != null){
                            RequestInfo requestInfo = new RequestInfo(object,method);
                            String requestName = requestMethod.value();
                            requestMap.put(requestName,requestInfo);
                        }
                    }
                }
            }
            logger.info("请求协议初始化成功");
        }
    }

    public void callMethod(String reqName, Object reqData, ChannelHandlerContext ctx){
        RequestInfo requestInfo = requestMap.get(reqName);
        if(requestInfo == null){
            logger.error("协议内容:"+reqName+"未找到:" + reqData);
            return;
        }

        Object reqObj = requestInfo.getRequestObj();
        Method reqMethod = requestInfo.getRequestMethod();

        try {
            logger.info("channelID:" + ctx.channel().id()+","+"处理请求:" + reqName + "数据:" + reqData);
            reqMethod.invoke(reqObj,reqData,ctx);
        }catch (IllegalAccessException | IllegalArgumentException | InvocationTargetException e){
            if(reqMethod == null){
                logger.error("协议:"+reqName+"方法处理失败," + "方法不存在");
            }else {
                logger.error("协议:"+reqName+"方法处理失败," + "方法名" + reqMethod.getName() + ":参数类型可能出错了或函数内部调用出错");
            }
            System.out.println(e);
        }
    }

}
