import { Router } from "express"
import { verifyAdmin } from "../../../middlewares/index.js"
// @import the controller
import * as AdminCategoryControllers from "./index.js"

// @define routes
const router = Router()
router.get("/", verifyAdmin, AdminCategoryControllers.getCategory)

export default router