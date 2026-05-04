package mk.ukim.finki.ictpm41.config;

import mk.ukim.finki.ictpm41.entity.User;
import mk.ukim.finki.ictpm41.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("dev")
public class DemoUserBootstrap {

    @Bean
    public CommandLineRunner seedDemoUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.existsByUsername("demo")) {
                return;
            }
            User user = new User();
            user.setUsername("demo");
            user.setEmail("demo@example.com");
            user.setPasswordHash(passwordEncoder.encode("demo123"));
            user.setRole("USER");
            userRepository.save(user);
        };
    }
}