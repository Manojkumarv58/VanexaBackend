import express from "express";
import {
  fetchSingleOrder,
  placeNewOrder,
  fetchMyOrders,
  fetchAllOrders,
  updateOrderStatus,
  deleteOrder,
  cancelOrder,
} from "../controllers/orderController.js";
import {
  isAuthenticated,
  authorizeRoles,
} from "../middlewares/authMiddleware.js";


const router = express.Router();
router.post("/new", isAuthenticated, placeNewOrder);
router.get("/orders/me", isAuthenticated, fetchMyOrders);
router.get("/:orderId", isAuthenticated, fetchSingleOrder);
router.put("/:orderId/cancel", isAuthenticated, cancelOrder);
router.get(
  "/admin/getall",
  isAuthenticated,
  authorizeRoles("Admin"),
  fetchAllOrders
);
router.put(
  "/admin/update/:orderId",
  isAuthenticated,
  authorizeRoles("Admin"),
  updateOrderStatus
);
router.delete(
  "/admin/delete/:orderId",
  isAuthenticated,
  authorizeRoles("Admin"),
  deleteOrder
);

export default router;
