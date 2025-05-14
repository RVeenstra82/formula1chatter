package com.f1chatter.backend.repository

interface UserScoreProjection {
    val userId: Long
    val totalScore: Int
} 