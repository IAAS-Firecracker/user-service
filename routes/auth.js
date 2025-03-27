const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   get:
 *     summary: Login route
 *     tags: [Auth, Login]
 *     description: Generation d'un token d'acces pour un utilisateur
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   example: dallas@gmail.com
 *                 password:
 *                   type: string
 *                   example: ****
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *                 message: "Internal Server Error"
 * 
 * @swagger
 * /api/auth/register:
 *   get:
 *     summary: Create new user account
 *     tags: [Auth, Register]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: dallas
 *                 email:
 *                   type: string
 *                   example: dallas@gmail.com
 *                 password:
 *                   type: string
 *                   example: ****
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *                 message: "Internal Server Error"
 * 
 */
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);

module.exports = router;