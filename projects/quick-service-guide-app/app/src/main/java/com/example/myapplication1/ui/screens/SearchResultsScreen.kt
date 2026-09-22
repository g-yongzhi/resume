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
 * 搜索结果屏幕
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchResultsScreen(
    query: String,
    onBackClick: () -> Unit,
    onAffairClick: (Affair) -> Unit,
    modifier: Modifier = Modifier
) {
    // 获取当前选中的城市ID
    val cityId = DataRepository.getSelectedCityId()
    
    // 搜索结果
    val searchResults = remember(query, cityId) { 
        DataRepository.searchAffairs(query, cityId) 
    }
    
    GradientBackground {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { 
                        Text(
                            text = "搜索结果: $query",
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
                if (searchResults.isEmpty()) {
                    // 没有结果时显示提示
                    Column(
                        modifier = Modifier.align(Alignment.Center),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "没有找到相关办事指南",
                            style = MaterialTheme.typography.bodyLarge,
                            textAlign = TextAlign.Center,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                        )
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        Text(
                            text = "请尝试使用其他关键词搜索",
                            style = MaterialTheme.typography.bodyMedium,
                            textAlign = TextAlign.Center,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                        )
                    }
                } else {
                    // 搜索结果列表
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 16.dp),
                        contentPadding = PaddingValues(vertical = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        item {
                            Text(
                                text = "找到 ${searchResults.size} 条相关结果",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                                modifier = Modifier.padding(vertical = 8.dp)
                            )
                        }
                        
                        items(searchResults) { affair ->
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