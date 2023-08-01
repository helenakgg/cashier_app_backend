import { Router } from "express"
import { verifyCashier } from "../../middlewares/index.js"
// @import the controller
import * as CashierControllers from "./index.js"

// @define routes
const router = Router()
router.get("/category", verifyCashier, CashierControllers.getCategory)
router.get("/product-list", verifyCashier, CashierControllers.getProductList)
router.post("/transaction", verifyCashier, CashierControllers.createTransaction)
router.post("/:transactionId/payment", verifyCashier, CashierControllers.payment)
// router.post("/profile/change-photo", verifyCashier, CashierControllers.changePhotoProfile)

export default router