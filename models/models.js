const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const bcrypt = require("bcrypt");

/** ---------- MODELS ---------- **/
// User Model
const User = sequelize.define("user", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate : {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: "user", // user, admin
        allowNull: true
    },
    token : {
        type: DataTypes.TEXT,
        allowNull: true
    }
},
{
    hooks: {
        beforeCreate: async (user) => {
            if(user.password)
            {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if(user.password)
            {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

// password reset code model
const PasswordResetCode = sequelize.define("passwordResetCode", {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate : {
            isEmail: true
        }
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    used : {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
},
{
    hooks: {
        beforeCreate: async (instance) => {
            if(instance.code)
            {
                const salt = await bcrypt.genSalt(10);
                instance.code = await bcrypt.hash(instance.code, salt);
            }
        },
        beforeUpdate: async (instance) => {
            if(instance.code)
            {
                const salt = await bcrypt.genSalt(10);
                instance.code = await bcrypt.hash(instance.code, salt);
            }
        }
    }
});

/** ---------- OPERATIONS ---------- **/
User.prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

PasswordResetCode.prototype.validCode = async function(code) {
    return await bcrypt.compare(code, this.code);
}

module.exports = {
    User,
    PasswordResetCode
};