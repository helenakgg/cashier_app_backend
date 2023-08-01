import { Router } from "express"
import { verifyAdmin } from "../../../middlewares/index.js"
// @import the controller
import * as AdminCashierControllers from "./index.js"

// @define routes
const router = Router()

// @manage Cashier
router.get("/", verifyAdmin, AdminCashierControllers.getAllCashiers)
router.get("/disabled", verifyAdmin, AdminCashierControllers.getAllDisabledCashiers)
router.post("/create", verifyAdmin, AdminCashierControllers.createCashier)
router.get("/:uuid", verifyAdmin, AdminCashierControllers.getCashierById)
router.patch("/:uuid/change-username", verifyAdmin, AdminCashierControllers.changeUsername)
router.patch("/:uuid/v-change-password", verifyAdmin, AdminCashierControllers.verifyToChangePassword)
router.patch("/:uuid/change-password", verifyAdmin, AdminCashierControllers.changePassword)
router.patch("/:uuid/v-change-email", verifyAdmin, AdminCashierControllers.verifyTochangeEmail)
router.patch("/:uuid/change-email", verifyAdmin, AdminCashierControllers.changeEmail)
router.patch("/:uuid/disable", verifyAdmin, AdminCashierControllers.disableCashier)

export default router