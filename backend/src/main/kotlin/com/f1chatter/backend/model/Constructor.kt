package com.f1chatter.backend.model

import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Index
import jakarta.persistence.OneToMany
import jakarta.persistence.Table

@Entity
@Table(
    name = "constructors",
    indexes = [
        Index(name = "idx_constructors_name", columnList = "name")
    ]
)
data class Constructor(
    @Id
    val id: String,
    
    val name: String,
    val nationality: String,
    val url: String,
    
    @OneToMany(mappedBy = "constructor", cascade = [jakarta.persistence.CascadeType.ALL], orphanRemoval = false)
    val drivers: MutableList<Driver> = mutableListOf()
) 