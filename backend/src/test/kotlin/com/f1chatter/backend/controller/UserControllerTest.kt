package com.f1chatter.backend.controller

import com.f1chatter.backend.model.User
import com.f1chatter.backend.service.UserService
import com.f1chatter.backend.service.JwtService
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@WebMvcTest(UserController::class)
class UserControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var userService: UserService

    @MockBean
    private lateinit var jwtService: JwtService

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    @WithMockUser
    fun `should get current user`() {
        // When & Then
        mockMvc.perform(get("/api/user/me"))
            .andExpect(status().isOk)
    }

    @Test
    fun `should return 401 when not authenticated`() {
        // When & Then
        mockMvc.perform(get("/api/user/me"))
            .andExpect(status().isUnauthorized)
    }
}
