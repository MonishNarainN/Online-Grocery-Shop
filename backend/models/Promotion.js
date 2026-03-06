const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    target: {
        type: String,
        enum: ['All', 'Category'],
        required: true
    },
    targetValue: {
        type: String
        // e.g., 'Dairy', 'Vegetables'. Optional if target is 'All'
    },
    discountPercent: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    },
    minQuantity: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
}, {
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

module.exports = mongoose.model('Promotion', promotionSchema);
