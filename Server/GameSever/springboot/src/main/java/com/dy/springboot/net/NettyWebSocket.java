package com.dy.springboot.net;


import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.Channel;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Component;

@Component
public class NettyWebSocket {
    private final Logger log = Logger.getLogger(NettyWebSocket.class);

    public void startServer(){
        log.info("开始启动服务器");
        NioEventLoopGroup boss = new NioEventLoopGroup();//一个接受连接线程池
        NioEventLoopGroup worker = new NioEventLoopGroup();//处理客户端事件线程池
        try{
            ServerBootstrap bootstrap = new ServerBootstrap();
            bootstrap.group(boss,worker)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new NioWebSocketChannel());
            Channel ch = bootstrap.bind(9001).sync().channel();
            log.info("websocket启动成功");
            ch.closeFuture().sync();
        }catch (InterruptedException e){
            e.printStackTrace();
            log.info("运行出错:"+e);
        }finally {
            boss.shutdownGracefully();
            worker.shutdownGracefully();
            log.info("服务器关闭");
        }
    }
}
