import db from "../database/index.js";

export const Category = db.sequelize.define("categories", {
    categoryId: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    categoryName: {
        type : db.Sequelize.STRING(45),
        allowNull : false
    },
    isDeleted: {
        type : db.Sequelize.BOOLEAN,
        allowNull : false,
        defaultValue : 0
    },
    userId: {
        type : db.Sequelize.INTEGER,
        allowNull : false
    }
},
{ timestamps: false }
);
