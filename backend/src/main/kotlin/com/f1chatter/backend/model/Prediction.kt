package com.f1chatter.backend.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "predictions")
data class Prediction(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "race_id", nullable = false)
    val race: Race,
    
    val firstPlaceDriverId: String,
    val secondPlaceDriverId: String,
    val thirdPlaceDriverId: String,
    val fastestLapDriverId: String,
    val driverOfTheDayId: String,
    
    val score: Int? = null,
    val createdAt: LocalDateTime = LocalDateTime.now()
) 