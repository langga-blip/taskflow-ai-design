package com.aistudio.taskflowai.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.aistudio.taskflowai.app.ui.components.CustomBottomBar
import com.aistudio.taskflowai.app.ui.screens.*
import com.aistudio.taskflowai.app.ui.theme.DeepDarkBg
import com.aistudio.taskflowai.app.ui.theme.TaskFlowTheme
import com.aistudio.taskflowai.app.viewmodel.TaskFlowViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            TaskFlowTheme {
                val viewModel: TaskFlowViewModel = viewModel()
                val activeScreen by viewModel.activeScreen.collectAsState()

                Scaffold(
                    bottomBar = {
                        if (activeScreen != "onboarding" && activeScreen != "subscription") {
                            CustomBottomBar(
                                currentScreen = activeScreen,
                                onNavigate = { viewModel.navigateTo(it) }
                            )
                        }
                    },
                    containerColor = DeepDarkBg
                ) { innerPadding ->
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                            .background(DeepDarkBg)
                    ) {
                        when (activeScreen) {
                            "onboarding" -> OnboardingScreen(viewModel)
                            "subscription" -> SubscriptionScreen(viewModel)
                            "dashboard" -> DashboardScreen(viewModel)
                            "tasks" -> TaskScreen(viewModel)
                            "planner" -> PlannerScreen(viewModel)
                            "assistant" -> AssistantScreen(viewModel)
                            "revenue" -> RevenueScreen(viewModel)
                            "templates" -> TemplatesScreen(viewModel)
                            "profile" -> ProfileScreen(viewModel)
                            else -> DashboardScreen(viewModel)
                        }
                    }
                }
            }
        }
    }
}
