const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    // Only one document should exist for global settings
    singleton_id: { type: String, default: 'global', unique: true },
    is_online: { type: Boolean, default: true },
    offline_until: { type: Date, default: null }
});

module.exports = mongoose.model('Settings', settingsSchema);
