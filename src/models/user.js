import db from "../database/index.js";

export const User = db.Sequelize.define("users", {
    userId: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    role : {
        type : db.Sequelize.INTEGER,
        allowNull : false,
        defaultValue : 0
    },
    username: {
        type: db.Sequelize.STRING(45),
        allowNull: false
    },
    password: {
        type: db.Sequelize.STRING(255),
        allowNull : false
    },
    email: {
        type : db.Sequelize.STRING(45),
        allowNull : false
    },     
    profileImg : {
        type : db.Sequelize.STRING(255),
        allowNull : true
    },
    isDisable : {
        type : db.Sequelize.BOOLEAN,
        allowNull : false,
        defaultValue : 0
    },
    otp : {
        type : db.Sequelize.INTEGER,
        allowNull : true,
    },
    expiredOtp : {
        type : db.Sequelize.TIME,
        allowNull : true,
    },
},
{ timestamps: false }
)