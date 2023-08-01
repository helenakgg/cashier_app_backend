import { ValidationError } from "yup"
import * as error from "../../../middlewares/error.handler.js"
import { User, Category } from "../../../models/relation.js"
import db from "../../../database/index.js"
import * as validation from "./validation.js"

// @get all categories
export const getCategory = async (req, res, next) => {
    try {
      const categories = await Category.findAll();
      //@send response
      res.status(200).json({ result: categories });
    } catch (error) {
      next(error);
    }
};

// @add category
export const addCategory = async (req, res, next) => {
    try {
        const { categoryName } = req.body;
        await validation.AddCategorySchema.validate(req.body);

        // @get userId
        const { uuid } = req.admin
        const admin = await User?.findOne ({ where : {uuid} })
        const adminId = admin.userId

        // @check if category already exists
        const categoryExists = await Category?.findOne({ where : { categoryName }});
        if (categoryExists) throw ({ status : 400, message : error.CATEGORY_ALREADY_EXISTS });

        // @create category
        const category = await Category?.create({
            categoryName,
            userId : adminId
        });
        res.status(200).json({ message: "Category added successfully", category });

    } catch (error) {
        // @check if error from validation
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}

// @edit category
export const editCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const { categoryName } = req.body;
        await validation.EditCategorySchema.validate(req.body);

        // @check if category already exists
        const categoryExists = await Category?.findOne({ where : { categoryName }});
        if (categoryExists) throw ({ status : 400, message : error.CATEGORY_ALREADY_EXISTS });

        const category = await Category?.findOne({ where : { categoryId } });
        // @edit category
        await category?.update({ categoryName });
        res.status(200).json({ message: "Category edited successfully", category });

    } catch (error) {
        // @check if error from validation
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}

// @delete category
export const deleteCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;

        const category = await Category?.findOne({ where : { categoryId } });
        // @delete category
        await category?.update({ isDeleted : 1 });
        res.status(200).json({ message: "Category deleted successfully", category });

    } catch (error) {
        // @check if error from validation
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}
