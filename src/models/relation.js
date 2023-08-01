import { User } from "./user.js"
import { Category } from "./category.js"
import { Product } from "./product.js";
import { Transaction, ProductSold, Payment, SalesReport } from "./transaction.js";

// @define relations
User.hasMany(Category); //admin
User.hasMany(Product); //admin
User.hasMany(SalesReport); //admin
User.hasMany(Transaction); //cashier

Category.hasMany(Product);
Category.belongsTo(User, { foreignKey : 'userId' });

Product.hasMany(ProductSold);
Product.belongsTo(User, { foreignKey : 'userId' });
Product.belongsTo(Category, { foreignKey : 'categoryId' });

Transaction.hasMany(ProductSold);
Transaction.hasOne(Payment);
Transaction.belongsTo(User, { foreignKey : 'userId' });
Transaction.belongsTo(SalesReport, { foreignKey : 'salesReportId' });

ProductSold.belongsTo(Product, { foreignKey : 'productId' });
ProductSold.belongsTo(Transaction, { foreignKey : 'transactionId' });
    
Payment.belongsTo(Transaction, { foreignKey : 'transactionId' });

SalesReport.hasMany(Transaction);
SalesReport.belongsTo(User, { foreignKey : 'userId' })

export { User, Category, Product, Transaction, ProductSold, Payment, SalesReport }
