package com.f1chatter.backend.controller

import com.f1chatter.backend.service.RaceService
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

@WebMvcTest(RaceController::class)
class RaceControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var raceService: RaceService

    @MockBean
    private lateinit var jwtService: JwtService

    @Test
    @WithMockUser
    fun `should get all races`() {
        // When & Then
        mockMvc.perform(get("/api/races"))
            .andExpect(status().isOk)
    }

    @Test
    @WithMockUser
    fun `should get race by id`() {
        // When & Then
        mockMvc.perform(get("/api/races/2025-1"))
            .andExpect(status().isOk)
    }

    @Test
    @WithMockUser
    fun `should get next race`() {
        // When & Then
        mockMvc.perform(get("/api/races/next"))
            .andExpect(status().isOk)
    }

    @Test
    fun `should return 401 when not authenticated`() {
        // When & Then
        mockMvc.perform(get("/api/races"))
            .andExpect(status().isUnauthorized)
    }
}
