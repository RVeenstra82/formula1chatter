package com.f1chatter.backend.controller

import com.f1chatter.backend.service.PredictionService
import com.f1chatter.backend.service.JwtService
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@WebMvcTest(PredictionController::class)
class PredictionControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var predictionService: PredictionService

    @MockBean
    private lateinit var jwtService: JwtService

    @Test
    @WithMockUser
    fun `should get user prediction for race`() {
        // When & Then
        mockMvc.perform(get("/api/predictions/race/2025-1"))
            .andExpect(status().isOk)
    }

    @Test
    @WithMockUser
    fun `should get prediction results for race`() {
        // When & Then
        mockMvc.perform(get("/api/predictions/race/2025-1/results"))
            .andExpect(status().isOk)
    }

    @Test
    @WithMockUser
    fun `should create prediction`() {
        // Given
        val predictionRequest = """
            {
                "firstPlaceDriverId": "VER",
                "secondPlaceDriverId": "PER",
                "thirdPlaceDriverId": "SAI",
                "fastestLapDriverId": "VER",
                "driverOfTheDayId": "VER"
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            post("/api/predictions/race/2025-1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(predictionRequest)
        )
            .andExpect(status().isOk)
    }

    @Test
    fun `should return 401 when not authenticated`() {
        // When & Then
        mockMvc.perform(get("/api/predictions/race/2025-1"))
            .andExpect(status().isUnauthorized)
    }
}
