import { verifyToken } from "../helpers/token.js"

export async function verifyUser(req, res, next) {
    try {
        // @check if token exists
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) throw ({ message : "Unauthorized" });

        // @verify token
        const decoded = verifyToken(token);
        req.user = decoded;
        
        next();
    } catch (error) {
        return res.status(401).json({ type : "error", message : error?.message, data : null })
    }
}

// @admin only middleware
export async function verifyAdmin(req, res, next) {
    try {
        // @heck if token exists
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) throw ({ message : "Unauthorized" });

        // @verify token
        const decoded = verifyToken(token);
        req.admin = decoded;

        // @check if user is admin
        if (decoded?.role !== 1) throw ({  message : "Restricted" });

        next();
    } catch (error) {
        return res.status(403).json({ type : "error", message : error?.message, data : null  })
    }
}

// @cashier only middleware
export async function verifyCashier(req, res, next) {
    try {
        // @heck if token exists
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) throw ({ message : "Unauthorized" });

        // @verify token
        const decoded = verifyToken(token);
        req.cashier = decoded;

        // @check if user is admin
        if (decoded?.role !== 2) throw ({  message : "Restricted" });

        next();
    } catch (error) {
        return res.status(403).json({ type : "error", message : error?.message, data : null  })
    }
}