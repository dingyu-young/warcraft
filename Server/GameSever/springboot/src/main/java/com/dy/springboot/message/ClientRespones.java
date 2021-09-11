package com.dy.springboot.message;

import com.dy.springboot.annotation.ResponesType;
import com.google.gson.Gson;
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.http.websocketx.BinaryWebSocketFrame;
import io.netty.util.CharsetUtil;

public class ClientRespones {

    public static void SendTo(ChannelHandlerContext ctx, Object msg) {
        ResponesType type = msg.getClass().getAnnotation(ResponesType.class);
        String json = new Gson().toJson(msg);
        byte[] body = json.getBytes(CharsetUtil.UTF_8);
        ByteBuf byteBuf = ctx.alloc().buffer(body.length + 4);
        byteBuf.writeInt(type == null ? 1 : type.value());
        byteBuf.writeInt(body.length);
        byteBuf.writeBytes(body);
        BinaryWebSocketFrame rep = new BinaryWebSocketFrame(byteBuf);
        ctx.writeAndFlush(rep);
    }

    public static void SendAll(Object msg){

    }
}
