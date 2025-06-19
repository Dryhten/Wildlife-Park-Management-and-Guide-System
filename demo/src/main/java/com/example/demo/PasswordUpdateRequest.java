package com.example.demo;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
class PasswordUpdateRequest {
    // Getters and Setters
    private Long userId;
    private String oldPassword;
    private String newPassword;

}
