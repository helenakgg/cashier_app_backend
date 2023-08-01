import { Router } from "express"
import { verifyAdmin } from "../../../middlewares/index.js"
// @import the controller
import * as AdminCategoryControllers from "./index.js"

// @define routes
const router = Router()
router.get("/", verifyAdmin, AdminCategoryControllers.getCategory)
router.post("/add", verifyAdmin, AdminCategoryControllers.addCategory)
router.patch("/:categoryId/edit", verifyAdmin, AdminCategoryControllers.editCategory)
router.patch("/:categoryId/delete", verifyAdmin, AdminCategoryControllers.deleteCategory)

export default router