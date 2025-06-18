import jwt from "jsonwebtoken";

const validateUser = (req, res, next) => {
    try {
        let token = null;

        // 1. Try to get token from Authorization header
        const authHeader = req.headers.authorization;
        if (authHeader && (authHeader.startsWith("Bearer ") || authHeader.startsWith("Bearer: "))) {
            token = authHeader.replace("Bearer", "").replace(":", "").trim();
        }

        // 2. If not found, try to get token from cookie
        if (!token && req.cookies && req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return res.status(401).json({ error: "Access denied. No token provided." });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request
        req.user = decoded;
        req.userId = decoded.userId;

        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(400).json({ error: "Invalid token." });
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token has expired." });
        } else {
            console.error("Error validating token:", error);
            return res.status(500).json({ error: "Internal server error." });
        }
    }
};

export default validateUser;
