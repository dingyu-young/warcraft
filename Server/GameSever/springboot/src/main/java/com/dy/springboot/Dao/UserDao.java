package com.dy.springboot.Dao;

import com.dy.springboot.mapper.GameUserMapper;
import com.dy.springboot.model.GameUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.List;

//t_user表接口
@Service
public class UserDao {

    @Autowired
    private GameUserMapper mapper;

    private static GameUserMapper userMapper;
    @PostConstruct
    public void init(){
        UserDao.userMapper = this.mapper;
    }



    //增
    public static int insertUser(GameUser user) {
        return userMapper.insertSelective(user);
    }

    //删除

    public static int deleteUserById(Integer id) {
        return userMapper.deleteByPrimaryKey(id);
    }

    //查找
    public static GameUser selectUserById(Integer id) {
        return userMapper.selectByPrimaryKey(id);
    }

    public static GameUser selectUserByName(String name) {
        return userMapper.selectUserByName(name);
    }

    public static List<GameUser> selectAll(){
        return userMapper.selectAll();
    }

    //修改
    public static int updateUser(GameUser user) {
        return userMapper.updateByPrimaryKeySelective(user);
    }

}
