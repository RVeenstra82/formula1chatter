package com.f1chatter.backend.dto

data class UserDto(
    val id: Long,
    val name: String,
    val email: String,
    val profilePictureUrl: String?,
    val isAdmin: Boolean = false
) 