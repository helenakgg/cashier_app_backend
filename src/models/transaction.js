import db from "../database/index.js";

export const Transaction = db.sequelize.define("transactions", {
    transactionId: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    userId: {
        type : db.Sequelize.INTEGER,
        allowNull : false
    },
    createdAt: {
        type : db.Sequelize.DATE,
        allowNull : false
    },
    total : {
        type : db.Sequelize.INTEGER,
        allowNull : false,
        defaultValue : 0
    },
    salesReportId: {
        type : db.Sequelize.INTEGER,
        allowNull : true
    },
},
{ timestamps: false }
);

export const ProductSold = db.sequelize.define("products_solds", {
    productSoldId : {
        type : db.Sequelize.INTEGER,
        primaryKey : true,
        autoIncrement : true,
        allowNull : false
    },
    transactionId : {
        type : db.Sequelize.INTEGER,
        allowNull : false
    },
    productId : {
        type : db.Sequelize.INTEGER,
        allowNull : false
    },
    qty : {
        type : db.Sequelize.INTEGER,
        allowNull : false,
        defaultValue : 0
    },
    subtotal : {
        type : db.Sequelize.INTEGER,
        allowNull : false,
        defaultValue : 0
    }
},
{ timestamps: false }
);

export const Payment = db.sequelize.define("payments", {
    paymentId: {
      type: db.Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    transactionId: {
      type: db.Sequelize.INTEGER,
      allowNull: false,
    },
    paymentAmount: {
      type: db.Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    change: {
      type: db.Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
}, 
{ timestamps: false }
);

export const SalesReport = db.sequelize.define("sales_reports", {
    salesReportId : {
        type : db.Sequelize.INTEGER,
        primaryKey : true,
        autoIncrement : true,
        allowNull : false
    },
    salesReportName : {
        type : db.Sequelize.STRING(45),
        allowNull : false
    },
    salesReportDate : {
        type : db.Sequelize.DATE,
        allowNull : false
    },
    dateStart : {
        type : db.Sequelize.DATE,
        allowNull : false
    },
    dateEnd : {
        type : db.Sequelize.DATE,
        allowNull : false
    },
    totalSales : {
        type : db.Sequelize.INTEGER,
        allowNull : false,
        defaultValue : 0
    },
    graph : {
        type : db.Sequelize.STRING(255),
        allowNull : true
    }
},
{ timestamps: false }
);

