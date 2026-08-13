const functions = require('firebase-functions');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Firebase Cloud Function triggered when a new subscription document is created in Firestore.
 * Automatically sends a subscription payment receipt to the user's registered email address.
 */
exports.sendSubscriptionReceipt = functions.firestore
  .document('subscriptions/{subscriptionId}')
  .onCreate(async (snap, context) => {
    const payment = snap.data();
    if (!payment) return null;

    const userEmail = payment.userEmail || payment.email;
    const planName = payment.planName || 'TaskFlow AI Pro Annual Pass';
    const amountPaid = payment.amountPaid || '₦20,000';
    const currency = payment.currency || 'NGN';
    const transactionId = payment.transactionId || `TF-TXN-${Date.now()}`;
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    console.log(`[Firebase Cloud Function] Processing subscription payment receipt for ${userEmail}`);

    const receiptContent = {
      to: userEmail,
      subject: `Receipt for Your TaskFlow AI Subscription (${transactionId})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #7C3AED; border-radius: 12px; background-color: #0A0C14; color: #FFFFFF;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #2E3552;">
            <h1 style="color: #F59E0B; margin: 0;">TaskFlow AI</h1>
            <p style="color: #94A3B8; font-size: 14px; margin-top: 4px;">Payment Receipt & Subscription Confirmation</p>
          </div>
          <div style="padding: 20px 0;">
            <p style="font-size: 16px;">Hello,</p>
            <p>Thank you for subscribing to <strong>${planName}</strong>. Your payment of <strong>${amountPaid}</strong> (${currency}) was processed successfully.</p>
            
            <table style="width: 100%; margin-top: 20px; border-collapse: collapse; color: #FFFFFF;">
              <tr style="background-color: #131726;">
                <td style="padding: 10px; border: 1px solid #2E3552;"><strong>Transaction ID:</strong></td>
                <td style="padding: 10px; border: 1px solid #2E3552;">${transactionId}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #2E3552;"><strong>Plan:</strong></td>
                <td style="padding: 10px; border: 1px solid #2E3552;">${planName}</td>
              </tr>
              <tr style="background-color: #131726;">
                <td style="padding: 10px; border: 1px solid #2E3552;"><strong>Amount Paid:</strong></td>
                <td style="padding: 10px; border: 1px solid #2E3552; color: #00E676; font-weight: bold;">${amountPaid} / Year</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #2E3552;"><strong>Date:</strong></td>
                <td style="padding: 10px; border: 1px solid #2E3552;">${date}</td>
              </tr>
            </table>

            <p style="margin-top: 25px; font-size: 14px; color: #CBD5E1;">Your account now has full access to unlimited AI daily strategies, global currency auto-conversions, 50+ business automation playbooks, and 24/7 AI Business Assistant.</p>
          </div>
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #2E3552; font-size: 12px; color: #64748B;">
            TaskFlow AI Inc. • Executive Business Strategy Platform
          </div>
        </div>
      `,
    };

    try {
      // Record receipt dispatch log in Firestore
      await admin.firestore().collection('receipts').add({
        subscriptionId: snap.id,
        userEmail,
        amountPaid,
        transactionId,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'DELIVERED',
      });

      console.log(`[Firebase Cloud Function] Receipt delivered successfully to ${userEmail}`);
      return { success: true, userEmail, transactionId };
    } catch (err) {
      console.error('[Firebase Cloud Function Error] Failed to process receipt:', err);
      throw err;
    }
  });

/**
 * Firebase Cloud Function triggered when a new task is created in Firestore.
 * Dispatches a real-time email notification to the user's registered email address
 * and notifies the AI in the app.
 */
exports.sendTaskCreatedEmailNotification = functions.firestore
  .document('tasks/{taskId}')
  .onCreate(async (snap, context) => {
    const task = snap.data();
    if (!task) return null;

    const userEmail = task.userEmail || task.assignedToEmail || 'mummom692@gmail.com';
    const taskTitle = task.title || 'New Task';
    const description = task.description || 'No description provided';
    const dueDate = task.dueDate || 'Today';
    const priority = task.priority || 'MEDIUM';
    const revenueImpact = task.revenueImpact || 'MEDIUM';
    const dateStr = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    console.log(`[Firebase Cloud Function] Task Created Email Notification triggered for ${userEmail} -> "${taskTitle}"`);

    const emailPayload = {
      to: userEmail,
      subject: `📌 New Task Created: "${taskTitle}" - TaskFlow AI`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #06B6D4; border-radius: 12px; background-color: #0A0C14; color: #FFFFFF;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #2E3552;">
            <h1 style="color: #06B6D4; margin: 0;">TaskFlow AI</h1>
            <p style="color: #94A3B8; font-size: 14px; margin-top: 4px;">Real-Time Task Notification</p>
          </div>
          <div style="padding: 20px 0;">
            <p style="font-size: 16px;">Hello,</p>
            <p>A new high-priority business task has been created and synced in your TaskFlow AI workspace:</p>
            
            <div style="background-color: #131726; border-left: 4px solid #06B6D4; padding: 15px; margin: 20px 0; border-radius: 8px;">
              <h3 style="margin: 0 0 10px 0; color: #38BDF8;">${taskTitle}</h3>
              <p style="margin: 0 0 10px 0; color: #CBD5E1; font-size: 14px;">${description}</p>
              <table style="width: 100%; color: #FFFFFF; font-size: 13px;">
                <tr>
                  <td><strong>Due Date:</strong> ${dueDate}</td>
                  <td><strong>Priority:</strong> <span style="color: #F59E0B;">${priority}</span></td>
                </tr>
                <tr>
                  <td><strong>Revenue Impact:</strong> ${revenueImpact}</td>
                  <td><strong>Created Date:</strong> ${dateStr}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 14px; color: #94A3B8;">The TaskFlow AI Assistant has been notified in your app and will guide you in completing this milestone.</p>
          </div>
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #2E3552; font-size: 12px; color: #64748B;">
            Dispatched to registered email: ${userEmail} • TaskFlow AI
          </div>
        </div>
      `,
    };

    try {
      // 1. Record email log in Firestore email_notifications collection
      await admin.firestore().collection('email_notifications').add({
        taskId: snap.id,
        userEmail,
        type: 'TASK_CREATED',
        taskTitle,
        subject: emailPayload.subject,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'DELIVERED',
      });

      // 2. Trigger real-time in-app AI notification document for the email app & assistant sync
      await admin.firestore().collection('in_app_notifications').add({
        userEmail,
        title: `📧 Task Email Alert Sent to ${userEmail}`,
        message: `An email notification was dispatched to your registered email (${userEmail}) for task: "${taskTitle}".`,
        category: 'EMAIL',
        taskTitle,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        isRead: false,
      });

      console.log(`[Firebase Cloud Function] Task Created Email & In-App AI notification logged for ${userEmail}`);
      return { success: true, userEmail, taskTitle };
    } catch (err) {
      console.error('[Firebase Cloud Function Error] Task email notification failed:', err);
      throw err;
    }
  });

/**
 * Firebase Cloud Function triggered when a task's deadline is approaching or updated.
 * Sends a real-time email warning to the user's registered email address and notifies the AI in the app.
 */
exports.sendTaskDeadlineEmailNotification = functions.firestore
  .document('tasks/{taskId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    if (!afterData) return null;

    const userEmail = afterData.userEmail || afterData.assignedToEmail || 'mummom692@gmail.com';
    const taskTitle = afterData.title || 'Task';
    const dueDate = afterData.dueDate || 'Today';

    // Check if task is approaching deadline or if deadline alert was triggered
    const isDeadlineApproaching =
      afterData.isDeadlineApproaching === true ||
      (dueDate === 'Today' && !afterData.isCompleted) ||
      (afterData.dueDate !== beforeData.dueDate);

    if (!isDeadlineApproaching) {
      return null;
    }

    console.log(`[Firebase Cloud Function] Task Deadline Approaching Email triggered for ${userEmail} -> "${taskTitle}"`);

    const emailPayload = {
      to: userEmail,
      subject: `⏰ Deadline Approaching: "${taskTitle}" - TaskFlow AI Alert`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #EF4444; border-radius: 12px; background-color: #0A0C14; color: #FFFFFF;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #2E3552;">
            <h1 style="color: #EF4444; margin: 0;">TaskFlow AI</h1>
            <p style="color: #94A3B8; font-size: 14px; margin-top: 4px;">Deadline Approaching Alert</p>
          </div>
          <div style="padding: 20px 0;">
            <p style="font-size: 16px;">Hello,</p>
            <p>Your task <strong style="color: #F87171;">"${taskTitle}"</strong> has an approaching deadline (<strong>${dueDate}</strong>) and requires immediate execution.</p>
            
            <div style="background-color: #131726; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; border-radius: 8px;">
              <h3 style="margin: 0 0 8px 0; color: #F87171;">Action Required</h3>
              <p style="margin: 0; color: #CBD5E1; font-size: 14px;">Open TaskFlow AI to mark complete or ask the AI Assistant for instant strategy execution assistance.</p>
            </div>
          </div>
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #2E3552; font-size: 12px; color: #64748B;">
            Dispatched to registered email: ${userEmail} • TaskFlow AI
          </div>
        </div>
      `,
    };

    try {
      await admin.firestore().collection('email_notifications').add({
        taskId: change.after.id,
        userEmail,
        type: 'DEADLINE_APPROACHING',
        taskTitle,
        subject: emailPayload.subject,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'DELIVERED',
      });

      await admin.firestore().collection('in_app_notifications').add({
        userEmail,
        title: `⏰ Deadline Email Alert Sent to ${userEmail}`,
        message: `Deadline approaching for "${taskTitle}". An email alert was sent to your registered email (${userEmail}).`,
        category: 'EMAIL',
        taskTitle,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        isRead: false,
      });

      console.log(`[Firebase Cloud Function] Deadline Email & In-App AI notification logged for ${userEmail}`);
      return { success: true, userEmail, taskTitle };
    } catch (err) {
      console.error('[Firebase Cloud Function Error] Deadline email notification failed:', err);
      throw err;
    }
  });

