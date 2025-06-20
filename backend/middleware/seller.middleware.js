const validateSeller = (req, res, next) => {
    if (!req.user || !req.user.isSeller) {
        return res.status(403).json({ error: "Seller access required." });
    }
    
    // Set sellerId for use in controllers
    req.sellerId = req.user.userId;
    
    next();
};

export default validateSeller;
