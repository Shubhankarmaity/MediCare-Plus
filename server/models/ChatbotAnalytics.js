const mongoose = require('mongoose');

const chatbotAnalyticsSchema = new mongoose.Schema({
    query: { type: String, required: true },
    correctedQuery: { type: String },
    expandedQuery: { type: String },
    intent: { type: String },
    intentConfidence: { type: Number },
    matchedCategory: { type: String },
    matchSource: { type: String, enum: ['nlp', 'fuse', 'keyword', 'fallback', 'clarify'] },
    responseTime: { type: Number }, // milliseconds
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    feedback: { type: String, enum: ['helpful', 'not_helpful'] },
    feedbackComment: { type: String },
    sessionId: { type: String },
}, { timestamps: true });

// Index for analytics queries
chatbotAnalyticsSchema.index({ createdAt: -1 });
chatbotAnalyticsSchema.index({ matchSource: 1, createdAt: -1 });
chatbotAnalyticsSchema.index({ feedback: 1 });

module.exports = mongoose.model('ChatbotAnalytics', chatbotAnalyticsSchema);
