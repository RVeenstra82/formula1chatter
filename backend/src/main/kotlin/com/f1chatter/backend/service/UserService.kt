package com.f1chatter.backend.service

import com.f1chatter.backend.dto.UserDto
import com.f1chatter.backend.model.User
import com.f1chatter.backend.repository.UserRepository
import com.f1chatter.backend.repository.PredictionRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.stereotype.Service
import java.util.NoSuchElementException
import mu.KotlinLogging

@Service
class UserService(
    private val userRepository: UserRepository,
    private val predictionRepository: PredictionRepository
) {
    private val logger = KotlinLogging.logger {}

    private fun isKnownAdmin(user: User): Boolean =
        user.email == "wub66@hotmail.com" || user.facebookId == "10162944940270266"

    fun processOAuthPostLogin(auth: OAuth2AuthenticationToken): UserDto {
        val attributes = auth.principal.attributes
        val facebookId = attributes["id"].toString()

        val existingUser = userRepository.findByFacebookId(facebookId)

        val user = if (existingUser != null) {
            existingUser
        } else {
            val name = attributes["name"].toString()
            val email = (attributes["email"] as? String)?.takeIf { it.isNotBlank() }
                ?: "${facebookId}@f1chatter.local" // Fallback email when provider doesn't share it
            val profilePictureUrl = "https://graph.facebook.com/$facebookId/picture?type=large"

            User(
                facebookId = facebookId,
                name = name,
                email = email,
                profilePictureUrl = profilePictureUrl
            )
        }

        user.isAdmin = isKnownAdmin(user)
        val savedUser = userRepository.save(user)

        logger.info { "User ${savedUser.name} (${savedUser.email}) - isAdmin: ${savedUser.isAdmin}" }

        return UserDto(
            id = savedUser.id!!,
            name = savedUser.name,
            email = savedUser.email,
            profilePictureUrl = savedUser.profilePictureUrl,
            isAdmin = savedUser.isAdmin
        )
    }

    fun getUserById(id: Long): UserDto {
        val user = userRepository.findByIdOrNull(id)
            ?: throw NoSuchElementException("User not found with id: $id")

        logger.info { "User ${user.name} (${user.email}) - isAdmin: ${user.isAdmin}" }

        return UserDto(
            id = user.id!!,
            name = user.name,
            email = user.email,
            profilePictureUrl = user.profilePictureUrl,
            isAdmin = user.isAdmin
        )
    }

    fun deleteUserAndData(userId: Long) {
        val user = userRepository.findByIdOrNull(userId)
            ?: throw NoSuchElementException("User not found with id: $userId")
        // Remove all predictions for this user
        val userPredictions = predictionRepository.findByUserId(userId)
        if (userPredictions.isNotEmpty()) {
            predictionRepository.deleteAll(userPredictions)
        }
        // Finally delete the user
        userRepository.delete(user)
    }
} 