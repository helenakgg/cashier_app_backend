import { ValidationError } from "yup"
import * as error from "../../../middlewares/error.handler.js"
import { Category } from "../../../models/relation.js"
import db from "../../../database/index.js"

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