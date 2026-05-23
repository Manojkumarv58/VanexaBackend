import {catchAsyncError} from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import database from '../database/db.js';
import {getAIRecommendation} from "../utils/getAIRecomendation.js";
import { destroyCloudinaryMedia, toFileArray, uploadProductMedia } from "../utils/cloudinaryMedia.js";

function getProductMediaFiles(files = {}) {
  return [
    ...toFileArray(files.images),
    ...toFileArray(files.image),
    ...toFileArray(files.videos),
    ...toFileArray(files.video),
    ...toFileArray(files.media),
  ];
}

export const createProduct = catchAsyncError(async (req, res, next) => {  
    
    const {name, description, price, category, stock} = req.body;
    const  created_by = req.user.id;    
    if (!name || !description || !price || !category || !stock) {
        return next(new ErrorHandler(400, "Please Provide All Required Fields"));
    }

    let media = [];
    const productMediaFiles = getProductMediaFiles(req.files);

    if (productMediaFiles.length > 0) {
        media = await uploadProductMedia(productMediaFiles);
    }

    let product;

    try {
        product= await database.query(
            `INSERT INTO products (name, description, price, category, stock, created_by, images) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [name, description, price, category, stock, created_by, JSON.stringify(media)]
        );
    } catch (error) {
        await destroyCloudinaryMedia(media);
        throw error;
    }
    res.status(201).json({
        success: true,
        message: "Product Created Successfully",
        product: product.rows[0],
    });

 })

 export const fetchAllProducts = catchAsyncError(async (req, res, next) => {
   const {availability,price,category,ratings,search}=req.query;
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 10;
   const offset = (page - 1) * limit;
  
   const condition=[];
   const values=[];
   let index=1;
   let paginationHolders={};

// availability filter
   if(availability==='in_stock'){
    condition.push(`stock > 5`);
   }else if(availability==='limited'){
    condition.push(`stock>0 AND stock <= 5`);
   }else if(availability==='out_of_stock'){
    condition.push(`stock=0`);
   }


//    price filter
   if(price){
    const [minPrice, maxPrice] = price.split('-').map(Number);
    condition.push(`price BETWEEN $${index} AND $${index + 1}`);
    values.push(minPrice, maxPrice);
    index += 2;
   }

// category filter - exact match only
   if(category){
    condition.push(`category = $${index}`);
    values.push(category);
    index++;
   }

// rating filter
   if(ratings){
    condition.push(`ratings >= $${index}`);
    values.push(ratings);
    index++;
   }

// search filter
   if(search){
    condition.push(`(p.name ILIKE $${index} OR p.description ILIKE $${index + 1})`);
    values.push(`%${search}%`, `%${search}%`);
    index += 2;
   }
 
   const whereClause = condition.length > 0 ? `WHERE ${condition.join(' AND ')}` : "";
    
    const totalProductsResult = await database.query(`SELECT COUNT(*) FROM products p ${whereClause}`, values);
    const totalProducts = parseInt(totalProductsResult.rows[0].count, 10);
    
    paginationHolders.limit=`${index}`;
    values.push(limit);
    index++;

    paginationHolders.offset=`${index}`;
    values.push(offset);
    index++;
  
    //  Fetch with Reviews
    const query = 
        `SELECT p.*, COUNT(r.id) AS review_count FROM products p LEFT JOIN reviews r ON p.id = r.product_id ${whereClause} GROUP BY p.id ORDER BY p.created_at DESC LIMIT $${paginationHolders.limit} OFFSET $${paginationHolders.offset}`;
    const result=await database.query(query, values);
    
    // for fetching new products
    const newProductsQuery = `SELECT p.*, COUNT(r.id) AS review_count FROM products p LEFT JOIN reviews r ON p.id = r.product_id WHERE p.created_at >= NOW() - INTERVAL '10 days' GROUP BY p.id ORDER BY p.created_at DESC LIMIT 8`;
 const newProductResult = await database.query(newProductsQuery);
   
// top rated products
 const topRatedProductsQuery = `SELECT p.*, COUNT(r.id) AS review_count FROM products p LEFT JOIN reviews r ON p.id = r.product_id WHERE p.ratings>=4.5 GROUP BY p.id ORDER BY AVG(r.rating) DESC LIMIT 8`;
 const topRatedProductResult = await database.query(topRatedProductsQuery);

 res.status(200).json({
    success: true,
    products: result.rows,
    totalProducts,
    newProducts: newProductResult.rows,
    topRatedProducts: topRatedProductResult.rows,
})
 })


 export const updateProduct = catchAsyncError(async (req, res, next) => {   
      const {productId}=req.params;
      const {name, description, price, category, stock}=req.body;
      if (!name || !description || !price || !category || !stock) {
        return next(new ErrorHandler(400, "Please Provide All Required Fields"));
        }
         const product=await database.query(`SELECT * FROM products WHERE id=$1`, [productId]);
           if(product.rows.length===0){
             return next(new ErrorHandler(404, "Product Not Found"));
              }

        const oldMedia = product.rows[0].images || [];
        const productMediaFiles = getProductMediaFiles(req.files);
        let media = oldMedia;
        let newMedia = null;

        if (productMediaFiles.length > 0) {
            newMedia = await uploadProductMedia(productMediaFiles);
            media = newMedia;
        }

        let updatedProduct;

        try {
            updatedProduct=await database.query(
                `UPDATE products SET name=$1, description=$2, price=$3, category=$4, stock=$5, images=$6 WHERE id=$7 RETURNING *`,
                [name, description, price, category, stock, JSON.stringify(media || []), productId]
            );
        } catch (error) {
            if (newMedia) {
                await destroyCloudinaryMedia(newMedia);
            }
            throw error;
        }

        if (newMedia) {
            await destroyCloudinaryMedia(oldMedia);
        }
        res.status(200).json({
            success: true,
            message: "Product Updated Successfully",
            product: updatedProduct.rows[0],
        });

 })

export const deleteProduct = catchAsyncError(async (req, res, next) => {

  const { productId } = req.params;

  // 1️⃣ get product
  const productRes = await database.query(
    `SELECT * FROM products WHERE id = $1`,
    [productId]
  );

  if (productRes.rows.length === 0) {
    return next(new ErrorHandler(404, "Product Not Found"));
  }

  const product = productRes.rows[0];

  // 2️⃣ delete product media from cloudinary
  await destroyCloudinaryMedia(product.images);

  // 3️⃣ delete product from DB
  await database.query(
    `DELETE FROM products WHERE id = $1`,
    [productId]
  );

  // 4️⃣ response
  res.status(200).json({
    success: true,
    message: "Product and images deleted successfully",
  });

});


export const fetchSingleProduct = catchAsyncError(async (req, res, next) => {

  const { productId } = req.params;

  const result = await database.query(
    `SELECT 
      p.*,

      COALESCE(
        json_agg(
          json_build_object(
            'review_id', r.id,
            'user_id', r.user_id,
            'rating', r.rating,
            'comment', r.comment,
            'created_at', r.created_at
          )
        ) FILTER (WHERE r.id IS NOT NULL), '[]'
      ) AS reviews,

      COUNT(r.id) AS review_count,
      COALESCE(AVG(r.rating),0) AS avg_rating

    FROM products p
    LEFT JOIN reviews r ON p.id = r.product_id
    WHERE p.id = $1
    GROUP BY p.id`,
    [productId]
  );

  if (result.rows.length === 0) {
    return next(new ErrorHandler(404, "Product not found"));
  }

  res.status(200).json({
    success: true,
    product: result.rows[0],
  });

});
export const postProductReview = catchAsyncError(async (req, res, next) => { 

const {productId}=req.params;
const {rating, comment}=req.body;
if(!rating || !comment){
    return next(new ErrorHandler(400, "Please Provide All Required Fields"));
}

const productPurchaseQuery=`SELECT oi.product_id FROM order_items oi JOIN orders o ON oi.order_id=o.id 
JOIN payments p ON o.id=p.order_id WHERE oi.product_id=$1 AND o.buyer_id=$2 AND  p.payment_status='paid'
LIMIT 1`;

const {rows}=await database.query(productPurchaseQuery, [productId, req.user.id]);

if(rows.length===0){
    return res.status(403).json({
        success: false,
        message: "You can only review products you have purchased",
    });
}

const product=await database.query(`SELECT * FROM products WHERE id=$1`, [productId]);
if(product.rows.length===0){
    return next(new ErrorHandler(404, "Product Not Found"));
  }
const isAlreadyReviewed=await database.query(`SELECT * FROM reviews WHERE product_id=$1 AND user_id=$2`, [productId, req.user.id]);
let review;
if(isAlreadyReviewed.rows.length>0){
    review=await database.query(`UPDATE reviews SET rating=$1, comment=$2 WHERE product_id=$3 AND user_id=$4 RETURNING *`, [rating, comment, productId, req.user.id]);
}else{
    review=await database.query(`INSERT INTO reviews (product_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *`, [productId, req.user.id, rating, comment]);
}
const allReviews=await database.query(`SELECT AVG(rating) AS avg_rating FROM reviews WHERE product_id=$1`, [productId]);
await database.query(`UPDATE products SET ratings=$1 WHERE id=$2`, [allReviews.rows[0].avg_rating, productId]);

res.status(200).json({
    success: true,
    message: isAlreadyReviewed.rows.length>0 ? "Review Updated Successfully" : "Review Added Successfully",
    review: review.rows[0],
    productRatings: allReviews.rows[0].avg_rating,
})

})
export const deleteReview = catchAsyncError(async (req, res, next) => {
    const {productId}=req.params;
    const review=await database.query(`SELECT * FROM reviews WHERE product_id=$1 AND user_id=$2`, [productId, req.user.id]);

    if(review.rows.length===0){
        return next(new ErrorHandler(404, "Review Not Found"));
    }
    await database.query(`DELETE FROM reviews WHERE product_id=$1 AND user_id=$2`, [productId, req.user.id]);
    const allReviews=await database.query(`SELECT AVG(rating) AS avg_rating FROM reviews WHERE product_id=$1`, [productId]);
    await database.query(`UPDATE products SET ratings=$1 WHERE id=$2`, [allReviews.rows[0].avg_rating, productId]);
   res.status(200).json({
    success: true,
    message: "Review Deleted Successfully",
    productRatings: allReviews.rows[0].avg_rating,
   })
})



export const fetchAIFilteredProducts = catchAsyncError(async (req, res, next) => {

  const { query } = req.body;
  const searchQuery = typeof query === "string" ? query.trim() : "";

  if (!searchQuery) {
    return next(new ErrorHandler(400, "Please Provide Search Query"));
  }

  // 🧠 stop words
  const stopWords = new Set([
    "the","they","them","then","i","we","you","he","she","it","is",
    "a","an","of","and","or","to","for","from","on","who","whom",
    "why","when","which","with","this","that","in","at","by","be",
    "not","was","were","has","have","had","do","does","did","so",
    "some","any","how","can","could","should","would","there","here",
    "just","than","because","but","its","it's","if"
  ]);

  // 🔍 keyword extraction (FIXED)
  const keywords = searchQuery
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !stopWords.has(word))
    .map(word => `%${word}%`);

  // 🛑 fallback empty
  if (keywords.length === 0) {
    return res.status(200).json({
      success: true,
      products: [],
      recommendations: [],
    });
  }

  // 🚀 DB fetch (LIMIT for performance 🔥)
  const dbResult = await database.query(
    `SELECT id, name, description, price, category, ratings, images 
     FROM products 
     WHERE name ILIKE ANY($1) 
     OR description ILIKE ANY($1)
     OR category ILIKE ANY($1)
     ORDER BY ratings DESC NULLS LAST, created_at DESC
     LIMIT 50`,
    [keywords]
  );

  const products = dbResult.rows;

  // 🛑 no products
  if (products.length === 0) {
    return res.status(200).json({
      success: true,
      products: [],
      recommendations: [],
    });
  }

  const recommendations = await getAIRecommendation(searchQuery, products);

  return res.status(200).json({
    success: true,
    products,
    recommendations,
  });

});
