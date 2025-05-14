package com.f1chatter.backend.repository

import com.f1chatter.backend.model.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface UserRepository : JpaRepository<User, Long> {
    fun findByFacebookId(facebookId: String): Optional<User>
    fun findByEmail(email: String): Optional<User>
} 