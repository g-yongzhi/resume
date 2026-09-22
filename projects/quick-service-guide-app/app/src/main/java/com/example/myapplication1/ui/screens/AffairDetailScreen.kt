package com.example.myapplication1.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.example.myapplication1.data.model.Affair
import com.example.myapplication1.data.model.AffairStep
import com.example.myapplication1.data.repository.DataRepository
import com.example.myapplication1.ui.components.Chip
import com.example.myapplication1.ui.components.StepItem
import com.example.myapplication1.ui.theme.AppTheme
import java.text.SimpleDateFormat
import java.util.*

/**
 * 办事详情屏幕
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AffairDetailScreen(
    affairId: String,
    onBackClick: () -> Unit,
    onAddToTodoClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    // 获取事项详情
    val affair = remember { DataRepository.getAffairById(affairId) }
    
    affair?.let {
        // 状态
        var expandedStepId by remember { mutableStateOf<String?>(null) }
        
        // 自定义的顶部栏颜色渐变
        val topBarColors = TopAppBarDefaults.centerAlignedTopAppBarColors(
            containerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.05f),
            titleContentColor = MaterialTheme.colorScheme.onBackground,
            navigationIconContentColor = MaterialTheme.colorScheme.primary
        )
        
        Scaffold(
            topBar = {
                CenterAlignedTopAppBar(
                    title = {
                        Text(
                            text = affair.name,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    },
                    navigationIcon = {
                        IconButton(onClick = onBackClick) {
                            Icon(
                                imageVector = Icons.Default.ArrowBack,
                                contentDescription = "返回"
                            )
                        }
                    },
                    colors = topBarColors
                )
            },
            floatingActionButton = {
                FloatingActionButton(
                    onClick = onAddToTodoClick,
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = Color.White
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Add,
                        contentDescription = "添加到待办"
                    )
                }
            },
            containerColor = MaterialTheme.colorScheme.background
        ) { innerPadding ->
            LazyColumn(
                modifier = modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // 概述部分
                item {
                    // 描述
                    Text(
                        text = affair.description,
                        style = MaterialTheme.typography.bodyLarge,
                        color = AppTheme.colors.textSecondary,
                        modifier = Modifier.padding(top = 16.dp, bottom = 24.dp)
                    )
                    
                    // 信息卡片
                    InfoCard(affair)
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    // 步骤标题
                    Text(
                        text = "办理步骤",
                        style = MaterialTheme.typography.titleLarge,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                }
                
                // 步骤列表
                items(affair.steps.size) { index ->
                    val step = affair.steps[index]
                    val isExpanded = step.id == expandedStepId
                    
                    StepItem(
                        number = index + 1,
                        title = step.title,
                        description = step.description,
                        isActive = isExpanded,
                        onExpand = { 
                            expandedStepId = if (isExpanded) null else step.id 
                        }
                    )
                    
                    // 如果步骤展开，显示详细信息
                    if (isExpanded) {
                        StepDetails(step, affair)
                    }
                    
                    // 不是最后一个步骤，添加分隔线
                    if (index < affair.steps.size - 1) {
                        Divider(
                            color = AppTheme.colors.surfaceVariant,
                            modifier = Modifier.padding(start = 48.dp)
                        )
                    }
                }
                
                // 底部空间
                item {
                    Spacer(modifier = Modifier.height(80.dp))
                }
            }
        }
    } ?: run {
        // 如果找不到事项数据，显示错误信息
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "未找到事项信息",
                style = MaterialTheme.typography.bodyLarge,
                color = AppTheme.colors.textSecondary
            )
        }
    }
}

/**
 * 信息卡片
 */
@Composable
private fun InfoCard(affair: Affair) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(
            containerColor = AppTheme.colors.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // 办理时间
            if (affair.estimatedTime.isNotEmpty()) {
                InfoRow(
                    icon = Icons.Default.DateRange,
                    title = "办理时间",
                    content = affair.estimatedTime
                )
            }
            
            // 难度
            val difficultyText = when (affair.difficulty) {
                1 -> "容易"
                2 -> "较简单"
                3 -> "中等"
                4 -> "较难"
                else -> "复杂"
            }
            InfoRow(
                icon = Icons.Default.Info,
                title = "办理难度",
                content = difficultyText
            )
            
            // 更新时间
            val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.CHINA)
            InfoRow(
                icon = Icons.Default.DateRange,
                title = "更新时间",
                content = dateFormat.format(Date(affair.updateTime))
            )
        }
    }
}

/**
 * 信息行
 */
@Composable
private fun InfoRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    content: String
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.fillMaxWidth()
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(20.dp)
        )
        
        Spacer(modifier = Modifier.width(12.dp))
        
        Text(
            text = title,
            style = MaterialTheme.typography.titleSmall,
            color = AppTheme.colors.textSecondary
        )
        
        Spacer(modifier = Modifier.weight(1f))
        
        Text(
            text = content,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onBackground
        )
    }
}

/**
 * 步骤详情
 */
@Composable
private fun StepDetails(step: AffairStep, affair: Affair) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(start = 48.dp, top = 8.dp, bottom = 16.dp)
    ) {
        // 小贴士
        if (step.tips.isNotEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(AppTheme.colors.info.copy(alpha = 0.1f))
                    .padding(12.dp)
            ) {
                Column {
                    Text(
                        text = "小贴士",
                        style = MaterialTheme.typography.labelMedium,
                        color = AppTheme.colors.info
                    )
                    
                    Spacer(modifier = Modifier.height(4.dp))
                    
                    Text(
                        text = step.tips,
                        style = MaterialTheme.typography.bodySmall,
                        color = AppTheme.colors.textSecondary
                    )
                }
            }
        }
        
        // 所需材料
        if (step.materialIds.isNotEmpty()) {
            Spacer(modifier = Modifier.height(12.dp))
            
            Text(
                text = "所需材料",
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.primary
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            step.materialIds.forEach { materialId ->
                affair.materials.find { it.id == materialId }?.let { material ->
                    Row(
                        verticalAlignment = Alignment.Top,
                        modifier = Modifier.padding(vertical = 4.dp)
                    ) {
                        Text(
                            text = "•",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.primary
                        )
                        
                        Spacer(modifier = Modifier.width(8.dp))
                        
                        Column {
                            Text(
                                text = material.name,
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onBackground
                            )
                            
                            if (material.description.isNotEmpty()) {
                                Text(
                                    text = material.description,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = AppTheme.colors.textSecondary
                                )
                            }
                        }
                    }
                }
            }
        }
        
        // 办理地点
        if (step.locationIds.isNotEmpty()) {
            Spacer(modifier = Modifier.height(12.dp))
            
            Text(
                text = "办理地点",
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.primary
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            step.locationIds.forEach { locationId ->
                affair.locations.find { it.id == locationId }?.let { location ->
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(MaterialTheme.colorScheme.surfaceVariant)
                            .padding(12.dp)
                    ) {
                        Column {
                            Text(
                                text = location.name,
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onBackground
                            )
                            
                            Spacer(modifier = Modifier.height(4.dp))
                            
                            Text(
                                text = location.address,
                                style = MaterialTheme.typography.bodySmall,
                                color = AppTheme.colors.textSecondary
                            )
                            
                            if (location.workTime.isNotEmpty()) {
                                Spacer(modifier = Modifier.height(4.dp))
                                
                                Text(
                                    text = "工作时间: ${location.workTime}",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = AppTheme.colors.textSecondary
                                )
                            }
                            
                            if (location.telephone.isNotEmpty()) {
                                Spacer(modifier = Modifier.height(4.dp))
                                
                                Text(
                                    text = "联系电话: ${location.telephone}",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = AppTheme.colors.textSecondary
                                )
                            }
                        }
                    }
                }
            }
        }
    }
} 