package com.dy.springboot.model;

public class GameUser {
    private Integer userId;

    private String userName;

    private String userPwd;

    private Integer mLv;

    private Integer mVip;

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserPwd() {
        return userPwd;
    }

    public void setUserPwd(String userPwd) {
        this.userPwd = userPwd;
    }

    public Integer getmLv() {
        return mLv;
    }

    public void setmLv(Integer mLv) {
        this.mLv = mLv;
    }

    public Integer getmVip() {
        return mVip;
    }

    public void setmVip(Integer mVip) {
        this.mVip = mVip;
    }
}