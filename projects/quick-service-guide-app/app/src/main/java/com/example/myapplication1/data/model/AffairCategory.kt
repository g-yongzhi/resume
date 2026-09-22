package com.example.myapplication1.data.model

/**
 * 办事类别数据模型
 */
data class AffairCategory(
    val id: String,
    val name: String,
    val icon: String,
    val description: String = "",
    val order: Int = 0
) 