import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white px-4">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="text-center max-w-lg"
            >
                {/* Large 404 */}
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
                    className="text-[10rem] font-extrabold leading-none bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent select-none"
                    style={{ textShadow: 'none' }}
                >
                    404
                </motion.div>

                <h1 className="text-3xl font-bold mt-2 mb-3 text-white">
                    Page Not Found
                </h1>
                <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                    The page you are looking for doesn't exist or has been moved.
                    Let's get you back to safety.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5"
                    >
                        Go Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="px-8 py-3 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold rounded-xl transition-all duration-200"
                    >
                        Go Back
                    </button>
                </div>

                {/* Decorative pulse */}
                <motion.div
                    animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.25, 0.15] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none"
                >
                    <div className="w-96 h-96 rounded-full bg-blue-600/20 blur-3xl" />
                </motion.div>
            </motion.div>
        </div>
    );
};

export default NotFound;
