package com.dy.springboot;

import com.dy.springboot.common.BeanUtil;
import com.dy.springboot.net.NettyWebSocket;
import org.apache.log4j.BasicConfigurator;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.stereotype.Component;

//SpringBoot项目启动入口
@SpringBootApplication  //springboot核心注解,主要用于开启spring配置
@MapperScan(basePackages = "com.dy.springboot.mapper")//开启扫描Mapper接口的包以及子目录添加@Mapper注解
public class SpringbootApplication {
    //springboot项目代码必须放在这个文件同级目录后者下级目录
    public static void main(String[] args) {
        BasicConfigurator.configure();
        BeanUtil.context = SpringApplication.run(SpringbootApplication.class, args);
        new NettyWebSocket().startServer();
    }

}
