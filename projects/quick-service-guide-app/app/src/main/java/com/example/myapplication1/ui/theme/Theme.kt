package com.example.myapplication1.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

// 自定义的颜色系统
private val LightColorScheme = lightColorScheme(
    primary = Primary,
    onPrimary = Color.White,
    primaryContainer = PrimaryLight,
    onPrimaryContainer = Primary,
    secondary = Secondary,
    onSecondary = Color.White,
    secondaryContainer = SecondaryLight,
    onSecondaryContainer = Secondary,
    tertiary = Secondary,
    background = Background,
    onBackground = TextPrimary,
    surface = Surface,
    onSurface = TextPrimary,
    surfaceVariant = SurfaceVariant,
    onSurfaceVariant = TextSecondary,
    outline = TextHint,
    error = Error
)

// 为我们的应用自定义扩展主题值
data class ExtendedColors(
    val primaryLight: Color,
    val primaryVariant: Color,
    val secondaryLight: Color,
    val secondaryVariant: Color,
    val textSecondary: Color,
    val textHint: Color,
    val shadowColor: Color,
    val success: Color,
    val warning: Color,
    val info: Color,
    val surfaceVariant: Color
)

val LocalExtendedColors = staticCompositionLocalOf {
    ExtendedColors(
        primaryLight = Color.Unspecified,
        primaryVariant = Color.Unspecified,
        secondaryLight = Color.Unspecified,
        secondaryVariant = Color.Unspecified,
        textSecondary = Color.Unspecified,
        textHint = Color.Unspecified,
        shadowColor = Color.Unspecified,
        success = Color.Unspecified,
        warning = Color.Unspecified,
        info = Color.Unspecified,
        surfaceVariant = Color.Unspecified
    )
}

// 自定义间距
data class Spacing(
    val extraSmall: Int = 4,
    val small: Int = 8,
    val medium: Int = 16,
    val large: Int = 24,
    val extraLarge: Int = 32,
    val extraExtraLarge: Int = 48
)

val LocalSpacing = staticCompositionLocalOf { Spacing() }

// 自定义圆角
data class Radius(
    val small: Int = 4,
    val medium: Int = 8,
    val large: Int = 16,
    val extraLarge: Int = 24
)

val LocalRadius = staticCompositionLocalOf { Radius() }

@Composable
fun MyApplication1Theme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    // Dynamic color is available on Android 12+
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        else -> LightColorScheme
    }
    
    val extendedColors = ExtendedColors(
        primaryLight = PrimaryLight,
        primaryVariant = PrimaryVariant,
        secondaryLight = SecondaryLight,
        secondaryVariant = SecondaryVariant,
        textSecondary = TextSecondary,
        textHint = TextHint,
        shadowColor = ShadowColor,
        success = Success,
        warning = Warning,
        info = Info,
        surfaceVariant = SurfaceVariant
    )
    
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = true
        }
    }

    CompositionLocalProvider(
        LocalExtendedColors provides extendedColors,
        LocalSpacing provides Spacing(),
        LocalRadius provides Radius()
    ) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = Typography,
            content = content
        )
    }
}

// 扩展函数使访问自定义主题值更容易
object AppTheme {
    val colors: ExtendedColors
        @Composable
        get() = LocalExtendedColors.current
    
    val spacing: Spacing
        @Composable
        get() = LocalSpacing.current
    
    val radius: Radius
        @Composable
        get() = LocalRadius.current
}