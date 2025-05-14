package com.f1chatter.backend.model

import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table

@Entity
@Table(name = "drivers")
data class Driver(
    @Id
    val id: String,
    
    val code: String,
    val permanentNumber: String?,
    val givenName: String,
    val familyName: String,
    val dateOfBirth: String,
    val nationality: String,
    val url: String,
    
    @ManyToOne(fetch = jakarta.persistence.FetchType.EAGER)
    @JoinColumn(name = "constructor_id")
    var constructor: Constructor? = null,
    
    var profilePictureUrl: String? = null
) 