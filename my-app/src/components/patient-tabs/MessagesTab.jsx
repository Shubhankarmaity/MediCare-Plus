import React from 'react';
import { Card, CardContent, Typography, Avatar, Box } from '@mui/material';
import { MessageCircle, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const MessagesTab = ({ conversations, setChatPartner, setActiveChat }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full">
      <Card elevation={0} className="glass-panel border border-divider-gray h-full">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="font-bold text-xl flex items-center gap-2 font-outfit text-primary-navy">
              <MessageCircle className="text-primary-blue bg-blue-50 p-1.5 rounded-lg" size={32} /> 
              My Messages
            </h3>
            
            {conversations.length > 0 && (
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search chats..." 
                  className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all w-full sm:w-64"
                />
              </div>
            )}
          </div>

          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <div className="bg-blue-50 p-5 rounded-full mb-4">
                <MessageCircle size={48} className="text-primary-blue/50" />
              </div>
              <Typography variant="h6" className="text-gray-600 font-bold font-outfit mb-1">No conversations yet</Typography>
              <Typography variant="body2" className="text-center max-w-sm">When you message a doctor or hospital admin, your chats will appear here.</Typography>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((convo, index) => (
                <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card
                    elevation={0}
                    className="border border-gray-100 transition-all hover:shadow-md hover:border-blue-100 cursor-pointer"
                    sx={{ borderRadius: 3 }}
                    onClick={() => {
                      setChatPartner(convo.user);
                      setActiveChat(true);
                    }}
                  >
                    <CardContent sx={{ p: '16px !important' }} className="hover:bg-blue-50/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar sx={{ bgcolor: '#3b82f6', width: 48, height: 48 }} className="shadow-sm font-bold text-lg border-2 border-white">
                            {convo.user.name?.charAt(0) || '?'}
                          </Avatar>
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <Typography variant="subtitle1" fontWeight="bold" className="font-outfit text-gray-900 truncate pr-2">
                              {convo.user.name || 'Unknown User'}
                            </Typography>
                            <div className="flex flex-col items-end flex-shrink-0">
                              <Typography variant="caption" className={`${convo.unreadCount > 0 ? 'text-primary-blue font-bold' : 'text-gray-400 font-medium'}`}>
                                {new Date(convo.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <Typography 
                              variant="body2" 
                              className={`truncate pr-4 ${convo.unreadCount > 0 ? "text-gray-900 font-bold" : "text-gray-500 font-medium"}`}
                            >
                              {convo.lastMessage}
                            </Typography>
                            {convo.unreadCount > 0 && (
                              <Box
                                sx={{
                                  bgcolor: '#3b82f6',
                                  color: 'white',
                                  borderRadius: '50%',
                                  minWidth: 22,
                                  height: 22,
                                  px: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                }}
                                className="shadow-sm"
                              >
                                {convo.unreadCount}
                              </Box>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MessagesTab;
