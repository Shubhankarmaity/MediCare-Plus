import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Paper, Box, Typography, TextField, IconButton, Avatar, CircularProgress } from '@mui/material';
import { Send, X, Check, CheckCheck } from 'lucide-react';
import io from 'socket.io-client';
import { API_URL } from '../config';

const socket = io(API_URL);

const ChatWindow = ({ currentUser, chatPartner, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    }, []);

    const fetchMessages = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/messages/${chatPartner._id}`, {
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
    }, [chatPartner._id, scrollToBottom]);

    const markMessagesAsRead = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/messages/read/${chatPartner._id}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update UI for incoming messages (optional, mainly affects other user)
        } catch (err) {
            console.error("Failed to mark read", err);
        }
    }, [chatPartner._id]);

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
    }, [chatPartner._id, currentUser.id, fetchMessages, markMessagesAsRead, scrollToBottom]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/messages/send`, {
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

    return (
        <Paper
            elevation={0}
            sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                width: 360,
                height: 500,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 4,
                overflow: 'hidden',
                zIndex: 1300,
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)'
            }}
        >
            {/* Header */}
            <Box sx={{ p: 2, background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'rgba(255,255,255,0.2)', color: '#ffffff', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        {chatPartner?.name?.charAt(0) || '?'}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2" fontWeight="800" lineHeight={1.2}>
                            {chatPartner?.name || 'User'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                            <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem', fontWeight: 500 }}>
                                Online
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                <IconButton size="small" onClick={onClose} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                    <X size={18} />
                </IconButton>
            </Box>

            {/* Messages Area */}
            <Box sx={{ flex: 1, p: 2, overflowY: 'auto', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 1.5 }}>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress size={24} sx={{ color: '#3b82f6' }} />
                    </Box>
                ) : messages.length === 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                        <MessageSquare size={32} className="text-slate-400 mb-2" />
                        <Typography variant="caption" color="#475569" fontWeight="600" textAlign="center">
                            Start a conversation with {chatPartner.name}
                        </Typography>
                    </Box>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderId._id === currentUser.id || msg.senderId === currentUser.id;
                        return (
                            <Box
                                key={index}
                                sx={{
                                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isMe ? 'flex-end' : 'flex-start'
                                }}
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 1.2,
                                        px: 2,
                                        bgcolor: isMe ? '#dbeafe' : '#ffffff', 
                                        color: isMe ? '#0f172a' : '#1e293b',
                                        borderRadius: 3,
                                        borderBottomRightRadius: isMe ? 4 : 12,
                                        borderBottomLeftRadius: isMe ? 12 : 4,
                                        border: isMe ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                                        position: 'relative',
                                        minWidth: '80px'
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.5, wordBreak: 'break-word', mr: isMe ? 2 : 0 }}>{msg.content}</Typography>

                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                        <Typography variant="caption" sx={{ color: isMe ? '#64748b' : '#94a3b8', fontSize: '0.65rem', fontWeight: 600 }}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>
                                        {isMe && (
                                            msg.read ?
                                                <CheckCheck size={14} color="#0284c7" /> :  
                                                <Check size={14} color="#94a3b8" />            
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
            <Box component="form" onSubmit={handleSend} sx={{ p: 1.5, bgcolor: '#ffffff', display: 'flex', gap: 1, alignItems: 'center', borderTop: '1px solid #e2e8f0' }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    variant="outlined"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 6,
                            bgcolor: '#f1f5f9',
                            '& fieldset': { border: 'none' },
                            '& input': { py: 1.5, px: 2, fontSize: '0.9rem' }
                        }
                    }}
                />
                <IconButton
                    type="submit"
                    disabled={!newMessage.trim()}
                    sx={{
                        bgcolor: '#3b82f6',
                        color: 'white',
                        width: 42,
                        height: 42,
                        borderRadius: 6,
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
