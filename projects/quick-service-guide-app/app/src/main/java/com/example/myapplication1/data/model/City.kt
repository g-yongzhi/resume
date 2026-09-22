package com.example.myapplication1.data.model

/**
 * 城市数据模型
 */
data class City(
    val id: String,
    val name: String,
    val province: String,
    val isHot: Boolean = false
) 