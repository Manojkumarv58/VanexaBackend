export default function generateOrderConfirmationTemplate(orderData) {
  const { order, user, orderItems, shippingInfo } = orderData;
  
  const itemsHtml = orderItems.map(item => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 0; display: flex; align-items: center;">
        <img src="${item.image || 'https://placehold.co/60x60/f3f4f6/9ca3af?text=V'}" 
             alt="${item.title}" 
             style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 12px;">
        <div>
          <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #111827;">${item.title}</h4>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Qty: ${item.quantity}</p>
        </div>
      </td>
      <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #111827;">
        ₹${Number(item.price * item.quantity).toLocaleString('en-IN')}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - Vanexa</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
          <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 20px;">
            <div style="width: 40px; height: 40px; background-color: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-weight: 900; font-size: 20px;">V</span>
            </div>
            <span style="color: white; font-size: 24px; font-weight: 900;">Vanexa</span>
          </div>
          <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 800;">Order Confirmed! 🎉</h1>
          <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Thank you for your purchase, ${user.name}!</p>
        </div>

        <!-- Order Details -->
        <div style="padding: 30px;">
          
          <!-- Order Info -->
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #111827;">Order Details</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
              <div>
                <span style="color: #6b7280; font-weight: 500;">Order ID:</span>
                <span style="color: #111827; font-weight: 600; margin-left: 8px;">#${order.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div>
                <span style="color: #6b7280; font-weight: 500;">Order Date:</span>
                <span style="color: #111827; font-weight: 600; margin-left: 8px;">${new Date(order.created_at).toLocaleDateString('en-IN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div>
                <span style="color: #6b7280; font-weight: 500;">Status:</span>
                <span style="background-color: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-left: 8px;">${order.order_status}</span>
              </div>
              <div>
                <span style="color: #6b7280; font-weight: 500;">Payment:</span>
                <span style="background-color: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-left: 8px;">Paid</span>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div style="margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #111827;">Items Ordered</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsHtml}
            </table>
          </div>

          <!-- Shipping Address -->
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #111827;">Shipping Address</h3>
            <div style="font-size: 14px; line-height: 1.5; color: #374151;">
              <strong>${shippingInfo.full_name}</strong><br>
              ${shippingInfo.address}<br>
              ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.pincode}<br>
              ${shippingInfo.country}<br>
              Phone: ${shippingInfo.phone}
            </div>
          </div>

          <!-- Order Summary -->
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #111827;">Order Summary</h3>
            <div style="font-size: 14px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280;">Subtotal:</span>
                <span style="color: #111827; font-weight: 600;">₹${Number(order.total_price - order.tax_price - order.shipping_price).toLocaleString('en-IN')}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280;">Tax (8%):</span>
                <span style="color: #111827; font-weight: 600;">₹${Number(order.tax_price).toLocaleString('en-IN')}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="color: #6b7280;">Shipping:</span>
                <span style="color: #111827; font-weight: 600;">₹${Number(order.shipping_price).toLocaleString('en-IN')}</span>
              </div>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 12px; display: flex; justify-content: space-between;">
                <span style="font-size: 16px; font-weight: 700; color: #111827;">Total:</span>
                <span style="font-size: 16px; font-weight: 700; color: #111827;">₹${Number(order.total_price).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <!-- What's Next -->
          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #0c4a6e;">What's Next?</h3>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #0f172a; line-height: 1.6;">
              <li>We'll process your order within 1-2 business days</li>
              <li>You'll receive a shipping confirmation email with tracking details</li>
              <li>Expected delivery: 3-5 business days</li>
              <li>Track your order anytime in your account dashboard</li>
            </ul>
          </div>

          <!-- Support -->
          <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280;">Need help with your order?</p>
            <a href="mailto:support@vanexa.com" style="color: #6366f1; text-decoration: none; font-weight: 600; font-size: 14px;">Contact Support</a>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            © 2025 Vanexa. All rights reserved.<br>
            This email was sent to ${user.email}
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}