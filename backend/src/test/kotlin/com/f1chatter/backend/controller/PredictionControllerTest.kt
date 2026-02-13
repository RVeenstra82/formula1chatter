package com.f1chatter.backend.controller

import com.f1chatter.backend.config.AuthenticationHelper
import com.f1chatter.backend.config.SecurityConfig
import com.f1chatter.backend.dto.PredictionDto
import com.f1chatter.backend.service.PredictionService
import java.util.NoSuchElementException
import com.f1chatter.backend.service.JwtService
import com.f1chatter.backend.service.UserService
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.whenever
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
@Import(SecurityConfig::class, AuthenticationHelper::class)
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

    @Test
    fun `should return 401 when saving prediction without authentication`() {
        val predictionJson = """
            {
                "firstPlaceDriverId": "verstappen",
                "secondPlaceDriverId": "norris",
                "thirdPlaceDriverId": "leclerc",
                "fastestLapDriverId": "hamilton",
                "driverOfTheDayId": "russell"
            }
        """.trimIndent()

        mockMvc.perform(
            post("/api/predictions/2026-1").contextPath("/api")
                .contentType(MediaType.APPLICATION_JSON)
                .content(predictionJson)
        )
            .andExpect(status().isUnauthorized)
    }

    @Test
    @WithMockUser(username = "42")
    fun `should accept prediction from authenticated user with valid numeric ID`() {
        // When authenticated with a valid numeric user ID, the controller should
        // attempt to save (may fail at service level, but not at auth level)
        val predictionJson = """
            {
                "firstPlaceDriverId": "verstappen",
                "secondPlaceDriverId": "norris",
                "thirdPlaceDriverId": "leclerc",
                "fastestLapDriverId": "hamilton",
                "driverOfTheDayId": "russell"
            }
        """.trimIndent()

        // Mock service to throw NoSuchElementException (user not in DB)
        whenever(predictionService.savePrediction(eq(42L), eq("2026-1"), any<PredictionDto>()))
            .thenThrow(NoSuchElementException("User not found"))

        // Auth check should pass, but service fails with 404
        mockMvc.perform(
            post("/api/predictions/2026-1").contextPath("/api")
                .contentType(MediaType.APPLICATION_JSON)
                .content(predictionJson)
        )
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.error").value("User not found"))
    }

}
