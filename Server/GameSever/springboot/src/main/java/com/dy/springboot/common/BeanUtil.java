package com.dy.springboot.common;

import org.springframework.context.ApplicationContext;



public class BeanUtil {

    public static ApplicationContext context;

    public static <T>T getBean(String beanName){
        return (T) context.getBean(beanName);
    }

    // 获取bean 方法2
    public static <T> T getBean(Class<T> c){
        return (T) context.getBean(c);
    }

}
