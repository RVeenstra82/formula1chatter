package com.f1chatter.backend.controller

import com.f1chatter.backend.config.SecurityConfig
import com.f1chatter.backend.service.PredictionService
import com.f1chatter.backend.service.JwtService
import com.f1chatter.backend.service.UserService
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@WebMvcTest(PredictionController::class)
@Import(SecurityConfig::class)
class PredictionControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var predictionService: PredictionService

    @MockBean
    private lateinit var jwtService: JwtService

    @MockBean
    private lateinit var userService: UserService

    @Test
    @WithMockUser
    fun `should get prediction results for race`() {
        // When & Then
        mockMvc.perform(get("/api/predictions/race/2025-1/results").contextPath("/api"))
            .andExpect(status().isOk)
    }

    @Test
    @WithMockUser
    fun `should get leaderboard`() {
        // When & Then
        mockMvc.perform(get("/api/predictions/leaderboard").contextPath("/api"))
            .andExpect(status().isOk)
    }

}
