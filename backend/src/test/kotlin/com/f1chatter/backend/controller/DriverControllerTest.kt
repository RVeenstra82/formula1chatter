package com.f1chatter.backend.controller

import com.f1chatter.backend.config.SecurityConfig
import com.f1chatter.backend.service.DriverService
import com.f1chatter.backend.service.JwtService
import com.f1chatter.backend.service.OpenF1ApiService
import com.f1chatter.backend.service.UserService
import org.springframework.web.client.RestTemplate
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@WebMvcTest(DriverController::class)
@Import(SecurityConfig::class)
class DriverControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var driverService: DriverService

    @MockBean
    private lateinit var jwtService: JwtService

    @MockBean
    private lateinit var userService: UserService

    @MockBean
    private lateinit var openF1ApiService: OpenF1ApiService

    @MockBean
    private lateinit var restTemplate: RestTemplate

    @Test
    @WithMockUser
    fun `should get all drivers`() {
        // When & Then
        mockMvc.perform(get("/api/drivers").contextPath("/api"))
            .andExpect(status().isOk)
    }

    @Test
    @WithMockUser
    fun `should get driver by id`() {
        // When & Then
        mockMvc.perform(get("/api/drivers/VER").contextPath("/api"))
            .andExpect(status().isOk)
    }
}
