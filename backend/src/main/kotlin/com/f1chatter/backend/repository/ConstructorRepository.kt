package com.f1chatter.backend.repository

import com.f1chatter.backend.model.Constructor
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ConstructorRepository : JpaRepository<Constructor, String> {
    fun findByNameIgnoreCase(name: String): Constructor?
}