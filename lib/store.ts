import type {
  AppState,
  UserProfile,
  AssessmentResult,
  DailyLog,
  RecoveryPlan,
  Reminder,
  Booking,
} from "./types"

const STORAGE_KEY = "addiction-recovery-app"

function defaultState(): AppState {
  return {
    user: null,
    assessments: [],
    dailyLogs: [],
    currentPlan: null,
    reminders: [],
    bookings: [],
  }
}

function getState(): AppState {
  if (typeof window === "undefined") return defaultState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Ensure new fields exist for older saved states
      return {
        ...defaultState(),
        ...parsed,
      }
    }
  } catch {
    // ignore
  }
  return defaultState()
}

function setState(state: AppState) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const store = {
  getState,

  // ─── Auth ───

  login(email: string, name: string): UserProfile {
    const state = getState()
    const user: UserProfile = {
      id: crypto.randomUUID(),
      name,
      email,
      isGuest: false,
    }
    state.user = user
    setState(state)
    return user
  },

  register(email: string, name: string, _password: string): UserProfile {
    return this.login(email, name)
  },

  guestLogin(): UserProfile {
    const state = getState()
    const user: UserProfile = {
      id: crypto.randomUUID(),
      name: "Guest",
      email: "guest@recoverai.local",
      isGuest: true,
    }
    state.user = user
    setState(state)
    return user
  },

  upgradeGuest(email: string, name: string, _password: string): UserProfile {
    const state = getState()
    if (state.user) {
      state.user.name = name
      state.user.email = email
      state.user.isGuest = false
      setState(state)
      return state.user
    }
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

  // ─── Assessments ───

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

  // ─── Daily Logs ───

  addDailyLog(log: DailyLog) {
    const state = getState()
    state.dailyLogs.push(log)
    setState(state)
  },

  getDailyLogs(): DailyLog[] {
    return getState().dailyLogs
  },

  // ─── Recovery Plan ───

  setRecoveryPlan(plan: RecoveryPlan) {
    const state = getState()
    state.currentPlan = plan
    setState(state)
  },

  getRecoveryPlan(): RecoveryPlan | null {
    return getState().currentPlan
  },

  // ─── Reminders ───

  getReminders(): Reminder[] {
    return getState().reminders
  },

  addReminder(reminder: Reminder) {
    const state = getState()
    state.reminders.push(reminder)
    setState(state)
  },

  removeReminder(id: string) {
    const state = getState()
    state.reminders = state.reminders.filter((r) => r.id !== id)
    setState(state)
  },

  toggleReminder(id: string) {
    const state = getState()
    state.reminders = state.reminders.map((r) =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    )
    setState(state)
  },

  setReminders(reminders: Reminder[]) {
    const state = getState()
    state.reminders = reminders
    setState(state)
  },

  // ─── Bookings ───

  getBookings(): Booking[] {
    return getState().bookings
  },

  addBooking(booking: Booking) {
    const state = getState()
    state.bookings.push(booking)
    setState(state)
  },

  cancelBooking(id: string) {
    const state = getState()
    state.bookings = state.bookings.map((b) =>
      b.id === id ? { ...b, status: "cancelled" as const } : b
    )
    setState(state)
  },

  // ─── Clear ───

  clearAll() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY)
    }
  },
}
