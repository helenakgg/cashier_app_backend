import { ValidationError } from "yup"
import handlebars from "handlebars"
import fs from "fs"
import path from "path"
import moment from "moment"

import * as config from "../../config/index.js"
import * as helpers from "../../helpers/index.js"
import * as error from "../../middlewares/error.handler.js"
import { User } from "../../models/user.js"
import db from "../../database/index.js"
import * as validation from "./validation.js"

// @register admin process
export const register = async (req, res, next) => {
    try {
        // @create transaction
        const transaction = await db.sequelize.transaction();
        
        // @validation
        const { username, password, email } = req.body;
        await validation.RegisterValidationSchema.validate(req.body);

        // @check if user already exists
        const userExists = await User?.findOne({ where: { username, email } });
        if (userExists) throw ({ status : 400, message : error.USER_ALREADY_EXISTS });

        // @create user -> encypt password
        const hashedPassword = helpers.hashPassword(password);

        // @archive user data
        const user = await User?.create({
            username,
            password : hashedPassword,
            email,
            role : 1
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
                message: "Admin created successfully",
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

// @login process
export const login = async (req, res, next) => {
    try {
        // @validation, we assume that username will hold either username or email
        const { username, password } = req.body;
        await validation.LoginValidationSchema.validate(req.body);

        // @check if username is email
        const isAnEmail = await validation.IsEmail(username);
        const query = isAnEmail ? { email : username } : { username };

        // @check if user exists
        const userExists = await User?.findOne({ where: query });
        if (!userExists) throw ({ status : 400, message : error.USER_DOES_NOT_EXISTS })

        // @check if user is disable
        if (userExists?.dataValues?.isDisable === 1) throw ({ status : 400, message : error.CASHIER_IS_DISABLE });

        // @check if password is correct
        const isPasswordCorrect = helpers.comparePassword(password, userExists?.dataValues?.password);
        if (!isPasswordCorrect) throw ({ status : 400, message : error.INVALID_CREDENTIALS });

        // @generate access token
        const accessToken = helpers.createToken({ uuid: userExists?.dataValues?.uuid, role : userExists?.dataValues?.role });

        // @delete password from response
        delete userExists?.dataValues?.password;
        delete userExists?.dataValues?.otp;
        delete userExists?.dataValues?.expiredOtp;

        // @return response
        res.header("Authorization", `Bearer ${accessToken}`)
            .status(200)
            .json({ user : userExists })
    } catch (error) {
        // @check if error from validation
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}

// @keeplogin
export const keepLogin = async (req, res, next) => {
    try {
        // @get user id from token
        const { uuid } = req.user;

        // @get user data
        const user = await User?.findOne({ where : { uuid } });

        // @delete password from response
        delete user?.dataValues?.password;
        delete user?.dataValues?.otp;
        delete user?.dataValues?.expiredOtp;

        // @return response
        res.status(200).json({ user })
    } catch (error) {
        next(error)
    }
}

// @forgot password
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;     
        await validation.EmailValidationSchema.validate(req.body);

        const isUserExist = await User?.findOne({ where : { email } });

        if (!isUserExist) throw ({ 
            status : error.BAD_REQUEST_STATUS, 
            message : error.USER_DOES_NOT_EXISTS 
        })

        const otpToken = helpers.generateOtp();
        await User?.update({otp : otpToken, expiredOtp : moment().add(1,"days").format("YYYY-MM-DD HH:mm:ss")},{where : {email : email}})

        // @generate reset token
        const resetToken = helpers.createToken({ uuid: User?.dataValues?.uuid, role : User?.dataValues?.role });
        
        const template = fs.readFileSync(path.join(process.cwd(), "templates", "resetpass.html"), "utf8");

        const message = handlebars.compile(template)({otpToken, link : config.REDIRECT_URL+`/reset-password/rp-${isUserExist?.dataValues?.uuid}`})

        const mailOptions = {
            from: config.GMAIL,
            to: email,
            subject: "Reset Password",
            html: message
        }

        helpers.transporter.sendMail(mailOptions, (error, info) => {
            if (error) throw error;
            console.log("Email sent: " + info.response);
        })

        res.status(200).json({ 
            message : "Check your email to get your reset password link.",
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

// @reset password
export const resetPassword = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { uuid, token, newPassword } = req.body;
        await validation.resetPasswordSchema.validate(req.body);
       
        const context = uuid.split("-")[0];
        const userId = uuid.split("-")?.slice(1)?.join("-");

        const user = await User?.findOne({where : {uuid : userId} });
        if (!user) throw ({ 
            status : error.BAD_REQUEST_STATUS, 
            message : error.USER_DOES_NOT_EXISTS 
        })
        if(token !== user?.dataValues?.otp) throw ({status : 400, message : error.INVALID_CREDENTIALS});

        const isExpired = moment().isAfter(user?.dataValues?.expiredOtp);
        if(isExpired) throw ({status : 400, message : error.INVALID_CREDENTIALS});

        const hashedPassword = helpers.hashPassword(newPassword);        
        if(context === "rp"){
        await User?.update(
            { 
                password: hashedPassword,
                otp : null,
                expiredOtp : null 
            }, 
            { where: { uuid : userId } }
        )};

        // @delete password from response
        delete user?.dataValues?.password;
        delete user?.dataValues?.otp;
        delete user?.dataValues?.expiredOtp;

        res.status(200).json({ 
            message : "You have reset your password successfully! Please login again!",
            user
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

