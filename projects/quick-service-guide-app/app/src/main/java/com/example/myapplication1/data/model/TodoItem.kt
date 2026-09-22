package com.example.myapplication1.data.model

/**
 * 待办事项数据模型
 */
data class TodoItem(
    val id: String,
    val affairId: String,
    val title: String,
    val createTime: Long = System.currentTimeMillis(),
    val completedSteps: List<String> = emptyList(),
    val isCompleted: Boolean = false,
    val completedTime: Long? = null,
    val notes: String = ""
) 