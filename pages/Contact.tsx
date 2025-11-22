
import React from 'react';
import { Mail, MapPin, Globe, Instagram, Twitter, Linkedin, Github } from 'lucide-react';
import ContactForm from '../components/ContactForm';
import { Language } from '../types';

// 3D Social Button inspired by "Smart Liger 5" (uiverse.io) style
// Adjusted to fit light theme (white face, dark depth)
const SocialButton3D = ({ icon: Icon, color, href }: { icon: any, color: string, href: string }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="relative group w-12 h-12 cursor-pointer"
  >
    {/* Shadow/Depth Layer */}
    <div className="absolute inset-0 rounded-lg bg-gray-300 translate-y-1.5 transition-transform duration-100 group-hover:translate-y-2 group-active:translate-y-0"></div>
    
    {/* Main Button Layer */}
    <div className={`absolute inset-0 rounded-lg bg-white border border-black/5 flex items-center justify-center transition-transform duration-100 group-hover:-translate-y-1 group-active:translate-y-1.5`}>
       <Icon size={22} className={`${color} transition-transform group-hover:scale-110`} />
    </div>
  </a>
);

const Contact: React.FC<{ lang: Language }> = ({ lang }) => {
  return (
    <div className="bg-mncc-bg min-h-screen pt-24 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-mncc-text mb-4">
            {lang === 'en' ? 'Contact Us' : 'お問い合わせ'}
          </h1>
          <p className="text-mncc-muted">
            {lang === 'en' ? 'Collaborate with the ZipAI community.' : 'ZipAIコミュニティとのコラボレーション。'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
           {/* Info Side */}
           <div className="col-span-1 space-y-6">
              {/* Location Card */}
              <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-shadow">
                 <div className="w-10 h-10 bg-mncc-primary/10 text-mncc-primary rounded-xl flex items-center justify-center mb-4 shadow-sm">
                    <MapPin size={20} />
                 </div>
                 <h3 className="text-mncc-text font-bold mb-1">Location</h3>
                 <p className="text-sm text-mncc-muted">Cambridge, MA</p>
              </div>
              
              {/* Email Card */}
              <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-shadow">
                 <div className="w-10 h-10 bg-mncc-accent/10 text-mncc-accent rounded-xl flex items-center justify-center mb-4 shadow-sm">
                    <Mail size={20} />
                 </div>
                 <h3 className="text-mncc-text font-bold mb-1">Email</h3>
                 <p className="text-sm text-mncc-muted">research@zipai.io</p>
              </div>

              {/* Social Card */}
              <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-shadow">
                 <h3 className="text-mncc-text font-bold mb-6 flex items-center gap-2">
                    <Globe size={18} className="text-purple-500" /> Social
                 </h3>
                 <div className="flex items-center justify-start gap-4">
                    <SocialButton3D icon={Instagram} color="text-[#d62976]" href="#" />
                    <SocialButton3D icon={Twitter} color="text-[#1DA1F2]" href="#" />
                    <SocialButton3D icon={Linkedin} color="text-[#0077b5]" href="#" />
                    <SocialButton3D icon={Github} color="text-[#333]" href="#" />
                 </div>
              </div>
           </div>

           {/* Form Side */}
           <div className="col-span-1 md:col-span-2">
              <ContactForm lang={lang} />
           </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;