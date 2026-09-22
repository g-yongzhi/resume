package com.example.myapplication1.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.example.myapplication1.data.model.Affair
import com.example.myapplication1.data.model.TodoItem
import com.example.myapplication1.data.repository.DataRepository
import com.example.myapplication1.ui.components.AffairCard
import com.example.myapplication1.ui.theme.AppTheme

/**
 * "我的"页面
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MyScreen(
    onCityClick: () -> Unit,
    onAffairClick: (Affair) -> Unit,
    modifier: Modifier = Modifier
) {
    // 获取待办事项和历史记录
    val todoItems = remember { DataRepository.getAllTodoItems() }
    val historyItems = remember { DataRepository.getHistory() }
    
    // 顶部栏颜色渐变
    val topBarColors = TopAppBarDefaults.centerAlignedTopAppBarColors(
        containerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.05f),
        titleContentColor = MaterialTheme.colorScheme.onBackground
    )
    
    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(text = "我的")
                },
                colors = topBarColors
            )
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { innerPadding ->
        LazyColumn(
            modifier = modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // 用户信息卡片
            item {
                Spacer(modifier = Modifier.height(8.dp))
                
                UserInfoCard(onCityClick)
                
                Spacer(modifier = Modifier.height(24.dp))
                
                // 待办标题
                Text(
                    text = "我的待办",
                    style = MaterialTheme.typography.titleLarge,
                    color = MaterialTheme.colorScheme.onBackground
                )
                
                Spacer(modifier = Modifier.height(8.dp))
            }
            
            // 待办事项列表
            if (todoItems.isEmpty()) {
                item {
                    EmptyState(
                        message = "暂无待办事项",
                        modifier = Modifier.padding(vertical = 32.dp)
                    )
                }
            } else {
                items(todoItems) { todoItem ->
                    val affair = DataRepository.getAffairById(todoItem.affairId)
                    affair?.let {
                        TodoItemCard(
                            todoItem = todoItem,
                            affair = affair,
                            onTodoClick = { onAffairClick(affair) },
                            onDeleteClick = { DataRepository.deleteTodoItem(todoItem.id) }
                        )
                    }
                }
            }
            
            // 历史记录标题
            item {
                Spacer(modifier = Modifier.height(24.dp))
                
                Text(
                    text = "最近浏览",
                    style = MaterialTheme.typography.titleLarge,
                    color = MaterialTheme.colorScheme.onBackground
                )
                
                Spacer(modifier = Modifier.height(8.dp))
            }
            
            // 历史记录列表
            items(historyItems) { affair ->
                AffairCard(
                    title = affair.name,
                    description = affair.description,
                    estimatedTime = affair.estimatedTime,
                    difficulty = affair.difficulty,
                    updateTime = affair.updateTime,
                    onClick = { onAffairClick(affair) },
                    modifier = Modifier.padding(bottom = 8.dp)
                )
            }
            
            // 底部空间
            item {
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

/**
 * 用户信息卡片
 */
@Composable
private fun UserInfoCard(onCityClick: () -> Unit) {
    val selectedCity = DataRepository.getSelectedCity()
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.7f)
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // 头像
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .size(56.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.2f))
            ) {
                Icon(
                    imageVector = Icons.Default.Person,
                    contentDescription = "用户头像",
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(32.dp)
                )
            }
            
            Spacer(modifier = Modifier.width(16.dp))
            
            // 用户信息
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = "游客用户",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Text(
                    text = "当前城市: ${selectedCity.name}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f)
                )
            }
            
            // 切换城市按钮
            TextButton(
                onClick = onCityClick,
                colors = ButtonDefaults.textButtonColors(
                    contentColor = MaterialTheme.colorScheme.primary
                )
            ) {
                Text("切换城市")
            }
        }
    }
}

/**
 * 待办事项卡片
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun TodoItemCard(
    todoItem: TodoItem,
    affair: Affair,
    onTodoClick: () -> Unit,
    onDeleteClick: () -> Unit
) {
    val completedStepCount = todoItem.completedSteps.size
    val totalStepCount = affair.steps.size
    val progress = if (totalStepCount > 0) {
        completedStepCount.toFloat() / totalStepCount
    } else {
        0f
    }
    
    val dismissState = rememberSwipeToDismissBoxState(
        confirmValueChange = {
            if (it == SwipeToDismissBoxValue.EndToStart) {
                onDeleteClick()
                true
            } else {
                false
            }
        }
    )
    
    SwipeToDismissBox(
        state = dismissState,
        backgroundContent = {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(vertical = 8.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color.Red.copy(alpha = 0.2f)),
                contentAlignment = Alignment.CenterEnd
            ) {
                Icon(
                    imageVector = Icons.Rounded.Close,
                    contentDescription = "删除",
                    tint = Color.Red,
                    modifier = Modifier.padding(end = 16.dp)
                )
            }
        },
        content = {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .heightIn(min = 80.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surface
                ),
                onClick = onTodoClick
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(
                                text = todoItem.title,
                                style = MaterialTheme.typography.titleMedium,
                                color = MaterialTheme.colorScheme.onSurface,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            
                            Spacer(modifier = Modifier.height(4.dp))
                            
                            Text(
                                text = "进度: $completedStepCount/$totalStepCount",
                                style = MaterialTheme.typography.bodySmall,
                                color = AppTheme.colors.textSecondary
                            )
                        }
                        
                        if (progress >= 1f) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = "已完成",
                                tint = AppTheme.colors.success,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    LinearProgressIndicator(
                        progress = { progress },
                        modifier = Modifier.fillMaxWidth(),
                        color = MaterialTheme.colorScheme.primary,
                        trackColor = AppTheme.colors.primaryLight
                    )
                }
            }
        },
        enableDismissFromEndToStart = true
    )
}

/**
 * 空状态
 */
@Composable
private fun EmptyState(
    message: String,
    modifier: Modifier = Modifier
) {
    Box(
        contentAlignment = Alignment.Center,
        modifier = modifier.fillMaxWidth()
    ) {
        Text(
            text = message,
            style = MaterialTheme.typography.bodyLarge,
            color = AppTheme.colors.textHint
        )
    }
} 