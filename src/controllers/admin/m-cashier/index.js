import { ValidationError } from "yup"
import handlebars from "handlebars"
import fs from "fs"
import path from "path"
import moment from "moment"
import { Op } from 'sequelize';

import * as config from "../../../config/index.js"
import * as helpers from "../../../helpers/index.js"
import * as error from "../../../middlewares/error.handler.js"
import { User } from "../../../models/user.js"
import db from "../../../database/index.js"
import * as validation from "./validation.js"


// @admin create cashier
export const createCashier = async (req, res, next) => {
    // @create transaction
    const transaction = await db.sequelize.transaction();
    try {        
        // @validation
        const { username, password, email } = req.body;
        await validation.CreateCashierValidationSchema.validate(req.body);

        // @check if cashier already exists
        const userExists = await User?.findOne({ where: { username, email } });
        if (userExists) throw ({ status : 400, message : error.CASHIER_ALREADY_EXISTS });

        // @create cashier -> encypt password
        const hashedPassword = helpers.hashPassword(password);

        // @archive cashier data
        const user = await User?.create({
            username,
            password : hashedPassword,
            email,
            role : 2
        });

        // @delete unused data from response
        delete user?.dataValues?.password;
        delete user?.dataValues?.otp;
        delete user?.dataValues?.expiredOtp;

        // @generate access token
        const accessToken = helpers.createToken({ uuid: user?.dataValues?.uuid, role : user?.dataValues?.role });

        // @send response
        res.header("Authorization", `Bearer ${accessToken}`)
            .status(200)
            .json({
                message: "Cashier created successfully",
                user
            });

        // @commit transaction
        await transaction.commit();
    } catch (error) {
        // @rollback transaction
        await transaction.rollback();

        // @check if error from validation
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}

// @get all cashiers
export const getAllCashiers = async (req, res, next) => {
    try {
        const cashiers = await User?.findAll({ 
            where : {role : 2, isDisable: {[Op.not]: 1}},
            attributes : { exclude : ["password", "otp","expiredOtp"]}  
        });

        const total = await User?.count({ where : { role : 2, isDisable: {[Op.not]: 1} } });

        res.status(200).json({ 
            type: "success", 
            message: "All Data Cashiers Fetched", 
            data: {
                totalCashiers: total,
                cashiers
            }
        });
    } catch (error) {
        next(error)
    }
};

export const getCashierById = async (req, res, next) => {
    try {
        const { uuid } = req.params;

        // @get user by uuid
        const user = await User?.findOne({ where: { uuid }, attributes: { exclude: ["password", "otp", "expiredOtp"] } });

        // @check if user exists
        if (!user) {
            throw { status: 404, message: error.USER_DOES_NOT_EXISTS };
        }

        // @check if user is disable
        if (user?.dataValues?.isDisable !== 0) {
            throw { status: 400, message: error.CASHIER_IS_DISABLE };
        }

        // @send response
        res.status(200).json({ type: "success", message: "Cashier fetched", data: user });
    } catch (error) {
        next(error);
    }
};

export const changeUsername = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { uuid } = req.params;
        const { username } = req.body;
        await validation.changeUsernameSchema.validate(req.body);

        const usernameExists = await User?.findOne({ where: { username }});
        if (usernameExists) throw ({ 
            status : error.BAD_REQUEST_STATUS, 
            message : error.USERNAME_ALREADY_EXISTS 
        });
        
        await User?.update({ username }, { where: { uuid }});

        const user = await User?.findOne(
            { 
                where : { uuid },
                attributes : {
                    exclude : ["password", "otp", "expiredOtp"]
                }
            }
        );

        res.status(200).json({ 
            message : "You have changed the Cashier's username successfully!",
            user
        })

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();

        if (error instanceof ValidationError) {
            return next({
                status : errorMiddleware.BAD_REQUEST_STATUS, 
                message : error?.errors?.[0]
            })
        }
        next(error)
    }
}

// @verify first to change cashier's password
export const verifyToChangePassword = async (req, res, next) => {
    try {
        const { uuid } = req.admin;   

        const admin = await User.findOne({ where : {uuid} });
        const email = admin.email;

        const cashierUuid = req.params.uuid;

        const otpToken = helpers.generateOtp();
        await User?.update({otp : otpToken, expiredOtp : moment().add(1,"days").format("YYYY-MM-DD HH:mm:ss")},{where : { uuid }})

        // @generate change password token
        const token = helpers.createToken({ uuid: User?.dataValues?.uuid, role : User?.dataValues?.role });
        
        const template = fs.readFileSync(path.join(process.cwd(), "templates", "otp.html"), "utf8");

        const message = handlebars.compile(template)({otpToken, link : config.REDIRECT_URL+`/admin/m-cashier/${cashierUuid}/change-password/cp-${ uuid }`})

        const mailOptions = {
            from: config.GMAIL,
            to: email,
            subject: "Verify to Change Cashier Password",
            html: message
        }

        helpers.transporter.sendMail(mailOptions, (error, info) => {
            if (error) throw error;
            console.log("Email sent: " + info.response);
        })

        res.status(200).json({ 
            message : "Check your email to get the OTP & change password link.",
        })
    } catch (error) {
        if (error instanceof ValidationError) {
            return next({ 
                status : error.BAD_REQUEST_STATUS , 
                message : error?.errors?.[0] 
            })
        }
        next(error)
    }
}

// @change cashier's password
export const changePassword = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { uuid, token, newPassword } = req.body;
        await validation.changePasswordSchema.validate(req.body);
       
        const context = uuid.split("-")[0];
        const adminId = uuid.split("-")?.slice(1)?.join("-");

        const admin = await User?.findOne({where : {uuid : adminId} });
        if (!admin) throw ({ 
            status : error.BAD_REQUEST_STATUS, 
            message : error.USER_DOES_NOT_EXISTS 
        })
        if(token !== admin?.dataValues?.otp) throw ({status : 400, message : error.INVALID_CREDENTIALS});

        const isExpired = moment().isAfter(admin?.dataValues?.expiredOtp);
        if(isExpired) throw ({status : 400, message : error.INVALID_CREDENTIALS});

        const cashierId = req.params.uuid;
        const cashier = await User?.findOne({where: { uuid : cashierId}})

        const hashedPassword = helpers.hashPassword(newPassword);        
        if(context === "cp"){
        await User?.update(
            { 
                password: hashedPassword,
                otp : null,
                expiredOtp : null 
            }, 
            { where: { uuid : cashierId } }
        );

        await User?.update(
            {
                otp : null,
                expiredOtp : null 
            }, 
            { where: { uuid : adminId } }
        )};

        // @delete password from response
        delete cashier?.dataValues?.password;
        delete cashier?.dataValues?.otp;
        delete cashier?.dataValues?.expiredOtp;

        res.status(200).json({ 
            message : "You have changed Cashier's password successfully!",
            cashier
        })

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();

        if (error instanceof ValidationError) {
            return next({ 
                status : error.BAD_REQUEST_STATUS , 
                message : error?.errors?.[0] 
            })
        }
        next(error)
    }
}

// @verify first to change cashier's email
export const verifyTochangeEmail = async (req, res, next) => {
    try {
        const { uuid } = req.admin;
        const admin = await User.findOne({ where : {uuid} });

        const { password } = req.body;
        await validation.verifyToChangeEmailSchema.validate(req.body);

        // @check if password is correct
        const isPasswordCorrect = helpers.comparePassword(password, admin?.dataValues?.password);
        if (!isPasswordCorrect) throw ({ status : 400, message : error.INVALID_CREDENTIALS });

        res.status(200).json({ 
            message : "Verify Success! You can now change the Cashier's email.",
        })
    } catch (error) {
        if (error instanceof ValidationError) {
            return next({ 
                status : error.BAD_REQUEST_STATUS , 
                message : error?.errors?.[0] 
            })
        }
        next(error)
    }
}

// @change cashier's email
export const changeEmail = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { newEmail } = req.body;
        await validation.changeEmailSchema.validate(req.body);
       
        const cashierId = req.params.uuid;
        const cashier = await User?.findOne({where: { uuid : cashierId}})

        await User?.update({ email : newEmail }, { where: { uuid : cashierId } });

        // @delete password from response
        delete cashier?.dataValues?.password;
        delete cashier?.dataValues?.otp;
        delete cashier?.dataValues?.expiredOtp;

        res.status(200).json({ 
            message : "You have changed Cashier's email successfully!",
            cashier
        })

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();

        if (error instanceof ValidationError) {
            return next({ 
                status : error.BAD_REQUEST_STATUS , 
                message : error?.errors?.[0] 
            })
        }
        next(error)
    }
}

// @disable cashier
export const disableCashier = async (req, res, next) => {
      try {
        const cashierId = req.params.uuid;
        const cashier = await User?.findOne({where: { uuid : cashierId}})
    
        //@update isDisable status
        await cashier?.update( { isDisable: 1 } );

        // @delete password from response
        delete cashier?.dataValues?.password;
        delete cashier?.dataValues?.otp;
        delete cashier?.dataValues?.expiredOtp;
    
        //@send Response
        res.status(200).json({ message: "The Cashier disabled successfully.", cashier });
      } catch (error) {
        next(error);
      }
    };

// @get all disabled cashiers
export const getAllDisabledCashiers = async (req, res, next) => {
    try {
        const disabledCashiers = await User?.findAll({ 
            where : {role : 2, isDisable: 1},
            attributes : { exclude : ["password", "otp","expiredOtp"]}  
        });

        const total = await User?.count({ where : { role : 2, isDisable: 1 } });

        res.status(200).json({ 
            type: "success", 
            message: "All Disabled Cashiers Fetched", 
            data: {
                totalDisabledCashiers: total,
                disabledCashiers
            }
        });
    } catch (error) {
        next(error)
    }
};

