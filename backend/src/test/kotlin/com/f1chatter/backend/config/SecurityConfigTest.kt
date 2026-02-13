package com.f1chatter.backend.config

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

/**
 * Tests that SecurityConfig correctly enforces authentication on protected endpoints.
 *
 * These tests verify the actual Spring Security filter chain — not controller logic.
 * An unauthenticated request to a protected endpoint MUST return 401, not 200 or 400.
 * If a test here expects 401 but gets 200 or 400, the SecurityConfig is misconfigured.
 *
 * NOTE: All requests must include .contextPath("/api") because the servlet context-path
 * is /api. Spring Security matchers match against servlet-relative paths (without /api).
 */
@SpringBootTest
@AutoConfigureMockMvc
class SecurityConfigTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    private val predictionJson = """
        {
            "firstPlaceDriverId": "verstappen",
            "secondPlaceDriverId": "norris",
            "thirdPlaceDriverId": "leclerc",
            "fastestLapDriverId": "hamilton",
            "driverOfTheDayId": "russell"
        }
    """.trimIndent()

    private val sprintPredictionJson = """
        {
            "firstPlaceDriverId": "verstappen",
            "secondPlaceDriverId": "norris",
            "thirdPlaceDriverId": "leclerc"
        }
    """.trimIndent()

    // ===== Endpoints that MUST require authentication =====

    @Test
    fun `POST predictions requires authentication`() {
        mockMvc.perform(
            post("/api/predictions/2026-1").contextPath("/api")
                .contentType(MediaType.APPLICATION_JSON)
                .content(predictionJson)
        ).andExpect(status().isUnauthorized)
    }

    @Test
    fun `POST sprint-predictions requires authentication`() {
        mockMvc.perform(
            post("/api/sprint-predictions/2026-1").contextPath("/api")
                .contentType(MediaType.APPLICATION_JSON)
                .content(sprintPredictionJson)
        ).andExpect(status().isUnauthorized)
    }

    @Test
    fun `DELETE users-me requires authentication`() {
        mockMvc.perform(delete("/api/users/me").contextPath("/api"))
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `GET auth-user requires authentication`() {
        mockMvc.perform(get("/api/auth/user").contextPath("/api"))
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `GET predictions-user requires authentication`() {
        mockMvc.perform(get("/api/predictions/user/2026-1").contextPath("/api"))
            .andExpect(status().isUnauthorized)
    }

    // ===== Endpoints that MUST be publicly accessible =====

    @Test
    fun `GET races current-season is publicly accessible`() {
        mockMvc.perform(get("/api/races/current-season").contextPath("/api"))
            .andExpect(status().isOk)
    }

    @Test
    fun `GET races-next is publicly accessible`() {
        mockMvc.perform(get("/api/races/next").contextPath("/api"))
            .andExpect(status().isOk)
    }

    @Test
    fun `GET drivers is publicly accessible`() {
        mockMvc.perform(get("/api/drivers").contextPath("/api"))
            .andExpect(status().isOk)
    }

    @Test
    fun `GET leaderboard is publicly accessible`() {
        mockMvc.perform(get("/api/predictions/leaderboard").contextPath("/api"))
            .andExpect(status().isOk)
    }

    @Test
    fun `GET stats overview is publicly accessible`() {
        mockMvc.perform(get("/api/stats/overview").contextPath("/api"))
            .andExpect(status().isOk)
    }
}
