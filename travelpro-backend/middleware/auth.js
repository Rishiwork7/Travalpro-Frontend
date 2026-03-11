exports.authenticateAdmin = (req, res, next) => {
    const token = req.headers["x-admin-token"];
    const adminToken = process.env.ADMIN_TOKEN;

    // Simple strict equality check
    if (!token || token !== adminToken) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized access",
        });
    }
    next();
};

