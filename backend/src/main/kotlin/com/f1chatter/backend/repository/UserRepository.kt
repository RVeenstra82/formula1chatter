package com.f1chatter.backend.repository

import com.f1chatter.backend.model.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UserRepository : JpaRepository<User, Long> {
    fun findByFacebookId(facebookId: String): User?
    fun findByEmail(email: String): User?
} 