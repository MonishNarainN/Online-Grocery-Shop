const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    saved_addresses: [{
        label: String, // e.g., "Home", "Work"
        address_line: String,
        city: { type: String, required: true },
        pincode: String,
        is_default: { type: Boolean, default: false }
    }],
    verificationCode: { type: String },
    isVerified: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
}, {
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            delete ret.password;
            delete ret.verificationCode; // Don't expose code
            return ret;
        }
    }
});

// Hash password before saving
// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
