export default function generateOrderStatusTemplate(orderData) {
  const { order, user, status } = orderData;
  
  const statusConfig = {
    'Processing': {
      color: '#3b82f6',
      bgColor: '#dbeafe',
      icon: '⏳',
      title: 'Order is Being Processed',
      message: 'We\'ve received your order and are preparing it for shipment.'
    },
    'Shipped': {
      color: '#f59e0b',
      bgColor: '#fef3c7',
      icon: '🚚',
      title: 'Order Shipped',
      message: 'Your order is on its way! You should receive it within 2-3 business days.'
    },
    'Delivered': {
      color: '#10b981',
      bgColor: '#d1fae5',
      icon: '✅',
      title: 'Order Delivered',
      message: 'Your order has been successfully delivered. Thank you for shopping with Vanexa!'
    },
    'Cancelled': {
      color: '#ef4444',
      bgColor: '#fee2e2',
      icon: '❌',
      title: 'Order Cancelled',
      message: 'Your order has been cancelled. If you paid online, your refund will be processed within 5-7 business days.'
    }
  };

  const config = statusConfig[status] || statusConfig['Processing'];

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Update - Vanexa</title>
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
          <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 800;">Order Update ${config.icon}</h1>
          <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Hi ${user.name}!</p>
        </div>

        <!-- Status Update -->
        <div style="padding: 30px;">
          
          <!-- Status Info -->
          <div style="background-color: ${config.bgColor}; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 12px;">${config.icon}</div>
            <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #111827;">${config.title}</h2>
            <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.5;">${config.message}</p>
          </div>

          <!-- Order Details -->
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #111827;">Order Details</h3>
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
                <span style="background-color: ${config.bgColor}; color: ${config.color}; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-left: 8px;">${status}</span>
              </div>
              <div>
                <span style="color: #6b7280; font-weight: 500;">Total:</span>
                <span style="color: #111827; font-weight: 600; margin-left: 8px;">₹${Number(order.total_price).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          ${status === 'Shipped' ? `
          <!-- Tracking Info -->
          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #0c4a6e;">Track Your Order</h3>
            <p style="margin: 0 0 12px 0; font-size: 14px; color: #0f172a;">Your order is on its way! Expected delivery: 2-3 business days</p>
            <a href="#" style="display: inline-block; background-color: #0ea5e9; color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">Track Package</a>
          </div>
          ` : ''}

          ${status === 'Delivered' ? `
          <!-- Review Request -->
          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #166534;">How was your experience?</h3>
            <p style="margin: 0 0 16px 0; font-size: 14px; color: #15803d;">We'd love to hear about your shopping experience!</p>
            <a href="#" style="display: inline-block; background-color: #16a34a; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">Leave a Review</a>
          </div>
          ` : ''}

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