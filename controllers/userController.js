const { User } = require('../models/models');
const { rabbitPublishUser, rabbitPublishNotification } = require('../rabbit-ops');

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

exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const newUser = await User.create({ name, email, password, role: "admin" });

    /*const event = {
        user: {
            "id": newUser.id,
            name,
            email,
            role: newUser.role,
        },
        type: "CREATE"
    };*/

    const event = {
        user : {
            id: newUser.id,
            name,
            email,
            role: newUser.role,
        },
        type: "CREATE"
    };

    const notificationEvent = {
        "id": newUser.id,
        message: "Creation d'un nouvel administrateur effectuée avec succès" 
    };

    rabbitPublishUser(JSON.stringify(event));

    rabbitPublishNotification(JSON.stringify(notificationEvent));

    console.log(event, notificationEvent);

    res.status(201).json({
      message: "Admin créé avec succès",
      user: {
        "id": newUser.id,
        "name": newUser.name,
        "email": newUser.email
      }
    });
    
  } catch (err) {
    res.status(400).json({
      message: "Impossible de créé l'admin",
      error: err
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
                user : {
                    "id": deletedUser.id
                },
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