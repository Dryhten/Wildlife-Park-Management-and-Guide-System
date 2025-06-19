package com.example.demo;

import lombok.Data;

@Data
public class CommonResult<T> {
    private Integer code;
    private String message;
    private T data;

    public static <T> CommonResult<T> success(T data, String message) {
        CommonResult<T> result = new CommonResult<>();
        result.setCode(200);
        result.setMessage(message);
        result.setData(data);
        return result;
    }

    public static <T> CommonResult<T> failure(String message) {
        CommonResult<T> result = new CommonResult<>();
        result.setCode(400);
        result.setMessage(message);
        return result;
    }

    public static <T> CommonResult<T> error(String message) {
        CommonResult<T> result = new CommonResult<>();
        result.setCode(500);
        result.setMessage(message);
        return result;
    }
}