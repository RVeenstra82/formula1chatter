package com.f1chatter.backend.config

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.http.MediaType
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.AuthenticationEntryPoint
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
class SecurityConfig(
    private val jwtAuthenticationFilter: JwtAuthenticationFilter,
    @org.springframework.beans.factory.annotation.Value("\${app.frontend-url}") private val frontendUrl: String
) {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .cors { it.configurationSource(corsConfigurationSource()) }
            .csrf { it.disable() }
            // Matchers use servlet-relative paths (context-path /api is stripped)
            .authorizeHttpRequests { auth ->
                auth
                    .requestMatchers("/auth/user").authenticated()
                    .requestMatchers("/predictions/user/**").authenticated()
                    .requestMatchers(HttpMethod.POST, "/predictions/**").authenticated()
                    .requestMatchers(HttpMethod.POST, "/sprint-predictions/**").authenticated()
                    .requestMatchers(HttpMethod.DELETE, "/users/me").authenticated()
                    .requestMatchers("/**").permitAll()
            }
            .exceptionHandling { exceptions ->
                exceptions.authenticationEntryPoint(apiAuthenticationEntryPoint())
            }
            .oauth2Login { oauth2 ->
                oauth2
                    .defaultSuccessUrl("/auth/oauth2/callback", true)
                    .failureUrl("/auth/login-failed")
                    .authorizationEndpoint { auth ->
                        auth.baseUri("/oauth2/authorization")
                    }
            }
            .logout { logout ->
                logout
                    .logoutUrl("/logout")
                    .logoutSuccessUrl("${frontendUrl}/")
                    .invalidateHttpSession(true)
                    .deleteCookies("JSESSIONID")
                    .permitAll()
            }
            .sessionManagement { session ->
                session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            }
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)

        return http.build()
    }

    /**
     * Returns 401 with JSON body for unauthenticated API requests
     * instead of redirecting to the OAuth2 login page.
     */
    private fun apiAuthenticationEntryPoint() = AuthenticationEntryPoint { _: HttpServletRequest, response: HttpServletResponse, _ ->
        response.status = HttpServletResponse.SC_UNAUTHORIZED
        response.contentType = MediaType.APPLICATION_JSON_VALUE
        response.writer.write("""{"error":"Not authenticated. Please use a JWT token for API requests."}""")
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
}
