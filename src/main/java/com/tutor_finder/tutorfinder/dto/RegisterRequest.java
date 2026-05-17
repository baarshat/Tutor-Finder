package com.tutor_finder.tutorfinder.dto;

import com.tutor_finder.tutorfinder.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String name;
    private String email;
    private String phone;
    private String password;
    private Role role;
}
