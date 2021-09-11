package com.dy.springboot.net;

import com.dy.springboot.annotation.ResponesType;
import com.google.gson.Gson;
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelOutboundHandlerAdapter;
import io.netty.channel.ChannelPromise;
import io.netty.handler.codec.http.websocketx.BinaryWebSocketFrame;
import io.netty.util.CharsetUtil;

public class EncodeHandler  {

//    public static void write(ChannelHandlerContext ctx, Object msg) {
//        ResponesType type = msg.getClass().getAnnotation(ResponesType.class);
//        String json = new Gson().toJson(msg);
//        byte[] body = json.getBytes(CharsetUtil.UTF_8);
//        ByteBuf byteBuf = ctx.alloc().buffer(body.length + 4);
//        byteBuf.writeInt(type == null ? 1 : type.value());
//        byteBuf.writeInt(body.length);
//        byteBuf.writeBytes(body);
//        BinaryWebSocketFrame rep = new BinaryWebSocketFrame(byteBuf);
//        ctx.writeAndFlush(rep);
//    }
}

//public class EncodeHandler extends ChannelOutboundHandlerAdapter {
//    @Override
//    public void flush(ChannelHandlerContext ctx) throws Exception {
//        super.flush(ctx);
//    }
//
//    @Override
//    public void write(ChannelHandlerContext ctx, Object msg, ChannelPromise promise) throws Exception {
//        ResponesType type = msg.getClass().getAnnotation(ResponesType.class);
//        String json = new Gson().toJson(msg);
//        byte[] body =  json.getBytes(CharsetUtil.UTF_8);
//        ByteBuf byteBuf = ctx.alloc().buffer(body.length + 4);
//        byteBuf.writeInt(type == null ? 1 : type.value());
//        byteBuf.writeBytes(body);
//        BinaryWebSocketFrame rep = new BinaryWebSocketFrame(byteBuf);
//        ctx.writeAndFlush(rep, promise);
//    }
//}
