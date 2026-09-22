package com.example.myapplication1.ui.navigation

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.myapplication1.data.model.Affair
import com.example.myapplication1.data.model.AffairCategory
import com.example.myapplication1.data.model.City
import com.example.myapplication1.data.repository.DataRepository
import com.example.myapplication1.ui.components.CitySelectionDialog
import com.example.myapplication1.ui.screens.AffairDetailScreen
import com.example.myapplication1.ui.screens.CategoryScreen
import com.example.myapplication1.ui.screens.HomeScreen
import com.example.myapplication1.ui.screens.MyScreen
import com.example.myapplication1.ui.screens.SearchResultsScreen

/**
 * 导航目标
 */
sealed class Screen(val route: String) {
    object Home : Screen("home")
    object My : Screen("my")
    object AffairDetail : Screen("affair_detail/{affairId}") {
        fun createRoute(affairId: String) = "affair_detail/$affairId"
    }
    
    object Category : Screen("category/{categoryId}") {
        fun createRoute(categoryId: String) = "category/$categoryId"
    }
    
    object SearchResults : Screen("search_results/{query}") {
        fun createRoute(query: String) = "search_results/$query"
    }
}

/**
 * 底部导航项
 */
data class BottomNavItem(
    val route: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector,
    val title: String
)

/**
 * 应用导航组件
 */
@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    val currentRoute = currentRoute(navController)
    var showCityDialog by remember { mutableStateOf(false) }
    
    // 底部导航项
    val bottomNavItems = listOf(
        BottomNavItem(
            route = Screen.Home.route,
            selectedIcon = Icons.Filled.Home,
            unselectedIcon = Icons.Outlined.Home,
            title = "首页"
        ),
        BottomNavItem(
            route = Screen.My.route,
            selectedIcon = Icons.Filled.Person,
            unselectedIcon = Icons.Outlined.Person,
            title = "我的"
        )
    )
    
    // 显示底部导航的路由
    val showBottomBar = remember(currentRoute) {
        currentRoute == Screen.Home.route || currentRoute == Screen.My.route
    }
    
    // 城市选择对话框
    if (showCityDialog) {
        CitySelectionDialog(
            cities = DataRepository.getAllCities(),
            currentCityId = DataRepository.getSelectedCityId(),
            onCitySelected = { city ->
                DataRepository.setSelectedCityId(city.id)
            },
            onDismiss = { showCityDialog = false }
        )
    }
    
    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                BottomNavigation(
                    navController = navController,
                    items = bottomNavItems,
                    currentRoute = currentRoute
                )
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            // 首页
            composable(Screen.Home.route) {
                HomeScreen(
                    onCityClick = { showCityDialog = true },
                    onSearchSubmit = { query ->
                        // 导航到搜索结果页面
                        if (query.isNotEmpty()) {
                            navController.navigate(Screen.SearchResults.createRoute(query))
                        }
                    },
                    onCategoryClick = { category ->
                        // 导航到分类筛选页面
                        navController.navigate(Screen.Category.createRoute(category.id))
                    },
                    onAffairClick = { affair ->
                        navController.navigate(Screen.AffairDetail.createRoute(affair.id))
                    }
                )
            }
            
            // 我的页面
            composable(Screen.My.route) {
                MyScreen(
                    onCityClick = { showCityDialog = true },
                    onAffairClick = { affair ->
                        navController.navigate(Screen.AffairDetail.createRoute(affair.id))
                    }
                )
            }
            
            // 办事详情页
            composable(
                route = Screen.AffairDetail.route,
                arguments = listOf(
                    navArgument("affairId") { type = NavType.StringType }
                )
            ) { backStackEntry ->
                val affairId = backStackEntry.arguments?.getString("affairId") ?: ""
                
                AffairDetailScreen(
                    affairId = affairId,
                    onBackClick = { navController.popBackStack() },
                    onAddToTodoClick = {
                        // 添加到待办事项
                        DataRepository.addTodoItem(affairId)
                        // 返回到"我的"页面查看待办事项
                        navController.navigate(Screen.My.route) {
                            // 清除回退栈，避免多次重复点击返回
                            popUpTo(Screen.Home.route)
                        }
                    }
                )
            }
            
            // 分类筛选页面
            composable(
                route = Screen.Category.route,
                arguments = listOf(
                    navArgument("categoryId") { type = NavType.StringType }
                )
            ) { backStackEntry ->
                val categoryId = backStackEntry.arguments?.getString("categoryId") ?: ""
                
                CategoryScreen(
                    categoryId = categoryId,
                    onBackClick = { navController.popBackStack() },
                    onAffairClick = { affair ->
                        navController.navigate(Screen.AffairDetail.createRoute(affair.id))
                    }
                )
            }
            
            // 搜索结果页面
            composable(
                route = Screen.SearchResults.route,
                arguments = listOf(
                    navArgument("query") { type = NavType.StringType }
                )
            ) { backStackEntry ->
                val query = backStackEntry.arguments?.getString("query") ?: ""
                
                SearchResultsScreen(
                    query = query,
                    onBackClick = { navController.popBackStack() },
                    onAffairClick = { affair ->
                        navController.navigate(Screen.AffairDetail.createRoute(affair.id))
                    }
                )
            }
        }
    }
}

/**
 * 底部导航栏
 */
@Composable
private fun BottomNavigation(
    navController: NavHostController,
    items: List<BottomNavItem>,
    currentRoute: String?
) {
    NavigationBar(
        containerColor = MaterialTheme.colorScheme.surface
    ) {
        items.forEach { item ->
            val selected = currentRoute == item.route
            
            NavigationBarItem(
                icon = {
                    Icon(
                        imageVector = if (selected) item.selectedIcon else item.unselectedIcon,
                        contentDescription = item.title
                    )
                },
                label = { Text(text = item.title) },
                selected = selected,
                onClick = {
                    if (currentRoute != item.route) {
                        navController.navigate(item.route) {
                            // 避免创建多个实例
                            popUpTo(navController.graph.startDestinationId) {
                                saveState = true
                            }
                            // 恢复状态
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                }
            )
        }
    }
}

/**
 * 获取当前路由
 */
@Composable
private fun currentRoute(navController: NavHostController): String? {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    return navBackStackEntry?.destination?.route
} 