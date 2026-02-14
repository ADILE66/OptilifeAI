import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ActivityLog, UserProfile } from '../types';
import { IconPlus, IconActivity, IconTrash, IconChartBar, IconSparkles, IconLock, IconPlayerPlay, IconPlayerPause, IconPlayerStop, IconCheckCircle, IconRun, IconBike, IconSwim, IconDumbbell, IconYoga, IconCpu, IconSatellite, IconStar } from './Icons';
import { useTranslation } from '../i18n/i18n';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AIInsightsModal from './AIInsightsModal';

interface ActivityTrackerProps {
    logs: ActivityLog[];
    onAdd: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
    onDelete: (id: string) => void;
    isProMember: boolean;
    onUpgradeClick: () => void;
    profile?: UserProfile;
}

const formatTime = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(Math.floor(seconds % 60)).padStart(2, '0');
    return `${h}:${m}:${s}`;
};

const haversineDistance = (coords1: { lat: number, lon: number }, coords2: { lat: number, lon: number }) => {
    const R = 6371;
    const dLat = (coords2.lat - coords1.lat) * Math.PI / 180;
    const dLon = (coords2.lon - coords1.lon) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(coords1.lat * Math.PI / 180) * Math.cos(coords2.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const iconMap: Record<string, React.FC<{ className?: string }>> = {
    'activity': IconActivity,
    'run': IconRun,
    'bike': IconBike,
    'swim': IconSwim,
    'dumbbell': IconDumbbell,
    'yoga': IconYoga
};

const getIconForActivityType = (typeKey: string): string => {
    if (['run', 'soccer', 'basketball', 'tennis', 'hiking'].includes(typeKey)) return 'run';
    if (['bike', 'elliptical'].includes(typeKey)) return 'bike';
    if (['swim', 'rowing'].includes(typeKey)) return 'swim';
    if (['weightlifting', 'crossfit', 'boxing', 'hiit'].includes(typeKey)) return 'dumbbell';
    if (['yoga', 'pilates', 'dance'].includes(typeKey)) return 'yoga';
    return 'activity';
};

const usePedometer = (isTracking: boolean) => {
    const [steps, setSteps] = useState(0);
    const [source, setSource] = useState<'hardware' | 'software' | 'none'>('none');
    const stepCountRef = useRef(0);
    const lastAccelRef = useRef({ x: 0, y: 0, z: 0 });
    const lastStepTimeRef = useRef(0);

    useEffect(() => {
        if (!isTracking) {
            setSteps(0);
            stepCountRef.current = 0;
            return;
        }

        if ('LinearAccelerationSensor' in window) {
            try {
                // @ts-ignore
                const sensor = new LinearAccelerationSensor({ frequency: 60 });
                sensor.addEventListener('reading', () => {
                    const { x, y, z } = sensor;
                    if (x == null || y == null || z == null) return;
                    const magnitude = Math.sqrt(x * x + y * y + z * z);
                    detectStep(magnitude, 2.5);
                });
                sensor.addEventListener('error', (e: any) => {
                    startDeviceMotionFallback();
                });
                sensor.start();
                setSource('hardware');
                return () => sensor.stop();
            } catch (e) {
                startDeviceMotionFallback();
            }
        } else {
            startDeviceMotionFallback();
        }

        function startDeviceMotionFallback() {
            setSource('software');
            window.addEventListener('devicemotion', handleDeviceMotion);
        }

        function handleDeviceMotion(event: DeviceMotionEvent) {
            const accel = event.accelerationIncludingGravity;
            if (!accel || !accel.x || !accel.y || !accel.z) return;
            const alpha = 0.8;
            const gravity = {
                x: alpha * lastAccelRef.current.x + (1 - alpha) * accel.x,
                y: alpha * lastAccelRef.current.y + (1 - alpha) * accel.y,
                z: alpha * lastAccelRef.current.z + (1 - alpha) * accel.z,
            };
            lastAccelRef.current = gravity;
            const linearX = accel.x - gravity.x;
            const linearY = accel.y - gravity.y;
            const linearZ = accel.z - gravity.z;
            const magnitude = Math.sqrt(linearX * linearX + linearY * linearY + linearZ * linearZ);
            detectStep(magnitude, 2.0);
        }

        function detectStep(magnitude: number, threshold: number) {
            const now = Date.now();
            if (magnitude > threshold && (now - lastStepTimeRef.current > 300)) {
                stepCountRef.current += 1;
                lastStepTimeRef.current = now;
                setSteps(stepCountRef.current);
            }
        }

        return () => window.removeEventListener('devicemotion', handleDeviceMotion);
    }, [isTracking]);

    return { steps, source };
};

const ActivityTracker: React.FC<ActivityTrackerProps> = ({ logs, onAdd, onDelete, isProMember, onUpgradeClick, profile }) => {
    const { t } = useTranslation();
    const [mode, setMode] = useState<'live' | 'manual'>('manual');
    const [historyView, setHistoryView] = useState<'week' | 'month' | 'year'>('week');
    const [isInsightsOpen, setIsInsightsOpen] = useState(false);

    const activityTypes = useMemo(() => [
        { name: t('activityTracker.activityTypes.walk'), key: 'walk', met: 3.5, stepsPerKm: 1300 },
        { name: t('activityTracker.activityTypes.run'), key: 'run', met: 9.8, stepsPerKm: 1050 },
        { name: t('activityTracker.activityTypes.hiking'), key: 'hiking', met: 6.0, stepsPerKm: 1400 },
        { name: t('activityTracker.activityTypes.bike'), key: 'bike', met: 7.5, stepsPerKm: 0 },
        { name: t('activityTracker.activityTypes.swim'), key: 'swim', met: 8.0, stepsPerKm: 0 },
        { name: t('activityTracker.activityTypes.weightlifting'), key: 'weightlifting', met: 5.0, stepsPerKm: 0 },
        { name: t('activityTracker.activityTypes.hiit'), key: 'hiit', met: 8.0, stepsPerKm: 0 },
        { name: t('activityTracker.activityTypes.yoga'), key: 'yoga', met: 3.0, stepsPerKm: 0 },
    ].sort((a, b) => a.name.localeCompare(b.name)), [t]);

    const [activityName, setActivityName] = useState('');
    const [duration, setDuration] = useState('');
    const [calories, setCalories] = useState('');
    const [distance, setDistance] = useState('');
    const [steps, setSteps] = useState('');
    const [selectedManualActivity, setSelectedManualActivity] = useState<string>('walk');
    const [manualIcon, setManualIcon] = useState('activity');

    const [isTracking, setIsTracking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [distanceKm, setDistanceKm] = useState(0);
    const [liveCalories, setLiveCalories] = useState(0);
    const [selectedActivity, setSelectedActivity] = useState<(typeof activityTypes)[0] | null>(null);
    const [gpsError, setGpsError] = useState<string | null>(null);

    const { steps: pedometerSteps, source: pedometerSource } = usePedometer(isTracking && !isPaused);

    const timerRef = useRef<number | null>(null);
    const watchIdRef = useRef<number | null>(null);
    const lastPositionRef = useRef<{ lat: number, lon: number } | null>(null);

    const totalMinutes = logs.reduce((acc, log) => acc + log.durationMinutes, 0);
    const totalCalories = logs.reduce((acc, log) => acc + log.caloriesBurned, 0);

    useEffect(() => {
        if (!selectedActivity && activityTypes.length > 0) {
            const walk = activityTypes.find(a => a.key === 'walk');
            if (walk) setSelectedActivity(walk);
        }
    }, [activityTypes, selectedActivity]);

    const stopSensors = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };

    const handleStartTracking = async () => {
        if (!isProMember) return onUpgradeClick();
        if (!selectedActivity) return;
        setGpsError(null);
        setElapsedSeconds(0);
        setDistanceKm(0);
        setLiveCalories(0);
        lastPositionRef.current = null;
        setIsTracking(true);
        setIsPaused(false);

        timerRef.current = window.setInterval(() => {
            setElapsedSeconds(prev => prev + 1);
        }, 1000);

        if (navigator.geolocation) {
            watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude, accuracy } = position.coords;
                    if (accuracy && accuracy > 50) return;
                    const newPoint = { lat: latitude, lon: longitude };
                    if (lastPositionRef.current) {
                        const dist = haversineDistance(lastPositionRef.current, newPoint);
                        if (dist > 0.01) {
                            setDistanceKm(prev => prev + dist);
                            lastPositionRef.current = newPoint;
                        }
                    } else {
                        lastPositionRef.current = newPoint;
                    }
                },
                (error) => setGpsError(t('activityTracker.gpsError', { message: error.message })),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        }
    };

    const displaySteps = useMemo(() => {
        if (selectedActivity?.key === 'bike' || selectedActivity?.key === 'swim') return 0;
        if (pedometerSource !== 'none' && pedometerSteps > 0) return pedometerSteps;
        if (selectedActivity && selectedActivity.stepsPerKm > 0) return Math.round(distanceKm * selectedActivity.stepsPerKm);
        return 0;
    }, [pedometerSteps, pedometerSource, distanceKm, selectedActivity]);

    useEffect(() => {
        if (isTracking && !isPaused && selectedActivity) {
            const minutes = elapsedSeconds / 60;
            const weight = profile?.weightKg || 70;
            const height = profile?.heightCm || 175;
            const age = profile?.age || 30;
            const gender = profile?.gender || 'male';
            let bmr = (10 * weight) + (6.25 * height) - (5 * age);
            if (gender === 'female') bmr -= 161; else bmr += 5;
            const caloriesPerMinute = (bmr / 1440) * selectedActivity.met;
            setLiveCalories(Math.round(caloriesPerMinute * minutes));
        }
    }, [elapsedSeconds, isTracking, isPaused, selectedActivity, profile]);

    const handlePauseTracking = () => { stopSensors(); setIsPaused(true); };

    const handleResumeTracking = () => {
        setIsPaused(false);
        lastPositionRef.current = null;
        timerRef.current = window.setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
        if (navigator.geolocation) {
            watchIdRef.current = navigator.geolocation.watchPosition(
                (pos) => {
                    const { latitude: lat, longitude: lon } = pos.coords;
                    if (lastPositionRef.current) {
                        const dist = haversineDistance(lastPositionRef.current, { lat, lon });
                        if (dist > 0.01) { setDistanceKm(prev => prev + dist); lastPositionRef.current = { lat, lon }; }
                    } else { lastPositionRef.current = { lat, lon }; }
                },
                (err) => setGpsError(err.message),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        }
    };

    const handleStopTracking = () => {
        stopSensors();
        if (selectedActivity && elapsedSeconds > 0) {
            onAdd({
                activityName: `${selectedActivity.name} (Live)`,
                durationMinutes: Math.floor(elapsedSeconds / 60),
                caloriesBurned: liveCalories,
                steps: displaySteps > 0 ? displaySteps : undefined,
                icon: getIconForActivityType(selectedActivity.key)
            });
        }
        setIsTracking(false);
        setIsPaused(false);
    };

    useEffect(() => {
        const activity = activityTypes.find(a => a.key === selectedManualActivity);
        if (!activity) return;
        setManualIcon(getIconForActivityType(selectedManualActivity));
        if (duration) {
            const met = activity.met;
            const weight = profile?.weightKg || 70;
            setCalories(Math.round(((met * 3.5 * weight) / 200) * parseFloat(duration)).toString());
        }
        if (distance && activity.stepsPerKm > 0) {
            setSteps(Math.round(parseFloat(distance) * activity.stepsPerKm).toString());
        } else if (activity.stepsPerKm === 0) setSteps('');
    }, [duration, distance, selectedManualActivity, profile, activityTypes]);

    const handleManualAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const activityObj = activityTypes.find(a => a.key === selectedManualActivity);
        const name = activityName || (activityObj ? activityObj.name : 'Activité');
        if (duration && calories) {
            onAdd({
                activityName: name,
                durationMinutes: parseInt(duration),
                caloriesBurned: parseInt(calories),
                steps: steps ? parseInt(steps) : undefined,
                icon: manualIcon
            });
            setActivityName(''); setDuration(''); setCalories(''); setDistance(''); setSteps('');
        }
    };

    const historyData = useMemo(() => {
        const now = new Date(); now.setHours(0, 0, 0, 0);
        const labels = historyView === 'week' ? 7 : (historyView === 'month' ? 30 : 12);
        return Array.from({ length: labels }, (_, i) => {
            const d = new Date(now);
            if (historyView === 'week') d.setDate(d.getDate() - (6 - i));
            else if (historyView === 'month') d.setDate(d.getDate() - (29 - i));
            else d.setMonth(d.getMonth() - (11 - i));
            const start = d.getTime();
            const end = start + (historyView === 'year' ? 86400000 * 30 : 86400000);
            return {
                label: historyView === 'year' ? d.toLocaleDateString('fr-FR', { month: 'short' }) : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
                value: logs.filter(l => l.timestamp >= start && l.timestamp < end).reduce((acc, l) => acc + l.durationMinutes, 0)
            };
        });
    }, [logs, historyView]);

    const todaysLogs = useMemo(() => {
        const start = new Date(); start.setHours(0, 0, 0, 0);
        return logs.filter(l => l.timestamp >= start.getTime()).sort((a, b) => b.timestamp - a.timestamp);
    }, [logs]);

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-800">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                    <IconActivity className="w-6 h-6 text-emerald-500" />
                    {t('activityTracker.title')}
                </h2>

                <div className="bg-slate-800 p-1 rounded-lg flex items-center text-sm w-full mb-6">
                    <button onClick={() => setMode('live')} className={`w-1/2 py-2 rounded-md transition-colors font-semibold flex items-center justify-center gap-2 ${mode === 'live' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>
                        {t('activityTracker.liveMode')} {!isProMember && <IconLock className="w-3 h-3" />}
                    </button>
                    <button onClick={() => setMode('manual')} className={`w-1/2 py-2 rounded-md transition-colors font-semibold ${mode === 'manual' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>{t('activityTracker.manualMode')}</button>
                </div>

                {mode === 'live' ? (
                    !isProMember ? (
                        <div className="text-center py-12 px-6 bg-emerald-500/10 rounded-2xl border border-dashed border-emerald-500/20">
                            <IconLock className="w-12 h-12 mx-auto text-emerald-500/50 mb-4" />
                            <p className="text-emerald-200 font-bold mb-2">{t('common.proFeature')}</p>
                            <p className="text-sm text-emerald-500/70 mb-6">{t('activityTracker.proLockMessage')}</p>
                            <button onClick={onUpgradeClick} className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 mx-auto hover:bg-brand-500 transition-all">
                                <IconStar className="w-4 h-4 text-yellow-400" fill="currentColor" /> {t('dashboard.proFeatureButton')}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {!isTracking ? (
                                <div>
                                    <label className="text-sm font-medium text-slate-300 mb-1 block">{t('activityTracker.selectActivity')}</label>
                                    <select value={selectedActivity?.key || ''} onChange={(e) => setSelectedActivity(activityTypes.find(a => a.key === e.target.value) || null)} className="w-full px-4 py-2 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-800 text-white mb-4">
                                        {activityTypes.map(type => <option key={type.key} value={type.key}>{type.name}</option>)}
                                    </select>
                                    <button onClick={handleStartTracking} disabled={!selectedActivity} className="w-full py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-500 transition-colors flex items-center justify-center gap-2 disabled:bg-slate-700 disabled:text-slate-500"><IconPlayerPlay className="w-5 h-5" /> {t('activityTracker.startButton')}</button>
                                    {gpsError && <p className="text-sm text-red-400 text-center mt-2">{gpsError}</p>}
                                </div>
                            ) : (
                                <div className="text-center space-y-4 animate-in fade-in">
                                    <p className="font-semibold text-lg text-emerald-400 flex items-center justify-center gap-2">{selectedActivity?.name}<span className="flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full animate-pulse"><IconCheckCircle className="w-3 h-3" /> Actif</span></p>
                                    <div className="text-6xl font-bold font-mono tracking-tighter text-white">{formatTime(elapsedSeconds)}</div>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div><p className="text-sm text-slate-400">{t('activityTracker.distance')}</p><p className="font-bold text-xl text-slate-200">{distanceKm.toFixed(2)} km</p></div>
                                        <div><p className="text-sm text-slate-400">{t('activityTracker.steps')}</p><p className="font-bold text-xl text-slate-200">{displaySteps}</p></div>
                                        <div><p className="text-sm text-slate-400">{t('activityTracker.calories')}</p><p className="font-bold text-xl text-slate-200">{liveCalories}</p></div>
                                    </div>
                                    <div className="flex justify-center gap-4 pt-4">
                                        {isPaused ? <button onClick={handleResumeTracking} className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 shadow-lg"><IconPlayerPlay className="w-8 h-8" /></button> : <button onClick={handlePauseTracking} className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center hover:bg-amber-600 shadow-lg"><IconPlayerPause className="w-8 h-8" /></button>}
                                        <button onClick={handleStopTracking} className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg"><IconPlayerStop className="w-8 h-8" /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                ) : (
                    <form onSubmit={handleManualAdd} className="space-y-4 animate-in fade-in">
                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex gap-3 flex-col sm:flex-row">
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-slate-300 mb-1 block">Type</label>
                                    <select value={selectedManualActivity} onChange={(e) => setSelectedManualActivity(e.target.value)} className="w-full px-4 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                                        {activityTypes.map(type => <option key={type.key} value={type.key}>{type.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-slate-300 mb-1 block">Détails</label>
                                    <input type="text" placeholder="Ex: Matin" value={activityName} onChange={e => setActivityName(e.target.value)} className="w-full px-4 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500" />
                                </div>
                            </div>
                            <div className="flex gap-3 flex-col sm:flex-row">
                                <div className="flex-1"><label className="text-sm font-medium text-slate-300 mb-1 block">{t('activityTracker.manualDurationPlaceholder')}</label><input type="number" placeholder="min" value={duration} onChange={e => setDuration(e.target.value)} required className="w-full px-4 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
                                <div className="flex-1"><label className="text-sm font-medium text-slate-300 mb-1 block">{t('activityTracker.distance')}</label><input type="number" step="0.01" placeholder="km" value={distance} onChange={e => setDistance(e.target.value)} className="w-full px-4 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-2 block">Icône</label>
                                <div className="flex gap-2">
                                    {Object.entries(iconMap).map(([key, Icon]) => (
                                        <button key={key} type="button" onClick={() => setManualIcon(key)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${manualIcon === key ? 'bg-emerald-500 text-white ring-2 ring-emerald-500/50' : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'}`}><Icon className="w-5 h-5" /></button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="w-full py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-500 transition-colors flex items-center justify-center gap-2"><IconPlus className="w-5 h-5" /> {t('activityTracker.addButton')}</button>
                    </form>
                )}
            </div>

            <div className="bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-4">{t('activityTracker.historyTitle')}</h3>
                <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                    <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20"><p className="text-xs text-emerald-400">{t('activityTracker.totalMinutes')}</p><p className="text-xl font-bold text-emerald-100">{totalMinutes}</p></div>
                    <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20"><p className="text-xs text-emerald-400">{t('activityTracker.caloriesBurned')}</p><p className="text-xl font-bold text-emerald-100">{totalCalories}</p></div>
                </div>
                {todaysLogs.length === 0 ? <p className="text-slate-500 text-center py-4">{t('activityTracker.noActivity')}</p> : (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {todaysLogs.map((log) => {
                            const LogIcon = iconMap[log.icon || 'activity'] || IconActivity;
                            return (
                                <div key={log.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                                    <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><LogIcon className="w-4 h-4" /></div><div><p className="font-semibold text-white">{log.activityName}</p><p className="text-xs text-slate-400">{log.durationMinutes} min &middot; {log.caloriesBurned} kcal {log.steps ? ` \u00B7 ${log.steps} pas` : ''}</p></div></div>
                                    <button onClick={() => onDelete(log.id)} className="text-slate-500 hover:text-red-400 p-2"><IconTrash className="w-4 h-4" /></button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2"><IconChartBar className="w-6 h-6 text-brand-500" />{t('common.history')}</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={() => isProMember ? setIsInsightsOpen(true) : onUpgradeClick()} className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-lg text-xs font-bold hover:opacity-90">{isProMember ? <IconSparkles className="w-3 h-3" /> : <IconLock className="w-3 h-3" />}{t('common.analyze')}</button>
                        <div className="bg-slate-800 p-1 rounded-lg flex text-xs">
                            {(['week', 'month', 'year'] as const).map(view => (
                                <button key={view} onClick={() => isProMember || view === 'week' ? setHistoryView(view) : onUpgradeClick()} className={`px-3 py-1 rounded-md transition-colors ${historyView === view ? 'bg-slate-700 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>
                                    {t(`common.${view}`)} {(!isProMember && view !== 'week') && <IconLock className="inline w-2.5 h-2.5 ml-1" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={historyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #1e293b', backgroundColor: '#0f172a', color: '#fff' }} cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }} formatter={(value: number) => [`${value} min`, 'Durée']} />
                            <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <AIInsightsModal isOpen={isInsightsOpen} onClose={() => setIsInsightsOpen(false)} type="activity" dataSummary={logs.slice(0, 10).map(l => `${l.activityName}: ${l.durationMinutes}min`).join('\n')} />
        </div>
    );
};

export default ActivityTracker;