import type {
  AssessmentInput,
  AssessmentResult,
  SeverityLevel,
  OrganRisk,
  DiseaseRisk,
  DailyLog,
  RecoveryPlan,
  RecoveryWeek,
} from "./types"

// ─── Severity Scoring (weighted algorithm mimicking ML classification) ───

const WEIGHTS = {
  frequency: 0.2,
  duration: 0.15,
  quantity: 0.2,
  withdrawal: 0.15,
  stress: 0.15,
  sleep: 0.15,
}

function normalizeSleep(hours: number): number {
  // 7-9 hours is optimal; deviation increases risk
  if (hours >= 7 && hours <= 9) return 0
  if (hours >= 5 && hours < 7) return 0.4
  if (hours > 9 && hours <= 11) return 0.3
  return 0.8
}

export function calculateSeverityScore(input: AssessmentInput): number {
  const freqScore = Math.min(input.frequencyPerWeek / 7, 1) * 100
  const durScore = Math.min(input.durationYears / 20, 1) * 100
  const qtyScore = (input.quantityLevel / 5) * 100
  const withdrawalScore = input.withdrawalSymptoms ? 100 : 0
  const stressScore = (input.mentalStressLevel / 5) * 100
  const sleepScore = normalizeSleep(input.sleepHours) * 100

  const weighted =
    freqScore * WEIGHTS.frequency +
    durScore * WEIGHTS.duration +
    qtyScore * WEIGHTS.quantity +
    withdrawalScore * WEIGHTS.withdrawal +
    stressScore * WEIGHTS.stress +
    sleepScore * WEIGHTS.sleep

  return Math.round(Math.min(Math.max(weighted, 0), 100))
}

export function classifySeverity(score: number): SeverityLevel {
  if (score <= 25) return "Low"
  if (score <= 50) return "Moderate"
  if (score <= 75) return "High"
  return "Critical"
}

// ─── Organ Risk Prediction (hybrid rule-based + probability scaling) ───

const ORGAN_BASE_RISK: Record<string, OrganRisk> = {
  alcohol: { liver: 0.8, lungs: 0.2, heart: 0.5, brain: 0.6 },
  smoking: { liver: 0.2, lungs: 0.9, heart: 0.6, brain: 0.4 },
  drugs: { liver: 0.5, lungs: 0.4, heart: 0.7, brain: 0.9 },
  food: { liver: 0.4, lungs: 0.1, heart: 0.7, brain: 0.3 },
}

export function calculateOrganRisk(
  addictionType: string,
  severityScore: number
): OrganRisk {
  const base = ORGAN_BASE_RISK[addictionType] || ORGAN_BASE_RISK.alcohol
  const scale = severityScore / 100

  return {
    liver: Math.round(base.liver * scale * 100),
    lungs: Math.round(base.lungs * scale * 100),
    heart: Math.round(base.heart * scale * 100),
    brain: Math.round(base.brain * scale * 100),
  }
}

// ─── Disease Risk Prediction (logistic-style formula) ───

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

const DISEASE_COEFFICIENTS: Record<string, Record<string, number>> = {
  alcohol: { stroke: 0.6, cancer: 0.5, heartDisease: 0.7, diabetes: 0.4 },
  smoking: { stroke: 0.7, cancer: 0.9, heartDisease: 0.8, diabetes: 0.3 },
  drugs: { stroke: 0.8, cancer: 0.4, heartDisease: 0.6, diabetes: 0.3 },
  food: { stroke: 0.5, cancer: 0.3, heartDisease: 0.8, diabetes: 0.9 },
}

export function calculateDiseaseRisk(
  addictionType: string,
  severityScore: number,
  durationYears: number
): DiseaseRisk {
  const coefficients =
    DISEASE_COEFFICIENTS[addictionType] || DISEASE_COEFFICIENTS.alcohol
  const normalizedSeverity = severityScore / 100
  const normalizedDuration = Math.min(durationYears / 20, 1)

  const compute = (coef: number) => {
    const logit = -2 + 4 * coef * normalizedSeverity + 2 * normalizedDuration
    return Math.round(sigmoid(logit) * 100) / 100
  }

  return {
    stroke: compute(coefficients.stroke),
    cancer: compute(coefficients.cancer),
    heartDisease: compute(coefficients.heartDisease),
    diabetes: compute(coefficients.diabetes),
  }
}

// ─── Recovery Time Estimation (regression-style formula) ───

export function estimateRecoveryWeeks(
  severityScore: number,
  age: number,
  durationYears: number
): number {
  const base = severityScore * 0.3
  const ageFactor = age > 40 ? (age - 40) * 0.2 : 0
  const durationFactor = durationYears * 0.5
  const weeks = base + ageFactor + durationFactor + 4
  return Math.round(Math.min(weeks, 104)) // cap at 2 years
}

// ─── Full Assessment ───

export function runAssessment(input: AssessmentInput): AssessmentResult {
  const severityScore = calculateSeverityScore(input)
  const severityLevel = classifySeverity(severityScore)
  const organRisk = calculateOrganRisk(input.addictionType, severityScore)
  const diseaseRisk = calculateDiseaseRisk(
    input.addictionType,
    severityScore,
    input.durationYears
  )
  const recoveryWeeks = estimateRecoveryWeeks(
    severityScore,
    input.age,
    input.durationYears
  )

  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    input,
    severityScore,
    severityLevel,
    organRisk,
    diseaseRisk,
    recoveryWeeks,
  }
}

// ─── Daily Recovery Score ───

export function calculateDailyRecoveryScore(log: Omit<DailyLog, "id" | "date" | "recoveryScore">): number {
  let score = 50

  if (!log.consumed) score += 25
  else score -= 20

  // Sleep quality
  if (log.sleepHours >= 7 && log.sleepHours <= 9) score += 10
  else if (log.sleepHours < 5 || log.sleepHours > 11) score -= 10

  // Exercise
  if (log.exerciseMinutes >= 30) score += 10
  else if (log.exerciseMinutes >= 15) score += 5

  // Mood
  score += (log.moodScore - 3) * 5

  return Math.min(Math.max(Math.round(score), 0), 100)
}

export function calculateWeeklyImprovement(logs: DailyLog[]): number {
  if (logs.length < 2) return 0
  const sorted = [...logs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  const recent = sorted.slice(-7)
  const older = sorted.slice(-14, -7)

  if (older.length === 0) return 0

  const recentAvg =
    recent.reduce((s, l) => s + l.recoveryScore, 0) / recent.length
  const olderAvg =
    older.reduce((s, l) => s + l.recoveryScore, 0) / older.length

  if (olderAvg === 0) return 0
  return Math.round(((recentAvg - olderAvg) / olderAvg) * 100)
}

export function calculateRelapseRisk(logs: DailyLog[]): number {
  if (logs.length === 0) return 50
  const recent = [...logs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7)

  const consumedDays = recent.filter((l) => l.consumed).length
  const avgMood =
    recent.reduce((s, l) => s + l.moodScore, 0) / recent.length
  const avgSleep =
    recent.reduce((s, l) => s + l.sleepHours, 0) / recent.length

  let risk = (consumedDays / Math.max(recent.length, 1)) * 50
  if (avgMood < 3) risk += 20
  if (avgSleep < 6) risk += 15
  if (avgSleep > 10) risk += 10

  return Math.min(Math.max(Math.round(risk), 0), 100)
}

// ─── Recovery Plan Generator ───

const ADDICTION_LABELS: Record<string, string> = {
  alcohol: "Alcohol",
  smoking: "Smoking",
  drugs: "Substance",
  food: "Food/Eating",
}

function generateWeeklyPlan(
  severity: SeverityLevel,
  addictionType: string,
  totalWeeks: number
): RecoveryWeek[] {
  const label = ADDICTION_LABELS[addictionType] || "Addiction"
  const weeks: RecoveryWeek[] = []
  const planWeeks = Math.min(totalWeeks, 12)

  for (let i = 1; i <= planWeeks; i++) {
    const phase =
      i <= Math.ceil(planWeeks * 0.3)
        ? "early"
        : i <= Math.ceil(planWeeks * 0.7)
        ? "mid"
        : "late"

    const week: RecoveryWeek = { week: i, goals: [], activities: [], tips: [] }

    if (phase === "early") {
      week.goals = [
        `Reduce ${label.toLowerCase()} intake by ${Math.min(i * 15, 50)}%`,
        "Establish daily routine",
        "Identify triggers",
      ]
      week.activities = [
        "Morning meditation (10 min)",
        "Evening journaling",
        "Light walking (20 min)",
        "Deep breathing exercises",
      ]
      week.tips = [
        "Remove triggers from your environment",
        "Stay hydrated throughout the day",
        "Reach out to a support person daily",
      ]
    } else if (phase === "mid") {
      week.goals = [
        `Maintain reduced ${label.toLowerCase()} usage`,
        "Build healthy coping mechanisms",
        "Strengthen social connections",
      ]
      week.activities = [
        "Exercise (30 min)",
        "Hobby or creative activity (1 hr)",
        "Support group meeting",
        "Mindfulness practice",
      ]
      week.tips = [
        "Celebrate small victories",
        "Practice saying no in low-pressure situations",
        "Eat balanced, nutritious meals",
      ]
    } else {
      week.goals = [
        `Work toward full ${label.toLowerCase()} abstinence`,
        "Establish long-term relapse prevention",
        "Plan for independent maintenance",
      ]
      week.activities = [
        "Vigorous exercise (45 min)",
        "Volunteer or community engagement",
        "Weekly progress review",
        "Stress management workshop",
      ]
      week.tips = [
        "Create a relapse prevention plan",
        "Identify and avoid high-risk situations",
        "Build a long-term support network",
      ]
    }

    weeks.push(week)
  }

  return weeks
}

export function generateRecoveryPlan(
  severity: SeverityLevel,
  addictionType: string,
  recoveryWeeks: number
): RecoveryPlan {
  const rehabRecommended = severity === "High" || severity === "Critical"
  const weeks = generateWeeklyPlan(severity, addictionType, recoveryWeeks)

  return {
    severity,
    addictionType: addictionType as RecoveryPlan["addictionType"],
    weeks,
    rehabRecommended,
  }
}
