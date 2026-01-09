const router = require('express').Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// GET USER NOTIFICATIONS
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json(err);
    }
});

// MARK AS READ
router.put('/:id/read', auth, async (req, res) => {
    try {
        const updated = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
