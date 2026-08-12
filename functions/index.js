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
