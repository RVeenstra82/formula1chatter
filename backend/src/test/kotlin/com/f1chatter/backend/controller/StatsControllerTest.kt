package com.f1chatter.backend.controller

import com.f1chatter.backend.service.StatsService
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

@WebMvcTest(StatsController::class)
class StatsControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var statsService: StatsService

    @MockBean
    private lateinit var jwtService: JwtService

    @Test
    @WithMockUser
    fun `should get season stats`() {
        // When & Then
        mockMvc.perform(get("/api/stats/season"))
            .andExpect(status().isOk)
    }

    @Test
    @WithMockUser
    fun `should get driver stats`() {
        // When & Then
        mockMvc.perform(get("/api/stats/drivers"))
            .andExpect(status().isOk)
    }

    @Test
    @WithMockUser
    fun `should get constructor stats`() {
        // When & Then
        mockMvc.perform(get("/api/stats/constructors"))
            .andExpect(status().isOk)
    }

    @Test
    @WithMockUser
    fun `should get prediction accuracy stats`() {
        // When & Then
        mockMvc.perform(get("/api/stats/accuracy"))
            .andExpect(status().isOk)
    }

    @Test
    @WithMockUser
    fun `should get circuit stats`() {
        // When & Then
        mockMvc.perform(get("/api/stats/circuits"))
            .andExpect(status().isOk)
    }

    @Test
    @WithMockUser
    fun `should get user comparison stats`() {
        // When & Then
        mockMvc.perform(get("/api/stats/users"))
            .andExpect(status().isOk)
    }

    @Test
    @WithMockUser
    fun `should get season progress stats`() {
        // When & Then
        mockMvc.perform(get("/api/stats/progress"))
            .andExpect(status().isOk)
    }

    @Test
    fun `should return 401 when not authenticated`() {
        // When & Then
        mockMvc.perform(get("/api/stats/season"))
            .andExpect(status().isUnauthorized)
    }
}
