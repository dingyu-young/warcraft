package com.dy.springboot.message;

import com.dy.springboot.annotation.ResponesType;
import com.dy.springboot.model.GameUser;
import org.springframework.stereotype.Component;

@Component
public class NetMsg {

    @Component(value = "RQ_Login")
    public static class RQ_Login{
        public String userName;
        public String password;
    }

    @ResponesType(value = 1)
    public static class RS_Login{
        public int code;
        public GameUser mData;
    }

    @Component(value = "RQ_Register")
    public static class RQ_Register{
        public String userName;
        public String password;
    }
}
