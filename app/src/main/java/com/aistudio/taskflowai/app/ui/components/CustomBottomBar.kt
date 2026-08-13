package com.aistudio.taskflowai.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.taskflowai.app.ui.theme.*

data class NavItem(val id: String, val label: String, val icon: ImageVector)

@Composable
fun CustomBottomBar(
    currentScreen: String,
    onNavigate: (String) -> Unit
) {
    val items = listOf(
        NavItem("dashboard", "Home", Icons.Default.Home),
        NavItem("tasks", "Tasks", Icons.Default.CheckCircle),
        NavItem("planner", "Planner", Icons.Default.CalendarToday),
        NavItem("assistant", "Assistant", Icons.Default.SmartToy),
        NavItem("revenue", "Revenue", Icons.Default.TrendingUp),
        NavItem("templates", "Workflows", Icons.Default.Layers),
        NavItem("profile", "Settings", Icons.Default.Settings)
    )

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(SurfaceDark.copy(alpha = 0.95f))
            .border(1.dp, BorderDark, RoundedCornerShape(topStart = 18.dp, topEnd = 18.dp))
            .padding(vertical = 8.dp, horizontal = 4.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            items.forEach { item ->
                val isActive = currentScreen == item.id
                val shape = RoundedCornerShape(12.dp)

                Column(
                    modifier = Modifier
                        .clip(shape)
                        .background(if (isActive) NeonPurple.copy(alpha = 0.25f) else Color.Transparent)
                        .border(
                            1.dp,
                            if (isActive) NeonPurple.copy(alpha = 0.6f) else Color.Transparent,
                            shape
                        )
                        .clickable { onNavigate(item.id) }
                        .padding(horizontal = 6.dp, vertical = 6.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = item.icon,
                        contentDescription = item.label,
                        tint = if (isActive) NeonCyan else TextMuted,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = item.label,
                        color = if (isActive) TextPrimary else TextMuted,
                        fontSize = 10.sp,
                        fontWeight = if (isActive) FontWeight.Bold else FontWeight.Normal,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
        }
    }
}
