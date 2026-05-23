import  createUserTable  from "../models/userTable.js";
import  createOrderItemsTable  from "../models/orderitemsTable.js";
import  createOrdersTable  from "../models/ordersTable.js";
import  createPaymentsTable  from "../models/paymentsTable.js";
import  createProductsTable  from "../models/productTable.js";
import  createShippingInfoTable  from "../models/shippinginfoTable.js";
import createReviewsTable  from "../models/productReviewsTable.js";



export const createTables = async () => {
    try {
        await createUserTable(); 
        await createProductsTable();
        await createReviewsTable(); 
        await createOrdersTable();
        await createOrderItemsTable();
        await createShippingInfoTable();
        await createPaymentsTable();

    }
        catch (error) {
        console.error("Error creating tables:", error);
    }}