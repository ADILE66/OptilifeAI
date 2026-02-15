import React, { useState } from 'react';
import { useTranslation } from '../i18n/i18n';
import { IconShield, IconUser, IconX, IconCheckCircle } from '../ui/Icons';

const AdminPage = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([
        { id: '1', email: 'user@example.com', role: 'user', created: '2024-05-10' },
        { id: '2', email: 'admin@optilife.ai', role: 'admin', created: '2024-01-15' },
    ]);

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white">{t('admin.title')}</h1>
                    <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-xs">Gestion de la plateforme</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-2xl font-black text-white">{users.length}</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase">Utilisateurs</p>
                    </div>
                </div>
            </header>

            <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                            <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Utilisateur</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Rôle</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Inscription</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map(u => (
                            <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-brand-500/10 group-hover:text-brand-500 transition-all">
                                            <IconUser className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-white">{u.email}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-sm font-bold">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-slate-800 text-slate-500 border-white/5'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-sm text-slate-500 font-bold">{u.created}</td>
                                <td className="px-8 py-6 text-right">
                                    <button className="p-2 text-slate-700 hover:text-red-500 transition-all">
                                        <IconX className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPage;
