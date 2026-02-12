package com.f1chatter.backend.controller

import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.client.RestTemplate
import java.net.URI

@RestController
@RequestMapping("/images")
class ImageProxyController(
    private val restTemplate: RestTemplate
) {
    private val allowedHosts = setOf(
        "www.formula1.com",
        "formula1.com",
        "media.formula1.com",
        "content-api.formula1.com",
        "fom-website.azureedge.net",
        "f1mrx.netlify.app"
    )

    @GetMapping("/proxy")
    fun proxy(@RequestParam("src") src: String): ResponseEntity<ByteArray> {
        return try {
            val uri = URI(src)
            if (!allowedHosts.contains(uri.host)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
            }

            val response = restTemplate.getForEntity(uri, ByteArray::class.java)
            val headers = HttpHeaders()
            headers.contentType = detectContentType(uri.path)
            headers.cacheControl = "public, max-age=86400" // 24h
            ResponseEntity(response.body, headers, response.statusCode)
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.BAD_GATEWAY).build()
        }
    }

    private fun detectContentType(path: String): MediaType {
        return when {
            path.endsWith(".png", ignoreCase = true) -> MediaType.IMAGE_PNG
            path.endsWith(".jpg", ignoreCase = true) || path.endsWith(".jpeg", ignoreCase = true) -> MediaType.IMAGE_JPEG
            path.endsWith(".webp", ignoreCase = true) -> MediaType.parseMediaType("image/webp")
            else -> MediaType.IMAGE_JPEG
        }
    }
}


