package com.dy.springboot.net;

import com.dy.springboot.common.BeanUtil;
import com.dy.springboot.message.ClientRespones;
import com.dy.springboot.message.GameRequestSever;
import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.websocketx.*;
import io.netty.util.CharsetUtil;
import org.apache.log4j.Logger;
import org.springframework.beans.BeansException;

import java.util.Date;

public class WebSocketFramehandler extends SimpleChannelInboundHandler<WebSocketFrame> {

    private final Logger logger = Logger.getLogger(this.getClass());

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, WebSocketFrame frame) throws Exception {
        if (frame instanceof CloseWebSocketFrame) {
//            handshaker.close(ctx.channel(), (CloseWebSocketFrame) frame.retain());
            return;
        }
        // 判断是否ping消息
        if (frame instanceof PingWebSocketFrame) {
            ctx.channel().write(
                    new PongWebSocketFrame(frame.content().retain()));
            return;
        }
        if (frame instanceof BinaryWebSocketFrame) {
            ReciveBinarytMessge(ctx, (BinaryWebSocketFrame) frame);
        } else if (frame instanceof TextWebSocketFrame) {
            ReciveTextMessge(ctx, (TextWebSocketFrame) frame);
        }
    }

    protected void ReciveTextMessge(ChannelHandlerContext ctx, TextWebSocketFrame frame) {
        // 返回应答消息
        String request = frame.text();
        logger.debug("服务端收到：" + request);
        TextWebSocketFrame tws = new TextWebSocketFrame(new Date().toString()
                + ctx.channel().id() + "：" + request);
        // 群发
        //ChannelSupervise.send2All(tws);
        // 返回【谁发的发给谁】
        ctx.channel().writeAndFlush(tws);
    }

    protected void ReciveBinarytMessge(ChannelHandlerContext ctx, BinaryWebSocketFrame frame) {

        ByteBuf byteBuf = frame.content();

        int len = byteBuf.readInt();        //消息内容总长度
        logger.info("接受总字节:"+len);
        int moshu = byteBuf.readInt();      //魔数,判断是否有效消息
        int reqlen = byteBuf.readInt();     //请求名长度
        int length = byteBuf.readableBytes();
        int readIndex = byteBuf.readerIndex();//当前读指针
        String reqName = byteBuf.toString(readIndex,reqlen,CharsetUtil.UTF_8);                              //请求名
        String reqData = byteBuf.toString(reqlen + readIndex,length - reqlen,CharsetUtil.UTF_8);     //请求体
//        byteBuf.release();//内存释放
        String msg = "";
        //去除多余空内容
        for (int i = 0; i < reqData.length(); i++) {
            char c = reqData.charAt(i);
            if(c != 0){
                msg += c;
            }
        }
        try {

            Object c = BeanUtil.getBean(reqName);
            if(c != null){
                Object req = new Gson().fromJson(msg,c.getClass());
//                logger.info("收到请求内容::" + req);
                //处理协议
                GameRequestSever server = BeanUtil.getBean("GameRequestSever");
                server.callMethod(reqName,req,ctx);
            }else {
                logger.info("没有找到对应处理协议");
            }
        }catch (JsonSyntaxException  e){
            logger.error("协议" + reqName + "JSon序列化失败:" + msg);
            throw e;
        }catch (BeansException e){
            logger.error("没有找到协议bean,协议名称:" + reqName);
            ClientRespones.SendTo(ctx,"error");
            throw e;
        }catch (Exception e){
            ClientRespones.SendTo(ctx,"error");
        }
    }

    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        //添加连接
        logger.debug("客户端加入连接：" + ctx.channel());
        WebSocketChannelMap.addChannel(ctx.channel());
    }

    @Override
    public void channelInactive(ChannelHandlerContext ctx) throws Exception {
        //断开连接
        logger.debug("客户端断开连接：" + ctx.channel());
        WebSocketChannelMap.removeChannel(ctx.channel());
    }

    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
        ctx.flush();
    }
}
