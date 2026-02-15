import React, { useState, useRef, useEffect } from 'react';
import { IconSparkles, IconUser, IconX, IconCheckCircle } from '../ui/Icons';
import * as geminiService from '../services/geminiService';
import { useTranslation } from '../i18n/i18n';

const CoachingPage = () => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<any[]>([
        { role: 'model', parts: [{ text: "Bonjour ! Je suis votre coach OptiLife. Comment puis-je vous aider à atteindre vos objectifs aujourd'hui ?" }] }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSend = async () => {
        if (!input || loading) return;
        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', parts: [{ text: userMsg }] }]);
        setLoading(true);

        try {
            const history = messages.map(m => ({ role: m.role, parts: m.parts }));
            const response = await geminiService.chatWithCoach(userMsg, history);
            setMessages(prev => [...prev, { role: 'model', parts: [{ text: response }] }]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-16rem)] flex flex-col animate-fade-in gap-6">
            <header>
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <IconSparkles className="w-8 h-8 text-brand-500" />
                    OptiLife AI Coach
                </h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1 italic">Propulsé par Google Gemini 1.5</p>
            </header>

            <div className="flex-1 bg-slate-900/50 border border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden relative shadow-2xl">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-5 rounded-[2rem] text-sm leading-relaxed ${m.role === 'user' ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-100 rounded-tl-none border border-white/5'}`}>
                                {m.parts[0].text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800 p-5 rounded-[2rem] rounded-tl-none border border-white/5">
                                <div className="flex gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" />
                                    <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-slate-900/80 backdrop-blur-xl border-t border-white/5">
                    <div className="relative flex items-center gap-4">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSend()}
                            placeholder="Posez une question à votre coach..."
                            className="flex-1 bg-slate-800 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all shadow-inner"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input || loading}
                            className="bg-brand-600 hover:bg-brand-500 text-white p-4 rounded-xl transition-all shadow-lg shadow-brand-600/20 disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoachingPage;
