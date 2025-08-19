package com.f1chatter.backend.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import org.springframework.session.web.http.CookieSerializer
import org.springframework.session.web.http.DefaultCookieSerializer

@Configuration
@EnableWebSecurity
class SecurityConfig {
    
    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .cors { it.configurationSource(corsConfigurationSource()) }
            .csrf { it.disable() }
            .authorizeHttpRequests { auth ->
                auth
                    .requestMatchers("/api/auth/user").authenticated()
                    .requestMatchers("/api/predictions/user/**").authenticated()
                    .requestMatchers("/api/**").permitAll()
                    .requestMatchers("/**").permitAll()
            }
            .oauth2Login { oauth2 ->
                oauth2
                    .defaultSuccessUrl("https://formula1chatter.vercel.app/#/", true)
                    .failureUrl("/api/auth/login-failed")
                    .authorizationEndpoint { auth ->
                        auth.authorizationRequestResolver { request ->
                            // Ensure proper redirect URI
                            request
                        }
                    }
            }
            .logout { logout ->
                logout
                    .logoutUrl("/api/logout")
                    .logoutSuccessUrl("https://formula1chatter.vercel.app/#/")
                    .invalidateHttpSession(true)
                    .deleteCookies("JSESSIONID")
                    .permitAll()
            }
            .sessionManagement { session ->
                session
                    .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                    .maximumSessions(1)
            }
        
        return http.build()
    }
    
    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()
        configuration.allowedOrigins = listOf(
            "https://formula1chatter.vercel.app",
            "https://formula1chatter.onrender.com",
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:8090"
        )
        configuration.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")
        configuration.allowedHeaders = listOf("*")
        configuration.allowCredentials = true
        configuration.exposedHeaders = listOf("Set-Cookie")
        
        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }
    
    @Bean
    fun cookieSerializer(): CookieSerializer {
        val serializer = DefaultCookieSerializer()
        serializer.setCookieName("JSESSIONID")
        serializer.setCookiePath("/")
        // Don't set domain for cross-domain cookies - let browser handle it
        serializer.setCookieMaxAge(86400) // 24 hours
        serializer.setUseHttpOnlyCookie(true)
        serializer.setUseSecureCookie(true)
        serializer.setSameSite("None")
        return serializer
    }
} 