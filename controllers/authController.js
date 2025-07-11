const jwt = require('jsonwebtoken');
const { User, PasswordResetCode } = require('../models/models');
const { rabbitPublishNotification, rabbitPublishUser } = require("../rabbit-ops");
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const newUser = await User.create({ name, email, password });

    const event = {
      "user": {
        id: newUser.id,
        name,
        email,
        role: newUser.role,
      },
      type: "CREATE"
    };

    const notificationEvent = {
      user : {
        "id": newUser.id,
      },
      message: "Votre inscription sur la plateforme s'est effectuée avec succès" 
    };

    rabbitPublishUser(JSON.stringify(event));

    rabbitPublishNotification(JSON.stringify(notificationEvent));

    console.log(event, notificationEvent);

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        "id": newUser.id,
        "name": newUser.name,
        "email": newUser.email,
        "role": newUser.role
      }
    });
    
  } catch (err) {
    res.status(400).json({
      message: "Impossible de créé l'utilisateur",
      error: err
    });
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const isPasswordValid = await user.validPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    // Génère un token JWT avec l'ID de l'utilisateur
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, // Payload du token
      process.env.JWT_SECRET, // Clé secrète pour signer le token
      { expiresIn: '15d' } // Durée de validité du token
    );

    const tokenExpiration = Math.floor(Date.now() / 1000) + (15 * 24 * 3600); // Current timestamp + 15 days in seconds
    
    res.cookie("token", token, {
      maxAge: 15 * 24 * 3600,
      httpOnly: true,
      secure: true,
      sameSite: 'Strict'
    });

    const event = {
        user : {
          "id": user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
        "token_exp_timestamp": tokenExpiration,
        type: "UPDATE"
    };

    rabbitPublishUser(JSON.stringify(event));
    console.log(event);

    res.status(200).json({ message: 'Connexion réussie', "user": { "id": user.id, "name": user.name, "email": user.email, "role": user.role }, token });
  } catch (err) {
    res.status(400).json({ message: "Une erreur s'est produite pendant la connexion", error: err.message });
  }
}


exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict'
    });

    let userId = req.userData.userId;

    const notificationEvent = {
      user : {
        "id": userId,
      },
      message: "Vous vous êtes déconnectés de la plateforme" 
    };

    rabbitPublishNotification(JSON.stringify(notificationEvent));
    console.log(notificationEvent);

    res.status(200).json({ message: 'Déconnexion...' });
  } catch (err) {
    res.status(400).json({ message: "Une erreur s'est produite pendant la connexion", error: err.message });
  }
}

// Configuration Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
  }
});

// Fonction pour générer un code à 10 chiffres
function generateCode() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// Route pour envoyer le code de réinitialisation
exports.sendResetCode = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
      return res.status(400).json({ error: 'Email requis' });
  }

  try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
          return res.status(404).json({ error: "Cet email n'est associé à aucun compte" });
      }

      const code = generateCode();
      const expiresAt = new Date(Date.now() + 900000); // 3600000

      //const expiresAt = new Date().toISOString();

      // Supprimer les anciens codes pour cet email
      await PasswordResetCode.destroy({ where: { email, used: false } });

      // Sauvegarder le nouveau code
      const resetCode = new PasswordResetCode({
          email,
          code,
          expiresAt
      });
      await resetCode.save();

      // Envoyer l'email
      const mailOptions = {
          from: `"${process.env.FROM_EMAIL_NAME}" <${process.env.FROM_EMAIL_ADDRESS}>`,
          to: email,
          subject: 'Réinitialisation de votre mot de passe',
          text: `Votre code de réinitialisation est : ${code}\nCe code expirera dans 1 heure.`,
          html: `
              <p>Votre code de réinitialisation est :
                <strong>${code}</strong></p>
              <p>Ce code expirera dans 15 minutes.</p>
          `
      };

      await transporter.sendMail(mailOptions);
      
      console.log("USER", user);
      return res.json({ 
          success: true,
          message: 'Code envoyé avec succès'
      });
  } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ error: 'Erreur lors de l\'envoi du code' });
  }
}

// Route pour verifier le code envoye par mail
exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;
  
  if (!email || !code ) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
      // Vérifier le code
      const resetCode = await PasswordResetCode.findOne({ where: {
          email,
          used: false,
          expiresAt: { [Op.gt]: new Date() }
      }});
      
      if (!resetCode) {
        return res.status(400).json({ error: 'Code invalide' });
      }

      const isCodeValid = await resetCode.validCode(code);
      
      if (!isCodeValid) {
        return res.status(400).json({ error: 'Code expiré, veuillez en envoyer un nouveau' });
      }

      // Trouver l'utilisateur
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      res.json({ 
          success: true,
          message: 'Le code correspond bien a celui attendu'
      });
  } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ error: 'Erreur lors de la verification' });
  }
}

// Route pour réinitialiser le mot de passe
exports.resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;
  
  if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
      // Vérifier le code
      const resetCode = await PasswordResetCode.findOne({ where: {
          email,
          used: false,
          expiresAt: { [Op.gt]: new Date() }
      }});
      
      if (!resetCode) {
        return res.status(400).json({ error: 'Code invalide' });
      }

      const isCodeValid = await resetCode.validCode(code);
      
      if (!isCodeValid) {
        return res.status(400).json({ error: 'Code expiré, veuillez en envoyer un nouveau' });
      }

      // Trouver l'utilisateur
      const user = await User.findOne({ where: { email } });
      if (!user) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      // Mettre à jour le mot de passe
      user.password = newPassword;
      await user.save();

      // console.log("NEWPASSWORD", newPassword, "email", email, "USER", user);
      // Marquer le code comme utilisé
      resetCode.used = true;
      await resetCode.save();

      res.json({ 
          success: true,
          message: 'Mot de passe réinitialisé avec succès'
      });
  } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ error: 'Erreur lors de la réinitialisation' });
  }
}