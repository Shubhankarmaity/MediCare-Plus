import React from 'react';
import { Card, CardContent, Typography, Chip, Button, Avatar } from '@mui/material';
import { User, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const AccessRequestsTab = ({ accessRequests, respondToAccessRequest }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full">
      <Card elevation={0} className="glass-panel border border-divider-gray h-full">
        <CardContent className="p-6">
          <h3 className="font-bold text-xl mb-6 flex items-center gap-2 font-outfit text-primary-navy">
            <User className="text-primary-blue" /> Access Requests
          </h3>

          {accessRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <div className="bg-blue-50 p-4 rounded-full mb-3">
                <ShieldAlert size={48} className="text-primary-blue/50" />
              </div>
              <Typography className="text-gray-500 font-medium">No access requests at this time.</Typography>
              <Typography variant="body2" className="mt-1">When a doctor or admin requests access to your profile, it will appear here.</Typography>
            </div>
          ) : (
            <div className="space-y-4">
              {accessRequests.map((request, index) => (
                <motion.div key={request.requestId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                  <Card elevation={0} className={`border ${request.status === 'pending' ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200'} transition-all hover:shadow-sm`}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <Avatar sx={{ bgcolor: request.status === 'pending' ? '#f59e0b' : '#3b82f6' }}>
                            {(request.name || 'U').charAt(0)}
                          </Avatar>
                          <div>
                            <Typography variant="h6" fontWeight="bold" className="font-outfit text-gray-900 leading-tight">
                              {request.name || 'Unknown User'}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600 font-medium">
                              Requested access to your profile
                            </Typography>
                            <Typography variant="caption" className="text-gray-400 font-mono text-xs">
                              {new Date(request.requestedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                            </Typography>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Chip
                            label={(request.status || 'pending').toUpperCase()}
                            color={
                              request.status === 'approved' ? 'success' :
                                request.status === 'rejected' ? 'error' : 'warning'
                            }
                            size="small"
                            className="font-bold"
                          />
                          {request.status === 'pending' && (
                            <div className="flex gap-2 ml-auto">
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={() => respondToAccessRequest(request.requestId, 'approve')}
                                startIcon={<CheckCircle size={16} />}
                                className="bg-emerald-500 hover:bg-emerald-600 shadow-none font-bold"
                                sx={{ textTransform: 'none' }}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => respondToAccessRequest(request.requestId, 'reject')}
                                startIcon={<XCircle size={16} />}
                                className="border-red-200 text-red-600 hover:bg-red-50 font-bold"
                                sx={{ textTransform: 'none' }}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
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

export default AccessRequestsTab;
