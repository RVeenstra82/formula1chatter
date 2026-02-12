package com.f1chatter.backend.controller

import com.f1chatter.backend.config.SecurityConfig
import com.f1chatter.backend.dto.SprintPredictionDto
import com.f1chatter.backend.service.SprintPredictionService
import com.f1chatter.backend.service.JwtService
import com.f1chatter.backend.service.UserService
import java.util.NoSuchElementException
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@WebMvcTest(SprintPredictionController::class)
@Import(SecurityConfig::class)
class SprintPredictionControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var sprintPredictionService: SprintPredictionService

    @MockBean
    private lateinit var jwtService: JwtService

    @MockBean
    private lateinit var userService: UserService

    private val predictionJson = """
        {
            "firstPlaceDriverId": "verstappen",
            "secondPlaceDriverId": "norris",
            "thirdPlaceDriverId": "leclerc"
        }
    """.trimIndent()

    @Test
    fun `should return 400 when saving sprint prediction without authentication`() {
        mockMvc.perform(
            post("/api/sprint-predictions/2026-1").contextPath("/api")
                .contentType(MediaType.APPLICATION_JSON)
                .content(predictionJson)
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error").value("Not authenticated"))
    }

    @Test
    @WithMockUser(username = "anonymousUser")
    fun `should return 400 for anonymous user trying to save sprint prediction`() {
        mockMvc.perform(
            post("/api/sprint-predictions/2026-1").contextPath("/api")
                .contentType(MediaType.APPLICATION_JSON)
                .content(predictionJson)
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error").value("Not authenticated"))
    }

    @Test
    @WithMockUser(username = "42")
    fun `should accept sprint prediction from authenticated user with valid numeric ID`() {
        whenever(sprintPredictionService.saveSprintPrediction(eq(42L), eq("2026-1"), any<SprintPredictionDto>()))
            .thenThrow(NoSuchElementException("User not found"))

        mockMvc.perform(
            post("/api/sprint-predictions/2026-1").contextPath("/api")
                .contentType(MediaType.APPLICATION_JSON)
                .content(predictionJson)
        )
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.error").value("User not found"))
    }
}
