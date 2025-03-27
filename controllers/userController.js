const { User } = require('../models/models');

// get all users
exports.all = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({
            message : err.message
        });
    }
}

// get any users
exports.get = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findOne({ where: { 'id' : id } });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({
            message : err.message
        });
    }
}