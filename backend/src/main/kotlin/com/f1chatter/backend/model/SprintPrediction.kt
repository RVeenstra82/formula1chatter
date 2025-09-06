package com.f1chatter.backend.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "sprint_predictions")
data class SprintPrediction(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sprint_race_id", nullable = false)
    val sprintRace: SprintRace,
    
    val firstPlaceDriverId: String,
    val secondPlaceDriverId: String,
    val thirdPlaceDriverId: String,
    
    val score: Int? = null,
    val createdAt: LocalDateTime = LocalDateTime.now()
)
