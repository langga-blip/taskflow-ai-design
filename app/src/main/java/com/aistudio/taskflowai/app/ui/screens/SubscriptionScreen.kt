package com.aistudio.taskflowai.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.WorkspacePremium
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.taskflowai.app.ui.components.GlassCard
import com.aistudio.taskflowai.app.ui.theme.*
import com.aistudio.taskflowai.app.viewmodel.TaskFlowViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun SubscriptionScreen(viewModel: TaskFlowViewModel) {
    val userProfile by viewModel.userProfile.collectAsState()
    var isProcessing by remember { mutableStateOf(false) }
    var receiptTxn by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    val benefits = listOf(
        "Unlimited AI Executive Daily Schedules",
        "Automated ₦20,000/3-Month Receipt Dispatched to Email",
        "Full Pipeline & Proposal Generator Access",
        "50+ Business Workflow Playbooks",
        "24/7 AI Business Strategy Assistant"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DeepDarkBg)
            .padding(20.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(20.dp))

        Icon(
            imageVector = Icons.Default.WorkspacePremium,
            contentDescription = null,
            tint = AmberGlow,
            modifier = Modifier.size(54.dp)
        )

        Spacer(modifier = Modifier.height(10.dp))

        Text(
            text = "TaskFlow Pro Pass",
            color = TextPrimary,
            fontSize = 26.sp,
            fontWeight = FontWeight.ExtraBold
        )

        Text(
            text = "Unlock complete enterprise productivity features.",
            color = TextSecondary,
            fontSize = 13.sp
        )

        Spacer(modifier = Modifier.height(24.dp))

        GlassCard(
            modifier = Modifier.fillMaxWidth(),
            borderColor = AmberGlow.copy(alpha = 0.6f)
        ) {
            Column(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "TASKFLOW PRO QUARTERLY PASS",
                            color = AmberGlow,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.ExtraBold
                        )
                        Text(
                            text = "₦20,000 / 3 Months",
                            color = TextPrimary,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "20,000 Naira per 3 months (~₦6,666/mo)",
                            color = TextMuted,
                            fontSize = 11.sp
                        )
                    }

                    Surface(
                        color = AmberGlow.copy(alpha = 0.2f),
                        shape = RoundedCornerShape(20.dp)
                    ) {
                        Text(
                            text = "POPULAR TIER",
                            color = AmberGlow,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                benefits.forEach { benefit ->
                    Row(
                        modifier = Modifier.padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = EmeraldGreen,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = benefit,
                            color = TextPrimary,
                            fontSize = 13.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                if (receiptTxn != null) {
                    Surface(
                        color = EmeraldGreen.copy(alpha = 0.15f),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier.padding(14.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = EmeraldGreen)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Payment Success & Receipt Dispatched!",
                                    color = EmeraldGreen,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Receipt sent to ${userProfile.userEmail} (Txn: $receiptTxn)",
                                color = TextSecondary,
                                fontSize = 11.sp
                            )
                        }
                    }
                } else {
                    Button(
                        onClick = {
                            scope.launch {
                                isProcessing = true
                                delay(1200)
                                viewModel.activateSubscription()
                                receiptTxn = "TF-TXN-${(100000..999999).random()}"
                                isProcessing = false
                                delay(1000)
                                viewModel.navigateTo("dashboard")
                            }
                        },
                        enabled = !isProcessing,
                        colors = ButtonDefaults.buttonColors(containerColor = AmberGlow),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.fillMaxWidth().height(52.dp)
                    ) {
                        if (isProcessing) {
                            CircularProgressIndicator(
                                color = TextPrimary,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Processing ₦20,000 Payment...", color = DeepDarkBg, fontWeight = FontWeight.Bold)
                        } else {
                            Icon(Icons.Default.WorkspacePremium, contentDescription = null, tint = DeepDarkBg)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Activate Pro Pass (₦20,000 / 3 Months)",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = DeepDarkBg
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        TextButton(onClick = { viewModel.navigateTo("dashboard") }) {
            Text("Skip for now and enter dashboard", color = TextMuted, fontSize = 12.sp)
        }
    }
}
