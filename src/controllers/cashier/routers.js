import { Router } from "express"
import { verifyCashier } from "../../middlewares/index.js"
import { createUploader, createCloudinaryStorage } from "../../helpers/uploader.js"

// @setup multer
const storage = createCloudinaryStorage("profiles")
const uploader = createUploader(storage)

// @import the controller
import * as CashierControllers from "./index.js"

// @define routes
const router = Router()
router.get("/category", verifyCashier, CashierControllers.getCategory)
router.get("/product-list", verifyCashier, CashierControllers.getProductList)
router.post("/transaction", verifyCashier, CashierControllers.createTransaction)
router.post("/:transactionId/payment", verifyCashier, CashierControllers.payment)
router.patch("/profile/upload", verifyCashier, uploader.single("file"), CashierControllers.updateProfileImg)
router.get("/profile/profile-picture", verifyCashier, CashierControllers.getProfileImg)

export default router