import React, { useState, useRef, useEffect } from 'react';
import { IconSparkles, IconUser, IconMic, IconSend, IconLoader } from '../components/Icons';
import { chatWithCoach } from '../services/geminiService';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

const CoachingPage: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: "Bonjour ! Je suis votre coach personnel OptiLife. Comment puis-je vous aider aujourd'hui ? Je peux analyser vos repas, vous conseiller sur votre sommeil ou vous motiver pour votre séance de sport !", timestamp: Date.now() }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const newUserMsg: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: input,
            timestamp: Date.now()
        };

        const currentInput = input;
        setMessages(prev => [...prev, newUserMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Prepare history for Gemini
            // Map 'assistant' to 'model' and structure as { role, parts: [{ text }] }
            const history = messages.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user' as 'model' | 'user',
                parts: [{ text: m.content }]
            }));

            const responseText = await chatWithCoach(currentInput, history);

            setMessages(prev => [...prev, {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: responseText,
                timestamp: Date.now()
            }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: "Désolé, j'ai rencontré une erreur de connexion. Veuillez réessayer.",
                timestamp: Date.now()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)]">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-black text-white flex items-center gap-2">
                    <IconSparkles className="w-6 h-6 text-brand-500" />
                    AI Coach
                </h1>
                <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-500/20">En ligne</span>
            </div>

            <div className="flex-1 bg-slate-900 rounded-[2rem] shadow-sm border border-slate-800 overflow-hidden flex flex-col">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-700' : 'bg-brand-600 text-white'}`}>
                                    {msg.role === 'user' ? <IconUser className="w-4 h-4 text-slate-300" /> : <IconSparkles className="w-4 h-4" />}
                                </div>
                                <div>
                                    <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed ${msg.role === 'user'
                                        ? 'bg-slate-800 text-slate-200 rounded-tr-sm'
                                        : 'bg-brand-500/10 text-slate-200 rounded-tl-sm border border-brand-500/10'
                                        }`}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-bold mt-1 block px-1">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="flex gap-3 max-w-[80%]">
                                <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0">
                                    <IconSparkles className="w-4 h-4" />
                                </div>
                                <div className="bg-brand-500/10 p-4 rounded-2xl rounded-tl-sm flex gap-1 items-center h-10 border border-brand-500/10">
                                    <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-2 h-2 bg-brand-600 rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-900 border-t border-slate-800">
                    <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-2xl border border-slate-700 shadow-sm focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
                        <button className="p-2 text-slate-400 hover:text-brand-400 transition-colors rounded-xl hover:bg-slate-700">
                            <IconMic className="w-5 h-5" />
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Posez une question à votre coach..."
                            className="flex-1 bg-transparent border-none focus:outline-none text-slate-200 font-medium placeholder:text-slate-500"
                            disabled={isTyping}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="p-2 bg-brand-600 text-white rounded-xl shadow-lg shadow-brand-600/30 hover:bg-brand-500 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center"
                        >
                            {isTyping ? <IconLoader className="w-5 h-5 animate-spin" /> : <IconSend className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoachingPage;
