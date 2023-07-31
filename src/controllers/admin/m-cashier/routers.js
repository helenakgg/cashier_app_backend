import { Router } from "express"
import { verifyAdmin } from "../../../middlewares/index.js"
// @import the controller
import * as AdminControllers from "./index.js"

// @define routes
const router = Router()

// @manage Cashier
router.get("/", verifyAdmin, AdminControllers.getAllCashiers)
router.get("/disabled", verifyAdmin, AdminControllers.getAllDisabledCashiers)
router.post("/create", verifyAdmin, AdminControllers.createCashier)
router.get("/:uuid", verifyAdmin, AdminControllers.getCashierById)
router.patch("/:uuid/change-username", verifyAdmin, AdminControllers.changeUsername)
router.patch("/:uuid/v-change-password", verifyAdmin, AdminControllers.verifyToChangePassword)
router.patch("/:uuid/change-password", verifyAdmin, AdminControllers.changePassword)
router.patch("/:uuid/v-change-email", verifyAdmin, AdminControllers.verifyTochangeEmail)
router.patch("/:uuid/change-email", verifyAdmin, AdminControllers.changeEmail)
router.patch("/:uuid/disable", verifyAdmin, AdminControllers.disableCashier)

export default router