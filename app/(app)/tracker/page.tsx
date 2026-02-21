"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  CheckCircle2,
  Frown,
  Meh,
  Moon,
  Smile,
  Zap,
} from "lucide-react"
import { toast } from "sonner"
import { store } from "@/lib/store"
import {
  calculateDailyRecoveryScore,
  calculateWeeklyImprovement,
  calculateRelapseRisk,
} from "@/lib/ml-engine"
import type { DailyLog } from "@/lib/types"

const MOOD_ICONS = [Frown, Frown, Meh, Smile, Smile]
const MOOD_LABELS = ["Very Low", "Low", "Neutral", "Good", "Great"]

export default function TrackerPage() {
  const [consumed, setConsumed] = useState(false)
  const [sleepHours, setSleepHours] = useState(7)
  const [exerciseMinutes, setExerciseMinutes] = useState(15)
  const [moodScore, setMoodScore] = useState(3)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setLogs(store.getDailyLogs())
    setMounted(true)
  }, [])

  if (!mounted) return null

  const weeklyImprovement = calculateWeeklyImprovement(logs)
  const relapseRisk = calculateRelapseRisk(logs)
  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const recoveryScore = calculateDailyRecoveryScore({
      consumed,
      sleepHours,
      exerciseMinutes,
      moodScore,
    })

    const log: DailyLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      consumed,
      sleepHours,
      exerciseMinutes,
      moodScore,
      recoveryScore,
    }

    setTimeout(() => {
      store.addDailyLog(log)
      setLogs([...logs, log])
      toast.success(`Logged! Recovery score: ${recoveryScore}/100`)
      setLoading(false)
      // Reset
      setConsumed(false)
      setSleepHours(7)
      setExerciseMinutes(15)
      setMoodScore(3)
    }, 400)
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-serif">
            Daily Tracker
          </h1>
          <p className="text-sm text-muted-foreground">
            Log your daily habits and track recovery progress
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{"Today's Log"}</CardTitle>
            <CardDescription>
              Record your daily habits for{" "}
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Consumed */}
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <Label htmlFor="consumed" className="font-medium">
                    Consumed Today?
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Did you use the addictive substance today?
                  </p>
                </div>
                <Switch
                  id="consumed"
                  checked={consumed}
                  onCheckedChange={setConsumed}
                />
              </div>

              {/* Sleep */}
              <div className="flex flex-col gap-2">
                <Label className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-muted-foreground" />
                  Sleep Hours: {sleepHours}
                </Label>
                <Slider
                  value={[sleepHours]}
                  onValueChange={([v]) => setSleepHours(v)}
                  min={0}
                  max={14}
                  step={0.5}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0h</span>
                  <span>7-9h optimal</span>
                  <span>14h</span>
                </div>
              </div>

              {/* Exercise */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="exercise" className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  Exercise Minutes
                </Label>
                <Input
                  id="exercise"
                  type="number"
                  min={0}
                  max={300}
                  value={exerciseMinutes}
                  onChange={(e) =>
                    setExerciseMinutes(Number(e.target.value))
                  }
                />
              </div>

              {/* Mood */}
              <div className="flex flex-col gap-3">
                <Label>Mood: {MOOD_LABELS[moodScore - 1]}</Label>
                <div className="flex items-center justify-between gap-2 rounded-lg border border-border p-3">
                  {[1, 2, 3, 4, 5].map((score) => {
                    const Icon = MOOD_ICONS[score - 1]
                    return (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setMoodScore(score)}
                        className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-colors ${
                          moodScore === score
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs">{score}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging..." : "Submit Log"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Stats & Recent Logs */}
        <div className="flex flex-col gap-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-5 text-center">
                <p className="text-sm text-muted-foreground">
                  Weekly Change
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {weeklyImprovement >= 0 ? "+" : ""}
                  {weeklyImprovement}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 text-center">
                <p className="text-sm text-muted-foreground">Relapse Risk</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {relapseRisk}%
                </p>
                <Badge
                  variant={
                    relapseRisk <= 30
                      ? "secondary"
                      : relapseRisk <= 60
                      ? "outline"
                      : "destructive"
                  }
                  className="mt-1"
                >
                  {relapseRisk <= 30
                    ? "Low"
                    : relapseRisk <= 60
                    ? "Moderate"
                    : "High"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Recent Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Entries</CardTitle>
              <CardDescription>Last 7 daily logs</CardDescription>
            </CardHeader>
            <CardContent>
              {recentLogs.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No entries yet. Start by logging today.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentLogs.map((log, i) => (
                    <div key={log.id}>
                      {i > 0 && <Separator className="mb-3" />}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              log.consumed
                                ? "bg-destructive/10"
                                : "bg-chart-2/10"
                            }`}
                          >
                            {log.consumed ? (
                              <Frown className="h-4 w-4 text-destructive" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-chart-2" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {new Date(log.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Sleep: {log.sleepHours}h | Exercise:{" "}
                              {log.exerciseMinutes}min | Mood: {log.moodScore}/5
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">
                            {log.recoveryScore}
                          </p>
                          <p className="text-xs text-muted-foreground">score</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
