import { User } from "./user.js"
import { Category } from "./category.js"
import { Product } from "./product.js";
import { Transaction, ProductSold, Payment, SalesReport } from "./transaction.js";

// @define relations
User.hasMany(Category, { foreignKey : "userId" }); //admin
User.hasMany(Product, { foreignKey : "userId"}); //admin
User.hasMany(SalesReport, { foreignKey : "userId"}); //admin
User.hasMany(Transaction, { foreignKey : "userId"}); //cashier

Category.hasMany(Product, { foreignKey : 'categoryId' });
Category.belongsTo(User, { foreignKey : 'userId' });

Product.hasMany(ProductSold, { foreignKey : 'productId' });
Product.belongsTo(User, { foreignKey : 'userId' });
Product.belongsTo(Category, { foreignKey : 'categoryId' });

Transaction.hasMany(ProductSold, { foreignKey : 'transactionId' });
Transaction.hasOne(Payment, { foreignKey : 'transactionId' });
Transaction.belongsTo(User, { foreignKey : 'userId' });
Transaction.belongsTo(SalesReport, { foreignKey : 'salesReportId' });

ProductSold.belongsTo(Product, { foreignKey : 'productId' });
ProductSold.belongsTo(Transaction, { foreignKey : 'transactionId' });
    
Payment.belongsTo(Transaction, { foreignKey : 'transactionId' });

// SalesReport.hasMany(Transaction);
SalesReport.belongsTo(User, { foreignKey : 'userId' })

export { User, Category, Product, Transaction, ProductSold, Payment, SalesReport }
