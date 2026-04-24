package mk.ukim.finki.ictpm41.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import mk.ukim.finki.ictpm41.dto.LoginRequest;
import mk.ukim.finki.ictpm41.dto.RegisterRequest;
import mk.ukim.finki.ictpm41.entity.User;
import mk.ukim.finki.ictpm41.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
public class AuthControllerTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .alwaysDo(print())
                .build();
    }

    // ── /api/auth/register ──────────────────────────────────────

    @Test
    void register_returnsOk_withValidData() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("newuser@test.com");
        request.setPassword("password123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.username").value("newuser"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void register_returnsBadRequest_whenUsernameAlreadyExists() throws Exception {
        // Insert existing user first
        User existing = new User();
        existing.setUsername("existinguser");
        existing.setEmail("existing@test.com");
        existing.setPasswordHash(passwordEncoder.encode("password123"));
        existing.setRole("USER");
        userRepository.save(existing);

        RegisterRequest request = new RegisterRequest();
        request.setUsername("existinguser");
        request.setEmail("different@test.com");
        request.setPassword("password123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_returnsBadRequest_whenEmailAlreadyExists() throws Exception {
        User existing = new User();
        existing.setUsername("existinguser");
        existing.setEmail("existing@test.com");
        existing.setPasswordHash(passwordEncoder.encode("password123"));
        existing.setRole("USER");
        userRepository.save(existing);

        RegisterRequest request = new RegisterRequest();
        request.setUsername("differentuser");
        request.setEmail("existing@test.com");
        request.setPassword("password123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // ── /api/auth/login ─────────────────────────────────────────

    @Test
    void login_returnsOk_withValidCredentials() throws Exception {
        // Register a user first
        User user = new User();
        user.setUsername("loginuser");
        user.setEmail("loginuser@test.com");
        user.setPasswordHash(passwordEncoder.encode("password123"));
        user.setRole("USER");
        userRepository.save(user);

        LoginRequest request = new LoginRequest();
        request.setUsername("loginuser");
        request.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.username").value("loginuser"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void login_returnsError_withWrongPassword() throws Exception {
        User user = new User();
        user.setUsername("loginuser");
        user.setEmail("loginuser@test.com");
        user.setPasswordHash(passwordEncoder.encode("correctpassword"));
        user.setRole("USER");
        userRepository.save(user);

        LoginRequest request = new LoginRequest();
        request.setUsername("loginuser");
        request.setPassword("wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void login_throwsException_whenUserNotFound() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("nonexistent");
        request.setPassword("password123");

        assertThrows(Exception.class, () ->
                mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
        );
    }
}