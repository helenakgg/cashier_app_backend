// @default error message
export const ROUTE_NOT_FOUND = "Route not found";
export const SOMETHING_WENT_WRONG = "Something went wrong";
export const UNAUTHORIZED = "Unauthorized";
export const RESTRICTED = "Restricted";
export const USER_NOT_FOUND = "User not found";
export const USER_ALREADY_EXISTS = "User already exists";
export const CASHIER_ALREADY_EXISTS = "Cashier already exists";
export const USERNAME_ALREADY_EXISTS = "Username already exists";
export const USER_DOES_NOT_EXISTS = "User does not exists";
export const CASHIER_DOES_NOT_EXISTS = "Cashier does not exists";
export const USER_IS_NOT_CASHIER = "User is not Cashier";
export const CASHIER_IS_DISABLE = "Cashier is disable";
export const INVALID_CREDENTIALS = "Invalid credentials";
export const BAD_REQUEST = "Bad request";
export const FORBIDDEN = "Forbidden";

// @default error status
export const DEFAULT_ERROR_STATUS = 500;
export const BAD_REQUEST_STATUS = 400;
export const UNAUTHORIZED_STATUS = 401;
export const FORBIDDEN_STATUS = 403;
export const NOT_FOUND_STATUS = 404;

// @global error handler
export function errorHandler (error, req, res, next) {
    console.log(error.message || error)

    // @check if error from sequelize
    if (error?.name === "SequelizeValidationError") {
        return res.status(BAD_REQUEST_STATUS).json({ message : error?.errors?.[0]?.message })
    }

    // @generic or custom error
    const message = error?.message || SOMETHING_WENT_WRONG;
    const status = error?.status || DEFAULT_ERROR_STATUS;
    const data = error?.data || null;
    res.status(status).json({ type : "error", status, message, data });
}