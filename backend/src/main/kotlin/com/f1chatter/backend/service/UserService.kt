package com.f1chatter.backend.service

import com.f1chatter.backend.dto.UserDto
import com.f1chatter.backend.model.User
import com.f1chatter.backend.repository.UserRepository
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.stereotype.Service
import java.util.NoSuchElementException

@Service
class UserService(
    private val userRepository: UserRepository
) {
    fun processOAuthPostLogin(auth: OAuth2AuthenticationToken): UserDto {
        val attributes = auth.principal.attributes
        val facebookId = attributes["id"].toString()
        
        val existingUser = userRepository.findByFacebookId(facebookId)
        
        val user = if (existingUser.isPresent) {
            existingUser.get()
        } else {
            val name = attributes["name"].toString()
            val email = "${facebookId}@f1chatter.local" // Generate email from Facebook ID
            val profilePictureUrl = "https://graph.facebook.com/$facebookId/picture?type=large"
            
            val newUser = User(
                facebookId = facebookId,
                name = name,
                email = email,
                profilePictureUrl = profilePictureUrl
            )
            
            userRepository.save(newUser)
        }
        
        return UserDto(
            id = user.id!!,
            name = user.name,
            email = user.email,
            profilePictureUrl = user.profilePictureUrl
        )
    }
    
    fun getUserById(id: Long): UserDto {
        val user = userRepository.findById(id)
            .orElseThrow { NoSuchElementException("User not found with id: $id") }
        
        return UserDto(
            id = user.id!!,
            name = user.name,
            email = user.email,
            profilePictureUrl = user.profilePictureUrl
        )
    }
} 