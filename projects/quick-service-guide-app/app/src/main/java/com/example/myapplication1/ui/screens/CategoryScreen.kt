package com.example.myapplication1.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.example.myapplication1.data.model.Affair
import com.example.myapplication1.data.repository.DataRepository
import com.example.myapplication1.ui.components.AffairCard
import com.example.myapplication1.ui.components.GradientBackground

/**
 * 分类筛选页面
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CategoryScreen(
    categoryId: String,
    onBackClick: () -> Unit,
    onAffairClick: (Affair) -> Unit,
    modifier: Modifier = Modifier
) {
    // 获取分类信息
    val category = remember { DataRepository.getCategoryById(categoryId) }
    val cityId = DataRepository.getSelectedCityId()
    
    // 根据分类和当前城市获取事项列表
    val affairs = remember { DataRepository.getAffairsByCategoryAndCity(categoryId, cityId) }
    
    GradientBackground {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { 
                        Text(
                            text = category?.name ?: "服务分类",
                            style = MaterialTheme.typography.titleLarge
                        )
                    },
                    navigationIcon = {
                        IconButton(onClick = onBackClick) {
                            Icon(
                                imageVector = Icons.Rounded.ArrowBack,
                                contentDescription = "返回"
                            )
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.8f)
                    )
                )
            }
        ) { innerPadding ->
            Box(
                modifier = modifier
                    .fillMaxSize()
                    .padding(innerPadding)
            ) {
                if (affairs.isEmpty()) {
                    // 没有事项时显示提示
                    Column(
                        modifier = Modifier.align(Alignment.Center),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "当前城市暂无该分类办事指南",
                            style = MaterialTheme.typography.bodyLarge,
                            textAlign = TextAlign.Center,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                        )
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        Text(
                            text = "可以切换到其他城市查看",
                            style = MaterialTheme.typography.bodyMedium,
                            textAlign = TextAlign.Center,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                        )
                    }
                } else {
                    // 事项列表
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 16.dp),
                        contentPadding = PaddingValues(vertical = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        items(affairs) { affair ->
                            AffairCard(
                                title = affair.name,
                                description = affair.description,
                                estimatedTime = affair.estimatedTime,
                                difficulty = affair.difficulty,
                                onClick = { onAffairClick(affair) }
                            )
                        }
                    }
                }
            }
        }
    }
} 