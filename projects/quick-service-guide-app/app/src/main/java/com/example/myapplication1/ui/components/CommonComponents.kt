package com.example.myapplication1.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.rounded.ArrowForward
import androidx.compose.material.icons.rounded.LocationOn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.focus.FocusState
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.myapplication1.data.model.AffairCategory
import com.example.myapplication1.data.model.City
import com.example.myapplication1.ui.theme.AppTheme
import java.text.SimpleDateFormat
import java.util.*

/**
 * 渐变背景
 */
@Composable
fun GradientBackground(
    startColor: Color = AppTheme.colors.primaryLight.copy(alpha = 0.15f),
    endColor: Color = Color.Transparent,
    content: @Composable () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(startColor, endColor),
                    startY = 0f,
                    endY = 500f
                )
            )
    ) {
        content()
    }
}

/**
 * 优雅的搜索框
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ElegantSearchBar(
    query: String,
    onQueryChange: (String) -> Unit,
    onSearch: (String) -> Unit,
    modifier: Modifier = Modifier,
    hint: String = "搜索办事指南",
    onFocusChange: (FocusState) -> Unit = {}
) {
    var isFocused by remember { mutableStateOf(false) }
    
    Box(
        modifier = modifier
            .shadow(
                elevation = 8.dp,
                shape = RoundedCornerShape(16.dp),
                ambientColor = AppTheme.colors.shadowColor,
                spotColor = AppTheme.colors.shadowColor
            )
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White)
            .height(56.dp)
    ) {
        BasicTextField(
            value = query,
            onValueChange = onQueryChange,
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp, vertical = 8.dp)
                .onFocusChanged { 
                    isFocused = it.isFocused
                    onFocusChange(it)
                },
            textStyle = TextStyle(
                fontSize = 16.sp,
                color = MaterialTheme.colorScheme.onSurface
            ),
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
            keyboardActions = KeyboardActions(
                onSearch = { onSearch(query) }
            ),
            singleLine = true,
            cursorBrush = SolidColor(MaterialTheme.colorScheme.primary),
            decorationBox = { innerTextField ->
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxHeight()
                ) {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "搜索",
                        tint = if (isFocused) MaterialTheme.colorScheme.primary else AppTheme.colors.textHint
                    )
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .padding(horizontal = 12.dp)
                    ) {
                        if (query.isEmpty()) {
                            Text(
                                text = hint,
                                style = TextStyle(
                                    fontSize = 16.sp,
                                    color = AppTheme.colors.textHint
                                )
                            )
                        }
                        innerTextField()
                    }
                    if (query.isNotEmpty()) {
                        Row {
                            // 清除按钮
                            IconButton(
                                onClick = { onQueryChange("") },
                                modifier = Modifier.size(32.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Close,
                                    contentDescription = "清除",
                                    tint = AppTheme.colors.textHint
                                )
                            }
                            
                            // 搜索按钮
                            IconButton(
                                onClick = { onSearch(query) },
                                modifier = Modifier.size(32.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Search,
                                    contentDescription = "执行搜索",
                                    tint = MaterialTheme.colorScheme.primary
                                )
                            }
                        }
                    }
                }
            }
        )
    }
}

/**
 * 城市选择器
 */
@Composable
fun CitySelector(
    city: City,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .clip(RoundedCornerShape(18.dp))
            .background(MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.6f))
            .clickable { onClick() }
            .padding(horizontal = 12.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Icon(
            imageVector = Icons.Rounded.LocationOn,
            contentDescription = "城市",
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(16.dp)
        )
        Text(
            text = city.name,
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.primary
        )
    }
}

/**
 * 分类项
 */
@Composable
fun CategoryItem(
    category: AffairCategory,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = modifier
            .width(80.dp)
            .clickable { onClick() }
            .padding(8.dp)
    ) {
        // 图标容器
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .size(56.dp)
                .shadow(
                    elevation = 4.dp,
                    shape = RoundedCornerShape(16.dp),
                    ambientColor = AppTheme.colors.shadowColor,
                    spotColor = AppTheme.colors.shadowColor
                )
                .clip(RoundedCornerShape(16.dp))
                .background(
                    brush = Brush.linearGradient(
                        colors = listOf(
                            MaterialTheme.colorScheme.primary,
                            AppTheme.colors.primaryVariant
                        )
                    )
                )
                .padding(12.dp)
        ) {
            // 实际应用中这里应该是图片，但示例中使用文本代替
            Text(
                text = category.name.take(1),
                color = Color.White,
                style = MaterialTheme.typography.titleMedium
            )
        }
        
        Spacer(modifier = Modifier.height(8.dp))
        
        Text(
            text = category.name,
            style = MaterialTheme.typography.bodySmall,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            color = MaterialTheme.colorScheme.onBackground
        )
    }
}

/**
 * 办事事项卡片
 */
@Composable
fun AffairCard(
    title: String,
    description: String,
    estimatedTime: String = "",
    difficulty: Int = 0,
    updateTime: Long? = null,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .shadow(
                elevation = 4.dp,
                shape = RoundedCornerShape(16.dp),
                ambientColor = AppTheme.colors.shadowColor,
                spotColor = AppTheme.colors.shadowColor
            )
            .clip(RoundedCornerShape(16.dp))
            .clickable { onClick() },
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = description,
                style = MaterialTheme.typography.bodyMedium,
                color = AppTheme.colors.textSecondary,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // 标签区域
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    if (estimatedTime.isNotEmpty()) {
                        Chip(text = estimatedTime, color = AppTheme.colors.info)
                    }
                    
                    if (difficulty > 0) {
                        val difficultyText = when (difficulty) {
                            1 -> "容易"
                            2 -> "较简单"
                            3 -> "中等"
                            4 -> "较难"
                            else -> "复杂"
                        }
                        val difficultyColor = when (difficulty) {
                            1, 2 -> AppTheme.colors.success
                            3 -> AppTheme.colors.info
                            else -> AppTheme.colors.warning
                        }
                        Chip(text = difficultyText, color = difficultyColor)
                    }
                }
                
                // 箭头或时间
                if (updateTime != null) {
                    val dateFormat = SimpleDateFormat("MM-dd", Locale.CHINA)
                    Text(
                        text = dateFormat.format(Date(updateTime)),
                        style = MaterialTheme.typography.labelSmall,
                        color = AppTheme.colors.textHint
                    )
                } else {
                    Icon(
                        imageVector = Icons.Rounded.ArrowForward,
                        contentDescription = "查看详情",
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
    }
}

/**
 * 小标签
 */
@Composable
fun Chip(
    text: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(color.copy(alpha = 0.15f))
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text(
            text = text,
            color = color,
            style = MaterialTheme.typography.labelSmall
        )
    }
}

/**
 * 步骤项
 */
@Composable
fun StepItem(
    number: Int,
    title: String,
    description: String,
    isActive: Boolean = false,
    isCompleted: Boolean = false,
    onExpand: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onExpand() }
            .padding(vertical = 16.dp),
        verticalAlignment = Alignment.Top
    ) {
        // 步骤数字圆圈
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .size(32.dp)
                .clip(CircleShape)
                .background(
                    if (isCompleted) MaterialTheme.colorScheme.primary
                    else if (isActive) AppTheme.colors.primaryLight
                    else MaterialTheme.colorScheme.surfaceVariant
                )
                .padding(8.dp)
        ) {
            Text(
                text = number.toString(),
                style = MaterialTheme.typography.labelMedium,
                color = if (isCompleted) Color.White
                        else if (isActive) MaterialTheme.colorScheme.primary
                        else AppTheme.colors.textSecondary
            )
        }
        
        Spacer(modifier = Modifier.width(16.dp))
        
        Column {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                color = if (isActive || isCompleted) 
                    MaterialTheme.colorScheme.onSurface
                else AppTheme.colors.textSecondary
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = description,
                style = MaterialTheme.typography.bodyMedium,
                color = AppTheme.colors.textSecondary,
                maxLines = if (isActive) Int.MAX_VALUE else 2,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
} 