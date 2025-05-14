package com.f1chatter.backend.model

import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import jakarta.persistence.Table

@Entity
@Table(name = "constructors")
data class Constructor(
    @Id
    val id: String,
    
    val name: String,
    val nationality: String,
    val url: String,
    
    @OneToMany(mappedBy = "constructor", cascade = [jakarta.persistence.CascadeType.ALL], orphanRemoval = false)
    val drivers: MutableList<Driver> = mutableListOf()
) 