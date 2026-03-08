import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    X, Send, Bot, User, Loader2, ChevronDown,
    HeartPulse, Star, Banknote, Sparkles,
    RotateCcw, ShieldCheck, ExternalLink, Map,
    Info, AlertTriangle, AlertOctagon, Stethoscope,
    ThumbsUp, ThumbsDown, Zap, ChevronRight
} from 'lucide-react';
import api from '../services/api';

// =====================================================
//  SITE MAP — every page MediBot knows about
// =====================================================
const SITE_PAGES = [
    { path: '/', name: 'Home', emoji: '🏠', description: 'Landing page — overview, services, hospitals, features, FAQ, contact.', keywords: ['home', 'main', 'landing', 'start', 'about', 'overview', 'medicareplus'] },
    { path: '/hospitals', name: 'Hospital Search', emoji: '🏥', description: 'Search and browse all registered hospitals.', keywords: ['hospital', 'hospitals', 'find hospital', 'search hospital', 'all hospitals', 'hospital list'] },
    { path: '/ambulance', name: 'Ambulance Services', emoji: '🚑', description: 'Book emergency ambulance services.', keywords: ['ambulance', 'emergency ambulance', 'book ambulance', 'driver'] },
    { path: '/lab-tests', name: 'Lab Tests', emoji: '🧪', description: 'Browse lab tests, diagnostics, and health checkup plans.', keywords: ['lab', 'lab test', 'diagnostic', 'blood test', 'health checkup', 'pathology'] },
    { path: '/login', name: 'Login', emoji: '🔐', description: 'Sign in to your MediCare Plus account.', keywords: ['login', 'sign in', 'signin', 'log in', 'forgot'] },
    { path: '/signup', name: 'Sign Up', emoji: '📝', description: 'Create a new account — patient, doctor, admin, or driver.', keywords: ['signup', 'register', 'sign up', 'create account', 'new account', 'join'] },
    { path: '/forgot-password', name: 'Forgot Password', emoji: '🔑', description: 'Reset your account password via email.', keywords: ['forgot', 'reset password', 'forgot password'] },
    { path: '/profile', name: 'Profile', emoji: '👤', description: 'View and edit your personal profile and medical history.', keywords: ['profile', 'edit profile', 'personal info', 'update profile', 'account settings'] },
    {
        path: '/patient-dashboard', name: 'Patient Dashboard', emoji: '🩺',
        description: 'Patient portal: appointments, vitals, prescriptions, ambulance, reports, messages, payments.',
        sections: ['Overview', 'Find Doctors', 'My Appointments', 'Health Vitals', 'Prescriptions', 'Book Ambulance', 'My Reports', 'Access Requests', 'Messages', 'Payments', 'Settings'],
        keywords: ['patient', 'patient dashboard', 'appointment', 'book doctor', 'find doctor', 'prescription', 'vitals', 'report', 'ambulance', 'messages', 'payment', 'settings', 'book appointment']
    },
    { path: '/doctor-dashboard', name: 'Doctor Dashboard', emoji: '👨‍⚕️', description: 'Doctor portal — manage appointments, prescriptions, video calls.', keywords: ['doctor', 'doctor dashboard', 'doctor portal'] },
    { path: '/admin-dashboard', name: 'Admin Dashboard', emoji: '🏢', description: 'Hospital admin portal — manage hospital details, approve doctors.', keywords: ['admin', 'admin dashboard', 'hospital admin'] },
    { path: '/driver-dashboard', name: 'Driver Dashboard', emoji: '🚗', description: 'Ambulance driver portal — view and respond to emergency requests.', keywords: ['driver', 'driver dashboard', 'ambulance driver'] },
    { path: '/super-admin-dashboard', name: 'Super Admin', emoji: '⚙️', description: 'Super admin — manage all hospitals, approvals, and analytics.', keywords: ['super admin', 'system admin', 'superadmin'] },
    { path: '/team', name: 'Project Team', emoji: '👥', description: 'Meet the development team behind MediCare Plus.', keywords: ['team', 'developers', 'meet team', 'who built', 'creators'] },
];

const PATIENT_TABS = [
    { index: 0, name: 'Overview', keywords: ['overview', 'stats', 'summary', 'dashboard home'] },
    { index: 1, name: 'Find Doctors', keywords: ['find doctor', 'book doctor', 'doctors', 'specialist'] },
    { index: 2, name: 'My Appointments', keywords: ['appointment', 'my appointments', 'upcoming', 'scheduled', 'book appointment'] },
    { index: 3, name: 'Health Vitals', keywords: ['vitals', 'bp', 'blood pressure', 'sugar', 'weight', 'health track', 'spo2'] },
    { index: 4, name: 'Prescriptions', keywords: ['prescription', 'medicine', 'medication'] },
    { index: 5, name: 'Book Ambulance', keywords: ['book ambulance', 'emergency'] },
    { index: 6, name: 'My Reports', keywords: ['report', 'pdf', 'medical report', 'download'] },
    { index: 7, name: 'Access Requests', keywords: ['access', 'data access', 'privacy'] },
    { index: 8, name: 'Messages', keywords: ['message', 'chat', 'message doctor'] },
    { index: 9, name: 'Payments', keywords: ['payment', 'bill', 'invoice', 'fee'] },
    { index: 10, name: 'Settings', keywords: ['settings', 'notification'] },
];

const QUICK_SUGGESTIONS = [
    { label: '🏥 Recommend a hospital', query: 'recommend a hospital for me' },
    { label: '📅 Book appointment', query: 'how do I book a doctor appointment?' },
    { label: '💊 What is diabetes?', query: 'what is diabetes and how to manage it?' },
    { label: '🚑 Book ambulance', query: 'how do I book an ambulance?' },
    { label: '🗺 All pages', query: 'show me all pages of the website' },
    { label: '❤️ Heart disease info', query: 'what are the symptoms of heart disease?' },
    { label: '🧪 Blood test guide', query: 'explain common blood test results' },
    { label: '🩺 First aid tips', query: 'first aid for emergencies' },
];

const VISITOR_SUGGESTIONS = [
    { label: '🏥 What is MediCare Plus?', query: 'what is medicare plus?' },
    { label: '📝 How to register?', query: 'how do I create an account?' },
    { label: '📅 Book appointment', query: 'how do I book a doctor appointment?' },
    { label: '🏥 Find hospitals', query: 'show me all hospitals' },
];

// =====================================================
//  WEBSITE FAQ KNOWLEDGE BASE
//  Answers general questions about the MediCare Plus platform
// =====================================================
const WEBSITE_FAQ = [
    {
        keywords: ['what is medicare', 'what is this website', 'what is this app', 'about this site', 'about medicare', 'tell me about', 'what does this site', 'what does medicare'],
        answer: `🏥 **MediCare Plus** is a comprehensive digital healthcare platform that connects patients with doctors, hospitals, ambulances, and health services — all in one place.\n\n**What you can do:**\n• 👨‍⚕️ Find & book appointments with specialist doctors\n• 🏥 Search hospitals and get AI-powered recommendations\n• 🚑 Book emergency ambulance services\n• 🧪 Access lab test information and health checkups\n• 💬 Chat with doctors and hospital admins\n• 📋 Manage prescriptions, medical reports & health vitals\n• 🤖 Get AI-powered personalized health advice\n\nMediCare Plus is designed to make healthcare accessible and efficient for everyone.`
    },
    {
        keywords: ['how to register', 'how do i create', 'create account', 'sign up', 'how to sign up', 'how to join', 'new account', 'get started', 'register'],
        answer: `📝 **Creating an account on MediCare Plus is simple!**\n\n1. Click **Sign Up** in the top navigation\n2. Choose your **role:**\n   - 🧑‍⚕️ **Patient** — to book appointments & manage health\n   - 👨‍⚕️ **Doctor** — to manage appointments & patients\n   - 🚗 **Driver** — to manage ambulance requests\n   - 🏢 **Admin** — to manage a hospital\n3. Fill in your details and select your hospital\n4. Verify your email via OTP\n5. You're in! 🎉\n\n> Doctors require additional approval from their hospital admin before they can accept appointments.`,
        page: { path: '/signup', name: 'Sign Up', emoji: '📝', description: 'Create your MediCare Plus account.' }
    },
    {
        keywords: ['how to login', 'how do i login', 'how to sign in', 'sign in', 'log in', 'forgot password', 'reset password'],
        answer: `🔐 **To log in:**\n1. Click **Login** in the navigation bar\n2. Enter your registered email and password\n3. Click **Sign In**\n\n**Forgot your password?** Click *"Forgot Password"* on the login page — you'll receive a password reset link via email.\n\n> 💡 Doctors and admins have special default credentials. Contact your hospital admin if you need help.`,
        page: { path: '/login', name: 'Login', emoji: '🔐', description: 'Sign in to your account.' }
    },
    {
        keywords: ['book appointment', 'how to book', 'how do i book', 'book doctor', 'appointment booking', 'schedule appointment', 'find doctor', 'see a doctor'],
        answer: `📅 **To book a doctor appointment:**\n\n1. **Log in** as a Patient\n2. Go to your **Patient Dashboard**\n3. Click **"Find Doctors"** in the sidebar\n4. Browse doctors from your registered hospital\n5. Click **"Book Appointment"** on the doctor card\n6. Confirm the booking\n\nThe doctor will review and approve your appointment. You'll be notified when it's confirmed.\n\n> 💡 You can only book with doctors from your registered hospital.`,
        page: { path: '/patient-dashboard', name: 'Patient Dashboard', emoji: '🩺', description: 'Go to Find Doctors tab.', sections: ['Find Doctors'] }
    },
    {
        keywords: ['book ambulance', 'ambulance', 'emergency service', 'how to get ambulance', 'ambulance service', 'emergency transport'],
        answer: `🚑 **To book an ambulance:**\n\n**Option 1 — From Patient Dashboard:**\n1. Go to **Patient Dashboard** → **Book Ambulance** tab\n2. Select an available driver\n3. Confirm — your GPS location is sent automatically\n\n**Option 2 — From Ambulance Page:**\n1. Visit the **Ambulance Services** page\n2. Browse available drivers\n3. Book directly (login required)\n\n> ⚡ Your real-time location is shared with the driver for fastest response.`,
        page: { path: '/ambulance', name: 'Ambulance Services', emoji: '🚑', description: 'Book emergency ambulance.' }
    },
    {
        keywords: ['what hospitals', 'list of hospitals', 'all hospitals', 'find hospital', 'search hospital', 'which hospitals', 'hospital list', 'available hospital'],
        answer: `🏥 **MediCare Plus partners with multiple hospitals across different cities.**\n\nTo browse all hospitals:\n• Visit the **Hospital Search** page from the navigation\n• Or ask MediBot to **recommend a hospital** based on your condition\n\nEach hospital has its own team of specialist doctors, admin, and services.`,
        page: { path: '/hospitals', name: 'Hospital Search', emoji: '🏥', description: 'Browse all partner hospitals.' }
    },
    {
        keywords: ['services', 'what services', 'features', 'what can i do', 'what can this', 'what does it offer', 'offerings'],
        answer: `✨ **MediCare Plus offers these services:**\n\n🏥 **Hospital Services**\n• Hospital search & AI recommendations\n• Multi-specialty doctor booking\n• ICU, emergency & OT facilities\n\n👨‍⚕️ **Doctor Services**\n• Online consultations & video calls\n• Prescription management\n• Patient record access\n\n🚑 **Emergency Services**\n• Real-time ambulance booking\n• GPS-tracked driver dispatch\n\n🩺 **Patient Health Tools**\n• Health vitals tracking\n• Medical reports & PDF downloads\n• Prescription history\n• AI health advice (MediBot)\n\n🧪 **Lab & Diagnostics**\n• Lab test information\n• Blood test guides\n• Health checkup plans`
    },
    {
        keywords: ['is it free', 'free to use', 'cost', 'pricing', 'how much', 'subscription', 'paid', 'charges', 'fee'],
        answer: `💳 **MediCare Plus platform registration is free for all users.**\n\nHowever:\n• 💊 Individual **consultation fees** are set by each doctor\n• 🏥 **Hospital services** (ICU, OT, surgery) are billed by the hospital\n• 🚑 **Ambulance charges** may apply depending on the provider\n\nAll payment-related details are shown transparently before you confirm any booking.`
    },
    {
        keywords: ['doctor role', 'how to become a doctor', 'doctor registration', 'register as doctor', 'doctor account', 'doctor signup'],
        answer: `👨‍⚕️ **To join as a Doctor:**\n\n1. Go to **Sign Up** and select **Doctor** role\n2. Fill in your specialization, experience, consultation fee & availability\n3. Select your hospital\n4. Your registration goes to the **hospital admin for approval**\n5. Once approved, you can start accepting appointments\n\n> ⏳ Approval typically takes 1–2 business days. You'll be notified by email.`
    },
    {
        keywords: ['admin role', 'hospital admin', 'how to become admin', 'admin account', 'manage hospital'],
        answer: `🏢 **Hospital Admin accounts** are pre-configured by MediCare Plus.\n\nEach hospital has a **default admin account:**\n• 📧 Email: *{hospitalname}admin@gmail.com*\n• 🔑 Password: *123456*\n\n**As an Admin you can:**\n• ✅ Approve or reject doctor registrations\n• 👥 View patients and their appointments\n• 🏥 Manage hospital details\n• 📊 View hospital analytics & stats\n• 💬 Chat with patients`
    },
    {
        keywords: ['video call', 'online consultation', 'virtual appointment', 'telemedicine', 'video chat', 'call doctor'],
        answer: `🎥 **Video Consultations on MediCare Plus:**\n\nOnce a doctor **approves** your appointment:\n1. Go to **My Appointments** in your Patient Dashboard\n2. You'll see a **"Join Call"** button next to approved appointments\n3. Wait — the **doctor initiates the call** at the scheduled time\n4. Accept the incoming call when it rings\n\n> 💡 Video calls use real-time WebRTC technology for secure, high-quality consultations.`
    },
    {
        keywords: ['chat', 'message doctor', 'how to message', 'contact doctor', 'message admin', 'send message'],
        answer: `💬 **Messaging on MediCare Plus:**\n\n**Chat with your doctor:**\n→ Go to **My Appointments** → Click the **Chat** button on any appointment card\n\n**Chat with hospital admin:**\n→ A floating **💬 chat button** appears in the bottom-right corner of your Patient Dashboard\n\n> All messages are real-time and encrypted for your privacy.`
    },
    {
        keywords: ['prescription', 'medicine', 'medication history', 'view prescription', 'my prescription'],
        answer: `💊 **To view your prescriptions:**\n\n1. Log in as a **Patient**\n2. Go to **Patient Dashboard** → **Prescriptions** tab\n3. All prescriptions from completed appointments are listed here\n4. You can view medicines, dosage, and doctor notes\n\n📄 You can also download full **Medical Reports** as PDF from the **My Reports** tab.`
    },
    {
        keywords: ['health vitals', 'track health', 'blood pressure', 'sugar level', 'bmi', 'track vitals'],
        answer: `📊 **Health Vitals Tracking:**\n\nGo to **Patient Dashboard** → **Health Vitals** tab to:\n• Log daily blood pressure, blood sugar, SpO2, weight\n• View trends over time\n• Track BMI and activity levels\n\n> Regular tracking helps doctors make better treatment decisions for you.`
    },
    {
        keywords: ['security', 'is my data safe', 'privacy', 'data protection', 'secure', 'confidential'],
        answer: `🔒 **Your data is safe on MediCare Plus:**\n\n• 🔐 All passwords are **encrypted** using industry-standard bcrypt hashing\n• 🎫 Sessions use **JWT tokens** that expire automatically\n• 👁️ Doctors can only access your medical records if you **explicitly approve** their access request\n• 📧 Email verification is required for all new accounts\n• 🔑 Sensitive data is never stored in plain text\n\nYour health information is private and only shared with healthcare providers you authorize.`
    },
    {
        keywords: ['contact', 'support', 'help', 'customer service', 'contact us', 'reach out'],
        answer: `📞 **Need help? Here's how to reach us:**\n\n• 🌐 Visit our **Home page** and scroll to the **Contact** section\n• 💬 Use **MediBot** (that's me!) for instant answers\n• 📧 Email your hospital admin directly via the chat feature\n\n> For urgent medical emergencies, please call **112** (India Emergency Services) directly.`
    },
    {
        keywords: ['lab test', 'blood test', 'diagnostic', 'health checkup', 'pathology'],
        answer: `🧪 **Lab Tests & Diagnostics:**\n\nVisit the **Lab Tests** page to:\n• Browse available diagnostic tests\n• View normal ranges and what each test measures\n• Find health checkup packages\n\n> 🩺 After your doctor appointment, prescribed lab tests will appear in your medical report.`,
        page: { path: '/lab-tests', name: 'Lab Tests', emoji: '🧪', description: 'Browse lab tests and diagnostics.' }
    },
    {
        keywords: ['who made', 'who built', 'developers', 'team', 'creators', 'development team'],
        answer: `👥 **MediCare Plus Team:**\n\nThis platform was built by a passionate development team dedicated to making healthcare digitally accessible.\n\nVisit the **"Meet Our Team"** page to learn about the people behind MediCare Plus!`,
        page: { path: '/team', name: 'Project Team', emoji: '👥', description: 'Meet the development team.' }
    },
];

// =====================================================
//  HELPERS
// =====================================================
function getPageLabel(pathname) {
    const match = SITE_PAGES.find(p => p.path === pathname || (p.path !== '/' && pathname.startsWith(p.path)));
    return match || null;
}
function findPageForQuery(text) {
    const lower = text.toLowerCase();
    let best = null; let bestScore = 0;
    for (const p of SITE_PAGES) {
        const score = p.keywords.filter(kw => lower.includes(kw)).length;
        if (score > bestScore) { bestScore = score; best = p; }
    }
    return bestScore > 0 ? best : null;
}
function findPatientTab(text) {
    const lower = text.toLowerCase();
    for (const t of PATIENT_TABS) {
        if (t.keywords.some(kw => lower.includes(kw))) return t;
    }
    return null;
}
function findWebsiteAnswer(text) {
    const lower = text.toLowerCase();
    let best = null; let bestScore = 0;
    for (const faq of WEBSITE_FAQ) {
        const score = faq.keywords.filter(kw => lower.includes(kw)).length;
        if (score > bestScore) { bestScore = score; best = faq; }
    }
    return bestScore > 0 ? best : null;
}

// =====================================================
//  SEVERITY INDICATOR
// =====================================================
const SeverityBadge = ({ severity }) => {
    const map = {
        info: { icon: Info, cls: 'bg-blue-100 text-blue-700', label: 'General Info' },
        caution: { icon: AlertTriangle, cls: 'bg-amber-100 text-amber-700', label: 'Caution' },
        danger: { icon: AlertOctagon, cls: 'bg-red-100 text-red-700', label: 'Important' },
    };
    const item = map[severity]; if (!item) return null;
    const Icon = item.icon;
    return (
        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${item.cls} mb-2`}>
            <Icon className="w-3 h-3" /> {item.label}
        </span>
    );
};

// =====================================================
//  HOSPITAL CARD
// =====================================================
const HospitalChatCard = ({ hospital, rank }) => {
    const colors = ['border-l-amber-400 bg-amber-50', 'border-l-slate-400 bg-slate-50', 'border-l-orange-400 bg-orange-50'];
    const icons = ['🥇', '🥈', '🥉'];
    return (
        <div className={`rounded-xl border-l-4 p-3 mt-2 ${colors[rank] || 'border-l-sky-400 bg-sky-50'}`}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                        <span>{icons[rank] || '🏥'}</span>
                        <span className="font-bold text-slate-900 text-sm">{hospital.hospitalName}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{hospital.city}</p>
                </div>
                <div className="text-right shrink-0 ml-2">
                    <div className="text-base font-black text-sky-600">{hospital.matchScore}%</div>
                    <div className="text-xs text-slate-400">match</div>
                </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
                {hospital.specialties && <span className="bg-sky-100 text-sky-700 text-xs px-1.5 py-0.5 rounded-full">{hospital.specialties}</span>}
                {hospital.cashlessAvailable && <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Banknote className="w-2.5 h-2.5" /> Cashless</span>}
                {hospital.coveragePct && <span className="bg-indigo-100 text-indigo-700 text-xs px-1.5 py-0.5 rounded-full">{hospital.coveragePct}% cover</span>}
                <span className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Star className="w-2.5 h-2.5 fill-amber-500" /> {hospital.rating}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed border-t border-slate-200/70 pt-1.5">🤖 {hospital.reason}</p>
        </div>
    );
};

// =====================================================
//  PAGE LINK CARD
// =====================================================
const PageLinkCard = ({ page, navigate, onClose }) => (
    <button onClick={() => { navigate(page.path); onClose(); }}
        className="w-full mt-2 text-left rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 p-3 transition-colors group">
        <div className="flex items-center justify-between">
            <span className="font-semibold text-sky-800 text-sm">{page.emoji} {page.name}</span>
            <ExternalLink className="w-3.5 h-3.5 text-sky-500 group-hover:text-sky-700" />
        </div>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{page.description}</p>
        {page.sections && (
            <div className="flex flex-wrap gap-1 mt-2">
                {page.sections.slice(0, 4).map((s, i) => (
                    <span key={i} className="bg-white border border-sky-200 text-sky-700 text-xs px-1.5 py-0.5 rounded-full">{s}</span>
                ))}
                {page.sections.length > 4 && <span className="text-xs text-slate-400">+{page.sections.length - 4} more</span>}
            </div>
        )}
    </button>
);

// =====================================================
//  CHAT MESSAGE BUBBLE
// =====================================================
const ChatMessage = ({ msg, navigate, closeChat, onFollowUp, onFeedback }) => {
    const isBot = msg.role === 'bot';
    const [feedbackGiven, setFeedbackGiven] = useState(null);
    const renderText = (text) => {
        if (!text) return null;
        return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
            part.startsWith('**') && part.endsWith('**')
                ? <strong key={i}>{part.slice(2, -2)}</strong>
                : part
        );
    };
    const isEmergency = msg.type === 'emergency';
    const showFeedback = isBot && msg.matchSource && msg.matchSource !== 'fallback' && !isEmergency;
    const handleFeedback = (type) => {
        setFeedbackGiven(type);
        if (onFeedback) onFeedback(msg.queryId, type);
    };
    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 ${isBot ? 'items-start' : 'items-end flex-row-reverse'}`}>
            <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white ${isBot ? (isEmergency ? 'bg-red-600' : 'bg-primary-blue') : 'bg-primary-navy'}`}>
                {isBot ? (isEmergency ? <Zap className="w-4 h-4" /> : <Bot className="w-4 h-4" />) : <User className="w-4 h-4" />}
            </div>
            <div className={`max-w-[86%] ${isBot ? '' : 'items-end flex flex-col'}`}>
                <div className={`rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-line ${
                    isEmergency
                        ? 'bg-red-50 border-2 border-red-400 text-red-900 rounded-tl-sm shadow-md'
                        : isBot ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm' : 'bg-primary-blue text-white rounded-tr-sm'
                }`}>
                    {isBot && msg.severity && <SeverityBadge severity={msg.severity} />}
                    {isBot && msg.confidence > 0 && !isEmergency && (
                        <div className="flex items-center gap-1.5 mb-1">
                            {msg.category && <span className="text-xs text-sky-600 font-semibold flex items-center gap-1"><Stethoscope className="w-3 h-3" /> {msg.category}</span>}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${msg.confidence >= 80 ? 'bg-green-100 text-green-700' : msg.confidence >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                {msg.confidence}% match
                            </span>
                        </div>
                    )}
                    {isBot && msg.category && !msg.confidence && <div className="text-xs text-sky-600 font-semibold mb-1 flex items-center gap-1"><Stethoscope className="w-3 h-3" /> {msg.category}</div>}
                    {renderText(msg.text)}
                    {msg.hospitals && msg.hospitals.map((h, i) => <HospitalChatCard key={h.hospitalId || i} hospital={h} rank={i} />)}
                    {msg.page && <PageLinkCard page={msg.page} navigate={navigate} onClose={closeChat} />}
                    {msg.pages && msg.pages.map((p, i) => <PageLinkCard key={i} page={p} navigate={navigate} onClose={closeChat} />)}
                </div>
                {/* Related Topics */}
                {isBot && msg.relatedTopics && msg.relatedTopics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5 px-1">
                        <span className="text-xs text-slate-400">Related:</span>
                        {msg.relatedTopics.map((topic, i) => (
                            <button key={i} onClick={() => onFollowUp && onFollowUp(`Tell me about ${topic}`)}
                                className="text-xs bg-sky-50 border border-sky-200 text-sky-600 rounded-full px-2 py-0.5 hover:bg-sky-100 transition-colors">
                                {topic}
                            </button>
                        ))}
                    </div>
                )}
                {/* Follow-up Questions */}
                {isBot && msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                    <div className="flex flex-col gap-1 mt-2 px-1">
                        {msg.followUpQuestions.map((q, i) => (
                            <button key={i} onClick={() => onFollowUp && onFollowUp(q)}
                                className="text-left text-xs bg-white border border-slate-200 text-slate-600 rounded-lg px-2.5 py-1.5 hover:border-sky-400 hover:text-sky-600 transition-colors flex items-center gap-1">
                                <ChevronRight className="w-3 h-3 shrink-0 text-sky-400" /> {q}
                            </button>
                        ))}
                    </div>
                )}
                {/* Feedback UI */}
                {showFeedback && (
                    <div className="flex items-center gap-2 mt-1.5 px-1">
                        {feedbackGiven ? (
                            <span className="text-xs text-slate-400">Thanks for the feedback!</span>
                        ) : (
                            <>
                                <span className="text-xs text-slate-400">Helpful?</span>
                                <button onClick={() => handleFeedback('helpful')} className="p-1 rounded hover:bg-green-50 text-slate-400 hover:text-green-600 transition-colors" title="Helpful">
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleFeedback('not_helpful')} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Not helpful">
                                    <ThumbsDown className="w-3.5 h-3.5" />
                                </button>
                            </>
                        )}
                    </div>
                )}
                <span className="text-xs text-slate-400 mt-1 px-1">{new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        </motion.div>
    );
};

// =====================================================
//  MAIN MEDIBOT COMPONENT
// =====================================================
const MediBot = () => {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [healthSummary, setHealthSummary] = useState(null);
    const [patientAppointments, setPatientAppointments] = useState([]);
    const messagesEndRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    const isLoggedIn = !!localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const isPatient = userData?.role === 'patient';
    const currentPageObj = getPageLabel(location.pathname);

    // Fetch patient profile + appointments for personalization
    useEffect(() => {
        if (isLoggedIn && isPatient && open && !userProfile) {
            // Fetch profile
            api.get('/profile').then(res => {
                const prof = res.data?.user || null;
                setUserProfile(prof);

                // Fetch appointments to extract prescriptions
                const token = localStorage.getItem('token');
                fetch(`${api.defaults.baseURL}/api/appointments/my-appointments`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                    .then(r => r.json())
                    .then(apts => {
                        setPatientAppointments(apts || []);

                        // Extract prescriptions from completed appointments
                        const prescriptions = (apts || [])
                            .filter(a => a.doctorReport?.prescription)
                            .map(a => a.doctorReport.prescription);

                        const patientInfo = {
                            medicalHistory: prof?.medicalHistory || '',
                            allergies: prof?.allergies || '',
                            age: prof?.age || '',
                            bloodGroup: prof?.bloodGroup || '',
                            prescriptions,
                        };

                        // Fetch personalized health summary
                        api.post('/api/chatbot/health-summary', { patientInfo })
                            .then(r => { if (r.data.hasSummary) setHealthSummary(r.data); })
                            .catch(() => { });
                    })
                    .catch(() => { });
            }).catch(() => { });
        }
    }, [isLoggedIn, isPatient, open, userProfile]);

    useEffect(() => {
        if (open && messages.length === 0) {
            const name = userData?.name?.split(' ')[0] || 'there';
            const pageCtx = currentPageObj ? ` You're on the **${currentPageObj.name}** page.` : '';
            const greeting = `👋 Hi **${name}**! I'm **MediBot** 🤖 — your AI health & site guide.${pageCtx}\n\nI can:\n• 💊 Answer **any medical question**\n• 🏡 Get **personalized tips** based on your health profile\n• 🏥 Recommend the best **hospitals** for your condition\n• 🗺 Navigate you to **any page** of this site\n\nWhat can I help you with today?`;
            setMessages([{ role: 'bot', ts: Date.now(), text: greeting }]);
        }
    }, [open, messages.length, userData?.name, currentPageObj]);

    const prevPath = useRef(location.pathname);
    useEffect(() => {
        if (open && messages.length > 0 && prevPath.current !== location.pathname) {
            const pg = getPageLabel(location.pathname);
            if (pg) addMessage('bot', `📍 Navigated to **${pg.name}**. ${pg.description}\n\nHow can I help you here?`);
            prevPath.current = location.pathname;
        }
    }, [location.pathname, open, messages.length]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const addMessage = (role, text, extra = {}) => {
        setMessages(prev => [...prev, { role, text, ts: Date.now(), ...extra }]);
    };

    const handleSend = useCallback(async (text) => {
        const query = (text || input).trim();
        if (!query) return;
        addMessage('user', query);
        setInput('');
        setLoading(true);

        try {
            const lower = query.toLowerCase();
            await new Promise(r => setTimeout(r, 350));

            // ── SITE MAP shortcut ──
            if (/all pages|sitemap|site map|what sections|what pages|menu|navigation/.test(lower)) {
                addMessage('bot', `📚 Here's everything on **MediCare Plus** — tap any card to navigate:`, { pages: SITE_PAGES.slice(0, 6) });
                setLoading(false); return;
            }

            // ── WHERE AM I ──
            if (/where am i|what page|current page/.test(lower)) {
                if (currentPageObj) {
                    const sections = currentPageObj.sections ? `\n\n**Sections:** ${currentPageObj.sections.join(' · ')}` : '';
                    addMessage('bot', `📍 You're on **${currentPageObj.name}** ${currentPageObj.emoji}\n${currentPageObj.description}${sections}`);
                } else {
                    addMessage('bot', "📍 I can't detect your current page. Ask me about a specific section instead!");
                }
                setLoading(false); return;
            }

            // ── PATIENT DASHBOARD OVERVIEW ──
            if (isPatient && /patient dashboard/.test(lower)) {
                const pg = SITE_PAGES.find(p => p.path === '/patient-dashboard');
                addMessage('bot', `🩺 Your **Patient Dashboard** has ${pg.sections.length} sections:\n\n${pg.sections.map(s => `• ${s}`).join('\n')}\n\nJust ask me about any tab to jump right to it!`, { page: pg });
                setLoading(false); return;
            }

            // ── PATIENT TAB deep-link ──
            if (isPatient && /where|how|find|see|access|go to|open/.test(lower)) {
                const tab = findPatientTab(query);
                if (tab) {
                    const pg = SITE_PAGES.find(p => p.path === '/patient-dashboard');
                    addMessage('bot', `📍 To access **${tab.name}**, open your Patient Dashboard and click "**${tab.name}**" in the sidebar.`, { page: pg });
                    setLoading(false); return;
                }
            }

            // ── NAVIGATION intent ──
            if (/where|how to|find|go to|navigate|open|take me|shows|access/.test(lower)) {
                const pg = findPageForQuery(query);
                if (pg) {
                    addMessage('bot', `Here's where you can find that 👇`, { page: pg });
                    setLoading(false); return;
                }
            }

            // ── GREETINGS ──
            if (/^(hello|hi|hey|namaste|helo|good morning|good afternoon|good evening)[\s!.]*$/.test(lower)) {
                addMessage('bot', `👋 Hello! I'm **MediBot** 🤖\n\nAsk me any **medical question**, get **hospital recommendations**, or let me guide you to any **page/feature** on this site!\n\nFor example:\n• *"What is diabetes?"*\n• *"Best hospital for heart disease"*\n• *"Where do I track my vitals?"*`);
                setLoading(false); return;
            }

            // ── THANK YOU / BYE ──
            if (/thank|thanks|great|awesome|helpful/.test(lower)) {
                addMessage('bot', `😊 Glad I could help! Ask me anything anytime — medical questions, hospital recommendations, or site navigation. Stay healthy! 💚`);
                setLoading(false); return;
            }
            if (/bye|goodbye|see you/.test(lower)) {
                addMessage('bot', `👋 Take care! MediBot is always here for you. Stay healthy! 💚`);
                setLoading(false); return;
            }

            // ── WEBSITE FAQ ── (answers questions about the platform itself)
            const faqResult = findWebsiteAnswer(query);
            if (faqResult) {
                addMessage('bot', faqResult.answer, faqResult.page ? { page: faqResult.page } : undefined);
                setLoading(false); return;
            }

            // ── CALL BACKEND CHATBOT API ──
            // Extract prescriptions from appointments
            const prescriptions = patientAppointments
                .filter(a => a.doctorReport?.prescription)
                .map(a => a.doctorReport.prescription);

            const res = await api.post('/api/chatbot/ask', {
                query,
                insuranceCompany: userProfile?.mediclaimProvider || null,
                patientInfo: isPatient ? {
                    medicalHistory: userProfile?.medicalHistory || '',
                    allergies: userProfile?.allergies || '',
                    age: userProfile?.age || '',
                    bloodGroup: userProfile?.bloodGroup || '',
                    prescriptions,
                } : null
            });

            const data = res.data;

            if (data.type === 'emergency') {
                addMessage('bot', data.answer, {
                    severity: 'danger', type: 'emergency', confidence: data.confidence,
                    page: SITE_PAGES.find(p => p.path === '/ambulance')
                });
                return;
            }

            if (data.type === 'hospital_recommendation') {
                const { hospitals, insuranceFiltered, insuranceCompany: company } = data;
                if (!hospitals || hospitals.length === 0) {
                    addMessage('bot', `😔 No matching hospitals found for that condition. Try rephrasing your symptoms.`, { page: SITE_PAGES.find(p => p.path === '/hospitals') });
                } else {
                    const note = insuranceFiltered
                        ? `\n\n🔵 *Filtered for your **${company}** insurance network.*`
                        : `\n\n💡 *Add your insurance in profile for network-filtered results!*`;
                    addMessage('bot', `🏥 Here are the **top ${hospitals.length} hospitals** matched to your condition:${note}`, { hospitals });
                }
                return;
            }

            if (data.type === 'medical_info') {
                addMessage('bot', data.answer, {
                    category: data.category,
                    severity: data.severity,
                    confidence: data.confidence,
                    matchSource: data.matchSource,
                    followUpQuestions: data.followUpQuestions,
                    relatedTopics: data.relatedTopics,
                    queryId: data.queryId
                });
                return;
            }

            // ── FALLBACK: helpful prompt ──
            addMessage('bot',
                `🤔 I can help with:\n\n• 💊 **Medical questions** — *"What is hypertension?"*\n• 🏥 **Hospital recommendations** — *"Best hospital for kidney disease"*\n• 🩺 **Site help** — *"How do I register?"*, *"What services do you offer?"*\n• 🗺️ **Navigation** — *"Show all pages"*, *"Where do I see my reports?"*\n\nTry asking anything medical or about this site — I know everything! 😊`,
                { pages: [SITE_PAGES[0], SITE_PAGES[1], SITE_PAGES[8]].filter(Boolean) }
            );

        } catch (err) {
            console.error('MediBot error:', err);
            addMessage('bot', '⚠️ Could not connect to the medical knowledge engine. Please try again in a moment.');
        } finally {
            setLoading(false);
        }
    }, [input, userProfile, isPatient, currentPageObj, patientAppointments]);

    const clearChat = () => {
        setMessages([]);
        setTimeout(() => addMessage('bot', `Chat cleared! 🧹 How can I help you today?`), 100);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const personalHealthSuggestion = { label: '💊 My health tips', query: 'give me personalized health tips based on my medical history' };
    const contextSuggestions = !isLoggedIn
        ? VISITOR_SUGGESTIONS
        : location.pathname === '/patient-dashboard' && isPatient
            ? [personalHealthSuggestion, QUICK_SUGGESTIONS[0], QUICK_SUGGESTIONS[1], QUICK_SUGGESTIONS[7]]
            : QUICK_SUGGESTIONS.slice(0, 4);

    return (
        <>
            {/* FAB Trigger */}
            <motion.button onClick={() => setOpen(o => !o)}
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-primary-blue text-white shadow-xl flex items-center justify-center"
                aria-label="Open MediBot">
                <AnimatePresence mode="wait">
                    {open
                        ? <motion.span key="c" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><ChevronDown className="w-7 h-7" /></motion.span>
                        : <motion.span key="b" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><Bot className="w-7 h-7" /></motion.span>
                    }
                </AnimatePresence>
                {!open && <span className="absolute inset-0 rounded-full bg-sky-400 animate-ping opacity-30" />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {open && (
                    <motion.div key="cw"
                        initial={{ opacity: 0, scale: 0.85, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="fixed bottom-24 right-6 z-[9999] w-[375px] max-w-[calc(100vw-2rem)] flex flex-col rounded-3xl shadow-2xl border border-slate-200 bg-white overflow-hidden"
                        style={{ maxHeight: 'min(640px, calc(100vh - 120px))' }}>

                        {/* Header */}
                        <div className="bg-primary-navy px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"><Bot className="w-5 h-5 text-white" /></div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-white font-bold text-sm">MediBot</span>
                                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-400 rounded-full inline-block animate-pulse" />
                                        <span className="text-white/80 text-xs">Medical AI · Site Guide · Online</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {currentPageObj && (
                                    <div className="bg-white/20 rounded-full px-2 py-1 flex items-center gap-1" title={`Current: ${currentPageObj.name}`}>
                                        <Map className="w-3 h-3 text-white" />
                                        <span className="text-white text-xs font-medium truncate max-w-[70px]">{currentPageObj.name}</span>
                                    </div>
                                )}
                                {isPatient && userProfile?.mediclaimProvider && (
                                    <div className="bg-white/20 rounded-full px-2 py-1 flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3 text-white" />
                                        <span className="text-white text-xs font-medium truncate max-w-[60px]">{userProfile.mediclaimProvider}</span>
                                    </div>
                                )}
                                <button onClick={clearChat} title="Clear chat" className="p-1.5 hover:bg-white/20 rounded-full text-white/70 hover:text-white transition-colors"><RotateCcw className="w-4 h-4" /></button>
                                <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/20 rounded-full text-white/70 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                            </div>
                        </div>

                        {/* Personalized Health Summary Banner */}
                        {isPatient && healthSummary && healthSummary.hasSummary && (
                            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <HeartPulse className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span className="text-xs text-emerald-700 font-semibold">
                                        Your Health Profile Active
                                        {healthSummary.categories?.length > 0 && ` · ${healthSummary.categories.join(', ')}`}
                                    </span>
                                </div>
                                <p className="text-xs text-emerald-600">
                                    {healthSummary.topTips?.[0] || 'Ask me for personalized health advice!'}
                                </p>
                            </div>
                        )}

                        {/* Capabilities bar */}
                        <div className="bg-sky-50 border-b border-sky-100 px-4 py-1.5 flex items-center gap-2">
                            <HeartPulse className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                            <span className="text-xs text-sky-700 font-medium truncate">Medical answers · Hospital AI · Full site navigation</span>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                            {messages.map((msg, i) => (
                                <ChatMessage key={i} msg={msg} navigate={navigate} closeChat={() => setOpen(false)}
                                    onFollowUp={(q) => handleSend(q)}
                                    onFeedback={(queryId, feedback) => {
                                        if (queryId) {
                                            api.post('/api/chatbot/feedback', { queryId, feedback }).catch(() => {});
                                        }
                                    }} />
                            ))}
                            {loading && (
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-primary-blue flex items-center justify-center text-white shrink-0"><Bot className="w-4 h-4" /></div>
                                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                                        <div className="flex items-center gap-1.5">
                                            {[0, 150, 300].map(d => <span key={d} className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick suggestions */}
                        {messages.length <= 1 && !loading && (
                            <div className="px-3 pb-2 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                                {contextSuggestions.map((s, i) => (
                                    <button key={i} onClick={() => handleSend(s.query)}
                                        className="shrink-0 text-xs bg-white border border-slate-200 text-slate-600 rounded-full px-3 py-1.5 hover:border-sky-400 hover:text-sky-600 transition-colors whitespace-nowrap">
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className="border-t border-slate-200 bg-white p-3 flex items-end gap-2">
                            <textarea rows={1} value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask any medical question or about the site..."
                                className="flex-1 resize-none text-sm text-slate-800 placeholder-slate-400 outline-none leading-5 max-h-24 overflow-y-auto bg-transparent"
                                style={{ minHeight: '24px' }}
                            />
                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleSend()} disabled={!input.trim() || loading}
                                className="shrink-0 w-9 h-9 rounded-full bg-primary-blue text-white flex items-center justify-center disabled:opacity-40">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default MediBot;
