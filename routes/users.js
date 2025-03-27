const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: GET all the users
 *     tags: [Users]
 *     description: Retourne tous les utilisateurs contenues dans la bd
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: integer
 *                   example: 1
 *                 username:
 *                   type: string
 *                   example: dallas
 *                 cni_number:
 *                   type: string
 *                   example: ECSKAML84JRO0294
 *                 email:
 *                   type: string
 *                   example: dallas@gmail.com
 *                 tel:
 *                   type: integer
 *                   example: 690xxxxxx
 *                 role:
 *                   type: string
 *                   example: user
 *                 status:
 *                   type: string
 *                   example: PENDING
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *                 message: "Internal Server Error"
 * 
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: GET any user with specify id
 *     tags: [Requests]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: id de l'utilisateur
 *         schema:
 *           type: integer
 *         example:
 *           1
 *     description: Retourne l'utilisateur possédant l'id correspondant
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: integer
 *                   example: 1
 *                 username:
 *                   type: string
 *                   example: dallas
 *                 cni_number:
 *                   type: string
 *                   example: ECSKAML84JRO0294
 *                 email:
 *                   type: string
 *                   example: dallas@gmail.com
 *                 tel:
 *                   type: integer
 *                   example: 690xxxxxx
 *                 role:
 *                   type: string
 *                   example: user
 *                 status:
 *                   type: string
 *                   example: PENDING
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *                 message: "Internal Server Error"
 * 
 */
router.get('', userController.all);
router.get('/:id', userController.get);

module.exports = router;