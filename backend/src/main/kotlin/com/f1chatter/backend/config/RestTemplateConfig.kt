package com.f1chatter.backend.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.client.RestTemplate
import org.springframework.http.client.SimpleClientHttpRequestFactory
import java.time.Duration

@Configuration
class RestTemplateConfig {
    
    @Bean
    fun restTemplate(): RestTemplate {
        val factory = SimpleClientHttpRequestFactory()
        
        // Set timeouts to prevent 504 Gateway Timeout errors
        factory.setConnectTimeout(10000) // 10 seconds connect timeout
        factory.setReadTimeout(30000)    // 30 seconds read timeout
        
        return RestTemplate(factory)
    }
} 