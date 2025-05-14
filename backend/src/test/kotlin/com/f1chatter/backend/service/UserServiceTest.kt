package com.f1chatter.backend.service

import com.f1chatter.backend.model.User
import com.f1chatter.backend.repository.UserRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.security.oauth2.core.user.DefaultOAuth2User
import java.util.NoSuchElementException
import java.util.Optional

class UserServiceTest {
    
    private lateinit var userRepository: UserRepository
    private lateinit var userService: UserService
    
    @BeforeEach
    fun setup() {
        userRepository = mockk()
        userService = UserService(userRepository)
    }
    
    @Test
    fun `processOAuthPostLogin creates new user when user doesn't exist`() {
        // Arrange
        val facebookId = "123456789"
        val name = "John Doe"
        val email = "john@example.com"
        val profilePictureUrl = "https://graph.facebook.com/$facebookId/picture?type=large"
        
        val attributes = mapOf(
            "id" to facebookId,
            "name" to name,
            "email" to email
        )
        
        val principal = mockk<DefaultOAuth2User>()
        every { principal.attributes } returns attributes
        
        val auth = mockk<OAuth2AuthenticationToken>()
        every { auth.principal } returns principal
        
        // No existing user
        every { userRepository.findByFacebookId(facebookId) } returns Optional.empty()
        
        val userSlot = slot<User>()
        val savedUser = User(
            id = 1L,
            facebookId = facebookId,
            name = name,
            email = email,
            profilePictureUrl = profilePictureUrl
        )
        every { userRepository.save(capture(userSlot)) } returns savedUser
        
        // Act
        val result = userService.processOAuthPostLogin(auth)
        
        // Assert
        verify { userRepository.findByFacebookId(facebookId) }
        verify { userRepository.save(any()) }
        
        assertEquals(facebookId, userSlot.captured.facebookId)
        assertEquals(name, userSlot.captured.name)
        assertEquals(email, userSlot.captured.email)
        assertEquals(profilePictureUrl, userSlot.captured.profilePictureUrl)
        
        assertEquals(1L, result.id)
        assertEquals(name, result.name)
        assertEquals(email, result.email)
        assertEquals(profilePictureUrl, result.profilePictureUrl)
    }
    
    @Test
    fun `processOAuthPostLogin returns existing user when user exists`() {
        // Arrange
        val facebookId = "123456789"
        val name = "John Doe"
        val email = "john@example.com"
        val profilePictureUrl = "https://graph.facebook.com/$facebookId/picture?type=large"
        
        val attributes = mapOf(
            "id" to facebookId,
            "name" to name,
            "email" to email
        )
        
        val principal = mockk<DefaultOAuth2User>()
        every { principal.attributes } returns attributes
        
        val auth = mockk<OAuth2AuthenticationToken>()
        every { auth.principal } returns principal
        
        // Existing user
        val existingUser = User(
            id = 1L,
            facebookId = facebookId,
            name = name,
            email = email,
            profilePictureUrl = profilePictureUrl
        )
        every { userRepository.findByFacebookId(facebookId) } returns Optional.of(existingUser)
        
        // Act
        val result = userService.processOAuthPostLogin(auth)
        
        // Assert
        verify { userRepository.findByFacebookId(facebookId) }
        
        // Save should not be called for existing user
        verify(exactly = 0) { userRepository.save(any()) }
        
        assertEquals(1L, result.id)
        assertEquals(name, result.name)
        assertEquals(email, result.email)
        assertEquals(profilePictureUrl, result.profilePictureUrl)
    }
    
    @Test
    fun `getUserById returns user when found`() {
        // Arrange
        val userId = 1L
        val user = User(
            id = userId,
            facebookId = "123456789",
            name = "John Doe",
            email = "john@example.com",
            profilePictureUrl = "https://example.com/profile.jpg"
        )
        
        every { userRepository.findById(userId) } returns Optional.of(user)
        
        // Act
        val result = userService.getUserById(userId)
        
        // Assert
        verify { userRepository.findById(userId) }
        
        assertEquals(userId, result.id)
        assertEquals(user.name, result.name)
        assertEquals(user.email, result.email)
        assertEquals(user.profilePictureUrl, result.profilePictureUrl)
    }
    
    @Test
    fun `getUserById throws exception when user not found`() {
        // Arrange
        val userId = 1L
        
        every { userRepository.findById(userId) } returns Optional.empty()
        
        // Act & Assert
        assertThrows<NoSuchElementException> {
            userService.getUserById(userId)
        }
        
        verify { userRepository.findById(userId) }
    }
} 