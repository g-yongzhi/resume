package com.example.myapplication1.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.myapplication1.data.model.Affair
import com.example.myapplication1.data.model.AffairCategory
import com.example.myapplication1.data.model.City
import com.example.myapplication1.data.repository.DataRepository
import com.example.myapplication1.ui.components.*
import com.example.myapplication1.ui.theme.AppTheme

/**
 * 首页屏幕
 */
@Composable
fun HomeScreen(
    onCityClick: () -> Unit,
    onSearchSubmit: (String) -> Unit,
    onCategoryClick: (AffairCategory) -> Unit,
    onAffairClick: (Affair) -> Unit,
    modifier: Modifier = Modifier
) {
    // 状态
    val selectedCity = DataRepository.getSelectedCity()
    val categories = remember { DataRepository.getAllCategories() }
    val hotAffairs = remember { 
        DataRepository.getHotAffairs(DataRepository.getSelectedCityId()) 
    }
    var searchQuery by remember { mutableStateOf("") }
    
    // 当用户输入搜索词时，即时搜索结果
    val searchResults by remember(searchQuery, selectedCity.id) {
        derivedStateOf {
            if (searchQuery.isNotEmpty()) {
                DataRepository.searchAffairs(searchQuery, selectedCity.id)
            } else {
                emptyList()
            }
        }
    }
    
    // 渐变背景
    GradientBackground {
        LazyColumn(
            modifier = modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Spacer(modifier = Modifier.height(32.dp))
                
                // 顶部区域：欢迎语和城市选择
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "快速办事指南",
                        style = MaterialTheme.typography.headlineLarge,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    
                    CitySelector(
                        city = selectedCity,
                        onClick = onCityClick
                    )
                }
                
                Spacer(modifier = Modifier.height(24.dp))
                
                // 搜索框
                ElegantSearchBar(
                    query = searchQuery,
                    onQueryChange = { searchQuery = it },
                    onSearch = onSearchSubmit,
                    modifier = Modifier.fillMaxWidth()
                )
                
                Spacer(modifier = Modifier.height(16.dp))
            }
            
            // 显示即时搜索结果
            if (searchQuery.isNotEmpty() && searchResults.isNotEmpty()) {
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "搜索结果",
                            style = MaterialTheme.typography.titleLarge,
                            color = MaterialTheme.colorScheme.onBackground
                        )
                        
                        Text(
                            text = "显示全部 →",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.clickable { onSearchSubmit(searchQuery) }
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(8.dp))
                }
                
                // 最多显示3条结果
                items(searchResults.take(3)) { affair ->
                    AffairCard(
                        title = affair.name,
                        description = affair.description,
                        estimatedTime = affair.estimatedTime,
                        difficulty = affair.difficulty,
                        onClick = { onAffairClick(affair) },
                        modifier = Modifier.padding(bottom = 8.dp)
                    )
                }
                
                // 如果有更多结果
                if (searchResults.size > 3) {
                    item {
                        Box(
                            modifier = Modifier.fillMaxWidth(),
                            contentAlignment = Alignment.Center
                        ) {
                            FilledTonalButton(
                                onClick = { onSearchSubmit(searchQuery) }
                            ) {
                                Text("查看更多结果 (共 ${searchResults.size} 条)")
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                    }
                }
            }
            
            // 如果没有搜索或者搜索结果为空，显示普通内容
            if (searchQuery.isEmpty() || searchResults.isEmpty()) {
                // 分类标题
                item {
                    if (searchQuery.isNotEmpty() && searchResults.isEmpty()) {
                        Text(
                            text = "未找到相关结果，显示推荐内容",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                            modifier = Modifier.padding(vertical = 8.dp)
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                    }
                    
                    Text(
                        text = "服务分类",
                        style = MaterialTheme.typography.titleLarge,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                }
                
                // 分类网格（使用LazyRow实现每行展示多个分类）
                item {
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(categories) { category ->
                            CategoryItem(
                                category = category,
                                onClick = { onCategoryClick(category) }
                            )
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(32.dp))
                    
                    // 热门办事标题
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "热门办事",
                            style = MaterialTheme.typography.titleLarge,
                            color = MaterialTheme.colorScheme.onBackground
                        )
                        
                        Text(
                            text = "${selectedCity.name}",
                            style = MaterialTheme.typography.labelMedium,
                            color = AppTheme.colors.textSecondary
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                }
                
                // 热门办事列表
                items(hotAffairs) { affair ->
                    AffairCard(
                        title = affair.name,
                        description = affair.description,
                        estimatedTime = affair.estimatedTime,
                        difficulty = affair.difficulty,
                        onClick = { onAffairClick(affair) },
                        modifier = Modifier.padding(bottom = 16.dp)
                    )
                }
            }
            
            // 底部空间
            item {
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
} 