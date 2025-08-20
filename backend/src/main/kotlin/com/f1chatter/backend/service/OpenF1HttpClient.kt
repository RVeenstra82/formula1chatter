package com.f1chatter.backend.service

import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate

@Service
class OpenF1HttpClient(
    private val restTemplate: RestTemplate
) {
    fun getList(url: String, headers: HttpHeaders): List<Any>? {
        val entity = HttpEntity<Any>(headers)
        val response: ResponseEntity<List<*>> = restTemplate.exchange(url, HttpMethod.GET, entity, List::class.java)
        @Suppress("UNCHECKED_CAST")
        return if (response.statusCode.is2xxSuccessful) response.body as List<Any>? else null
    }
}


