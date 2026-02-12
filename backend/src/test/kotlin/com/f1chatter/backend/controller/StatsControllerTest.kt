package com.f1chatter.backend.controller

import com.f1chatter.backend.config.SecurityConfig
import com.f1chatter.backend.service.StatsService
import com.f1chatter.backend.service.JwtService
import com.f1chatter.backend.service.UserService
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@WebMvcTest(StatsController::class)
@Import(SecurityConfig::class)
class StatsControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var statsService: StatsService

    @MockBean
    private lateinit var jwtService: JwtService

    @MockBean
    private lateinit var userService: UserService

    @Test
    @WithMockUser
    fun `should get driver performance stats`() {
        // When & Then
        mockMvc.perform(get("/api/stats/driver-performance").contextPath("/api"))
            .andExpect(status().isOk)
    }

    @Test
    @WithMockUser
    fun `should get prediction accuracy stats`() {
        // When & Then
        mockMvc.perform(get("/api/stats/prediction-accuracy").contextPath("/api"))
            .andExpect(status().isOk)
    }

    @Test
    @WithMockUser
    fun `should get constructor performance stats`() {
        // When & Then
        mockMvc.perform(get("/api/stats/constructor-performance").contextPath("/api"))
            .andExpect(status().isOk)
    }

    @Test
    @WithMockUser
    fun `should get circuit difficulty stats`() {
        // When & Then
        mockMvc.perform(get("/api/stats/circuit-difficulty").contextPath("/api"))
            .andExpect(status().isOk)
    }

    @Test
    @WithMockUser
    fun `should get user comparison stats`() {
        // When & Then
        mockMvc.perform(get("/api/stats/user-comparison").contextPath("/api"))
            .andExpect(status().isOk)
    }

    @Test
    @WithMockUser
    fun `should get season progress stats`() {
        // When & Then
        mockMvc.perform(get("/api/stats/season-progress").contextPath("/api"))
            .andExpect(status().isOk)
    }

    @Test
    @WithMockUser
    fun `should get stats overview`() {
        // When & Then
        mockMvc.perform(get("/api/stats/overview").contextPath("/api"))
            .andExpect(status().isOk)
    }
}
