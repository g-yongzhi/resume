package com.example.myapplication1.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import com.example.myapplication1.data.model.City
import com.example.myapplication1.ui.theme.AppTheme

/**
 * 城市选择对话框
 */
@Composable
fun CitySelectionDialog(
    cities: List<City>,
    currentCityId: String,
    onCitySelected: (City) -> Unit,
    onDismiss: () -> Unit
) {
    val hotCities = remember(cities) { cities.filter { it.isHot } }
    
    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .wrapContentHeight()
                .padding(16.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface
            )
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = "选择城市",
                    style = MaterialTheme.typography.headlineSmall,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Text(
                    text = "热门城市",
                    style = MaterialTheme.typography.titleMedium,
                    color = AppTheme.colors.textSecondary
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                // 热门城市网格
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    hotCities.forEach { city ->
                        val isSelected = city.id == currentCityId
                        CityChip(
                            city = city,
                            isSelected = isSelected,
                            onClick = { 
                                onCitySelected(city)
                                onDismiss()
                            },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Text(
                    text = "所有城市",
                    style = MaterialTheme.typography.titleMedium,
                    color = AppTheme.colors.textSecondary
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                // 所有城市列表
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 300.dp)
                ) {
                    items(cities) { city ->
                        val isSelected = city.id == currentCityId
                        CityItem(
                            city = city,
                            isSelected = isSelected,
                            onClick = { 
                                onCitySelected(city)
                                onDismiss()
                            }
                        )
                        
                        if (city != cities.last()) {
                            Divider(
                                color = AppTheme.colors.surfaceVariant,
                                modifier = Modifier.padding(vertical = 8.dp)
                            )
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Box(
                    modifier = Modifier.fillMaxWidth(),
                    contentAlignment = Alignment.CenterEnd
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("取消")
                    }
                }
            }
        }
    }
}

/**
 * 城市选项
 */
@Composable
private fun CityItem(
    city: City,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(vertical = 8.dp)
    ) {
        Text(
            text = city.name,
            style = MaterialTheme.typography.bodyLarge,
            color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
        )
        
        Spacer(modifier = Modifier.width(8.dp))
        
        Text(
            text = city.province,
            style = MaterialTheme.typography.bodyMedium,
            color = AppTheme.colors.textSecondary
        )
        
        Spacer(modifier = Modifier.weight(1f))
        
        if (isSelected) {
            RadioButton(
                selected = true,
                onClick = null,
                colors = RadioButtonDefaults.colors(
                    selectedColor = MaterialTheme.colorScheme.primary
                )
            )
        }
    }
}

/**
 * 城市选择芯片
 */
@Composable
private fun CityChip(
    city: City,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        contentAlignment = Alignment.Center,
        modifier = modifier
            .heightIn(min = 36.dp)
            .clip(RoundedCornerShape(18.dp))
            .background(
                if (isSelected) MaterialTheme.colorScheme.primary
                else AppTheme.colors.surfaceVariant
            )
            .clickable { onClick() }
            .padding(horizontal = 12.dp, vertical = 8.dp)
    ) {
        Text(
            text = city.name,
            style = MaterialTheme.typography.bodyMedium,
            color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface
        )
    }
} 