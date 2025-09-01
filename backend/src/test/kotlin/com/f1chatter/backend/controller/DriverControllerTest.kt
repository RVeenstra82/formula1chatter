package com.f1chatter.backend.controller

import com.f1chatter.backend.service.DriverService
import com.f1chatter.backend.service.JwtService
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@WebMvcTest(DriverController::class)
class DriverControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var driverService: DriverService

    @MockBean
    private lateinit var jwtService: JwtService

    @Test
    @WithMockUser
    fun `should get all drivers`() {
        // When & Then
        mockMvc.perform(get("/api/drivers"))
            .andExpect(status().isOk)
    }

    @Test
    @WithMockUser
    fun `should get driver by id`() {
        // When & Then
        mockMvc.perform(get("/api/drivers/VER"))
            .andExpect(status().isOk)
    }

    @Test
    fun `should return 401 when not authenticated`() {
        // When & Then
        mockMvc.perform(get("/api/drivers"))
            .andExpect(status().isUnauthorized)
    }
}
