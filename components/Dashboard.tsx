import React, { useState, useEffect, useMemo } from 'react';
import { FoodItem, WaterLog, UserGoals, Badge, BadgeTier, ActivityLog, FastingLog, WeightLog, UserProfile, SleepLog } from '../types';
import { BarChart, Bar, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, Legend } from 'recharts';
import { IconCalendar, IconWater, IconFire, IconChevronLeft, IconChevronRight, IconTrophy, IconLock, IconStar, IconActivity, IconClock, IconChartBar, IconMoon } from './Icons';
import { getDisplayedBadges } from '../utils/badgeManager';
import { useTranslation } from '../i18n/i18n';

interface DashboardProps {
  waterLogs: WaterLog[];
  foodLogs: FoodItem[];
  activityLogs: ActivityLog[];
  fastingLogs: FastingLog[];
  weightLogs: WeightLog[];
  sleepLogs: SleepLog[];
  profile: UserProfile;
  goals: UserGoals;
  earnedBadgeIds: string[];
  isProMember: boolean;
  onUpgradeClick: () => void;
}

const tierColors: Record<BadgeTier, { bg: string; text: string }> = {
  bronze: { bg: 'bg-amber-100', text: 'text-amber-600' },
  silver: { bg: 'bg-slate-200', text: 'text-slate-600' },
  gold: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  platinum: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
  diamond: { bg: 'bg-violet-100', text: 'text-violet-600' },
  legendary: { bg: 'bg-red-100', text: 'text-red-600' },
};

const MacroProgress: React.FC<{ label: string, color: string, current: number, goal: number, unit: string }> = ({ label, color, current, goal, unit }) => (
  <div>
    <div className="flex justify-between items-baseline mb-1"><span className="text-sm font-medium text-slate-700">{label}</span><span className="text-xs text-slate-500">{current}{unit} / {goal}{unit}</span></div>
    <div className="w-full bg-slate-200 rounded-full h-2.5"><div className={`h-2.5 rounded-full ${color}`} style={{ width: `${Math.min((current / goal) * 100, 100)}%` }}></div></div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ waterLogs, foodLogs, activityLogs, fastingLogs, weightLogs, sleepLogs, profile, goals, earnedBadgeIds, isProMember, onUpgradeClick }) => {
  const { t } = useTranslation();
  const [summaryView, setSummaryView] = useState<'week' | 'month' | 'year'>('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [yearOffset, setYearOffset] = useState(0);

  const displayedBadges: Badge[] = useMemo(() => {
    return getDisplayedBadges(earnedBadgeIds);
  }, [earnedBadgeIds]);

  const earnedCount = earnedBadgeIds.length;

  const { weeklyStats, avgCalories, avgWater, avgActivity, avgFasting, avgSleep, weekDateRange } = useMemo(() => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - (weekOffset * 7));
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
    const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(startDate); d.setDate(startDate.getDate() + i); return d; });
    const stats = days.map(day => {
      const startOfDay = new Date(day); startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(day); endOfDay.setHours(23, 59, 59, 999);
      const dailyFoodLogs = foodLogs.filter(log => log.timestamp >= startOfDay.getTime() && log.timestamp <= endOfDay.getTime());
      const dailyWaterLogs = waterLogs.filter(log => log.timestamp >= startOfDay.getTime() && log.timestamp <= endOfDay.getTime());
      const dailyActivityLogs = activityLogs.filter(log => log.timestamp >= startOfDay.getTime() && log.timestamp <= endOfDay.getTime());
      const dailyFastingLogs = fastingLogs.filter(log => log.status === 'completed' && log.endTime! >= startOfDay.getTime() && log.endTime! <= endOfDay.getTime());
      const dailySleepLogs = sleepLogs.filter(log => log.timestamp >= startOfDay.getTime() && log.timestamp <= endOfDay.getTime());

      return {
        date: day,
        day: day.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''),
        calories: dailyFoodLogs.reduce((acc, log) => acc + log.macros.calories, 0),
        water: dailyWaterLogs.reduce((acc, log) => acc + log.amountMl, 0),
        activity: dailyActivityLogs.reduce((acc, log) => acc + log.durationMinutes, 0),
        fasting: dailyFastingLogs.reduce((acc, log) => acc + (log.endTime! - log.startTime) / (1000 * 60 * 60), 0),
        sleep: dailySleepLogs.reduce((acc, log) => acc + log.durationMinutes / 60, 0)
      };
    });
    const totalWeeklyCalories = stats.reduce((acc, day) => acc + day.calories, 0);
    const totalWeeklyWater = stats.reduce((acc, day) => acc + day.water, 0);
    const totalWeeklyActivity = stats.reduce((acc, day) => acc + day.activity, 0);
    const totalWeeklyFasting = stats.reduce((acc, day) => acc + day.fasting, 0);
    const totalWeeklySleep = stats.reduce((acc, day) => acc + day.sleep, 0);

    const dateRangeFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
    const formattedDateRange = `${dateRangeFormatter.format(startDate)} - ${dateRangeFormatter.format(endDate)}`;

    return {
      weeklyStats: stats,
      avgCalories: Math.round(totalWeeklyCalories / 7),
      avgWater: Math.round(totalWeeklyWater / 7),
      avgActivity: Math.round(totalWeeklyActivity / 7),
      avgFasting: Math.round(totalWeeklyFasting / 7 * 10) / 10,
      avgSleep: Math.round(totalWeeklySleep / 7 * 10) / 10,
      weekDateRange: formattedDateRange
    };
  }, [foodLogs, waterLogs, activityLogs, fastingLogs, sleepLogs, weekOffset]);

  const { monthlyStats, monthlyAvgCalories, monthlyAvgWater, monthlyAvgActivity, monthlyAvgFasting, monthlyAvgSleep, monthDateRange, daysInMonth } = useMemo(() => {
    const today = new Date();
    today.setMonth(today.getMonth() - monthOffset);
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const numDays = endDate.getDate();

    const stats = Array.from({ length: numDays }, (_, i) => {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      const startOfDay = new Date(day); startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(day); endOfDay.setHours(23, 59, 59, 999);

      const dailyFoodLogs = foodLogs.filter(log => log.timestamp >= startOfDay.getTime() && log.timestamp <= endOfDay.getTime());
      const dailyWaterLogs = waterLogs.filter(log => log.timestamp >= startOfDay.getTime() && log.timestamp <= endOfDay.getTime());
      const dailyActivityLogs = activityLogs.filter(log => log.timestamp >= startOfDay.getTime() && log.timestamp <= endOfDay.getTime());
      const dailyFastingLogs = fastingLogs.filter(log => log.status === 'completed' && log.endTime! >= startOfDay.getTime() && log.endTime! <= endOfDay.getTime());
      const dailySleepLogs = sleepLogs.filter(log => log.timestamp >= startOfDay.getTime() && log.timestamp <= endOfDay.getTime());

      return {
        day: day.getDate(),
        calories: dailyFoodLogs.reduce((acc, log) => acc + log.macros.calories, 0),
        water: dailyWaterLogs.reduce((acc, log) => acc + log.amountMl, 0),
        activity: dailyActivityLogs.reduce((acc, log) => acc + log.durationMinutes, 0),
        fasting: dailyFastingLogs.reduce((acc, log) => acc + (log.endTime! - log.startTime) / (1000 * 60 * 60), 0),
        sleep: dailySleepLogs.reduce((acc, log) => acc + log.durationMinutes / 60, 0)
      };
    });

    const totalMonthlyCalories = stats.reduce((acc, day) => acc + day.calories, 0);
    const totalMonthlyWater = stats.reduce((acc, day) => acc + day.water, 0);
    const totalMonthlyActivity = stats.reduce((acc, day) => acc + day.activity, 0);
    const totalMonthlyFasting = stats.reduce((acc, day) => acc + day.fasting, 0);
    const totalMonthlySleep = stats.reduce((acc, day) => acc + day.sleep, 0);

    const dateRangeFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });
    const formattedDateRange = dateRangeFormatter.format(startDate);

    return {
      monthlyStats: stats,
      monthlyAvgCalories: Math.round(totalMonthlyCalories / numDays),
      monthlyAvgWater: Math.round(totalMonthlyWater / numDays),
      monthlyAvgActivity: Math.round(totalMonthlyActivity / numDays),
      monthlyAvgFasting: Math.round(totalMonthlyFasting / numDays * 10) / 10,
      monthlyAvgSleep: Math.round(totalMonthlySleep / numDays * 10) / 10,
      monthDateRange: formattedDateRange,
      daysInMonth: numDays
    };
  }, [foodLogs, waterLogs, activityLogs, fastingLogs, sleepLogs, monthOffset]);

  const { yearlyStats, yearlyAvgCalories, yearlyAvgWater, yearlyAvgActivity, yearlyAvgFasting, yearlyAvgSleep, yearDateRange } = useMemo(() => {
    const today = new Date();
    const targetYear = today.getFullYear() - yearOffset;

    const stats = Array.from({ length: 12 }, (_, i) => {
      const monthStart = new Date(targetYear, i, 1).getTime();
      const monthEnd = new Date(targetYear, i + 1, 0, 23, 59, 59, 999).getTime();

      const monthlyFood = foodLogs.filter(l => l.timestamp >= monthStart && l.timestamp <= monthEnd);
      const monthlyWater = waterLogs.filter(l => l.timestamp >= monthStart && l.timestamp <= monthEnd);
      const monthlyActivity = activityLogs.filter(l => l.timestamp >= monthStart && l.timestamp <= monthEnd);
      const monthlyFasting = fastingLogs.filter(l => l.status === 'completed' && l.endTime! >= monthStart && l.endTime! <= monthEnd);
      const monthlySleep = sleepLogs.filter(l => l.timestamp >= monthStart && l.timestamp <= monthEnd);

      return {
        name: new Date(targetYear, i, 1).toLocaleDateString('fr-FR', { month: 'short' }),
        calories: monthlyFood.reduce((acc, l) => acc + l.macros.calories, 0),
        water: monthlyWater.reduce((acc, l) => acc + l.amountMl, 0),
        activity: monthlyActivity.reduce((acc, l) => acc + l.durationMinutes, 0),
        fasting: monthlyFasting.reduce((acc, l) => acc + (l.endTime! - l.startTime) / (1000 * 60 * 60), 0),
        sleep: monthlySleep.reduce((acc, l) => acc + l.durationMinutes / 60, 0)
      };
    });

    const totalCal = stats.reduce((acc, m) => acc + m.calories, 0);
    const totalWater = stats.reduce((acc, m) => acc + m.water, 0);
    const totalActivity = stats.reduce((acc, m) => acc + m.activity, 0);
    const totalFasting = stats.reduce((acc, m) => acc + m.fasting, 0);
    const totalSleep = stats.reduce((acc, m) => acc + m.sleep, 0);

    return {
      yearlyStats: stats,
      yearlyAvgCalories: Math.round(totalCal / 12),
      yearlyAvgWater: Math.round(totalWater / 12),
      yearlyAvgActivity: Math.round(totalActivity / 12),
      yearlyAvgFasting: Math.round(totalFasting / 12 * 10) / 10,
      yearlyAvgSleep: Math.round(totalSleep / 12 * 10) / 10,
      yearDateRange: targetYear.toString()
    };
  }, [foodLogs, waterLogs, activityLogs, fastingLogs, sleepLogs, yearOffset]);


  const todayLogs = useMemo(() => {
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    const dailyFoodLogs = foodLogs.filter(l => l.timestamp >= startOfToday.getTime());
    return {
      totalWater: waterLogs.filter(l => l.timestamp >= startOfToday.getTime()).reduce((acc, log) => acc + log.amountMl, 0),
      totalCalories: dailyFoodLogs.reduce((acc, log) => acc + log.macros.calories, 0),
      totalProtein: dailyFoodLogs.reduce((acc, log) => acc + log.macros.protein, 0),
      totalCarbs: dailyFoodLogs.reduce((acc, log) => acc + log.macros.carbs, 0),
      totalFat: dailyFoodLogs.reduce((acc, log) => acc + log.macros.fat, 0),
      totalActivityMinutes: activityLogs.filter(l => l.timestamp >= startOfToday.getTime()).reduce((acc, log) => acc + log.durationMinutes, 0),
      totalSleepHours: sleepLogs.filter(l => l.timestamp >= startOfToday.getTime()).reduce((acc, log) => acc + log.durationMinutes / 60, 0),
    }
  }, [foodLogs, waterLogs, activityLogs, sleepLogs]);

  const activeFast = useMemo(() => fastingLogs.find(f => f.status === 'active'), [fastingLogs]);

  const handlePrevPeriod = () => {
    if (summaryView === 'week') setWeekOffset(p => p + 1);
    else if (summaryView === 'month') setMonthOffset(p => p + 1);
    else setYearOffset(p => p + 1);
  };

  const handleNextPeriod = () => {
    if (summaryView === 'week') setWeekOffset(p => p - 1);
    else if (summaryView === 'month') setMonthOffset(p => p - 1);
    else setYearOffset(p => p - 1);
  };

  const isNextDisabled = () => {
    if (summaryView === 'week') return weekOffset === 0;
    if (summaryView === 'month') return monthOffset === 0;
    return yearOffset === 0;
  };

  const getDateRangeLabel = () => {
    if (summaryView === 'week') return weekDateRange;
    if (summaryView === 'month') return monthDateRange;
    return yearDateRange;
  };

  const weightChartData = useMemo(() => {
    return weightLogs.map(log => {
      const calculatedBmi = profile.heightCm ? log.weightKg / ((profile.heightCm / 100) ** 2) : null;
      return {
        ...log,
        bmi: calculatedBmi ? parseFloat(calculatedBmi.toFixed(1)) : null
      };
    });
  }, [weightLogs, profile.heightCm]);

  const CustomWeightTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const bmiValue = payload.find((p: any) => p.dataKey === 'bmi')?.value;
      const weightValue = payload.find((p: any) => p.dataKey === 'weightKg')?.value;

      let category = t('settings.bmiCategory.na');
      let colorClass = 'text-slate-400';

      if (bmiValue < 18.5) { category = t('settings.bmiCategory.underweight'); colorClass = 'text-blue-400'; }
      else if (bmiValue < 25) { category = t('settings.bmiCategory.normal'); colorClass = 'text-emerald-400'; }
      else if (bmiValue < 30) { category = t('settings.bmiCategory.overweight'); colorClass = 'text-amber-400'; }
      else if (bmiValue >= 30) { category = t('settings.bmiCategory.obesity'); colorClass = 'text-red-400'; }

      return (
        <div className="bg-slate-900 p-4 rounded-2xl shadow-xl border border-slate-800 animate-in zoom-in-95">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-800 pb-2">
            {new Date(label).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <div className="space-y-1">
            <div className="flex justify-between items-center gap-8">
              <span className="text-sm font-bold text-slate-300">Poids</span>
              <span className="text-lg font-black text-brand-500">{weightValue} kg</span>
            </div>
            <div className="flex justify-between items-center gap-8">
              <span className="text-sm font-bold text-slate-300">IMC</span>
              <span className="text-lg font-black text-amber-500">{bmiValue}</span>
            </div>
            <div className={`text-[10px] font-black uppercase tracking-tighter mt-2 text-center py-1 rounded-full bg-slate-800 ${colorClass}`}>
              {category}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-800"><p className="text-sm text-slate-400 mb-1">{t('dashboard.waterToday')}</p><p className="text-2xl font-bold text-brand-500">{todayLogs.totalWater} ml</p><div className="w-full bg-slate-800 rounded-full h-1.5 mt-3"><div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${Math.min((todayLogs.totalWater / 2500) * 100, 100)}%` }}></div></div></div>
        <div className="bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-800"><p className="text-sm text-slate-400 mb-1">{t('dashboard.caloriesToday')}</p><p className="text-2xl font-bold text-orange-500">{todayLogs.totalCalories} kcal</p><div className="w-full bg-slate-800 rounded-full h-1.5 mt-3"><div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${Math.min((todayLogs.totalCalories / goals.calories) * 100, 100)}%` }}></div></div></div>
        <div className="bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-800"><p className="text-sm text-slate-400 mb-1">{t('dashboard.activityToday')}</p><p className="text-2xl font-bold text-emerald-500">{todayLogs.totalActivityMinutes} min</p><div className="w-full bg-slate-800 rounded-full h-1.5 mt-3"><div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min((todayLogs.totalActivityMinutes / 60) * 100, 100)}%` }}></div></div></div>
        <div className="bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-800"><p className="text-sm text-slate-400 mb-1">{t('dashboard.fasting')}</p>{activeFast ? <p className="text-2xl font-bold text-purple-500">{t('dashboard.fastingStatusActive')}</p> : <p className="text-2xl font-bold text-purple-500">{t('dashboard.fastingStatusInactive')}</p>}<div className="w-full bg-slate-800 rounded-full h-1.5 mt-3"><div className="bg-purple-500 h-1.5 rounded-full" style={{ width: activeFast ? `${Math.min(((Date.now() - activeFast.startTime) / (activeFast.goalHours * 3600000)) * 100, 100)}%` : '0%' }}></div></div></div>
        <div className="bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-800"><p className="text-sm text-slate-400 mb-1">{t('dashboard.sleepToday')}</p><p className="text-2xl font-bold text-indigo-500">{todayLogs.totalSleepHours.toFixed(1)} h</p><div className="w-full bg-slate-800 rounded-full h-1.5 mt-3"><div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${Math.min((todayLogs.totalSleepHours / goals.sleepHours) * 100, 100)}%` }}></div></div></div>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <IconFire className="w-6 h-6 text-orange-500" />
          {t('dashboard.macrosTitle')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MacroProgress label={t('dashboard.protein')} color="bg-emerald-500" current={todayLogs.totalProtein} goal={goals.protein} unit="g" />
          <MacroProgress label={t('dashboard.carbs')} color="bg-amber-500" current={todayLogs.totalCarbs} goal={goals.carbs} unit="g" />
          <MacroProgress label={t('dashboard.fat')} color="bg-red-500" current={todayLogs.totalFat} goal={goals.fat} unit="g" />
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <IconTrophy className="w-6 h-6 text-amber-500" />
          {t('dashboard.achievementsTitle')}
          <span className="text-sm font-normal text-slate-500">({earnedCount})</span>
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {displayedBadges.map(badge => (
            <div key={badge.id} className="flex flex-col items-center text-center group" title={`${t(badge.nameKey)}: ${t(badge.descriptionKey)}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${badge.isEarned ? tierColors[badge.tier].bg : 'bg-slate-800'} shrink-0`}>
                <badge.icon className={`w-8 h-8 transition-all duration-300 ${badge.isEarned ? tierColors[badge.tier].text : 'text-slate-600'}`} />
              </div>
              <p className={`text-xs font-semibold mt-2 w-full px-1 line-clamp-2 leading-tight ${badge.isEarned ? 'text-slate-300' : 'text-slate-600'}`}>
                {t(badge.nameKey)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] shadow-sm p-8 border border-slate-800 overflow-hidden relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h3 className="text-xl font-black text-white flex items-center gap-3"><IconChartBar className="w-7 h-7 text-brand-500" />{t('settings.weightTracking')}</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-brand-500 rounded-full"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('settings.weight')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-amber-400 rounded-full"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('settings.bmiLabel')}</span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full">
          {weightLogs.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={weightChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(ts) => new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  domain={['dataMin - 5', 'dataMax + 5']}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  unit=" kg"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[10, 40]}
                  hide
                />

                <Tooltip content={<CustomWeightTooltip />} cursor={{ stroke: '#475569', strokeWidth: 2 }} />

                {/* Zones de santé IMC - Dark Mode Colors */}
                <ReferenceArea yAxisId="right" y1={10} y2={18.5} fill="#1e3a8a" fillOpacity={0.2} />
                <ReferenceArea yAxisId="right" y1={18.5} y2={25} fill="#064e3b" fillOpacity={0.2} />
                <ReferenceArea yAxisId="right" y1={25} y2={30} fill="#78350f" fillOpacity={0.2} />
                <ReferenceArea yAxisId="right" y1={30} y2={40} fill="#7f1d1d" fillOpacity={0.2} />

                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="weightKg"
                  stroke="#0ea5e9"
                  strokeWidth={4}
                  dot={{ r: 6, fill: '#0ea5e9', strokeWidth: 3, stroke: '#1e293b' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  animationDuration={1500}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="bmi"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  strokeDasharray="8 8"
                  dot={false}
                  animationDuration={2000}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-slate-800 rounded-3xl border-2 border-dashed border-slate-700 p-8">
              <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center shadow-sm mb-4">
                <IconChartBar className="w-10 h-10 opacity-20 text-slate-400" />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest">{t('settings.noWeightData')}</p>
              <p className="text-xs mt-2 max-w-[200px] text-center opacity-60">Ajoutez votre poids dans les paramètres pour commencer le suivi.</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-1 mt-6">
          <div className="h-1 bg-blue-500/30 rounded-full" title="Insuffisance"></div>
          <div className="h-1 bg-emerald-500/30 rounded-full" title="Normal"></div>
          <div className="h-1 bg-amber-500/30 rounded-full" title="Surpoids"></div>
          <div className="h-1 bg-red-500/30 rounded-full" title="Obésité"></div>
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><IconCalendar className="w-6 h-6 text-brand-500" />{t('dashboard.summaryTitle')}</h3>
            <div className="mt-2 bg-slate-800 p-1 rounded-lg flex items-center text-sm">
              <button onClick={() => setSummaryView('week')} className={`px-3 py-1 rounded-md transition-colors ${summaryView === 'week' ? 'bg-slate-700 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>{t('dashboard.summaryWeek')}</button>
              <button onClick={() => setSummaryView('month')} className={`px-3 py-1 rounded-md transition-colors ${summaryView === 'month' ? 'bg-slate-700 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>{t('dashboard.summaryMonth')}</button>
              <button onClick={() => setSummaryView('year')} className={`px-3 py-1 rounded-md transition-colors ${summaryView === 'year' ? 'bg-slate-700 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>{t('dashboard.summaryYear')}</button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-right">
            <span className="text-sm font-medium text-slate-400">{getDateRangeLabel()}</span>
            <button onClick={handlePrevPeriod} className="p-1 rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200" aria-label="Période précédente"><IconChevronLeft className="w-5 h-5" /></button>
            <button onClick={handleNextPeriod} disabled={isNextDisabled()} className="p-1 rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Période suivante"><IconChevronRight className="w-5 h-5" /></button>
          </div>
        </div>

        {isProMember ? (
          summaryView === 'week' ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6 text-center">
                <div className="bg-blue-500/10 p-4 rounded-xl"><p className="text-sm text-slate-400 flex items-center justify-center gap-1.5"><IconWater className="w-4 h-4 text-blue-400" />{t('dashboard.summaryWaterPerDay')}</p><p className="font-bold text-white text-xl">{avgWater} ml</p></div>
                <div className="bg-orange-500/10 p-4 rounded-xl"><p className="text-sm text-slate-400 flex items-center justify-center gap-1.5"><IconFire className="w-4 h-4 text-orange-400" />{t('dashboard.summaryCaloriesPerDay')}</p><p className="font-bold text-white text-xl">{avgCalories} kcal</p></div>
                <div className="bg-emerald-500/10 p-4 rounded-xl"><p className="text-sm text-slate-400 flex items-center justify-center gap-1.5"><IconActivity className="w-4 h-4 text-emerald-400" />{t('dashboard.summaryActivityPerDay')}</p><p className="font-bold text-white text-xl">{avgActivity} min</p></div>
                <div className="bg-purple-500/10 p-4 rounded-xl"><p className="text-sm text-slate-400 flex items-center justify-center gap-1.5"><IconClock className="w-4 h-4 text-purple-400" />{t('dashboard.summaryFastingPerDay')}</p><p className="font-bold text-white text-xl">{avgFasting} h</p></div>
                <div className="bg-indigo-500/10 p-4 rounded-xl"><p className="text-sm text-slate-400 flex items-center justify-center gap-1.5"><IconMoon className="w-4 h-4 text-indigo-400" />{t('dashboard.summarySleepPerDay')}</p><p className="font-bold text-white text-xl">{avgSleep} h</p></div>
              </div>
              <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={weeklyStats} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} /><Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #1e293b', backgroundColor: '#0f172a', color: '#fff' }} cursor={{ fill: 'rgba(251, 146, 60, 0.1)' }} /><Bar dataKey="calories" name={t('dashboard.goalCalories')} fill="#fb923c" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
            </>
          ) : summaryView === 'month' ? ( // Monthly View
            <>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6 text-center">
                <div className="bg-blue-500/10 p-4 rounded-xl"><p className="text-sm text-slate-400 flex items-center justify-center gap-1.5"><IconWater className="w-4 h-4 text-blue-400" />{t('dashboard.summaryAvgWaterPerDay')}</p><p className="font-bold text-white text-xl">{monthlyAvgWater} ml</p></div>
                <div className="bg-orange-500/10 p-4 rounded-xl"><p className="text-sm text-slate-400 flex items-center justify-center gap-1.5"><IconFire className="w-4 h-4 text-orange-400" />{t('dashboard.summaryAvgCaloriesPerDay')}</p><p className="font-bold text-white text-xl">{monthlyAvgCalories} kcal</p></div>
                <div className="bg-emerald-500/10 p-4 rounded-xl"><p className="text-sm text-slate-400 flex items-center justify-center gap-1.5"><IconActivity className="w-4 h-4 text-emerald-400" />{t('dashboard.summaryAvgActivityPerDay')}</p><p className="font-bold text-white text-xl">{monthlyAvgActivity} min</p></div>
                <div className="bg-purple-500/10 p-4 rounded-xl"><p className="text-sm text-slate-400 flex items-center justify-center gap-1.5"><IconClock className="w-4 h-4 text-purple-400" />{t('dashboard.summaryAvgFastingPerDay')}</p><p className="font-bold text-white text-xl">{monthlyAvgFasting} h</p></div>
                <div className="bg-indigo-500/10 p-4 rounded-xl"><p className="text-sm text-slate-400 flex items-center justify-center gap-1.5"><IconMoon className="w-4 h-4 text-indigo-400" />{t('dashboard.summaryAvgSleepPerDay')}</p><p className="font-bold text-white text-xl">{monthlyAvgSleep} h</p></div>
              </div>
              <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={monthlyStats} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" /><XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(val) => (val % 5 === 0 || val === 1 || val === daysInMonth) ? val : ''} /><YAxis yAxisId="left" orientation="left" stroke="#fb923c" tick={{ fill: '#fb923c', fontSize: 12 }} /><YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" tick={{ fill: '#0ea5e9', fontSize: 12 }} /><Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #1e293b', backgroundColor: '#0f172a', color: '#fff' }} /><Bar dataKey="calories" name={t('dashboard.goalCalories')} yAxisId="left" barSize={10} fill="#fb923c" radius={[2, 2, 0, 0]} /><Line type="monotone" dataKey="water" name={`${t('nav.water')} (ml)`} yAxisId="right" stroke="#0ea5e9" strokeWidth={2} dot={false} /></ComposedChart></ResponsiveContainer></div>
            </>
          ) : ( // Yearly View
            <>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6 text-center">
                <div className="bg-blue-500/10 p-4 rounded-xl"><p className="text-sm text-slate-400 flex items-center justify-center gap-1.5"><IconWater className="w-4 h-4 text-blue-400" />{t('dashboard.summaryAvgWaterPerMonth')}</p><p className="font-bold text-white text-xl">{yearlyAvgWater} ml</p></div>
                <div className="bg-orange-500/10 p-4 rounded-xl"><p className="text-sm text-slate-400 flex items-center justify-center gap-1.5"><IconFire className="w-4 h-4 text-orange-400" />{t('dashboard.summaryAvgCaloriesPerMonth')}</p><p className="font-bold text-white text-xl">{yearlyAvgCalories} kcal</p></div>
                <div className="bg-emerald-500/10 p-4 rounded-xl"><p className="text-sm text-slate-400 flex items-center justify-center gap-1.5"><IconActivity className="w-4 h-4 text-emerald-400" />{t('dashboard.summaryAvgActivityPerMonth')}</p><p className="font-bold text-white text-xl">{yearlyAvgActivity} min</p></div>
                <div className="bg-purple-500/10 p-4 rounded-xl"><p className="text-sm text-slate-400 flex items-center justify-center gap-1.5"><IconClock className="w-4 h-4 text-purple-400" />{t('dashboard.summaryAvgFastingPerMonth')}</p><p className="font-bold text-white text-xl">{yearlyAvgFasting} h</p></div>
                <div className="bg-indigo-500/10 p-4 rounded-xl"><p className="text-sm text-slate-400 flex items-center justify-center gap-1.5"><IconMoon className="w-4 h-4 text-indigo-400" />{t('dashboard.summaryAvgSleepPerMonth')}</p><p className="font-bold text-white text-xl">{yearlyAvgSleep} h</p></div>
              </div>
              <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={yearlyStats} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" /><XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} /><YAxis yAxisId="left" orientation="left" stroke="#fb923c" tick={{ fill: '#fb923c', fontSize: 12 }} /><YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" tick={{ fill: '#0ea5e9', fontSize: 12 }} /><Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #1e293b', backgroundColor: '#0f172a', color: '#fff' }} /><Bar dataKey="calories" name={t('dashboard.goalCalories')} yAxisId="left" barSize={10} fill="#fb923c" radius={[2, 2, 0, 0]} /><Line type="monotone" dataKey="water" name={`${t('nav.water')} (ml)`} yAxisId="right" stroke="#0ea5e9" strokeWidth={2} dot={false} /></ComposedChart></ResponsiveContainer></div>
            </>
          )
        ) : (
          <div className="relative h-80 flex flex-col items-center justify-center text-center bg-slate-900 rounded-xl p-6 border border-dashed border-slate-700">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm rounded-xl"></div>
            <div className="relative z-10">
              <IconLock className="w-10 h-10 mx-auto text-slate-500 mb-2" />
              <h4 className="font-bold text-white">{t('dashboard.proFeatureTitle')}</h4>
              <p className="text-sm text-slate-400 mb-4">{t('dashboard.proFeatureDescription')}</p>
              <button onClick={onUpgradeClick} className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg font-semibold text-slate-900 bg-white hover:bg-slate-200">
                <IconStar className="w-4 h-4" /> {t('dashboard.proFeatureButton')}
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;