package com.f1chatter.backend.service

import com.f1chatter.backend.model.Driver
import com.f1chatter.backend.repository.DriverRepository
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Test
import org.springframework.http.ResponseEntity
import org.springframework.web.client.RestTemplate

class OpenF1ApiServiceTest {
    @Test
    fun `updateDriverProfilePictures tolerates API failure and continues`() {
        val repo = mockk<DriverRepository>(relaxed = true)
        val rt = mockk<RestTemplate>()
        val client = mockk<OpenF1HttpClient>()

        val service = OpenF1ApiService(repo, rt, client)
        val delayCalls = OpenF1ApiService::class.java.getDeclaredField("delayBetweenCallsMs"); delayCalls.isAccessible = true; delayCalls.set(service, "0")
        val delayDrivers = OpenF1ApiService::class.java.getDeclaredField("delayBetweenDriversMs"); delayDrivers.isAccessible = true; delayDrivers.set(service, "0")
        val maxErrors = OpenF1ApiService::class.java.getDeclaredField("maxErrorsBeforeStop"); maxErrors.isAccessible = true; maxErrors.set(service, "1")

        // fail connection test: return empty list from wrapper client
        every { client.getList(any(), any()) } returns emptyList()
        // No exception thrown
        service.updateDriverProfilePictures()
        assertNotNull(service)
    }
}


