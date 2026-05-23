import ErrorHandler from "../middlewares/errorMiddleware.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import database from "../database/db.js";
import { destroyCloudinaryMedia } from "../utils/cloudinaryMedia.js";

export const getAllUsers = catchAsyncError(async (req, res, next) => {

  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  // Total Users Count
  const totalUsersResult = await database.query(
    "SELECT COUNT(*) FROM users WHERE role = $1",
    ['User']
  );

  const totalUsers = parseInt(totalUsersResult.rows[0].count);

  // Fetch Users with Pagination
  const users = await database.query(
    "SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
    ['User', limit, offset]
  );

  res.status(200).json({
    success: true,
    users: users.rows,
    totalUsers,
    currentPage: page
  });

});
export const deleteUser = catchAsyncError(async (req, res, next) => {
    const { id: userId } = req.params;

    if (userId === req.user.id) {
        return next(new ErrorHandler(400, "Admin cannot delete own account"));
    }

    const user = await database.query("SELECT id, role, avatar FROM users WHERE id=$1", [userId]);

    if (user.rows.length === 0) {
        return next(new ErrorHandler(404, "User not found"));
    }

    if (user.rows[0].role === "Admin") {
        return next(new ErrorHandler(403, "Admin users cannot be deleted from this route"));
    }

    await destroyCloudinaryMedia(user.rows[0].avatar);
    await database.query("DELETE FROM users WHERE id=$1", [userId]);

    res.status(200).json({
        success: true,
        message: "User deleted successfully"
    })
})

export const dashboardStats = catchAsyncError(async (req, res, next) => {

  const today = new Date();

  // 📅 Dates
  const todayDate = today.toISOString().split("T")[0];

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayDate = yesterday.toISOString().split("T")[0];

  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  // 💰 Total Revenue (All Time)
  const totalRevenueRes = await database.query(
    `SELECT COALESCE(SUM(total_price),0) AS total FROM orders`
  );
  const totalRevenueAlltime = parseFloat(totalRevenueRes.rows[0].total);

  // 👤 Total Users
  const totalUsersRes = await database.query(
    `SELECT COUNT(*) FROM users WHERE role = $1`,
    ["User"]
  );
  const totalUsersCount = parseInt(totalUsersRes.rows[0].count);

  // 📦 Order Status Count
  const orderStatusRes = await database.query(
    `SELECT order_status, COUNT(*) FROM orders GROUP BY order_status`
  );

  const orderStatusCount = {
    Processing: 0,
    Shipped: 0,
    Delivered: 0,
    Cancelled: 0,
  };

  orderStatusRes.rows.forEach(row => {
    orderStatusCount[row.order_status] = parseInt(row.count);
  });

  // 📅 Today Revenue
  const todayRevenueRes = await database.query(
    `SELECT COALESCE(SUM(total_price),0) AS total 
     FROM orders WHERE paid_at::date = $1`,
    [todayDate]
  );
  const todayRevenue = parseFloat(todayRevenueRes.rows[0].total);

  // 📅 Yesterday Revenue
  const yesterdayRevenueRes = await database.query(
    `SELECT COALESCE(SUM(total_price),0) AS total 
     FROM orders WHERE paid_at::date = $1`,
    [yesterdayDate]
  );
  const yesterdayRevenue = parseFloat(yesterdayRevenueRes.rows[0].total);

  // 📊 Monthly Sales (Line Chart)
  const monthlySalesRes = await database.query(`
    SELECT 
      TO_CHAR(created_at, 'Mon YYYY') AS month,
      DATE_TRUNC('month', created_at) AS date,
      COALESCE(SUM(total_price),0) AS totalsales
    FROM orders
    GROUP BY month, date
    ORDER BY date ASC
  `);

  const monthlySales = monthlySalesRes.rows.map(row => ({
    month: row.month,
    totalSales: parseFloat(row.totalsales),
  }));

  // 🔥 Top 5 Products
  const topProductsRes = await database.query(`
    SELECT 
      p.name,
      p.images->0->>'url' AS image,
      p.category,
      p.ratings,
      SUM(oi.quantity) AS total_sold
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    GROUP BY p.name, p.images, p.category, p.ratings
    ORDER BY total_sold DESC
    LIMIT 5
  `);

  const topProducts = topProductsRes.rows;

  // 📆 Current Month Sales
  const currentMonthRes = await database.query(
    `SELECT COALESCE(SUM(total_price),0) AS total 
     FROM orders 
     WHERE created_at BETWEEN $1 AND $2`,
    [currentMonthStart, currentMonthEnd]
  );

  const currentMonthSales = parseFloat(currentMonthRes.rows[0].total);

  // 📆 Last Month Sales
  const lastMonthRes = await database.query(
    `SELECT COALESCE(SUM(total_price),0) AS total 
     FROM orders 
     WHERE created_at BETWEEN $1 AND $2`,
    [previousMonthStart, previousMonthEnd]
  );

  const lastMonthRevenue = parseFloat(lastMonthRes.rows[0].total);

  // 📈 Growth %
  let revenueGrowthRate = "0%";
  if (lastMonthRevenue > 0) {
    revenueGrowthRate = (
      ((currentMonthSales - lastMonthRevenue) / lastMonthRevenue) * 100
    ).toFixed(2) + "%";
  }

  // ⚠️ Low Stock
  const lowStockRes = await database.query(
    `SELECT name, stock FROM products WHERE stock <= 5 ORDER BY stock ASC`
  );

  const lowStockProducts = lowStockRes.rows;

  // 🆕 New Users This Month
  const newUsersRes = await database.query(
    `SELECT COUNT(*) FROM users 
     WHERE role = $1 AND created_at BETWEEN $2 AND $3`,
    ["User", currentMonthStart, currentMonthEnd]
  );

  const newUsersThisMonth = parseInt(newUsersRes.rows[0].count);

  // 🚀 FINAL RESPONSE
  res.status(200).json({
    success: true,
    message: "Dashboard stats fetched successfully",

    totalRevenueAlltime,
    todayRevenue,
    yesterdayRevenue,

    totalUsersCount,
    newUsersThisMonth,

    orderStatusCount,

    monthlySales,
    topProducts,

    currentMonthSales,
    lastMonthRevenue,
    revenueGrowthRate,

    lowStockProducts,
  });

});