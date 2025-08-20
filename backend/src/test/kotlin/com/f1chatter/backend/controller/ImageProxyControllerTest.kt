package com.f1chatter.backend.controller

import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.client.RestTemplate

class ImageProxyControllerTest {

    @Test
    fun `forbidden when host not allowed`() {
        val restTemplate = mockk<RestTemplate>(relaxed = true)
        val controller = ImageProxyController(restTemplate)

        val response = controller.proxy("https://evil.example.com/hack.png")

        assertEquals(HttpStatus.FORBIDDEN, response.statusCode)
    }

    @Test
    fun `proxies allowed host and sets content type`() {
        val restTemplate = mockk<RestTemplate>()
        val controller = ImageProxyController(restTemplate)

        val body = byteArrayOf(1, 2, 3)
        every { restTemplate.getForEntity(any<java.net.URI>(), ByteArray::class.java) } returns ResponseEntity.ok(body)

        val response = controller.proxy("https://www.formula1.com/content/dam/some.png")

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(MediaType.IMAGE_PNG, response.headers.contentType)
        // Cache header present
        val cache: String? = response.headers.getFirst(HttpHeaders.CACHE_CONTROL)
        assertEquals(true, cache?.contains("max-age") == true)
    }
}


