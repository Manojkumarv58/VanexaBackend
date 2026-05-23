import crypto from "crypto";
import database from "../database/db.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { sendEmail } from '../utils/sendEmail.js';
import generateOrderConfirmationTemplate from '../utils/generateOrderConfirmationTemplate.js';

export const verifyPayment = catchAsyncError(async (req, res, next) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return next(new ErrorHandler(400, "Payment verification details are required"));
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: "Invalid payment signature",
    });
  }

  const paymentResult = await database.query(
    `SELECT order_id
     FROM payments
     WHERE payment_intent_id = $1`,
    [razorpay_order_id]
  );

  if (paymentResult.rows.length === 0) {
    return next(new ErrorHandler(404, "Payment record not found"));
  }

  const { order_id: orderId } = paymentResult.rows[0];

  await database.query("BEGIN");

  try {
    await database.query(
      `UPDATE payments
       SET payment_status = 'Paid',
           payment_intent_id = $2,
           gateway_payment_id = $3,
           gateway_signature = $4
       WHERE order_id = $1`,
      [orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature]
    );

    await database.query(
      `UPDATE orders
       SET paid_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [orderId]
    );

    await database.query("COMMIT");

    // Send order confirmation email after successful payment
    try {
      await sendOrderConfirmationEmail(orderId);
      console.log('✅ Order confirmation email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email:', emailError.message);
      // Don't fail the payment verification if email fails
    }

  } catch (error) {
    await database.query("ROLLBACK");
    throw error;
  }

  res.json({
    success: true,
    message: "Payment verified successfully",
    orderId,
    razorpay_payment_id,
  });
});

// Helper function to send order confirmation email
async function sendOrderConfirmationEmail(orderId) {
  try {
    // Fetch complete order details with user info, items, and shipping
    const orderQuery = `
      SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email,
        COALESCE(
          json_agg(
            json_build_object(
              'title', oi.title,
              'quantity', oi.quantity,
              'price', oi.price,
              'image', oi.image
            )
          ) FILTER (WHERE oi.id IS NOT NULL), '[]'
        ) AS order_items,
        json_build_object(
          'full_name', s.full_name,
          'address', s.address,
          'city', s.city,
          'state', s.state,
          'country', s.country,
          'pincode', s.pincode,
          'phone', s.phone
        ) AS shipping_info
      FROM orders o
      LEFT JOIN users u ON o.buyer_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN shipping_info s ON o.id = s.order_id
      WHERE o.id = $1
      GROUP BY o.id, u.id, s.id
    `;

    const result = await database.query(orderQuery, [orderId]);
    
    if (result.rows.length === 0) {
      throw new Error('Order not found');
    }

    const orderData = result.rows[0];
    
    // Prepare data for email template
    const emailData = {
      order: orderData,
      user: {
        name: orderData.user_name,
        email: orderData.user_email
      },
      orderItems: orderData.order_items,
      shippingInfo: orderData.shipping_info
    };

    // Generate email HTML
    const emailHtml = generateOrderConfirmationTemplate(emailData);

    // Send email
    await sendEmail({
      email: orderData.user_email,
      subject: `Order Confirmation - #${orderId.slice(0, 8).toUpperCase()} | Vanexa`,
      message: emailHtml
    });

    console.log(`📧 Order confirmation email sent to: ${orderData.user_email}`);
    
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error.message);
    throw error;
  }
}
