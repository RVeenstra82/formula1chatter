package com.f1chatter.backend.controller

import com.f1chatter.backend.config.SecurityConfig
import com.f1chatter.backend.service.OpenF1ApiService
import com.f1chatter.backend.service.DataSyncService
import com.f1chatter.backend.service.JolpicaApiService
import com.f1chatter.backend.service.PredictionService
import com.f1chatter.backend.service.JwtService
import com.f1chatter.backend.service.UserService
import com.f1chatter.backend.repository.RaceRepository
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@WebMvcTest(AdminController::class)
@Import(SecurityConfig::class)
class AdminControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var openF1ApiService: OpenF1ApiService

    @MockBean
    private lateinit var dataSyncService: DataSyncService

    @MockBean
    private lateinit var jolpicaApiService: JolpicaApiService

    @MockBean
    private lateinit var predictionService: PredictionService

    @MockBean
    private lateinit var raceRepository: RaceRepository

    @MockBean
    private lateinit var jwtService: JwtService

    @MockBean
    private lateinit var userService: UserService

    @Test
    @WithMockUser(authorities = ["ADMIN"])
    fun `should update driver photos when admin`() {
        mockMvc.perform(post("/api/admin/update-driver-photos"))
            .andExpect(status().isOk)
    }

    @Test
    fun `should reject unauthenticated access to admin`() {
        // Without auth, Spring OAuth2 redirects (302) or returns 401/403
        mockMvc.perform(post("/api/admin/update-driver-photos"))
            .andExpect(status().is3xxRedirection)
    }

    @Test
    @WithMockUser(authorities = ["USER"])
    fun `should return 403 when not admin`() {
        mockMvc.perform(post("/api/admin/update-driver-photos"))
            .andExpect(status().isForbidden)
    }
}
