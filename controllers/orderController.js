import ErrorHandler from "../middlewares/errorMiddleware.js"; // kya: error class
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import database from "../database/db.js";  
import razorpay from '../utils/razorpay.js';
import { sendEmail } from '../utils/sendEmail.js';
import generateOrderConfirmationTemplate from '../utils/generateOrderConfirmationTemplate.js';
import generateOrderStatusTemplate from '../utils/generateOrderStatusTemplate.js';

export const placeNewOrder = catchAsyncError(async (req, res, next) => {
  const { full_name, state, city, country, address, pincode, phone, orderdItems } = req.body;

  if (!full_name || !state || !city || !country || !address || !pincode || !phone) {
    return next(new ErrorHandler(400,"Please Provide All The Required Fields"));
  }

  let items;
  try {
    items = Array.isArray(orderdItems) ? orderdItems : JSON.parse(orderdItems);
  } catch {
    return next(new ErrorHandler(400, "Invalid order items payload"));
  }

  if (!items || items.length === 0) {
    return next(new ErrorHandler(400,"Order Items Cannot Be Empty"));
  }

  const productIds = items.map(item => item.product.id);

  const { rows: products } = await database.query(
    `SELECT id, price, stock, name FROM products WHERE id = ANY($1::uuid[])`,
    [productIds]
  );

  let totalPrice = 0;

  for (const item of items) {
    const product = products.find(p => p.id === item.product.id);

    if (!product) {
      throw new ErrorHandler(400,`Product not found`);
    }

    if (item.quantity > product.stock) {
      throw new ErrorHandler(400,`Insufficient stock for ${product.name}`);
    }

    totalPrice += product.price * item.quantity;
  }

  const tax_amount = Math.round(totalPrice * 0.08);
  const shipping_price = 50;

  totalPrice = totalPrice + tax_amount + shipping_price;

  let orderId;
  let razorpayOrder;

  await database.query("BEGIN");

  try {
    const orderResult = await database.query(
      `INSERT INTO orders (buyer_id, total_price, tax_price, shipping_price) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [req.user.id, totalPrice, tax_amount, shipping_price]
    );

    orderId = orderResult.rows[0].id;

    const values = [];
    const placeholders = [];

    items.forEach((item, index) => {
      const product = products.find(p => p.id === item.product.id);

      values.push(
        orderId,
        product.id,
        item.quantity,
        product.price,
        item.product.images?.[0]?.url || "",
        product.name
      );

      const offset = index * 6;

      placeholders.push(
        `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`
      );
    });

    await database.query(
      `INSERT INTO order_items 
      (order_id, product_id, quantity, price, image, title) 
      VALUES ${placeholders.join(", ")}`,
      values
    );

    await database.query(
      `INSERT INTO shipping_info 
      (order_id, full_name, state, city, country, address, pincode, phone) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [orderId, full_name, state, city, country, address, pincode, phone]
    );

    const razorpayReceipt = `rcpt_${orderId.replace(/-/g, "").slice(0, 20)}`;

    razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(totalPrice) * 100),
      currency: "INR",
      receipt: razorpayReceipt,
      notes: {
        orderId,
        buyerId: req.user.id,
      },
    });

    await database.query(
      `INSERT INTO payments (order_id, payment_type, payment_status, payment_intent_id)
       VALUES ($1, 'Online', 'Pending', $2)`,
      [orderId, razorpayOrder.id]
    );

    await database.query("COMMIT");
  } catch (error) {
    await database.query("ROLLBACK");
    throw error;
  }

  res.status(201).json({
    success: true,
    message: "Order created and payment initiated successfully",
    orderId,
    totalPrice,
    razorpayOrder,
  });

});

export const fetchSingleOrder = catchAsyncError(async (req, res, next) => {

  const {orderId} = req.params;
  const result = await database.query(`SELECT 
    o.*, 
    COALESCE(
        json_agg(
            json_build_object(
                'order_item_id', oi.id,
                'order_id', oi.order_id,
                'product_id', oi.product_id,
                'quantity', oi.quantity,
                'price', oi.price
            )
        ) FILTER (WHERE oi.id IS NOT NULL), '[]'
    ) AS order_items,
    json_build_object(
        'full_name', s.full_name,
        'state', s.state,
        'city', s.city,
        'country', s.country,
        'address', s.address,
        'pincode', s.pincode,
        'phone', s.phone
    ) AS shipping_info
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN shipping_info s ON o.id = s.order_id
WHERE o.id = $1
GROUP BY o.id, s.id;
`,[orderId]);

  if(result.rows.length===0){ 
    return next(new ErrorHandler(404,"Order Not Found"));
  }
       res.status(200).json({
        success:true,
        message:"Order fetched successfully",
        order:result.rows[0]
       })

})
export const fetchMyOrders = catchAsyncError(async (req, res, next) => {

const result=await database.query(`SELECT o.*, COALESCE(
    json_agg(
      json_build_object(
          'order_item_id', oi.id,
                'order_id', oi.order_id,
                'product_id', oi.product_id,
                'quantity', oi.quantity,
                'price', oi.price,
                'image', oi.image,
                'title', oi.title
      ) 
    ) FILTER (WHERE oi.id IS NOT NULL), '[]'
    ) AS order_items,
       json_build_object(
        'full_name', s.full_name,
        'state', s.state,
        'city', s.city,
        'country', s.country,
        'address', s.address,
        'pincode', s.pincode,
        'phone', s.phone
    ) AS shipping_info 
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN shipping_info s ON o.id = s.order_id
WHERE o.buyer_id = $1
GROUP BY o.id, s.id
`,[req.user.id]);

       res.status(200).json({
        success:true,
        message:"Orders fetched successfully",
        orders:result.rows
       })

})
export const fetchAllOrders = catchAsyncError(async (req, res, next) => {

const result=await database.query(`SELECT o.*,
    COALESCE(json_agg(
      json_build_object(
        'order_item_id', oi.id,
                'order_id', oi.order_id,
                'product_id', oi.product_id,
                'quantity', oi.quantity,
                'price', oi.price,
                'image', oi.image,
                'title', oi.title
      )
    ) FILTER (WHERE oi.id IS NOT NULL), '[]' ) AS order_items, json_build_object(
    'full_name', s.full_name,
        'state', s.state,
        'city', s.city,
        'country', s.country,
        'address', s.address,
        'pincode', s.pincode,
        'phone', s.phone 
    ) AS shipping_info
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     LEFT JOIN shipping_info s ON o.id = s.order_id
     GROUP BY o.id, s.id
`,)

res.status(200).json({
    success:true,
    message:"All Orders fetched successfully",
    orders:result.rows
  })
})
export const updateOrderStatus = catchAsyncError(async (req, res, next) => {
const {orderId} = req.params;
const {status, sendEmail: shouldSendEmail = false} = req.body;
if(!status){
  return next(new ErrorHandler(400,"Please Provide New Status"));
}
const result=await database.query(`SELECT * FROM orders WHERE id = $1`,[orderId]);

if(result.rows.length===0){
  return next(new ErrorHandler(404,"Order Not Found"));
}
  const updateResult=await database.query(`UPDATE orders SET order_status = $1 WHERE id = $2 RETURNING *`,[status, orderId]);

  // Send status update email if requested
  if (shouldSendEmail) {
    try {
      await sendOrderStatusUpdateEmail(orderId, status);
      console.log('✅ Order status update email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send status update email:', emailError.message);
      // Don't fail the status update if email fails
    }
  }

  res.status(200).json({
    success:true,
    message:"Order status updated successfully",
    order:updateResult.rows[0]
  })

});
export const deleteOrder = catchAsyncError(async (req, res, next) => {
const {orderId} = req.params;

const result=await database.query(`DELETE FROM orders WHERE id = $1 RETURNING *`,[orderId]);

if(result.rows.length===0){
  return next(new ErrorHandler(404,"Order Not Found"));
}
res.status(200).json({
  success:true,
  message:"Order deleted successfully",
  order:result.rows[0]
})



})

export const cancelOrder = catchAsyncError(async (req, res, next) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  await database.query("BEGIN");

  try {
    // Check if order exists and belongs to user
    const orderResult = await database.query(
      `SELECT o.*, p.gateway_payment_id, p.payment_status 
       FROM orders o 
       LEFT JOIN payments p ON o.id = p.order_id 
       WHERE o.id = $1 AND o.buyer_id = $2`,
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      await database.query("ROLLBACK");
      return next(new ErrorHandler(404, "Order Not Found"));
    }

    const order = orderResult.rows[0];

    // Only allow cancellation if order is in Processing status
    if (order.order_status !== 'Processing') {
      await database.query("ROLLBACK");
      return next(new ErrorHandler(400, "Order cannot be cancelled. It has already been shipped or delivered."));
    }

    // Check if payment was successful
    if (order.payment_status !== 'Paid' || !order.gateway_payment_id) {
      await database.query("ROLLBACK");
      return next(new ErrorHandler(400, "Cannot process refund. Payment not found or not completed."));
    }

    let refundResult = null;
    let refundStatus = 'Processing';

    // Process refund through Razorpay
    try {
      refundResult = await razorpay.payments.refund(order.gateway_payment_id, {
        amount: Math.round(Number(order.total_price) * 100), // Amount in paise
        notes: {
          reason: 'Order cancelled by customer',
          order_id: orderId,
          user_id: userId
        }
      });
      
      refundStatus = 'Processed';
      console.log('Refund processed successfully:', refundResult.id);
    } catch (refundError) {
      console.error('Refund processing failed:', refundError);
      // Continue with cancellation even if refund fails - can be processed manually
      refundStatus = 'Failed - Manual Processing Required';
    }

    // Update order status to Cancelled
    const updateResult = await database.query(
      `UPDATE orders SET order_status = $1 WHERE id = $2 RETURNING *`,
      ['Cancelled', orderId]
    );

    // Add refund information to payments table
    await database.query(
      `UPDATE payments 
       SET payment_status = $1, 
           gateway_signature = $2 
       WHERE order_id = $3`,
      ['Refunded', refundResult ? JSON.stringify({
        refund_id: refundResult.id,
        refund_status: refundStatus,
        refunded_at: new Date().toISOString(),
        refund_amount: refundResult ? refundResult.amount : order.total_price * 100
      }) : JSON.stringify({
        refund_status: refundStatus,
        refunded_at: new Date().toISOString(),
        refund_amount: order.total_price * 100
      }), orderId]
    );

    await database.query("COMMIT");

    res.status(200).json({
      success: true,
      message: refundStatus === 'Processed' 
        ? "Order cancelled successfully. Refund has been processed and will reflect in your account within 5-7 business days."
        : "Order cancelled successfully. Refund will be processed manually within 5-7 business days.",
      order: updateResult.rows[0],
      refund: {
        status: refundStatus,
        amount: order.total_price,
        refund_id: refundResult?.id || null,
        estimated_days: '5-7 business days'
      }
    });

  } catch (error) {
    await database.query("ROLLBACK");
    console.error('Order cancellation error:', error);
    return next(new ErrorHandler(500, "Failed to cancel order. Please try again."));
  }
});

// Helper function to send order status update email
async function sendOrderStatusUpdateEmail(orderId, status) {
  try {
    // Fetch order details with user info
    const orderQuery = `
      SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.buyer_id = u.id
      WHERE o.id = $1
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
      status: status
    };

    // Generate email HTML
    const emailHtml = generateOrderStatusTemplate(emailData);

    // Send email
    await sendEmail({
      email: orderData.user_email,
      subject: `Order Update: ${status} - #${orderId.slice(0, 8).toUpperCase()} | Vanexa`,
      message: emailHtml
    });

    console.log(`📧 Order status update email sent to: ${orderData.user_email}`);
    
  } catch (error) {
    console.error('❌ Error sending order status update email:', error.message);
    throw error;
  }
}