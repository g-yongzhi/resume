package com.example.myapplication1.data.model

/**
 * 办事事项数据模型
 */
data class Affair(
    val id: String,
    val name: String,
    val categoryId: String,
    val cityId: String,
    val description: String = "",
    val estimatedTime: String = "",
    val difficulty: Int = 1, // 1-5表示难度
    val steps: List<AffairStep> = emptyList(),
    val materials: List<AffairMaterial> = emptyList(),
    val locations: List<AffairLocation> = emptyList(),
    val hotness: Int = 0,
    val updateTime: Long = System.currentTimeMillis()
)

/**
 * 办事步骤数据模型
 */
data class AffairStep(
    val id: String,
    val title: String,
    val description: String,
    val order: Int,
    val tips: String = "",
    val locationIds: List<String> = emptyList(),
    val materialIds: List<String> = emptyList()
)

/**
 * 办事所需材料数据模型
 */
data class AffairMaterial(
    val id: String,
    val name: String,
    val description: String = "",
    val isRequired: Boolean = true
)

/**
 * 办事地点数据模型
 */
data class AffairLocation(
    val id: String,
    val name: String,
    val address: String,
    val telephone: String = "",
    val workTime: String = "",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0
) 