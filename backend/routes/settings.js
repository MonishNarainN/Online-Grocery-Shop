const express = require('express');
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');
const router = express.Router();

// Helper to get or create global settings
const getGlobalSettings = async () => {
    let settings = await Settings.findOne({ singleton_id: 'global' });
    if (!settings) {
        settings = new Settings();
        await settings.save();
    }

    // Auto-online if time has passed
    if (!settings.is_online && settings.offline_until && new Date() >= settings.offline_until) {
        settings.is_online = true;
        settings.offline_until = null;
        await settings.save();
    }
    return settings;
};

// GET current store status
router.get('/', async (req, res) => {
    try {
        const settings = await getGlobalSettings();
        res.json({
            is_online: settings.is_online,
            offline_until: settings.offline_until
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Admin ONLY: update store status
router.put('/', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    try {
        const { is_online, offline_until } = req.body;

        let settings = await getGlobalSettings();
        settings.is_online = is_online !== undefined ? is_online : settings.is_online;
        // Allows setting to null or a Date string
        settings.offline_until = offline_until !== undefined ? offline_until : settings.offline_until;

        // If they manually set it online, clear the offline_until time
        if (settings.is_online) {
            settings.offline_until = null;
        }

        await settings.save();

        res.json({
            is_online: settings.is_online,
            offline_until: settings.offline_until,
            message: 'Settings updated'
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
