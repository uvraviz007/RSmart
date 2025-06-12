const validateSeller = (req, res, next) => {
    if (!req.user || !req.user.isSeller) {
        return res.status(403).json({ error: "Seller access required." });
    }
    next();
};

export default validateSeller;
