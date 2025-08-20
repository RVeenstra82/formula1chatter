package com.f1chatter.backend.repository

import com.f1chatter.backend.model.Driver
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface DriverRepository : JpaRepository<Driver, String> {
    fun findByGivenNameIgnoreCaseAndFamilyNameIgnoreCase(givenName: String, familyName: String): Driver?
    fun findByCodeIgnoreCase(code: String): Driver?
    fun findByPermanentNumber(permanentNumber: String): Driver?

    @Query("SELECT d FROM Driver d WHERE LOWER(CONCAT(d.givenName, ' ', d.familyName)) = LOWER(CONCAT(:givenName, ' ', :familyName))")
fun findByFullNameIgnoreCase(givenName: String, familyName: String): Driver?

fun findByConstructorId(constructorId: String): List<Driver>
}