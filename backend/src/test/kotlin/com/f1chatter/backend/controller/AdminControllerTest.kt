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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@WebMvcTest(AdminController::class)
class AdminControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var driverService: DriverService

    @MockBean
    private lateinit var jwtService: JwtService

    @Test
    @WithMockUser(username = "rickveenstra@gmail.com")
    fun `should update driver photos when admin`() {
        // When & Then
        mockMvc.perform(post("/api/admin/update-driver-photos"))
            .andExpect(status().isOk)
    }

    @Test
    fun `should return 401 when not authenticated`() {
        // When & Then
        mockMvc.perform(post("/api/admin/update-driver-photos"))
            .andExpect(status().isUnauthorized)
    }
}
