import { StudentProfile, MLCluster, MLConfig } from '../types';

export const DEFAULT_ML_CONFIG: MLConfig = {
  k: 4,
  maxIterations: 30,
  weights: {
    lessons: 1.2,
    points: 1.0,
    difficulty: 1.4,
    duration: 0.8,
    hardRatio: 1.5,
    recency: 1.1
  }
};

const CLUSTER_PALETTES = [
  { name: 'Dominio Avanzado', code: 'ADV', color: '#6366F1', desc: 'Alto volumen de lecciones, preferencia por dificultad alta y máximo puntaje.', focus: 'Inmersión avanzada, debates libres y preparación de certificaciones C1.' },
  { name: 'Constantes en Progreso', code: 'PROG', color: '#10B981', desc: 'Rendimiento sostenido, balance de dificultad media y asistencia regular.', focus: 'Consolidación gramatical intermedia B1/B2 y fluidez conversacional.' },
  { name: 'Principiantes Dinámicos', code: 'INIT', color: '#06B6D4', desc: 'Reciente incorporación, enfoque en lecciones básicas y ritmo activo.', focus: 'Vocabulario esencial A1/A2, fonética y refuerzo de confianza.' },
  { name: 'En Riesgo de Abandono', code: 'RISK', color: '#F43F5E', desc: 'Baja frecuencia reciente, pocas lecciones completadas y estancamiento.', focus: 'Campañas de reenganche, micro-lecciones y tutoría de reactivación.' },
  { name: 'Entusiastas de Logros', code: 'ACHV', color: '#A855F7', desc: 'Gran concentración de puntos y trofeos, alta motivación por recompensas.', focus: 'Desafíos gamificados, metas semanales y retos de vocabulario.' },
  { name: 'Práctica Ocasional', code: 'OCAS', color: '#F59E0B', desc: 'Sesiones esporádicas pero con buen desempeño por lección.', focus: 'Horarios flexibles, recordatorios push proactivos y clases temáticas.' }
];

export interface ClusteringResult {
  profiles: StudentProfile[];
  clusters: MLCluster[];
  inertia: number;
  silhouetteScore: number;
  iterationsRun: number;
}

// Extract raw feature vector for student
function extractRawFeatures(p: StudentProfile): number[] {
  return [
    p.totalLessons,
    p.totalPoints,
    p.difficultyScore,
    p.avgLessonDuration,
    p.hardRatio,
    p.recencyDays
  ];
}

// Compute mean and standard deviation for normalization
function computeStats(data: number[][]): { means: number[]; stds: number[] } {
  const numFeatures = data[0].length;
  const n = data.length;
  const means: number[] = new Array(numFeatures).fill(0);
  const stds: number[] = new Array(numFeatures).fill(0);

  for (let i = 0; i < n; i++) {
    for (let f = 0; f < numFeatures; f++) {
      means[f] += data[i][f];
    }
  }
  for (let f = 0; f < numFeatures; f++) {
    means[f] /= n;
  }

  for (let i = 0; i < n; i++) {
    for (let f = 0; f < numFeatures; f++) {
      const diff = data[i][f] - means[f];
      stds[f] += diff * diff;
    }
  }
  for (let f = 0; f < numFeatures; f++) {
    stds[f] = Math.sqrt(stds[f] / n) || 1; // avoid div by 0
  }

  return { means, stds };
}

// Weighted Euclidean distance
function weightedEuclideanDistance(
  a: number[],
  b: number[],
  weights: number[]
): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += weights[i] * diff * diff;
  }
  return Math.sqrt(sum);
}

// K-Means++ initialization
function initKMeansPlusPlus(
  normalizedData: number[][],
  k: number,
  weights: number[]
): number[][] {
  const n = normalizedData.length;
  const centroids: number[][] = [];

  // Pick first centroid randomly
  const firstIdx = Math.floor(Math.random() * n);
  centroids.push([...normalizedData[firstIdx]]);

  // Pick remaining centroids
  while (centroids.length < k) {
    const dists: number[] = new Array(n).fill(0);
    let totalDistSq = 0;

    for (let i = 0; i < n; i++) {
      let minDist = Infinity;
      for (const c of centroids) {
        const d = weightedEuclideanDistance(normalizedData[i], c, weights);
        if (d < minDist) minDist = d;
      }
      const distSq = minDist * minDist;
      dists[i] = distSq;
      totalDistSq += distSq;
    }

    // Roulette wheel selection
    let r = Math.random() * totalDistSq;
    let selectedIdx = 0;
    for (let i = 0; i < n; i++) {
      r -= dists[i];
      if (r <= 0) {
        selectedIdx = i;
        break;
      }
    }

    centroids.push([...normalizedData[selectedIdx]]);
  }

  return centroids;
}

// 2D Projection using 2-Component PCA approximation for visualization
function compute2DProjection(normalizedData: number[][]): { xs: number[]; ys: number[] } {
  // Dimension 1: Engagement & Volume vector (Lessons, Points, Duration, Difficulty)
  // Dimension 2: Mastery vs Inactivity vector (HardRatio - Recency)
  const n = normalizedData.length;
  const xs: number[] = new Array(n).fill(0);
  const ys: number[] = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    const d = normalizedData[i];
    // PC1: overall learning output (positive lessons, points, difficulty)
    const pc1 = (d[0] * 0.45) + (d[1] * 0.35) + (d[2] * 0.40) + (d[3] * 0.20) - (d[5] * 0.25);
    // PC2: challenge grit vs dormancy (high hard ratio, lower recency days)
    const pc2 = (d[4] * 0.65) + (d[2] * 0.30) - (d[5] * 0.50);

    xs[i] = pc1;
    ys[i] = pc2;
  }

  // Scale to standard view coordinates (-80 to 80)
  const maxX = Math.max(...xs.map(Math.abs)) || 1;
  const maxY = Math.max(...ys.map(Math.abs)) || 1;

  for (let i = 0; i < n; i++) {
    xs[i] = Math.round((xs[i] / maxX) * 75 * 10) / 10;
    ys[i] = Math.round((ys[i] / maxY) * 75 * 10) / 10;
  }

  return { xs, ys };
}

// Calculate Silhouette Score sample approximation
function calculateSilhouette(
  normalizedData: number[][],
  assignments: number[],
  k: number,
  weights: number[]
): number {
  const n = normalizedData.length;
  if (n <= k) return 0;

  let totalSilhouette = 0;
  const clusterMembers: number[][] = Array.from({ length: k }, () => []);
  for (let i = 0; i < n; i++) {
    clusterMembers[assignments[i]].push(i);
  }

  for (let i = 0; i < n; i++) {
    const myCluster = assignments[i];
    const sameClusterMembers = clusterMembers[myCluster];

    // a(i): average distance to points in same cluster
    let a = 0;
    if (sameClusterMembers.length > 1) {
      let sumDist = 0;
      for (const otherIdx of sameClusterMembers) {
        if (otherIdx !== i) {
          sumDist += weightedEuclideanDistance(normalizedData[i], normalizedData[otherIdx], weights);
        }
      }
      a = sumDist / (sameClusterMembers.length - 1);
    }

    // b(i): minimum average distance to points in any other cluster
    let minOtherAvgDist = Infinity;
    for (let c = 0; c < k; c++) {
      if (c === myCluster) continue;
      const otherMembers = clusterMembers[c];
      if (otherMembers.length === 0) continue;

      let sumDist = 0;
      for (const otherIdx of otherMembers) {
        sumDist += weightedEuclideanDistance(normalizedData[i], normalizedData[otherIdx], weights);
      }
      const avgDist = sumDist / otherMembers.length;
      if (avgDist < minOtherAvgDist) {
        minOtherAvgDist = avgDist;
      }
    }

    const b = minOtherAvgDist;
    const maxVal = Math.max(a, b);
    const s = maxVal === 0 ? 0 : (b - a) / maxVal;
    totalSilhouette += s;
  }

  return Number((totalSilhouette / n).toFixed(3));
}

export function runClustering(
  students: StudentProfile[],
  config: MLConfig = DEFAULT_ML_CONFIG
): ClusteringResult {
  const k = Math.min(6, Math.max(3, config.k));
  const n = students.length;

  if (n === 0) {
    return {
      profiles: [],
      clusters: [],
      inertia: 0,
      silhouetteScore: 0,
      iterationsRun: 0
    };
  }

  const rawData = students.map(extractRawFeatures);
  const { means, stds } = computeStats(rawData);

  // Normalize data with Z-Score
  const normalizedData = rawData.map(row =>
    row.map((val, idx) => (val - means[idx]) / stds[idx])
  );

  const featureWeights = [
    config.weights.lessons,
    config.weights.points,
    config.weights.difficulty,
    config.weights.duration,
    config.weights.hardRatio,
    config.weights.recency
  ];

  // 1. Initialize Centroids using KMeans++
  let centroids = initKMeansPlusPlus(normalizedData, k, featureWeights);
  let assignments = new Array(n).fill(0);
  let iterationsRun = 0;
  let changed = true;

  // 2. Iterative optimization
  while (changed && iterationsRun < config.maxIterations) {
    changed = false;
    iterationsRun++;

    // Assignment step
    for (let i = 0; i < n; i++) {
      let minDistance = Infinity;
      let bestCluster = 0;

      for (let c = 0; c < k; c++) {
        const dist = weightedEuclideanDistance(normalizedData[i], centroids[c], featureWeights);
        if (dist < minDistance) {
          minDistance = dist;
          bestCluster = c;
        }
      }

      if (assignments[i] !== bestCluster) {
        assignments[i] = bestCluster;
        changed = true;
      }
    }

    // Update step
    const counts = new Array(k).fill(0);
    const newCentroids: number[][] = Array.from({ length: k }, () =>
      new Array(centroids[0].length).fill(0)
    );

    for (let i = 0; i < n; i++) {
      const c = assignments[i];
      counts[c]++;
      for (let f = 0; f < centroids[0].length; f++) {
        newCentroids[c][f] += normalizedData[i][f];
      }
    }

    for (let c = 0; c < k; c++) {
      if (counts[c] > 0) {
        for (let f = 0; f < centroids[0].length; f++) {
          newCentroids[c][f] /= counts[c];
        }
        centroids[c] = newCentroids[c];
      }
    }
  }

  // 3. Compute Inertia (WCSS)
  let inertia = 0;
  for (let i = 0; i < n; i++) {
    const c = assignments[i];
    const dist = weightedEuclideanDistance(normalizedData[i], centroids[c], featureWeights);
    inertia += dist * dist;
  }
  inertia = Math.round(inertia);

  // 4. Compute 2D PCA projection for visualization
  const { xs, ys } = compute2DProjection(normalizedData);

  // 5. Cluster Profiling & Semantic Naming
  // Sort clusters by average difficulty & lessons to assign intuitive labels
  interface RawClusterStat {
    clusterIdx: number;
    count: number;
    avgLessons: number;
    avgPoints: number;
    avgDifficulty: number;
    avgDuration: number;
    avgHardRatio: number;
    avgRecency: number;
    pcaCenterX: number;
    pcaCenterY: number;
  }

  const rawStats: RawClusterStat[] = [];
  for (let c = 0; c < k; c++) {
    const members = students.filter((_, idx) => assignments[idx] === c);
    const count = members.length;
    if (count === 0) continue;

    const avgLessons = members.reduce((s, m) => s + m.totalLessons, 0) / count;
    const avgPoints = members.reduce((s, m) => s + m.totalPoints, 0) / count;
    const avgDifficulty = members.reduce((s, m) => s + m.difficultyScore, 0) / count;
    const avgDuration = members.reduce((s, m) => s + m.avgLessonDuration, 0) / count;
    const avgHardRatio = members.reduce((s, m) => s + m.hardRatio, 0) / count;
    const avgRecency = members.reduce((s, m) => s + m.recencyDays, 0) / count;

    let sumX = 0;
    let sumY = 0;
    members.forEach(m => {
      const idx = students.indexOf(m);
      sumX += xs[idx];
      sumY += ys[idx];
    });

    rawStats.push({
      clusterIdx: c,
      count,
      avgLessons,
      avgPoints,
      avgDifficulty,
      avgDuration,
      avgHardRatio,
      avgRecency,
      pcaCenterX: Math.round(sumX / count),
      pcaCenterY: Math.round(sumY / count)
    });
  }

  // Sort clusters: Highest lessons & hard ratio first (Power Learners), highest recency last (At-Risk)
  rawStats.sort((a, b) => {
    // If high recency and low lessons => at-risk
    const scoreA = (a.avgLessons * 2) + (a.avgDifficulty * 3) + (a.avgHardRatio * 5) - (a.avgRecency * 0.05);
    const scoreB = (b.avgLessons * 2) + (b.avgDifficulty * 3) + (b.avgHardRatio * 5) - (b.avgRecency * 0.05);
    return scoreB - scoreA;
  });

  // Assign semantic metadata from CLUSTER_PALETTES
  const clusterMapping = new Map<number, MLCluster>();

  rawStats.forEach((stat, rank) => {
    // Palette selection: if it has high recency, assign Risk palette
    let paletteIdx = rank;
    if (stat.avgRecency > 60 && stat.avgLessons < 3.5) {
      paletteIdx = 3; // Risk
    } else if (rank === 0) {
      paletteIdx = 0; // Advanced
    } else if (rank === 1) {
      paletteIdx = 1; // Progress
    } else if (rank === 2) {
      paletteIdx = 2; // Dynamic Init
    } else {
      paletteIdx = Math.min(CLUSTER_PALETTES.length - 1, rank);
    }

    const palette = CLUSTER_PALETTES[paletteIdx];
    const originalClusterIdx = stat.clusterIdx;

    const clusterObj: MLCluster = {
      id: originalClusterIdx,
      name: palette.name,
      code: palette.code,
      color: palette.color,
      description: palette.desc,
      pedagogicalProfile: `Promedio ${stat.avgLessons.toFixed(1)} lecciones, dificultad ${stat.avgDifficulty.toFixed(2)}, ${Math.round(stat.avgHardRatio * 100)}% lecciones difíciles.`,
      recommendedFocus: palette.focus,
      size: stat.count,
      percentage: Number(((stat.count / n) * 100).toFixed(1)),
      avgLessons: Number(stat.avgLessons.toFixed(1)),
      avgPoints: Math.round(stat.avgPoints),
      avgDifficulty: Number(stat.avgDifficulty.toFixed(2)),
      avgDuration: Math.round(stat.avgDuration),
      hardRatio: Number(stat.avgHardRatio.toFixed(2)),
      avgRecencyDays: Math.round(stat.avgRecency),
      dominantSubscription: 'basic',
      dominantCefr: stat.avgDifficulty > 2.2 ? 'B2-C1' : stat.avgDifficulty > 1.6 ? 'A2-B1' : 'A1-A2',
      centroid: centroids[originalClusterIdx] || [],
      pcaX: stat.pcaCenterX,
      pcaY: stat.pcaCenterY
    };

    clusterMapping.set(originalClusterIdx, clusterObj);
  });

  // 6. Enrich students with cluster information and 2D coordinates
  const updatedProfiles = students.map((p, idx) => {
    const cId = assignments[idx];
    const clusterMeta = clusterMapping.get(cId) || {
      name: `Segmento ${cId + 1}`,
      color: '#6366F1'
    };

    return {
      ...p,
      clusterId: cId,
      clusterName: clusterMeta.name,
      clusterColor: clusterMeta.color,
      pcaX: xs[idx],
      pcaY: ys[idx]
    };
  });

  // Calculate Silhouette Score
  const silhouetteScore = calculateSilhouette(normalizedData, assignments, k, featureWeights);

  const finalClusters = Array.from(clusterMapping.values());

  return {
    profiles: updatedProfiles,
    clusters: finalClusters,
    inertia,
    silhouetteScore,
    iterationsRun
  };
}

// Predict cluster for a new student or updated student using nearest centroid
export function predictStudentCluster(
  student: StudentProfile,
  clusters: MLCluster[],
  config: MLConfig = DEFAULT_ML_CONFIG
): { clusterId: number; clusterName: string; clusterColor: string } {
  if (clusters.length === 0) {
    return { clusterId: 0, clusterName: 'Segmento 1', clusterColor: '#6366F1' };
  }

  // Simple heuristic: compare Euclidean distance in real metric space to cluster averages
  let minDistance = Infinity;
  let bestCluster = clusters[0];

  clusters.forEach(c => {
    const dLessons = (student.totalLessons - c.avgLessons) * config.weights.lessons;
    const dPoints = ((student.totalPoints - c.avgPoints) / 50) * config.weights.points;
    const dDiff = ((student.difficultyScore - c.avgDifficulty) * 3) * config.weights.difficulty;
    const dRecency = ((student.recencyDays - c.avgRecencyDays) / 30) * config.weights.recency;

    const dist = Math.sqrt(dLessons * dLessons + dPoints * dPoints + dDiff * dDiff + dRecency * dRecency);
    if (dist < minDistance) {
      minDistance = dist;
      bestCluster = c;
    }
  });

  return {
    clusterId: bestCluster.id,
    clusterName: bestCluster.name,
    clusterColor: bestCluster.color
  };
}
