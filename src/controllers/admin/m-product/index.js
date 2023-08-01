import { ValidationError } from "yup"
import cloudinary from 'cloudinary'
import * as error from "../../../middlewares/error.handler.js"
import { User, Category, Product } from "../../../models/relation.js"
import db from "../../../database/index.js"
import * as validation from "./validation.js"

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

// @create product
export const createProduct = async (req, res, next) => {
    try {
        const { data } = req.body;
        const body = JSON.parse(data);
        const { productName, price, description, categoryId } = body

        // @validate request body
        await validation.CreateProductSchema.validate(body);

        // @check if product exists
        const productExists = await Product?.findOne({ where : { productName } });
        if (productExists) throw ({ status : 400, message : "Product already exists" });

        // @get userId
        const { uuid } = req.admin
        const admin = await User?.findOne ({ where : {uuid} })
        const adminId = admin.userId
        
        // @archive product's data
        const product = await Product?.create({ productName, price, description, categoryId, userId : adminId, productImg : req?.file?.path });

        // @send response
        res.status(201).json({ type: "success", message: "Product created successfully", product });
    } catch (error) {
        // @check if error from validation
        if (error instanceof ValidationError) {
            return next({ status: 400, message: error?.errors?.[0] })
        }
        next(error)
    }
}

// @update product
export const updateProduct = async (req, res, next) => {
  try {
        const { productId } = req.params;
        const { productName, price, description, categoryId } = req.body;

        // @validate request body
        await validation.UpdateProductSchema.validate(req.body);

        const product = await Product?.findOne( { where : { productId }});
        // @update product's data
        await product?.update({ productName, price, description, categoryId });

        // @send response
        res.status(201).json({ type: "success", message: "Product updated successfully", product });
    } catch (error) {
        // @check if error from validation
        if (error instanceof ValidationError) {
            return next({ status: 400, message: error?.errors?.[0] })
        }
        next(error)
    }
}
        
// @update product image
export const updateProductImg = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
      const { productId } = req.params;

      // @delete the old image
      const product = await Product?.findOne( { where : { productId }, attributes : ['productImg'] } );
      if (product?.dataValues?.productImg){
          cloudinary.v2.api
          .delete_resources([`${product?.dataValues?.productImg}`],
          { type: 'upload', resource_type: 'image'})
          .then(console.log);
      }

      // @update the product image
      await Product?.update({ productImg : req?.file?.path }, { where : { productId } })

      // @send response
      res.status(200).json({ message : "Product Image updated successfully.", imageUrl : req.file?.path })
      
      await transaction.commit();
  } catch (error) {
      await transaction.rollback();
      next(error)
  }
}

// @get product image
export const getProductImg = async (req, res, next) => {
  try {
      const { productId } = req.params;
      const product = await Product?.findOne({ where : { productId }});
      if (!product) throw ({ status: 400, message: error.PRODUCT_DOES_NOT_EXISTS });
      if (!product.productImg) throw ({ status: 404, message: "Product Image is empty" });

      res.status(200).json( product.productImg )
  } catch (error) {
    next(error)
  }
}

// @deactivate product
export const deactivateProduct = async (req, res, next) => {
  try {
      const { productId } = req.params;

      const product = await Product?.findOne({ where : { productId } });
      if (!product) throw ({ status: 400, message: error.PRODUCT_DOES_NOT_EXISTS });
      // @deactivate product
      await product?.update({ isDeactive : 1 });
      res.status(200).json({ message: "Product deactivated successfully", product });

  } catch (error) {
      // @check if error from validation
      if (error instanceof ValidationError) {
          return next({ status : 400, message : error?.errors?.[0] })
      }
      next(error)
  }
}