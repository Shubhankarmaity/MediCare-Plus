import React, { useState, useEffect, useRef } from 'react';
import { Paper, Box, Typography, TextField, IconButton, Avatar, CircularProgress } from '@mui/material';
import { Send, X, Check, CheckCheck } from 'lucide-react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const ChatWindow = ({ currentUser, chatPartner, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Initial Join & Fetch
    useEffect(() => {
        socket.emit("join_room", currentUser.id);

        fetchMessages();
        markMessagesAsRead(); // Mark as read immediately when opening

        // Listen for incoming messages
        socket.on("receive_message", (message) => {
            // Check if this message belongs to the current open chat
            if ((message.senderId._id === chatPartner._id || message.senderId === chatPartner._id) ||
                (message.receiverId === currentUser.id)) {

                setMessages((prev) => [...prev, message]);
                scrollToBottom();

                // If chat is open and focused, mark as read immediately
                if (document.hasFocus()) {
                    markMessagesAsRead();
                }
            }
        });

        // Listen for when MY messages are read by the other person
        socket.on("messages_read", (data) => {
            if (data.readerId === chatPartner._id) {
                setMessages(prev => prev.map(msg =>
                    (msg.senderId._id === currentUser.id || msg.senderId === currentUser.id)
                        ? { ...msg, read: true }
                        : msg
                ));
            }
        });

        return () => {
            socket.off("receive_message");
            socket.off("messages_read");
        };
    }, [chatPartner._id]);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/messages/${chatPartner._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch messages');
            const data = await res.json();
            setMessages(data);
            scrollToBottom();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const markMessagesAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/messages/read/${chatPartner._id}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update UI for incoming messages (optional, mainly affects other user)
        } catch (err) {
            console.error("Failed to mark read", err);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/messages/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    receiverId: chatPartner._id,
                    content: newMessage
                })
            });
            if (!res.ok) throw new Error('Failed to send message');
            const savedMessage = await res.json();

            // Saved message from backend usually has "read: false" default
            setMessages((prev) => [...prev, savedMessage]);
            setNewMessage('');
            scrollToBottom();
        } catch (err) {
            console.error("Failed to send", err);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    return (
        <Paper
            elevation={6}
            sx={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                width: 350,
                height: 450,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                overflow: 'hidden',
                zIndex: 1300
            }}
        >
            {/* Header */}
            <Box sx={{ p: 2, bgcolor: '#3b82f6', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'white', color: '#3b82f6', fontSize: '0.8rem' }}>
                        {chatPartner?.name?.charAt(0) || '?'}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold" lineHeight={1.2}>
                            {chatPartner?.name || 'User'}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
                            Online
                        </Typography>
                    </Box>
                </Box>
                <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
                    <X size={18} />
                </IconButton>
            </Box>

            {/* Messages Area */}
            <Box sx={{ flex: 1, p: 2, overflowY: 'auto', bgcolor: '#e5ddd5', display: 'flex', flexDirection: 'column', gap: 1 }}>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : messages.length === 0 ? (
                    <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 4, bgcolor: 'rgba(255,255,255,0.8)', p: 1, borderRadius: 1 }}>
                        Start a conversation with {chatPartner.name}
                    </Typography>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderId._id === currentUser.id || msg.senderId === currentUser.id;
                        return (
                            <Box
                                key={index}
                                sx={{
                                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isMe ? 'flex-end' : 'flex-start'
                                }}
                            >
                                <Paper
                                    elevation={1}
                                    sx={{
                                        p: 1,
                                        px: 1.5,
                                        bgcolor: isMe ? '#dcf8c6' : 'white', // WhatsApp style colors
                                        color: 'black',
                                        borderRadius: 2,
                                        position: 'relative',
                                        minWidth: '80px'
                                    }}
                                >
                                    <Typography variant="body2" sx={{ mr: isMe ? 2 : 0 }}>{msg.content}</Typography>

                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>
                                        {isMe && (
                                            msg.read ?
                                                <CheckCheck size={14} color="#34B7F1" /> :  // Blue double tick
                                                <Check size={14} color="gray" />            // Gray single/double tick
                                        )}
                                    </Box>
                                </Paper>
                            </Box>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box component="form" onSubmit={handleSend} sx={{ p: 1.5, bgcolor: '#f0f0f0', display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    variant="outlined"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 4,
                            bgcolor: 'white',
                            '& fieldset': { border: 'none' }
                        }
                    }}
                />
                <IconButton
                    type="submit"
                    disabled={!newMessage.trim()}
                    sx={{
                        bgcolor: '#3b82f6',
                        color: 'white',
                        width: 40,
                        height: 40,
                        '&:hover': { bgcolor: '#2563eb' },
                        '&:disabled': { bgcolor: '#cbd5e1' }
                    }}
                >
                    <Send size={18} />
                </IconButton>
            </Box>
        </Paper>
    );
};

export default ChatWindow;
