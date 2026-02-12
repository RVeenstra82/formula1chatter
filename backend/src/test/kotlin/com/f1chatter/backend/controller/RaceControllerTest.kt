package com.f1chatter.backend.controller

import com.f1chatter.backend.config.SecurityConfig
import com.f1chatter.backend.dto.RaceDto
import com.f1chatter.backend.service.RaceService
import com.f1chatter.backend.service.JwtService
import com.f1chatter.backend.service.UserService
import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@WebMvcTest(RaceController::class)
@Import(SecurityConfig::class)
class RaceControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var raceService: RaceService

    @MockBean
    private lateinit var jwtService: JwtService

    @MockBean
    private lateinit var userService: UserService

    @Test
    @WithMockUser
    fun `should get current season races`() {
        // When & Then
        mockMvc.perform(get("/api/races/current-season").contextPath("/api"))
            .andExpect(status().isOk)
    }

    @Test
    @WithMockUser
    fun `should get race by id`() {
        // When & Then
        mockMvc.perform(get("/api/races/2025-1").contextPath("/api"))
            .andExpect(status().isOk)
    }

    @Test
    @WithMockUser
    fun `should return 404 when no next race`() {
        // Given - mock returns null (no upcoming race)
        `when`(raceService.getNextRace()).thenReturn(null)

        // When & Then
        mockMvc.perform(get("/api/races/next").contextPath("/api"))
            .andExpect(status().isNotFound)
    }
}
