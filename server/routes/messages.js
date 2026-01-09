const router = require('express').Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

// SEND MESSAGE
router.post('/send', auth, async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.id;

        const newMessage = await Message.create({
            senderId,
            receiverId,
            content
        });

        const savedMessage = await newMessage.populate('senderId', 'name email role');

        // Emit socket event to receiver
        if (req.io) {
            req.io.to(receiverId).emit('receive_message', savedMessage);
        }

        res.status(200).json(savedMessage);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET CONVERSATION WITH SPECIFIC USER
router.get('/:userId', auth, async (req, res) => {
    try {
        const userId1 = req.user.id;
        const userId2 = req.params.userId;

        const messages = await Message.find({
            $or: [
                { senderId: userId1, receiverId: userId2 },
                { senderId: userId2, receiverId: userId1 }
            ]
        })
            .sort({ createdAt: 1 })
            .populate('senderId', 'name email role');

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET LIST OF RECENT CONVERSATIONS (For Admin mostly)
router.get('/conversations/list', auth, async (req, res) => {
    try {
        const currentUserId = req.user.id;

        // Find all messages where current user is sender or receiver
        const messages = await Message.find({
            $or: [{ senderId: currentUserId }, { receiverId: currentUserId }]
        })
            .populate('senderId', 'name role')
            .populate('receiverId', 'name role')
            .sort({ createdAt: -1 });

        const conversations = [];
        const visitedIds = new Set();

        for (const msg of messages) {
            const otherUser = msg.senderId._id.toString() === currentUserId
                ? msg.receiverId
                : msg.senderId;

            if (!visitedIds.has(otherUser._id.toString())) {
                visitedIds.add(otherUser._id.toString());

                // Count unread messages from this user
                const unreadCount = await Message.countDocuments({
                    senderId: otherUser._id,
                    receiverId: currentUserId,
                    read: false
                });

                conversations.push({
                    user: otherUser,
                    lastMessage: msg.content,
                    createdAt: msg.createdAt,
                    read: msg.read,
                    isMyMessage: msg.senderId._id.toString() === currentUserId,
                    unreadCount
                });
            }
        }

        res.status(200).json(conversations);
    } catch (err) {
        console.error("Error fetching conversations:", err);
        res.status(500).json(err);
    }
});

// MARK MESSAGES AS READ
router.put('/read/:senderId', auth, async (req, res) => {
    try {
        const senderId = req.params.senderId;
        const receiverId = req.user.id; // Current user is the receiver

        // Update all unread messages from this sender to this receiver
        await Message.updateMany(
            { senderId: senderId, receiverId: receiverId, read: false },
            { $set: { read: true } }
        );

        // Notify the sender that messages have been read
        if (req.io) {
            req.io.to(senderId).emit('messages_read', {
                readerId: receiverId,
                readAt: new Date()
            });
        }

        res.status(200).json({ message: "Messages marked as read" });
    } catch (err) {
        console.error("Error marking messages as read:", err);
        res.status(500).json(err);
    }
});

module.exports = router;
