package com.aistudio.taskflowai.app.data

import java.util.UUID

data class UserProfile(
    val userName: String = "Alex Rivera",
    val userEmail: String = "alex.rivera@agency.io",
    val companyName: String = "Apex Media Agency",
    val isSubscribed: Boolean = false,
    val isOnboarded: Boolean = true,
    val monthlyTarget: Double = 25000.00
)

enum class TaskPriority {
    HIGH, MEDIUM, LOW
}

enum class TaskStatus {
    TODO, IN_PROGRESS, COMPLETED
}

data class TaskItem(
    val id: String = UUID.randomUUID().toString(),
    val title: String,
    val category: String = "Business",
    val priority: TaskPriority = TaskPriority.MEDIUM,
    val status: TaskStatus = TaskStatus.TODO,
    val timeEstimate: String = "30 mins",
    val dueDate: String = "Today"
)

data class ChatMessage(
    val id: String = UUID.randomUUID().toString(),
    val text: String,
    val isUser: Boolean,
    val timestamp: String = "Just now"
)

data class RevenueDeal(
    val id: String = UUID.randomUUID().toString(),
    val clientName: String,
    val amount: Double,
    val stage: String,
    val status: String = "Active"
)

data class WorkflowTemplate(
    val id: String = UUID.randomUUID().toString(),
    val title: String,
    val category: String,
    val description: String,
    val duration: String,
    val roiImpact: String
)

data class DailyScheduleBlock(
    val timeSlot: String,
    val taskTitle: String,
    val category: String,
    val isAiOptimized: Boolean = true
)
