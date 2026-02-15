import { Badge, WaterLog, FoodItem, ActivityLog, FastingLog, SleepLog } from '../types';

export const checkForNewBadges = (
    currentBadges: string[],
    waterLogs: WaterLog[],
    foodLogs: FoodItem[],
    activityLogs: ActivityLog[],
    fastingLogs: FastingLog[],
    sleepLogs: SleepLog[]
): string[] => {
    const newBadges: string[] = [];

    const hasBadge = (id: string) => currentBadges.includes(id) || newBadges.includes(id);

    // Initial logs
    if (!hasBadge('PREMIERE_GORGEE') && waterLogs.length > 0) newBadges.push('PREMIERE_GORGEE');
    if (!hasBadge('PREMIER_REPAS') && foodLogs.length > 0) newBadges.push('PREMIER_REPAS');
    if (!hasBadge('PREMIERE_ACTIVITE') && activityLogs.length > 0) newBadges.push('PREMIERE_ACTIVITE');
    if (!hasBadge('PREMIER_JEUNE') && fastingLogs.some(f => f.status === 'completed')) newBadges.push('PREMIER_JEUNE');

    // Counts
    if (!hasBadge('TOTAL_WATER_100') && waterLogs.length >= 100) newBadges.push('TOTAL_WATER_100');
    if (!hasBadge('TOTAL_FOOD_100') && foodLogs.length >= 100) newBadges.push('TOTAL_FOOD_100');

    // Activity minutes
    const totalActivityMins = activityLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
    if (!hasBadge('ACTIVITY_MINS_1000') && totalActivityMins >= 1000) newBadges.push('ACTIVITY_MINS_1000');

    // Fasting
    if (!hasBadge('JEUNE_16H') && fastingLogs.some(f => f.status === 'completed' && f.goalHours >= 16)) newBadges.push('JEUNE_16H');

    // Sleep
    if (!hasBadge('SOMMEIL_8H') && sleepLogs.some(s => s.durationMinutes >= 480)) newBadges.push('SOMMEIL_8H');

    return newBadges;
};
