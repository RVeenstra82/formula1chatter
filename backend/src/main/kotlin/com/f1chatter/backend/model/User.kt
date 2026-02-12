package com.f1chatter.backend.model

import jakarta.persistence.*

@Entity
@Table(
    name = "users",
    indexes = [
        Index(name = "idx_users_facebook_id", columnList = "facebookId", unique = true),
        Index(name = "idx_users_email", columnList = "email")
    ]
)
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
) {
    companion object {
        val TEST_USER = User(
            id = 0L,
            facebookId = "test-user",
            name = "Test User",
            email = "testuser@f1chatter.com",
            profilePictureUrl = null,
            isAdmin = true
        )
    }
} 