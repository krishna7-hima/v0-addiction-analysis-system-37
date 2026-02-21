export type AddictionType = "alcohol" | "smoking" | "drugs" | "food"

export type SeverityLevel = "Low" | "Moderate" | "High" | "Critical"

export interface AssessmentInput {
  addictionType: AddictionType
  frequencyPerWeek: number
  durationYears: number
  quantityLevel: number // 1-5
  withdrawalSymptoms: boolean
  mentalStressLevel: number // 1-5
  sleepHours: number
  age: number
}

export interface OrganRisk {
  liver: number
  lungs: number
  heart: number
  brain: number
}

export interface DiseaseRisk {
  stroke: number
  cancer: number
  heartDisease: number
  diabetes: number
}

export interface AssessmentResult {
  id: string
  date: string
  input: AssessmentInput
  severityScore: number
  severityLevel: SeverityLevel
  organRisk: OrganRisk
  diseaseRisk: DiseaseRisk
  recoveryWeeks: number
}

export interface DailyLog {
  id: string
  date: string
  consumed: boolean
  sleepHours: number
  exerciseMinutes: number
  moodScore: number // 1-5
  recoveryScore: number
}

export interface RecoveryPlan {
  severity: SeverityLevel
  addictionType: AddictionType
  weeks: RecoveryWeek[]
  rehabRecommended: boolean
}

export interface RecoveryWeek {
  week: number
  goals: string[]
  activities: string[]
  tips: string[]
}

export interface UserProfile {
  id: string
  name: string
  email: string
}

export interface AppState {
  user: UserProfile | null
  assessments: AssessmentResult[]
  dailyLogs: DailyLog[]
  currentPlan: RecoveryPlan | null
}
