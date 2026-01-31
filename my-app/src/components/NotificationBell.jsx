import React, { useState, useEffect } from 'react';
import { Badge, IconButton, Menu, MenuItem, Typography, Box, ListItemText, Divider, Avatar } from '@mui/material';
import { Bell, Check } from 'lucide-react';
import { API_URL } from '../config';

const NotificationBell = ({ userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    useEffect(() => {
        fetchNotifications();
        // Listen for real-time notifications via prop or global socket if available
        // For now, we rely on polling or parent component passing socket event
        // Ideally, pass socket as prop or use context
    }, [userId]);

    // Expose a method to add notification from parent socket listener
    useEffect(() => {
        // Just a placeholder to show we can expose this update logic
        window.updateNotifications = fetchNotifications;
        return () => { delete window.updateNotifications; };
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch notifications');
            const data = await res.json();
            setNotifications(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update local state
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <>
            <IconButton onClick={handleClick} size="large" sx={{ ml: 2, color: 'text.secondary' }}>
                <Badge badgeContent={unreadCount} color="error">
                    <Bell />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        width: 320,
                        maxHeight: 400
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: 2, pb: 1 }}>
                    <Typography variant="h6" fontWeight="bold">Notifications</Typography>
                </Box>
                <Divider />
                {notifications.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography color="text.secondary">No notifications</Typography>
                    </Box>
                ) : (
                    notifications.map((notification) => (
                        <MenuItem
                            key={notification._id}
                            onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                            sx={{
                                py: 1.5,
                                bgcolor: notification.read ? 'transparent' : '#f0f9ff',
                                '&:hover': { bgcolor: '#f3f4f6' }
                            }}
                        >
                            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Typography variant="body2" fontWeight={!notification.read ? 600 : 400} sx={{ whiteSpace: 'pre-wrap' }}>
                                        {notification.message}
                                    </Typography>
                                    {!notification.read && <Box sx={{ width: 8, height: 8, bgcolor: '#3b82f6', borderRadius: '50%', mt: 0.5 }} />}
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                    {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                            </Box>
                        </MenuItem>
                    ))
                )}
            </Menu>
        </>
    );
};

export default NotificationBell;
