import { Router } from "express"
import { verifyUser } from "../../middlewares/index.js"
// @import the controller
import * as AuthControllers from "./index.js"

// @define routes
const router = Router()
router.post("/register", AuthControllers.register)
router.post("/login", AuthControllers.login)
router.get("/", verifyUser, AuthControllers.keepLogin)
router.put("/forgot-password", AuthControllers.forgotPassword)
router.patch("/reset-password", AuthControllers.resetPassword)



export default router