
import React, { useState } from 'react';
import { Send, CheckCircle, Loader2, MessageSquare, User, Mail as MailIcon } from 'lucide-react';
import { Language } from '../types';

const ContactForm: React.FC<{ lang: Language }> = ({ lang }) => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    // Simulate network request
    setTimeout(() => {
      setStatus('success');
    }, 1500);
  };

  if (status === 'success') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-white border border-green-500/30 rounded-3xl text-center animate-fade-in shadow-2xl shadow-green-500/10">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-500 shadow-[0_0_30px_rgba(74,222,128,0.2)]">
            <CheckCircle size={40} />
        </div>
        <h3 className="text-3xl font-bold text-mncc-text mb-2">
          {lang === 'en' ? 'Message Sent!' : '送信完了'}
        </h3>
        <p className="text-mncc-muted mb-8">
          {lang === 'en' ? 'We will be in touch shortly.' : '担当者よりご連絡いたします。'}
        </p>
        <button onClick={() => setStatus('idle')} className="px-6 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-mncc-text text-sm transition-colors border border-black/5">
            {lang === 'en' ? 'Send another message' : '戻る'}
        </button>
      </div>
    );
  }

  // 3D Neumorphic Input Style for Light Theme
  const inputContainerClass = "relative group";
  const inputClass = "w-full bg-[#f3f1ea] border-none rounded-xl py-4 pl-12 pr-4 text-mncc-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mncc-primary/50 transition-all duration-300 shadow-[inset_2px_2px_6px_#d1cec7,inset_-2px_-2px_6px_#ffffff]";
  const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-mncc-primary transition-colors duration-300";

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-black/5 p-8 md:p-10 rounded-[2rem] shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-mncc-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-mncc-accent/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>
      
      <div className="relative z-10">
        <h2 className="text-2xl md:text-3xl font-bold text-mncc-text mb-2">
            {lang === 'en' ? "Let's Connect" : 'お問い合わせ'}
        </h2>
        <p className="text-mncc-muted mb-10 text-sm">
            {lang === 'en' 
               ? "Have a project in mind or want to discuss research?" 
               : "プロジェクトや研究に関するご相談はこちらから。"}
        </p>

        <div className="space-y-6">
            <div className={inputContainerClass}>
                <User size={20} className={iconClass} />
                <input type="text" id="name" className={inputClass} placeholder={lang === 'en' ? 'Your Name' : 'お名前'} required />
            </div>
            
            <div className={inputContainerClass}>
                <MailIcon size={20} className={iconClass} />
                <input type="email" id="email" className={inputClass} placeholder="Email Address" required />
            </div>

            <div className={inputContainerClass}>
                <MessageSquare size={20} className={`${iconClass} top-6 -translate-y-0`} />
                <textarea id="message" rows={4} className={`${inputClass} resize-none`} placeholder={lang === 'en' ? 'How can we help?' : 'メッセージ内容'} required></textarea>
            </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="relative w-full mt-10 group cursor-pointer"
      >
        <div className="absolute inset-0 bg-mncc-text rounded-xl translate-y-2 transition-transform group-hover:translate-y-3 group-active:translate-y-0"></div>
        <div className="relative bg-mncc-primary rounded-xl p-4 flex items-center justify-center gap-2 text-white font-bold tracking-wide transition-transform group-hover:-translate-y-1 group-active:translate-y-2 shadow-lg">
            {status === 'sending' ? (
                <Loader2 className="animate-spin" size={20} />
            ) : (
                <>
                    <Send size={20} />
                    <span>{lang === 'en' ? 'Send Message' : 'メッセージを送信'}</span>
                </>
            )}
        </div>
      </button>
    </form>
  );
};

export default ContactForm;