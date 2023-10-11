import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    url: {type: String, required: true, unique: true},
    currency: {type: String, required: true},
    image: {type: String, required: true},
    title: {type: String, required: true},
    currentPrice: {type: Number, required: true},
    originalPrice: {type: Number, required: true},
    isOutOfStock: {type: Boolean, required: true, default: false},
    discountRate: {type: Number, required: true},
    brand: {type: String, required: true},
    deliveryDate: {type: String, required: true},
    lowestPrice: {type: Number},
    highestPrice: {type: Number},
    averagePrice: {type: Number},
    priceHistory: [
        {
            price: {type: Number, required: true},
            date: { type: Date, default: Date.now}
        }
    ],
    users: [
        {email: {type: String, required: true}}
    ], default: []
} , {timestamps: true})

const Product = mongoose.models.Product || mongoose.model('Product', productSchema)
export default Product