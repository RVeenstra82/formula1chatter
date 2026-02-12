package com.f1chatter.backend.model

import jakarta.persistence.*

@Entity
@Table(name = "users")
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    
    val facebookId: String,
    val name: String,
    val email: String,
    val profilePictureUrl: String?,

    @Column(nullable = false, columnDefinition = "boolean default false")
    var isAdmin: Boolean = false,

    @OneToMany(mappedBy = "user", cascade = [CascadeType.ALL], orphanRemoval = true)
    val predictions: MutableList<Prediction> = mutableListOf()
) 