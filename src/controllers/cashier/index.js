import { ValidationError } from "yup"
import handlebars from "handlebars"
import fs from "fs"
import path from "path"
import moment from "moment"
import cloudinary from 'cloudinary'

import * as config from "../../config/index.js"
import * as helpers from "../../helpers/index.js"
import * as error from "../../middlewares/error.handler.js"
import { User, Category, Product, Transaction, ProductSold, Payment, SalesReport } from "../../models/relation.js"
import db from "../../database/index.js"
import * as validation from "./validation.js"

//@get all categories
export const getCategory = async (req, res, next) => {
    try {
      const categories = await Category.findAll();
      //@send response
      res.status(200).json({ result: categories });
    } catch (error) {
      next(error);
    }
  };

// @get product list
export const getProductList = async (req, res, next) => {
    try {
      // @get query parameters
      const { id_cat, sort, page, search } = req.query;
  
      // @Pagination
      // @maximum Product per page
      const pageSize = 10;
      let offset = 0;
      let limit = pageSize;
      let currentPage = 1;
  
      if (page && !isNaN(page)) {
        currentPage = parseInt(page);
        offset = (currentPage - 1) * pageSize;
      }
  
      let queryOptions = {
        attributes: ["productId", "productName", "price", "productImg"], // Add product attributes to display
        include: [
          {
            model: Category,
            attributes: ["categoryId", "categoryName"],
          },
        ],
        where: { isDeactive: 0 }, // Filter out active products only
        offset,
        limit,
      };
  
      // @query based on parameters
      if (id_cat) {
        queryOptions.where.categoryId = id_cat;
      }
  
      if (search) {
        queryOptions.where.productName = { [Op.like]: `%${search}%` };
      }
  
      // @sort product by alphabetical (A-Z & Z-A) order and price order (Ascending & Descending)
      if (sort === "name_asc") {
        queryOptions.order = [["productName", "ASC"]];
      } else if (sort === "name_desc") {
        queryOptions.order = [["productName", "DESC"]];
      } else if (sort === "price_asc") {
        queryOptions.order = [["productPrice", "ASC"]];
      } else if (sort === "price_desc") {
        queryOptions.order = [["productPrice", "DESC"]];
      } else {
        // Default sorting by product name in ascending order if no valid sort option provided
        queryOptions.order = [["productName", "ASC"]];
      }
  
      const { count, rows: products } = await Product.findAndCountAll(queryOptions);
  
      const totalPages = Math.ceil(count / pageSize);
  
      // @send response
      res.status(200).json({
        totalProducts: count,
        productsLimit: limit,
        totalPages: totalPages,
        currentPage: currentPage,
        result: products,
      });
    } catch (error) {
      next(error);
    }
  };
  
// @create transaction
export const createTransaction = async (req, res, next) => {
    try{
        const { products } = req.body; // Frontend sends an array of { productId, qty }

        // Step 1: Create a new transaction record
        const { uuid } = req.cashier;
        const cashier = await User?.findOne({ where: { uuid } });
        const cashierId = cashier.userId;

        const transaction = await Transaction?.create({
        userId: cashierId,
        createdAt: new Date(),
        total: 0,
        });

        let total = 0;

        // Step 2: Add products to the transaction and calculate the total
        for (const product of products) {
        const { productId, qty } = product;
  
        // Fetch the product details from the database
        const productDetails = await Product.findByPk(productId, {
            attributes: ["productId", "productName", "price"]});
  
        if (!productDetails) {
          // Product not found
          return res.status(404).json({ error: `Product with ID ${productId} not found.` });
        }

        // Calculate the subtotal for this product
        const subtotal = productDetails.price * qty;
        total += subtotal;

        // Step 3: Create a new productSold record
        await ProductSold?.create({
            transactionId: transaction.transactionId,
            productId,
            qty,
            subtotal,
        });
        }

        // Step 4: Update the total in the transaction record
        await transaction.update({ total });

        // Return the created transaction     
        res.status(201).json({type : "success", message : "Create transaction success", transaction});
        } catch(error){
        if(error instanceof ValidationError){
            return next({status : 400, message : error?.errors?.[0]})
        }
        next(error);
    }
}

// @payment
export const payment = async (req, res, next) => {
    try{
        const { transactionId } = req.params;
        const transaction = await Transaction?.findOne({ where: { transactionId },
            attributes: { exclude: ['userUserId', 'salesReportSalesReportId'] }});

        if (!transaction) {
            return res.status(404).json({ error: `Transaction with ID ${transactionId} not found.` });
        }
        const total = transaction.total;

        const { paymentAmount } = req.body;

        // Create the payment record
        const change = paymentAmount - total;
        const payment = await Payment.create({
            transactionId: transaction.transactionId,
            paymentAmount,
            change,
        });

        // Return the payment     
        res.status(201).json({type : "success", message : "This is the Payment Result", payment});
        } catch(error){
        if(error instanceof ValidationError){
            return next({status : 400, message : error?.errors?.[0]})
        }
        next(error);
    }
}

// @upload / update profile picture
export const updateProfileImg = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
      // @check if image is uploaded
      if (!req.file) {
          throw new ({ status: 400, message: "Please upload an image." })
      }

      console.log(req.file)

      // @delete the old image
      const cashier = await User?.findOne( { where : { uuid : req.cashier.uuid }, attributes : ['profileImg'] } );
      if (cashier?.dataValues?.profileImg){
          cloudinary.v2.api
          .delete_resources([`${cashier?.dataValues?.profileImg}`],
          { type: 'upload', resource_type: 'image'})
          .then(console.log);
      }

      // @update the user profile
      await User?.update({ profileImg : req?.file?.path }, { where : { uuid : req.cashier.uuid } })

      // @send response
      res.status(200).json({ message : "Image uploaded successfully.", imageUrl : req.file?.path })
      
      await transaction.commit();
  } catch (error) {
      await transaction.rollback();
      next(error)
  }
}

// @get profile picture
export const getProfileImg = async (req, res, next) => {
  try {
      const cashier = await User?.findOne({ where : { uuid : req.cashier.uuid }});
      if (!cashier) throw ({ status: 400, message: error.CASHIER_DOES_NOT_EXISTS });
      if (!cashier.profileImg) throw ({ status: 404, message: "Profile picture is empty" });

      res.status(200).json( cashier.profileImg )
  } catch (error) {
    next(error)
  }
}