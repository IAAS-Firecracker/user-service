const { User } = require("../models/models");
const { rabbitPublishUser } = require("../rabbit-ops");


const createAdmin = async () => {

    const ADMIN_NAME = process.env.ADMIN_NAME || "Admin";
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "1234567a";

    // Verify if admin already exists
    const isAdminExists = await User.findOne( { where: { email : ADMIN_EMAIL }});

    if(isAdminExists != null) return;

    const adminUser = await User.create({
        "name" : ADMIN_NAME,
        "email" : ADMIN_EMAIL,
        "password" : ADMIN_PASSWORD,
        "role": "admin"
    });

    // Event for broadcast admin creation event
    const event = {
        "id": adminUser.id,
        "name": adminUser.name,
        "email": adminUser.email,
        type: "CREATE"
    };
    rabbitPublishUser(JSON.stringify(event));
}

module.exports = createAdmin