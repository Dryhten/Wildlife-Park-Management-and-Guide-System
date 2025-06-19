package com.example.demo.config;

import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;

@Component
@Slf4j
public class MyMetaObjectHandler implements MetaObjectHandler {

    @Override
    public void insertFill(MetaObject metaObject) {
        log.debug("start insert fill ....");
        // 起始版本 3.3.3(推荐)
        this.strictInsertFill(metaObject, "createdAt", () -> LocalDateTime.now(), LocalDateTime.class);
        this.strictInsertFill(metaObject, "updatedAt", () -> LocalDateTime.now(), LocalDateTime.class);
        this.strictInsertFill(metaObject, "isDeleted", () -> false, Boolean.class);
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        log.debug("start update fill ....");
        this.strictUpdateFill(metaObject, "updatedAt", () -> LocalDateTime.now(), LocalDateTime.class);
    }
} 