package com.example.demo;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserPreferencesMapper extends BaseMapper<UserPreferences> {
    
    /**
     * 根据用户ID查询用户偏好设置
     * @param userId 用户ID
     * @return 用户偏好设置
     */
    @Select("SELECT * FROM user_preferences WHERE user_id = #{userId}")
    UserPreferences selectByUserId(@Param("userId") Integer userId);
} 