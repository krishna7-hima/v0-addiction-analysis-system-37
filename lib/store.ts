import type {
  AppState,
  UserProfile,
  AssessmentResult,
  DailyLog,
  RecoveryPlan,
} from "./types"

const STORAGE_KEY = "addiction-recovery-app"

function getState(): AppState {
  if (typeof window === "undefined") {
    return { user: null, assessments: [], dailyLogs: [], currentPlan: null }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return { user: null, assessments: [], dailyLogs: [], currentPlan: null }
}

function setState(state: AppState) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const store = {
  getState,

  // Auth
  login(email: string, name: string): UserProfile {
    const state = getState()
    const user: UserProfile = {
      id: crypto.randomUUID(),
      name,
      email,
    }
    state.user = user
    setState(state)
    return user
  },

  register(email: string, name: string, _password: string): UserProfile {
    return this.login(email, name)
  },

  logout() {
    const state = getState()
    state.user = null
    setState(state)
  },

  getUser(): UserProfile | null {
    return getState().user
  },

  // Assessments
  addAssessment(result: AssessmentResult) {
    const state = getState()
    state.assessments.push(result)
    setState(state)
  },

  getAssessments(): AssessmentResult[] {
    return getState().assessments
  },

  getLatestAssessment(): AssessmentResult | null {
    const assessments = this.getAssessments()
    return assessments.length > 0 ? assessments[assessments.length - 1] : null
  },

  // Daily Logs
  addDailyLog(log: DailyLog) {
    const state = getState()
    state.dailyLogs.push(log)
    setState(state)
  },

  getDailyLogs(): DailyLog[] {
    return getState().dailyLogs
  },

  // Recovery Plan
  setRecoveryPlan(plan: RecoveryPlan) {
    const state = getState()
    state.currentPlan = plan
    setState(state)
  },

  getRecoveryPlan(): RecoveryPlan | null {
    return getState().currentPlan
  },

  // Clear all
  clearAll() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY)
    }
  },
}
