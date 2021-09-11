package com.dy.springboot.mapper;

import com.dy.springboot.model.GameUser;

import java.util.List;

public interface GameUserMapper {
    int deleteByPrimaryKey(Integer userId);

    int insert(GameUser record);

    int insertSelective(GameUser record);

    GameUser selectByPrimaryKey(Integer userId);

    GameUser selectUserByName(String userName);

    List<GameUser> selectAll();

    int updateByPrimaryKeySelective(GameUser record);

    int updateByPrimaryKey(GameUser record);
}