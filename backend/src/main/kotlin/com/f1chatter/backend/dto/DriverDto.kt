package com.f1chatter.backend.dto

data class DriverDto(
    val id: String,
    val code: String,
    val number: String?,
    val firstName: String,
    val lastName: String,
    val nationality: String,
    val constructorId: String?,
    val constructorName: String?,
    val profilePictureUrl: String?
) 