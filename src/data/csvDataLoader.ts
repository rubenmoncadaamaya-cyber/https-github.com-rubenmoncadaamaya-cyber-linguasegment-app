import {
  RawUser,
  RawLesson,
  RawAchievement,
  StudentProfile,
  StudentSkillScores,
  CEFRLevel,
  SubscriptionType,
  LessonDifficulty,
  AchievementType
} from '../types';

export function parseCSV<T>(csvText: string, mapper: (row: Record<string, string>) => T): T[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const results: T[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple CSV parser supporting standard rows
    const values = line.split(',').map(v => v.trim());
    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] ?? '';
    });
    
    try {
      results.push(mapper(rowObj));
    } catch {
      // skip invalid row
    }
  }
  return results;
}

export function parseRawUsers(csvText: string): RawUser[] {
  return parseCSV(csvText, row => ({
    id: parseInt(row.id, 10),
    full_name: row.full_name,
    email: row.email,
    subscription_start: row.subscription_start,
    subscription_type: (row.subscription_type || 'free') as SubscriptionType
  }));
}

export function parseRawLessons(csvText: string): RawLesson[] {
  return parseCSV(csvText, row => ({
    id: parseInt(row.id, 10),
    user_id: parseInt(row.user_id, 10),
    lesson_name: row.lesson_name || '',
    completion_date: row.completion_date,
    lesson_difficulty: (row.lesson_difficulty || 'medium') as LessonDifficulty,
    lesson_duration_minutes: parseInt(row.lesson_duration_minutes || '45', 10)
  }));
}

export function parseRawAchievements(csvText: string): RawAchievement[] {
  return parseCSV(csvText, row => ({
    id: parseInt(row.id, 10),
    user_id: parseInt(row.user_id, 10),
    achievement_name: row.achievement_name || '',
    unlocked_date: row.unlocked_date,
    achievement_type: (row.achievement_type || 'skill') as AchievementType,
    achievement_points: parseInt(row.achievement_points || '50', 10)
  }));
}

const REFERENCE_DATE = new Date('2025-01-15T00:00:00Z').getTime();

export function buildStudentProfiles(
  users: RawUser[],
  lessons: RawLesson[],
  achievements: RawAchievement[]
): StudentProfile[] {
  // Map lessons by user_id
  const lessonsByUser = new Map<number, RawLesson[]>();
  lessons.forEach(l => {
    if (!lessonsByUser.has(l.user_id)) {
      lessonsByUser.set(l.user_id, []);
    }
    lessonsByUser.get(l.user_id)!.push(l);
  });

  // Map achievements by user_id
  const achievementsByUser = new Map<number, RawAchievement[]>();
  achievements.forEach(a => {
    if (!achievementsByUser.has(a.user_id)) {
      achievementsByUser.set(a.user_id, []);
    }
    achievementsByUser.get(a.user_id)!.push(a);
  });

  return users.map(user => {
    const userLessons = lessonsByUser.get(user.id) || [];
    const userAchievements = achievementsByUser.get(user.id) || [];

    const totalLessons = userLessons.length;
    const totalDurationMinutes = userLessons.reduce((acc, l) => acc + (l.lesson_duration_minutes || 0), 0);
    const avgLessonDuration = totalLessons > 0 ? Math.round(totalDurationMinutes / totalLessons) : 0;

    let easyCount = 0;
    let medCount = 0;
    let hardCount = 0;
    let difficultyWeightSum = 0;

    userLessons.forEach(l => {
      const diff = l.lesson_difficulty?.toLowerCase();
      if (diff === 'hard') {
        hardCount++;
        difficultyWeightSum += 3;
      } else if (diff === 'easy') {
        easyCount++;
        difficultyWeightSum += 1;
      } else {
        medCount++;
        difficultyWeightSum += 2;
      }
    });

    const difficultyScore = totalLessons > 0 ? Number((difficultyWeightSum / totalLessons).toFixed(2)) : 1.0;
    const hardRatio = totalLessons > 0 ? Number((hardCount / totalLessons).toFixed(2)) : 0;

    // Achievements stats
    const totalAchievements = userAchievements.length;
    const totalPoints = userAchievements.reduce((acc, a) => acc + (a.achievement_points || 0), 0);
    const skillAchievements = userAchievements.filter(a => a.achievement_type === 'skill').length;
    const milestoneAchievements = userAchievements.filter(a => a.achievement_type === 'milestone').length;
    const participationAchievements = userAchievements.filter(a => a.achievement_type === 'participation').length;

    // Recency (latest activity)
    const dates: number[] = [];
    userLessons.forEach(l => {
      if (l.completion_date) {
        const d = new Date(l.completion_date).getTime();
        if (!isNaN(d)) dates.push(d);
      }
    });
    userAchievements.forEach(a => {
      if (a.unlocked_date) {
        const d = new Date(a.unlocked_date).getTime();
        if (!isNaN(d)) dates.push(d);
      }
    });

    let lastActivityDate = user.subscription_start || '2024-01-01';
    let recencyDays = 120; // default

    if (dates.length > 0) {
      const maxDate = Math.max(...dates);
      lastActivityDate = new Date(maxDate).toISOString().split('T')[0];
      const diffDays = Math.max(0, Math.round((REFERENCE_DATE - maxDate) / (1000 * 60 * 60 * 24)));
      recencyDays = diffDays;
    }

    // Skills breakdown based on lesson names and achievements
    const skills: StudentSkillScores = {
      grammar: 20,
      conversation: 20,
      vocabulary: 20,
      listening: 20,
      reading: 20,
      pronunciation: 20,
      culture: 20,
      idioms: 20
    };

    userLessons.forEach(l => {
      const name = l.lesson_name.toLowerCase();
      const mult = l.lesson_difficulty === 'hard' ? 18 : l.lesson_difficulty === 'medium' ? 12 : 8;
      
      if (name.includes('grammar')) skills.grammar += mult;
      if (name.includes('conversation') || name.includes('dialogue') || name.includes('phrases')) skills.conversation += mult;
      if (name.includes('vocabulary') || name.includes('expressions')) skills.vocabulary += mult;
      if (name.includes('listening')) skills.listening += mult;
      if (name.includes('reading') || name.includes('comprehension')) skills.reading += mult;
      if (name.includes('pronunciation')) skills.pronunciation += mult;
      if (name.includes('culture')) skills.culture += mult;
      if (name.includes('idioms')) skills.idioms += mult;
    });

    // Normalize skill scores between 15 and 98
    Object.keys(skills).forEach(k => {
      const key = k as keyof StudentSkillScores;
      skills[key] = Math.min(98, Math.max(15, skills[key]));
    });

    // Learning Velocity (lessons per month relative to subscription)
    const subStartDate = new Date(user.subscription_start).getTime();
    const monthsSubscribed = Math.max(1, (REFERENCE_DATE - subStartDate) / (1000 * 60 * 60 * 24 * 30));
    const learningVelocity = Number((totalLessons / monthsSubscribed).toFixed(2));

    // CEFR Level Estimation based on difficultyScore, volume, hardRatio and points
    let cefrLevel: CEFRLevel = 'A1';
    const scoreIdx = (totalLessons * 1.5) + (difficultyScore * 3) + (hardRatio * 8) + (totalPoints * 0.03);
    
    if (scoreIdx >= 24) {
      cefrLevel = 'C1';
    } else if (scoreIdx >= 18) {
      cefrLevel = 'B2';
    } else if (scoreIdx >= 12) {
      cefrLevel = 'B1';
    } else if (scoreIdx >= 7) {
      cefrLevel = 'A2';
    } else {
      cefrLevel = 'A1';
    }

    return {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      subscription_start: user.subscription_start,
      subscription_type: user.subscription_type,
      totalLessons,
      totalDurationMinutes,
      avgLessonDuration,
      difficultyScore,
      easyLessonsCount: easyCount,
      mediumLessonsCount: medCount,
      hardLessonsCount: hardCount,
      hardRatio,
      totalAchievements,
      totalPoints,
      skillAchievements,
      milestoneAchievements,
      participationAchievements,
      lastActivityDate,
      recencyDays,
      learningVelocity,
      skills,
      cefrLevel,
      clusterId: 0,
      clusterName: 'Sin Asignar',
      clusterColor: '#64748B',
      pcaX: 0,
      pcaY: 0
    };
  });
}

export async function loadInitialDatasets(): Promise<{
  users: RawUser[];
  lessons: RawLesson[];
  achievements: RawAchievement[];
  profiles: StudentProfile[];
}> {
  try {
    const [usersRes, lessonsRes, achievementsRes] = await Promise.all([
      fetch('/assets/aistudio/language-learning-app-v5-csv-users_ffcf8fb6.csv'),
      fetch('/assets/aistudio/language-learning-app-v5-csv-user_lessons_c9aea748.csv'),
      fetch('/assets/aistudio/language-learning-app-v5-csv-user_achievements_45b0e862.csv')
    ]);

    if (!usersRes.ok || !lessonsRes.ok || !achievementsRes.ok) {
      throw new Error('Failed to fetch one or more CSVs from /assets/aistudio/');
    }

    const [usersText, lessonsText, achievementsText] = await Promise.all([
      usersRes.text(),
      lessonsRes.text(),
      achievementsRes.text()
    ]);

    const users = parseRawUsers(usersText);
    const lessons = parseRawLessons(lessonsText);
    const achievements = parseRawAchievements(achievementsText);
    const profiles = buildStudentProfiles(users, lessons, achievements);

    return { users, lessons, achievements, profiles };
  } catch (error) {
    console.error('Error loading initial datasets:', error);
    throw error;
  }
}
