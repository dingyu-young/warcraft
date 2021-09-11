package com.dy.springboot.request;

import com.dy.springboot.Dao.UserDao;
import com.dy.springboot.annotation.GameRequest;
import com.dy.springboot.annotation.GameRequestMethod;
import com.dy.springboot.message.ClientRespones;
import com.dy.springboot.message.NetMsg;
import com.dy.springboot.model.GameUser;
import io.netty.channel.ChannelHandlerContext;
import org.apache.log4j.Logger;

@GameRequest
public class LoginRequest {
    private final Logger logger = Logger.getLogger(this.getClass());

    /**
     * 请求登录
     * @param req
     * @param ctx
     */
    @GameRequestMethod(value = "RQ_Login")
    public void RQ_Login(NetMsg.RQ_Login req, ChannelHandlerContext ctx){
        System.out.println("姓名:" + req.userName + "密码:" + req.password);
        GameUser user = UserDao.selectUserByName(req.userName);

        //回复
        NetMsg.RS_Login res = new NetMsg.RS_Login();
        if(user == null ||  !req.password.equals(user.getUserPwd())){
            res.code = 1;
            res.mData = null;
        }else {
            res.code = 0;
            res.mData = user;
        }
        ClientRespones.SendTo(ctx,res);
    }

    //请求注册账号
    @GameRequestMethod(value = "RQ_Register")
    public void RQ_Register(NetMsg.RQ_Register req, ChannelHandlerContext ctx){
        try{
            GameUser user = UserDao.selectUserByName(req.userName);
            NetMsg.RS_Login res = new NetMsg.RS_Login();

            if(user != null){
                res.code = 1;
                res.mData = null;
            }else {
                GameUser newUser = new GameUser();
                newUser.setUserName(req.userName);
                newUser.setUserPwd(req.password);
                newUser.setmLv(1);
                newUser.setmVip(0);
                UserDao.insertUser(newUser);
                res.code = 0;
                res.mData = newUser;
            }
            ClientRespones.SendTo(ctx,res);
        }catch (Exception e){
            e.printStackTrace();
        }

    }


}
