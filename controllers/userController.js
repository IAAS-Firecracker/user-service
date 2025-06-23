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

// create an admin
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

// Update user
exports.update = async (req, res) => {

    try {
        const { id } = req.params;
        const { name, email } = req.body;
        
        const currentUser = await User.findByPk(id);
        
        if(currentUser != null)
        {
            if(name != null) currentUser.name = name;
            if(email != null) currentUser.email = email;
            
            currentUser.save();

            const event = {
                user : {
                    name,
                    email
                },
                type: "UPDATE"
            };

            const notificationEvent = {
                "id": currentUser.id,
                message: "Utilisateur modifié avec succès" 
            };
        
            rabbitPublishUser(JSON.stringify(event));
        
            rabbitPublishNotification(JSON.stringify(notificationEvent));
            
            res.status(201).json({
              message: "Utilisateur modifié succès",
              user: {
                "id": currentUser.id,
                "name": currentUser.name,
                "email": currentUser.email
              }
            });
        } else {
            res.status(404).json({
                message: "Utilisateur introuvable"
            });
        }
  
  
      
    } catch (err) {
      res.status(400).json({
        message: "Impossible de modifier l'utilisateur",
        error: err
      });
    }
}

// Update auth User Profile
exports.updateProfile = async (req, res) => {

    try {
        const userId = req.userData.userId;
        const { name, email } = req.body;
        
        const currentUser = await User.findByPk(userId);
        
        if(currentUser != null)
        {
            if(name != null) currentUser.name = name;
            if(email != null) currentUser.email = email;
            
            currentUser.save();

            const event = {
                user : {
                    name,
                    email
                },
                type: "UPDATE"
            };

            const notificationEvent = {
                "id": currentUser.id,
                message: "Profil modifié avec succès" 
            };
        
            rabbitPublishUser(JSON.stringify(event));
        
            rabbitPublishNotification(JSON.stringify(notificationEvent));
            
            res.status(201).json({
              message: "Profil modifié succès",
              user: {
                "id": currentUser.id,
                "name": currentUser.name,
                "email": currentUser.email
              }
            });
        } else {
            res.status(404).json({
                message: "Utilisateur introuvable"
            });
        }
  
  
      
    } catch (err) {
      res.status(400).json({
        message: "Impossible de modifier votre profil",
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

// delete auth user profile
exports.deleteProfile = async (req, res) => {
    const userId = req.userData.userId;
    try {
        const deletedUser = await User.destroy({ where: { 'id' : userId } });
        
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
            
            res.status(200).json({ message: "Profil supprimé avec succès" });
        }
        else res.status(404).json({ message: "Profil inexistant" });
    } catch (err) {
        res.status(500).json({
            message : err.message
        });
    }
}

exports.changeUserPassword = async (req, res) => {
  try {
        const userId = req.userData.userId;
        const { password, newPassword } = req.body;
        const user = await User.findOne({ where: { "id": userId } });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const isPasswordValid = await user.validPassword(password);
    console.log("PASSWORD", password, "NEWPASSWORD", newPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    if(newPassword != null) user.password = newPassword;

    res.status(200).json({ message: 'Mot de passe modifie avec succes', "user": { "id": user.id, "name": user.name, "email": user.email, "role": user.role } });
  } catch (err) {
    res.status(400).json({ message: "Une erreur innatendue lors de la modification du mot de passe", error: err.message });
  }
}