import React, { useMemo } from 'react';
import { useAuth } from '../core/AuthContext';
import { IconWater, IconFire, IconActivity, IconClock, IconSparkles, IconMoon, IconStar, IconTrophy } from '../ui/Icons';
import { Link } from 'react-router-dom';
import { WaterLog, FoodItem, ActivityLog, FastingLog, SleepLog, WeightLog, UserGoals, UserProfile } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
    waterLogs: WaterLog[];
    foodLogs: FoodItem[];
    activityLogs: ActivityLog[];
    fastingLogs: FastingLog[];
    sleepLogs: SleepLog[];
    weightLogs: WeightLog[];
    goals: UserGoals;
    profile: UserProfile;
    earnedBadgeIds: string[];
    isProMember: boolean;
    onUpgradeClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
    waterLogs, foodLogs, activityLogs, fastingLogs, sleepLogs, weightLogs, goals, profile, earnedBadgeIds, isProMember, onUpgradeClick
}) => {
    const { currentUser } = useAuth();

    const todayWater = useMemo(() => {
        const start = new Date().setHours(0, 0, 0, 0);
        return waterLogs.filter(l => l.timestamp >= start).reduce((acc, l) => acc + l.amountMl, 0);
    }, [waterLogs]);

    const todayCalories = useMemo(() => {
        const start = new Date().setHours(0, 0, 0, 0);
        return foodLogs.filter(l => l.timestamp >= start).reduce((acc, l) => acc + (l.macros?.calories || 0), 0);
    }, [foodLogs]);

    const todayActivity = useMemo(() => {
        const start = new Date().setHours(0, 0, 0, 0);
        return activityLogs.filter(l => l.timestamp >= start).reduce((acc, l) => acc + l.durationMinutes, 0);
    }, [activityLogs]);

    const lastSleep = useMemo(() => {
        const start = new Date().setHours(0, 0, 0, 0);
        const todaySleep = sleepLogs.filter(l => l.timestamp >= start);
        if (todaySleep.length > 0) return todaySleep[0].durationMinutes / 60;
        return 0;
    }, [sleepLogs]);

    const activeFast = fastingLogs.find(f => f.status === 'active');
    const fastValueH = activeFast ? Math.floor((Date.now() - activeFast.startTime) / 3600000) : 0;

    const stats = [
        { label: 'Eau', val: (todayWater / 1000).toFixed(1) + 'L', goal: (goals.waterMl / 1000).toFixed(1) + 'L', icon: IconWater, color: 'text-blue-500', bg: 'bg-blue-500/10', to: '/water', progress: (todayWater / goals.waterMl) * 100 },
        { label: 'Calories', val: todayCalories.toLocaleString(), goal: goals.calories.toLocaleString(), icon: IconFire, color: 'text-orange-500', bg: 'bg-orange-500/10', to: '/food', progress: (todayCalories / goals.calories) * 100 },
        { label: 'Activité', val: todayActivity + 'm', goal: goals.activityMinutes + 'm', icon: IconActivity, color: 'text-emerald-500', bg: 'bg-emerald-500/10', to: '/activity', progress: (todayActivity / goals.activityMinutes) * 100 },
        { label: 'Jeûne', val: fastValueH + 'h', goal: goals.fastingHours + 'h', icon: IconClock, color: 'text-purple-500', bg: 'bg-purple-500/10', to: '/fasting', progress: (fastValueH / goals.fastingHours) * 100 },
        { label: 'Sommeil', val: lastSleep.toFixed(1) + 'h', goal: goals.sleepHours + 'h', icon: IconMoon, color: 'text-indigo-500', bg: 'bg-indigo-500/10', to: '/sleep', progress: (lastSleep / goals.sleepHours) * 100 }
    ];

    const chartData = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            d.setHours(0, 0, 0, 0);
            const start = d.getTime();
            const end = start + 86400000;
            const dailyCals = foodLogs.filter(l => l.timestamp >= start && l.timestamp < end).reduce((acc, l) => acc + (l.macros?.calories || 0), 0);
            return {
                name: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
                calories: dailyCals,
                goal: goals.calories
            };
        });
    }, [foodLogs, goals.calories]);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-brand-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg shadow-brand-500/20">VITALITY STATUS</span>
                        {isProMember && <span className="bg-amber-500/20 text-amber-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter border border-amber-500/20 flex items-center gap-1"><IconStar className="w-3 h-3" /> PRO</span>}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tight leading-none">
                        HELLO, <span className="text-brand-500 uppercase">{currentUser?.email?.split('@')[0]}</span>
                    </h1>
                </div>

                <div className="flex gap-4">
                    <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-500/10 text-brand-500 rounded-xl flex items-center justify-center">
                            <IconTrophy className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">BADGES</p>
                            <p className="text-xl font-black text-white leading-none">{earnedBadgeIds.length}</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                {stats.map((stat, i) => (
                    <Link
                        key={i}
                        to={stat.to}
                        className="bg-slate-900 border border-white/5 p-6 rounded-[2rem] hover:border-brand-500/30 transition-all group relative overflow-hidden active:scale-95 shadow-xl flex flex-col justify-between"
                    >
                        <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-black text-white italic leading-none">{stat.val}</span>
                                <span className="text-[8px] font-bold text-slate-600 uppercase">/ {stat.goal}</span>
                            </div>
                        </div>
                        <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${stat.color.replace('text-', 'bg-')} opacity-60 rounded-full transition-all duration-1000`} style={{ width: `${Math.min(100, stat.progress)}%` }} />
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 relative z-10 gap-4">
                        <div>
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tight">ANALYSES & TENDANCES</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Évolution métabolique hebdomadaire</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 text-brand-500 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-brand-500/20 backdrop-blur-md">
                            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse"></span> SYSTEM OK
                        </div>
                    </div>

                    <div className="h-64 w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCals" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff03" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '20px', border: '1px solid #ffffff10', backgroundColor: '#0f172a', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                    cursor={{ stroke: '#f97316', strokeWidth: 2 }}
                                />
                                <Area type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorCals)" />
                                <Area type="monotone" dataKey="goal" stroke="#ffffff05" strokeDasharray="5 5" fill="transparent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-black border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl flex flex-col justify-between group">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-brand-400 mb-6">
                            <IconSparkles className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Antigravity AI Insights</span>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-6 italic leading-tight uppercase">SCORE<br />MÉTABOLIQUE</h3>
                        <p className="text-slate-400 leading-relaxed font-bold text-sm">
                            {todayWater > 0
                                ? "Votre système est parfaitement optimisé. L'hydratation actuelle assure une performance cognitive maximale."
                                : "ALERTE SYSTÈME : Hydratation insuffisante détectée. Risque de baisse de performance immédiat."}
                        </p>
                    </div>
                    <Link to="/food" className="mt-8 px-8 py-5 bg-white text-black font-black rounded-2xl hover:bg-brand-500 hover:text-white transition-all text-[10px] uppercase tracking-widest text-center shadow-xl shadow-white/5 group-hover:shadow-brand-500/20 active:scale-95">RECHARGER LE SYSTÈME</Link>
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-brand-500/10 blur-[100px] rounded-full group-hover:bg-brand-500/20 transition-all duration-700" />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
