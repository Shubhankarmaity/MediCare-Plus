import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Github, Linkedin, Mail, Code, BookOpen, Globe as Language } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProjectTeam = () => {
    const teamMembers = [
        {
            role: 'FULL STACK DEVELOPER',
            name: 'Shubhankar Maity',
            icon: <Code className="w-8 h-8 text-sky-500" />,
            description: 'Passionate Computer Science student specializing in Data Science and MERN Stack Development. I build robust, user-centric applications like MediCare Plus to solve real-world problems through technology.',
            skills: ['MERN Stack', 'Data Science', 'Machine Learning', 'Java', 'React', 'Node.js', 'MongoDB'],
            educationHeader: 'EDUCATION',
            education: (
                <>
                    <p className="text-slate-900 font-bold text-sm">Brainware University</p>
                    <p className="text-slate-600 text-xs">B.Tech in Computer Science & Engineering (Data Science)</p>
                </>
            ),
            socials: {
                github: 'https://github.com/Shubhankarmaity',
                linkedin: 'https://www.linkedin.com/in/shubhankar-maity-05976b290',
                website: 'https://shubhankarmaity.tech'
            },
            image: 'https://shubhankarmaity.tech/static/media/profile_photo.6b3d1b6e.png'
        },
        {
            role: 'ASSISTANT PROFESSOR',
            name: 'Dr. Arnab Kundu',
            icon: <BookOpen className="w-8 h-8 text-purple-500" />,
            description: 'A distinguished academic and mentor in the field of Computer Science and Engineering. Dr. Kundu specializes in Wireless Communication, Cognitive Radio networks, and Blockchain Technology.',
            skills: ['Cognitive Radio', 'Blockchain', 'Wireless Communication', 'IoT', 'Networking'],
            educationHeader: 'AFFILIATION',
            education: (
                <>
                    <p className="text-slate-900 font-bold text-sm">Brainware University</p>
                    <p className="text-slate-600 text-xs">Department of Computer Science & Engineering (CS & DS)</p>
                </>
            ),
            socials: {
                linkedin: 'https://www.linkedin.com/in/dr-arnab-kundu-4a211188/',
            },
            image: 'https://ui-avatars.com/api/?name=Arnab+Kundu&background=7c3aed&color=fff&size=256'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Navbar / Header */}
            <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-sky-600 transition-colors font-medium">
                        <ArrowLeft className="w-5 h-5" /> Back to Home
                    </Link>
                    <span className="font-bold text-xl text-slate-800">MediCare Plus Team</span>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-16">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold text-slate-900 mb-6"
                    >
                        Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-teal-400">Creators</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-600 leading-relaxed"
                    >
                        The minds behind MediCare Plus. Dedicated to simplifying healthcare management through technology.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {teamMembers.map((member, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 group hover:shadow-2xl transition-all duration-300"
                        >
                            <div className={`h-32 bg-gradient-to-r ${index === 0 ? 'from-blue-600 to-indigo-800' : 'from-purple-600 to-pink-800'} relative`}>
                                <div className="absolute -bottom-16 left-8 p-1 bg-white rounded-full">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${member.name}&background=random` }}
                                    />
                                </div>
                            </div>

                            <div className="pt-20 p-8">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">{member.name}</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            {member.icon}
                                            <span className={`font-semibold tracking-wide uppercase text-sm ${index === 0 ? 'text-sky-600' : 'text-purple-600'}`}>{member.role}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        {member.socials.github && (
                                            <a href={member.socials.github} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                                                <Github className="w-5 h-5" />
                                            </a>
                                        )}
                                        {member.socials.linkedin && (
                                            <a href={member.socials.linkedin} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all">
                                                <Linkedin className="w-5 h-5" />
                                            </a>
                                        )}
                                        {member.socials.website && (
                                            <a href={member.socials.website} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all">
                                                <Language className="w-5 h-5" />
                                            </a>
                                        )}
                                        {member.socials.email && (
                                            <a href={member.socials.email} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                <Mail className="w-5 h-5" />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <p className="text-slate-600 leading-relaxed mb-6 text-sm">
                                    {member.description}
                                </p>

                                <div className="mb-6">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{member.educationHeader}</h4>
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        {member.education}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                        {index === 0 ? 'SKILLS' : 'RESEARCH AREAS'}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {member.skills.map((skill, i) => (
                                            <span key={i} className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-default ${index === 0 ? 'bg-sky-50 text-sky-600 hover:bg-sky-100' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <p className="text-slate-400 text-sm">
                        Project developed as part of the Final Year Curriculum • 2024
                    </p>
                </div>
            </main>
        </div>
    );
};

export default ProjectTeam;
