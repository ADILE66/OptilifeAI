import { Badge, FoodItem, WaterLog, ActivityLog, FastingLog, SleepLog, BadgeCategory } from '../types';
import { IconWater, IconFire, IconAward, IconSparkles, IconTrophy, IconDiamond, IconActivity, IconClock, IconMoon } from '../components/Icons';

export const allBadges: Omit<Badge, 'isEarned'>[] = [
    // Special - One-time achievements
    { id: 'PREMIERE_GORGEE', nameKey: 'badges.PREMIERE_GORGEE.name', descriptionKey: 'badges.PREMIERE_GORGEE.description', icon: IconWater, tier: 'bronze', category: 'special', value: 1 },
    { id: 'PREMIER_REPAS', nameKey: 'badges.PREMIER_REPAS.name', descriptionKey: 'badges.PREMIER_REPAS.description', icon: IconFire, tier: 'bronze', category: 'special', value: 1 },
    { id: 'PREMIERE_ACTIVITE', nameKey: 'badges.PREMIERE_ACTIVITE.name', descriptionKey: 'badges.PREMIERE_ACTIVITE.description', icon: IconActivity, tier: 'bronze', category: 'special', value: 1 },
    { id: 'PREMIER_JEUNE', nameKey: 'badges.PREMIER_JEUNE.name', descriptionKey: 'badges.PREMIER_JEUNE.description', icon: IconClock, tier: 'bronze', category: 'special', value: 1 },
    
    // Streaks - Tiers for consecutive days of logging anything
    { id: 'STREAK_3', nameKey: 'badges.STREAK_3.name', descriptionKey: 'badges.STREAK_3.description', icon: IconAward, tier: 'bronze', category: 'streak', value: 3 },
    { id: 'STREAK_7', nameKey: 'badges.STREAK_7.name', descriptionKey: 'badges.STREAK_7.description', icon: IconAward, tier: 'bronze', category: 'streak', value: 7 },
    { id: 'STREAK_14', nameKey: 'badges.STREAK_14.name', descriptionKey: 'badges.STREAK_14.description', icon: IconAward, tier: 'silver', category: 'streak', value: 14 },
    { id: 'STREAK_30', nameKey: 'badges.STREAK_30.name', descriptionKey: 'badges.STREAK_30.description', icon: IconAward, tier: 'gold', category: 'streak', value: 30 },
    { id: 'STREAK_90', nameKey: 'badges.STREAK_90.name', descriptionKey: 'badges.STREAK_90.description', icon: IconTrophy, tier: 'platinum', category: 'streak', value: 90 },

    // Activity Badges
    ...([
        { id: 'ACTIVITY_MINS_1000', tier: 'bronze', value: 1000 }, { id: 'ACTIVITY_MINS_5000', tier: 'silver', value: 5000 },
        { id: 'ACTIVITY_MINS_10000', tier: 'gold', value: 10000 }, { id: 'ACTIVITY_MINS_25000', tier: 'platinum', value: 25000 },
    ] as const).map(b => ({ ...b, nameKey: `badges.${b.id}.name`, descriptionKey: `badges.${b.id}.description`, icon: IconActivity, category: 'activity' as BadgeCategory })),

    // Fasting Badges
    { id: 'JEUNE_16H', nameKey: 'badges.JEUNE_16H.name', descriptionKey: 'badges.JEUNE_16H.description', icon: IconClock, tier: 'silver', category: 'fasting', value: 16 },
    { id: 'JEUNE_24H', nameKey: 'badges.JEUNE_24H.name', descriptionKey: 'badges.JEUNE_24H.description', icon: IconDiamond, tier: 'gold', category: 'fasting', value: 24 },
    { id: 'JEUNE_SERIE_7', nameKey: 'badges.JEUNE_SERIE_7.name', descriptionKey: 'badges.JEUNE_SERIE_7.description', icon: IconFire, tier: 'gold', category: 'fasting', value: 7 },

    // Sleep Badges
    { id: 'SOMMEIL_8H', nameKey: 'badges.SOMMEIL_8H.name', descriptionKey: 'badges.SOMMEIL_8H.description', icon: IconMoon, tier: 'gold', category: 'sleep', value: 480 }, // 480 mins = 8h
    { id: 'SOMMEIL_QUALITE_3', nameKey: 'badges.SOMMEIL_QUALITE_3.name', descriptionKey: 'badges.SOMMEIL_QUALITE_3.description', icon: IconSparkles, tier: 'silver', category: 'sleep', value: 3 },

    // Totals - Tiers for total logs
    ...([
        { id: 'TOTAL_WATER_100', tier: 'bronze', value: 100 }, { id: 'TOTAL_WATER_500', tier: 'silver', value: 500 },
        { id: 'TOTAL_WATER_1000', tier: 'gold', value: 1000 },
    ] as const).map(b => ({ ...b, nameKey: `badges.${b.id}.name`, descriptionKey: `badges.${b.id}.description`, icon: IconWater, category: 'total' as BadgeCategory })),

    ...([
        { id: 'TOTAL_FOOD_100', tier: 'bronze', value: 100 }, { id: 'TOTAL_FOOD_500', tier: 'silver', value: 500 },
        { id: 'TOTAL_FOOD_1000', tier: 'gold', value: 1000 },
    ] as const).map(b => ({ ...b, nameKey: `badges.${b.id}.name`, descriptionKey: `badges.${b.id}.description`, icon: IconFire, category: 'total' as BadgeCategory })),

    // Anniversaries - For each year with the app
    { id: 'ANNIVERSARY_0_5', nameKey: 'badges.ANNIVERSARY_0_5.name', descriptionKey: 'badges.ANNIVERSARY_0_5.description', icon: IconSparkles, tier: 'silver', category: 'anniversary', value: 0.5 },
    { id: 'ANNIVERSARY_1', nameKey: 'badges.ANNIVERSARY_1.name', descriptionKey: 'badges.ANNIVERSARY_1.description', icon: IconSparkles, tier: 'gold', category: 'anniversary', value: 1 },
];

const getDayKey = (date: Date): string => date.toISOString().split('T')[0];

export const checkForNewBadges = (
    foodLogs: FoodItem[],
    waterLogs: WaterLog[],
    activityLogs: ActivityLog[],
    fastingLogs: FastingLog[],
    sleepLogs: SleepLog[],
    earnedBadgeIds: string[],
    firstLogDate: number | null
): Omit<Badge, 'isEarned'>[] => {
    const newBadges: Omit<Badge, 'isEarned'>[] = [];
    const unearnedBadges = allBadges.filter(b => !earnedBadgeIds.includes(b.id));
    if (unearnedBadges.length === 0) return [];

    // --- Calculate User Stats ---
    const totalWaterLogs = waterLogs.length;
    const totalFoodLogs = foodLogs.length;
    const totalActivityLogs = activityLogs.length;
    const totalActivityMinutes = activityLogs.reduce((acc, log) => acc + log.durationMinutes, 0);

    const completedFasts = fastingLogs.filter(f => f.status === 'completed' && f.endTime);
    const totalCompletedFasts = completedFasts.length;
    
    // Max fasting duration calculation
    const maxFastDuration = completedFasts.reduce((max, f) => {
        const duration = (f.endTime! - f.startTime) / (1000 * 60 * 60);
        return duration > max ? duration : max;
    }, 0);

    // Sleep stats
    const maxSleepDurationMinutes = sleepLogs.reduce((max, log) => Math.max(max, log.durationMinutes), 0);
    
    // Daily data for log streak calculation (Food/Water/Activity)
    const dailyLogs = new Set<string>();
    [...foodLogs, ...waterLogs, ...activityLogs].forEach(log => dailyLogs.add(getDayKey(new Date(log.timestamp))));
    
    const todayKey = getDayKey(new Date());
    const yesterday = new Date(); 
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = getDayKey(yesterday);

    // General Streak calculation
    let currentStreak = 0;
    if (dailyLogs.size > 0) {
        if (dailyLogs.has(todayKey) || dailyLogs.has(yesterdayKey)) {
             let checkDate = new Date();
             if (!dailyLogs.has(todayKey)) {
                 checkDate.setDate(checkDate.getDate() - 1);
             }
             while(dailyLogs.has(getDayKey(checkDate))) {
                 currentStreak++;
                 checkDate.setDate(checkDate.getDate() - 1);
             }
        }
    }

    // Fasting streak calculation
    const dailyFasts = new Set<string>();
    completedFasts.forEach(log => dailyFasts.add(getDayKey(new Date(log.endTime!))));
    let currentFastingStreak = 0;
    if (dailyFasts.size > 0) {
        if (dailyFasts.has(todayKey) || dailyFasts.has(yesterdayKey)) {
            let checkDate = new Date();
            if (!dailyFasts.has(todayKey)) {
                checkDate.setDate(checkDate.getDate() - 1);
            }
            while(dailyFasts.has(getDayKey(checkDate))) {
                currentFastingStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            }
        }
    }

    // Sleep Quality Streak Calculation
    const qualitySleepDates = new Set<string>();
    sleepLogs
        .filter(l => l.quality === 'good' || l.quality === 'excellent')
        .forEach(l => qualitySleepDates.add(getDayKey(new Date(l.timestamp))));
    
    let currentSleepQualityStreak = 0;
    if (qualitySleepDates.size > 0) {
        if (qualitySleepDates.has(todayKey) || qualitySleepDates.has(yesterdayKey)) {
            let checkDate = new Date();
            if (!qualitySleepDates.has(todayKey)) {
                checkDate.setDate(checkDate.getDate() - 1);
            }
            while(qualitySleepDates.has(getDayKey(checkDate))) {
                currentSleepQualityStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            }
        }
    }

    // Anniversary calculation
    let yearsWithApp = 0;
    if (firstLogDate) {
        const diff = Date.now() - firstLogDate;
        yearsWithApp = diff / (1000 * 60 * 60 * 24 * 365.25);
    }

    // --- Check for each unearned badge ---
    for (const badge of unearnedBadges) {
        let isEarned = false;
        switch (badge.category) {
            case 'special':
                if (badge.id === 'PREMIERE_GORGEE' && totalWaterLogs > 0) isEarned = true;
                if (badge.id === 'PREMIER_REPAS' && totalFoodLogs > 0) isEarned = true;
                if (badge.id === 'PREMIERE_ACTIVITE' && totalActivityLogs > 0) isEarned = true;
                if (badge.id === 'PREMIER_JEUNE' && totalCompletedFasts > 0) isEarned = true;
                break;
            case 'streak':
                if (currentStreak >= badge.value) isEarned = true;
                break;
            case 'activity':
                if (totalActivityMinutes >= badge.value) isEarned = true;
                break;
            case 'fasting':
                if (badge.id === 'JEUNE_16H' && maxFastDuration >= 16) isEarned = true;
                else if (badge.id === 'JEUNE_24H' && maxFastDuration >= 24) isEarned = true;
                else if (badge.id === 'JEUNE_SERIE_7' && currentFastingStreak >= 7) isEarned = true;
                break;
            case 'sleep':
                if (badge.id === 'SOMMEIL_8H' && maxSleepDurationMinutes >= badge.value) isEarned = true;
                if (badge.id === 'SOMMEIL_QUALITE_3' && currentSleepQualityStreak >= badge.value) isEarned = true;
                break;
            case 'total':
                if (badge.nameKey.includes('TOTAL_WATER') && totalWaterLogs >= badge.value) isEarned = true;
                if (badge.nameKey.includes('TOTAL_FOOD') && totalFoodLogs >= badge.value) isEarned = true;
                break;
            case 'anniversary':
                if (yearsWithApp >= badge.value) isEarned = true;
                break;
        }
        if (isEarned) newBadges.push(badge);
    }
    return newBadges;
};

// Determines which badge to show on the dashboard (highest earned or next unearned)
export const getDisplayedBadges = (earnedIds: string[]): Badge[] => {
    const displayed: Badge[] = [];
    const categories = ['streak', 'activity', 'fasting', 'sleep', 'anniversary'];

    const getBadgesForCategory = (cat: string) => allBadges.filter(b => b.category === cat);

    categories.forEach(cat => {
        const categoryBadges = getBadgesForCategory(cat).sort((a, b) => a.value - b.value);
        let highestEarned: Omit<Badge, 'isEarned'> | undefined;
        let nextUnearned: Omit<Badge, 'isEarned'> | undefined;

        for (const badge of categoryBadges) {
            if (earnedIds.includes(badge.id)) {
                highestEarned = badge;
            } else {
                nextUnearned = badge;
                break;
            }
        }

        // Prioritize showing the highest earned badge. If none, show the first goal (nextUnearned).
        if (highestEarned) {
            displayed.push({ ...highestEarned, isEarned: true });
        } else if (nextUnearned) {
            displayed.push({ ...nextUnearned, isEarned: false });
        }
    });

    // Add special one-time badges
    const specialBadges = allBadges.filter(b => b.category === 'special');
    specialBadges.forEach(badge => {
        displayed.push({ ...badge, isEarned: earnedIds.includes(badge.id) });
    });
    
    // A simple sort to have a consistent order
    return displayed.sort((a, b) => a.category.localeCompare(b.category));
};