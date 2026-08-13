package com.aistudio.taskflowai.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val DeepDarkBg = Color(0xFF0A0C14)
val SurfaceDark = Color(0xFF131726)
val SurfaceCardDark = Color(0xFF181D30)
val BorderDark = Color(0xFF2E3552)

val NeonCyan = Color(0xFF06B6D4)
val NeonPurple = Color(0xFF7C3AED)
val BrightPurple = Color(0xFFA78BFA)
val AmberGlow = Color(0xFFF59E0B)
val EmeraldGreen = Color(0xFF10B981)

val TextPrimary = Color(0xFFF8FAFC)
val TextSecondary = Color(0xFF94A3B8)
val TextMuted = Color(0xFF64748B)

private val DarkColorScheme = darkColorScheme(
    primary = NeonPurple,
    secondary = NeonCyan,
    tertiary = AmberGlow,
    background = DeepDarkBg,
    surface = SurfaceDark,
    surfaceVariant = SurfaceCardDark,
    onPrimary = Color.White,
    onSecondary = Color.Black,
    onBackground = TextPrimary,
    onSurface = TextPrimary
)

@Composable
fun TaskFlowTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
