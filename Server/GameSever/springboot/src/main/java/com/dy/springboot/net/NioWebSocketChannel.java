package com.dy.springboot.net;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.socket.SocketChannel;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpServerCodec;
import io.netty.handler.codec.http.websocketx.WebSocketServerProtocolHandler;
import io.netty.handler.logging.LoggingHandler;


public class NioWebSocketChannel extends ChannelInitializer<SocketChannel> {


    @Override
    protected void initChannel(SocketChannel ch) throws Exception {
        ch.pipeline().addLast("logging",new LoggingHandler("DEBUG"));
        ch.pipeline().addLast("http-codec",new HttpServerCodec());//设置http解码器
        ch.pipeline().addLast("aggregator",new HttpObjectAggregator(65536));//聚合器,使用websocket用到
        ch.pipeline().addLast("websocket",new WebSocketServerProtocolHandler("/"));
        ch.pipeline().addLast("framehandler",new WebSocketFramehandler());
//        ch.pipeline().addLast("encode",new EncodeHandler());//编码器


    }
}
