package com.aistudio.taskflowai.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aistudio.taskflowai.app.data.*
import com.aistudio.taskflowai.app.utils.AutoCorrect
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class TaskFlowViewModel : ViewModel() {

    private val _userProfile = MutableStateFlow(UserProfile())
    val userProfile: StateFlow<UserProfile> = _userProfile.asStateFlow()

    private val _activeScreen = MutableStateFlow("dashboard")
    val activeScreen: StateFlow<String> = _activeScreen.asStateFlow()

    private val _tasks = MutableStateFlow(
        listOf(
            TaskItem(title = "Send Q3 Agency Retainer Proposals", category = "Revenue", priority = TaskPriority.HIGH, status = TaskStatus.TODO, dueDate = "Today 2:00 PM"),
            TaskItem(title = "Audit Google Ads Campaign CPA", category = "Marketing", priority = TaskPriority.HIGH, status = TaskStatus.IN_PROGRESS, dueDate = "Today 4:30 PM"),
            TaskItem(title = "Review AI Automated Onboarding Flow", category = "Productivity", priority = TaskPriority.MEDIUM, status = TaskStatus.TODO, dueDate = "Tomorrow"),
            TaskItem(title = "Finalize 2026 Client Expansion Playbook", category = "Strategy", priority = TaskPriority.LOW, status = TaskStatus.COMPLETED, dueDate = "Yesterday")
        )
    )
    val tasks: StateFlow<List<TaskItem>> = _tasks.asStateFlow()

    private val _chatMessages = MutableStateFlow(
        listOf(
            ChatMessage(
                text = "Hello Alex! I am your TaskFlow AI Executive Assistant. I can optimize your daily calendar, generate deal proposals, or automate workflow pipelines. How can I assist you today?",
                isUser = false,
                timestamp = "10:00 AM"
            )
        )
    )
    val chatMessages: StateFlow<List<ChatMessage>> = _chatMessages.asStateFlow()

    private val _revenueDeals = MutableStateFlow(
        listOf(
            RevenueDeal(clientName = "Nexus Technologies", amount = 12500.0, stage = "Proposal Sent", status = "Active"),
            RevenueDeal(clientName = "Apex Media Global", amount = 8400.0, stage = "Contract Signed", status = "Won"),
            RevenueDeal(clientName = "Vanguard Ventures", amount = 15000.0, stage = "In Negotiation", status = "Active"),
            RevenueDeal(clientName = "Horizon Digital", amount = 6200.0, stage = "Discovery Call", status = "Lead")
        )
    )
    val revenueDeals: StateFlow<List<RevenueDeal>> = _revenueDeals.asStateFlow()

    private val _templates = MutableStateFlow(
        listOf(
            WorkflowTemplate(
                title = "High-Ticket Client Cold Email Sequence",
                category = "Sales",
                description = "4-step automated outreach workflow targeting CEO-level buyers.",
                duration = "10 mins setup",
                roiImpact = "+38% Response Rate"
            ),
            WorkflowTemplate(
                title = "AI Daily Revenue & KPI Audit",
                category = "Analytics",
                description = "Auto-aggregates daily sales numbers and posts summary to Slack/Email.",
                duration = "Instant",
                roiImpact = "Saves 2.5 hrs/day"
            ),
            WorkflowTemplate(
                title = "Automated Client Onboarding Portal",
                category = "Operations",
                description = "Sends contract, intake form, and welcome kit on payment confirmation.",
                duration = "5 mins setup",
                roiImpact = "Zero Churn Delay"
            ),
            WorkflowTemplate(
                title = "Weekly Business Strategy Review",
                category = "Executive",
                description = "Generates weekly priority roadmap based on completed tasks and revenue.",
                duration = "15 mins setup",
                roiImpact = "10x Productivity"
            )
        )
    )
    val templates: StateFlow<List<WorkflowTemplate>> = _templates.asStateFlow()

    private val _dailySchedule = MutableStateFlow(
        listOf(
            DailyScheduleBlock("08:00 AM - 09:00 AM", "Executive Morning Focus & KPI Review", "Strategy"),
            DailyScheduleBlock("09:00 AM - 11:30 AM", "Deep Work: Proposal Drafting for Nexus Tech", "Revenue"),
            DailyScheduleBlock("11:30 AM - 12:30 PM", "AI Assistant Workflow Automation Setup", "Productivity"),
            DailyScheduleBlock("01:30 PM - 03:00 PM", "Client Strategy Call & Expansion Pitch", "Sales"),
            DailyScheduleBlock("03:30 PM - 05:00 PM", "Campaign CPA Audit & Team Sync", "Operations")
        )
    )
    val dailySchedule: StateFlow<List<DailyScheduleBlock>> = _dailySchedule.asStateFlow()

    private val _isGenerating = MutableStateFlow(false)
    val isGenerating: StateFlow<Boolean> = _isGenerating.asStateFlow()

    fun navigateTo(screen: String) {
        _activeScreen.value = screen
    }

    fun toggleTask(taskId: String) {
        _tasks.value = _tasks.value.map { task ->
            if (task.id == taskId) {
                val newStatus = if (task.status == TaskStatus.COMPLETED) TaskStatus.TODO else TaskStatus.COMPLETED
                task.copy(status = newStatus)
            } else task
        }
    }

    fun addTask(title: String, category: String, priority: TaskPriority) {
        if (title.isBlank()) return
        val newTask = TaskItem(title = title, category = category, priority = priority)
        _tasks.value = listOf(newTask) + _tasks.value
    }

    fun sendChatMessage(rawInput: String) {
        if (rawInput.isBlank()) return
        val correctedInput = AutoCorrect.correct(rawInput)

        val userMsg = ChatMessage(text = correctedInput, isUser = true)
        _chatMessages.value = _chatMessages.value + userMsg

        viewModelScope.launch {
            _isGenerating.value = true
            delay(1200)
            val aiResponseText = generateAssistantResponse(correctedInput)
            val aiMsg = ChatMessage(text = aiResponseText, isUser = false)
            _chatMessages.value = _chatMessages.value + aiMsg
            _isGenerating.value = false
        }
    }

    private fun generateAssistantResponse(input: String): String {
        val lower = input.lowercase()
        return when {
            lower.contains("schedule") || lower.contains("plan") || lower.contains("time") ->
                "I've re-aligned your high-priority revenue tasks into 90-minute focus blocks for maximum energy efficiency today."
            lower.contains("revenue") || lower.contains("mrr") || lower.contains("client") || lower.contains("deal") ->
                "Your pipeline is currently tracking at ₦27.1M ($32,100). Closing the Nexus Technologies proposal will boost MRR by 38%."
            lower.contains("task") || lower.contains("todo") ->
                "You have 2 high-priority items due before 4:30 PM today. I recommend focusing on the Q3 Retainer Proposal first."
            else ->
                "Understood! I've logged this prompt and updated your TaskFlow execution strategy accordingly."
        }
    }

    fun activateSubscription() {
        _userProfile.value = _userProfile.value.copy(isSubscribed = true)
    }

    fun completeOnboarding(name: String, company: String) {
        _userProfile.value = _userProfile.value.copy(
            userName = name.ifBlank { "Alex Rivera" },
            companyName = company.ifBlank { "Apex Media Agency" },
            isOnboarded = true
        )
        _activeScreen.value = "subscription"
    }

    fun optimizeSchedule() {
        viewModelScope.launch {
            _isGenerating.value = true
            delay(1000)
            _dailySchedule.value = _dailySchedule.value.shuffled()
            _isGenerating.value = false
        }
    }
}
