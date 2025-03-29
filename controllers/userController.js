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

// delete any user
exports.delete = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedUser = await User.destroy({ where: { 'id' : id } });
        
        if(deletedUser > 0)
        {
            const event = {
                "id": deletedUser.id,
                type: "DELETE"
            };
        
            rabbitPublishUser(JSON.stringify(event));
            console.log(event);
            
            res.status(200).json({ message: "Utilisateur supprimé avec succès" });
        }
        else res.status(404).json({ message: "utilisateur inexistant" });
    } catch (err) {
        res.status(500).json({
            message : err.message
        });
    }
}