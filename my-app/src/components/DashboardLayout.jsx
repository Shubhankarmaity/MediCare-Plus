import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Typography, Menu, MenuItem, Avatar, Tooltip, Box } from '@mui/material';
import { User, Shield, Activity, Ambulance } from 'lucide-react';

// Helper to generate color from name
function stringToColor(string) {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
}

function stringAvatar(name) {
    return {
        sx: {
            bgcolor: stringToColor(name),
        },
        children: `${name.split(' ')[0][0]}${name.split(' ')[1] ? name.split(' ')[1][0] : ''}`,
    };
}

const DashboardLayout = ({ title, userRole, children }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{"name": "Guest User"}');

    // Menu State
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenu = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleLogout = () => {
        console.log('Logging out - Clearing all data');
        
        // Clear all localStorage items
        localStorage.clear();
        
        // Also explicitly remove token and user for safety
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        console.log('LocalStorage cleared');
        
        // Clear session storage as well
        sessionStorage.clear();
        
        // Navigate to login
        navigate('/login', { replace: true });
        
        // Force reload to clear any cached state and React components
        setTimeout(() => {
            window.location.href = '/login';
        }, 100);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* MUI App Bar */}
            <AppBar position="sticky" color="default" elevation={1} sx={{ bgcolor: 'white' }}>
                <Toolbar>
                    {/* Role Icon */}
                    <Box sx={{ mr: 2, display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                        {userRole === 'patient' && <User size={28} className="text-blue-600" />}
                        {userRole === 'doctor' && <Activity size={28} className="text-teal-600" />}
                        {userRole === 'driver' && <Ambulance size={28} className="text-red-600" />}
                        {userRole === 'admin' && <Shield size={28} className="text-purple-600" />}
                    </Box>

                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: '#333' }}>
                        {title}
                    </Typography>

                    {/* User Avatar & Menu */}
                    <div>
                        <Tooltip title="Account settings">
                            <IconButton onClick={handleMenu} size="small" sx={{ ml: 2 }}>
                                {/* Automatically generates initials and color based on name */}
                                <Avatar {...stringAvatar(user.name.toUpperCase())} />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            keepMounted
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            open={open}
                            onClose={handleClose}
                        >
                            {/* UPDATE THIS LINE: */}
                            <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
                                My Profile
                            </MenuItem>

                            <MenuItem onClick={handleClose}>Account Settings</MenuItem>
                            <MenuItem onClick={handleLogout} sx={{ color: 'red' }}>Logout</MenuItem>
                        </Menu>
                    </div>
                </Toolbar>
            </AppBar>

            <main className="max-w-7xl mx-auto p-6">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;