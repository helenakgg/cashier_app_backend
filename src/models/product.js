import db from "../database/index.js";

export const Product = db.Sequelize.define("products", {
    productId: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    productName: {
        type : db.Sequelize.STRING(45),
        allowNull : false
    },
    productImg : {
        type : db.Sequelize.STRING(255),
        allowNull : true
    },
    price : {
        type : db.Sequelize.INTEGER,
        allowNull : false,
        defaultValue : 0
    },
    description : {
        type : db.Sequelize.TEXT('long'),
        allowNull : true
    },
    isDeactive: {
        type : db.Sequelize.BOOLEAN,
        allowNull : false,
        defaultValue : 0
    },
    categoryId: {
        type : db.Sequelize.INTEGER,
        allowNull : false
    },
    userId: {
        type : db.Sequelize.INTEGER,
        allowNull : false
    }
},
{ timestamps: false }
);

