import { Router } from "express"
import { verifyAdmin } from "../../../middlewares/index.js"
import { createUploader, createCloudinaryStorage } from "../../../helpers/uploader.js"

// @setup multer
const storage = createCloudinaryStorage("products")
const uploader = createUploader(storage)

// @import the controller
import * as AdminProductControllers from "./index.js"

// @define routes
const router = Router()
router.get("/", verifyAdmin, AdminProductControllers.getProductList)
router.post("/create", verifyAdmin, uploader.single("file"), AdminProductControllers.createProduct)
router.patch("/:productId/update", verifyAdmin, uploader.single("file"), AdminProductControllers.updateProduct)
router.patch("/:productId/upload", verifyAdmin, uploader.single("file"), AdminProductControllers.updateProductImg)
router.get("/:productId/image", verifyAdmin, AdminProductControllers.getProductImg)
router.patch("/:productId/deactivate", verifyAdmin, AdminProductControllers.deactivateProduct)

export default router