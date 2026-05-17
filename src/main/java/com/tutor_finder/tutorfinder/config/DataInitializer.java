package com.tutor_finder.tutorfinder.config;

import com.tutor_finder.tutorfinder.model.User;
import com.tutor_finder.tutorfinder.model.Role;
import com.tutor_finder.tutorfinder.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initSuperAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String superAdminEmail = "superadmin@tutorfinder.com";
            if (!userRepository.existsByEmail(superAdminEmail)) {
                User superAdmin = new User();
                superAdmin.setName("Super Admin");
                superAdmin.setEmail(superAdminEmail);
                superAdmin.setPhone("9999999999");
                superAdmin.setPassword(passwordEncoder.encode("SuperAdmin@123"));
                superAdmin.setRole(Role.SUPERADMIN);
                userRepository.save(superAdmin);
                System.out.println("★ Default Superadmin registered: " + superAdminEmail + " / SuperAdmin@123");
            }
        };
    }
}
