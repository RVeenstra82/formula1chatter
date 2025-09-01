package com.f1chatter.backend.integration

import com.f1chatter.backend.model.User
import com.f1chatter.backend.repository.UserRepository
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional
import org.assertj.core.api.Assertions.assertThat

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class BasicIntegrationTest {

    @Autowired
    private lateinit var userRepository: UserRepository

    @Test
    fun `test user repository integration`() {
        // Given
        val user = User(
            facebookId = "test-facebook-id",
            name = "Test User",
            email = "test@example.com",
            profilePictureUrl = "https://example.com/pic.jpg"
        )

        // When
        val savedUser = userRepository.save(user)

        // Then
        assertThat(savedUser.id).isNotNull()
        assertThat(savedUser.name).isEqualTo("Test User")
        assertThat(savedUser.email).isEqualTo("test@example.com")

        // Verify we can find the user
        val foundUser = userRepository.findByFacebookId("test-facebook-id")
        assertThat(foundUser).isNotNull()
        assertThat(foundUser?.name).isEqualTo("Test User")
    }

    @Test
    fun `test user repository find by email`() {
        // Given
        val user = User(
            facebookId = "test-facebook-id-2",
            name = "Test User 2",
            email = "test2@example.com",
            profilePictureUrl = "https://example.com/pic2.jpg"
        )
        userRepository.save(user)

        // When
        val foundUser = userRepository.findByEmail("test2@example.com")

        // Then
        assertThat(foundUser).isNotNull()
        assertThat(foundUser?.name).isEqualTo("Test User 2")
    }
}
