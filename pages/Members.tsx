
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Code2, BrainCircuit } from 'lucide-react';
import { Language } from '../types';
import { MEMBERS } from '../constants';

interface Props {
  lang: Language;
}

const Members: React.FC<Props> = ({ lang }) => {
  return (
    <div className="bg-mncc-bg min-h-screen pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
           <h1 className="text-4xl md:text-5xl font-bold text-mncc-text mb-6 flex items-center justify-center gap-4">
             <Users size={48} className="text-mncc-primary" />
             {lang === 'en' ? 'Our Members' : 'メンバー紹介'}
           </h1>
           <p className="text-lg text-mncc-muted max-w-3xl mx-auto">
             {lang === 'en' 
               ? 'A collective of researchers bridging neuroscience, AI, and engineering.' 
               : '神経科学、AI、エンジニアリングをつなぐ研究者集団。'}
           </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {Object.values(MEMBERS).map((member) => {
                const isSasaki = member.id === 'tomohisa-sasaki';
                // Dynamic classes based on member theme
                const cardBorderHover = isSasaki ? 'hover:border-mncc-primary' : 'hover:border-mncc-purple';
                const textAccent = isSasaki ? 'text-mncc-primary' : 'text-mncc-purple';
                const bgAccent = isSasaki ? 'bg-mncc-primary' : 'bg-mncc-purple';
                const icon = isSasaki ? <BrainCircuit size={24} /> : <Code2 size={24} />;

                return (
                    <Link 
                        key={member.id} 
                        to={`/members/${member.id}`}
                        className={`group relative bg-white rounded-3xl p-8 border border-black/5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${cardBorderHover}`}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-br from-gray-100 to-gray-200">
                                    <img 
                                        src={member.image} 
                                        alt={member.name} 
                                        className="w-full h-full rounded-full object-cover bg-white"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-mncc-text group-hover:text-black transition-colors">{member.name}</h2>
                                    <p className="text-sm text-mncc-muted">{member.title[lang]}</p>
                                </div>
                            </div>
                            <div className={`p-3 rounded-xl bg-gray-50 ${textAccent} group-hover:scale-110 transition-transform`}>
                                {icon}
                            </div>
                        </div>

                        {/* Summary */}
                        <p className="text-mncc-muted text-sm leading-relaxed mb-8 line-clamp-3">
                            {member.summary[lang]}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between border-t border-black/5 pt-6">
                            <div className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-100 text-gray-600`}>
                                {member.role[lang]}
                            </div>
                            <div className={`flex items-center gap-2 font-bold text-sm ${textAccent} group-hover:translate-x-1 transition-transform`}>
                                {lang === 'en' ? 'View Profile' : 'プロフィールを見る'}
                                <ArrowRight size={16} />
                            </div>
                        </div>

                        {/* Decorative gradient line */}
                        <div className={`absolute bottom-0 left-8 right-8 h-1 rounded-t-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ${bgAccent}`}></div>
                    </Link>
                );
            })}
        </div>

      </div>
    </div>
  );
};

export default Members;
