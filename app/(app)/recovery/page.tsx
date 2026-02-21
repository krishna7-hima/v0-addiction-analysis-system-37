"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Heart,
  Lightbulb,
  Target,
} from "lucide-react"
import { store } from "@/lib/store"
import type { RecoveryPlan } from "@/lib/types"

const ADDICTION_LABELS: Record<string, string> = {
  alcohol: "Alcohol",
  smoking: "Smoking",
  drugs: "Substance",
  food: "Food/Eating",
}

export default function RecoveryPage() {
  const [plan, setPlan] = useState<RecoveryPlan | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setPlan(store.getRecoveryPlan())
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Heart className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-foreground font-serif">
          No Recovery Plan Yet
        </h2>
        <p className="mt-2 max-w-md text-center text-muted-foreground">
          Complete an assessment first to receive a personalized recovery plan
          tailored to your needs.
        </p>
        <Link href="/assessment" className="mt-6">
          <Button size="lg" className="gap-2">
            Take Assessment
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-serif">
              Recovery Plan
            </h1>
            <p className="text-sm text-muted-foreground">
              Personalized {plan.weeks.length}-week structured recovery for{" "}
              {ADDICTION_LABELS[plan.addictionType] || plan.addictionType}{" "}
              addiction
            </p>
          </div>
        </div>
        <Badge
          variant={plan.severity === "Low" || plan.severity === "Moderate" ? "secondary" : "destructive"}
          className="self-start"
        >
          {plan.severity} Severity
        </Badge>
      </div>

      {/* Rehab Alert */}
      {plan.rehabRecommended && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-4 p-5">
            <AlertTriangle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">
                Professional Treatment Recommended
              </p>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Based on your severity level ({plan.severity}), we strongly
                recommend consulting with a healthcare professional or
                considering a rehabilitation program alongside this self-guided
                plan.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Plans */}
      <div className="flex flex-col gap-6">
        {plan.weeks.map((week) => (
          <Card key={week.week}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Week {week.week}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {week.week <= Math.ceil(plan.weeks.length * 0.3)
                    ? "Early Phase"
                    : week.week <= Math.ceil(plan.weeks.length * 0.7)
                    ? "Mid Phase"
                    : "Late Phase"}
                </Badge>
              </div>
              <CardDescription>
                Structured goals and activities for this week
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {/* Goals */}
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Target className="h-4 w-4 text-primary" />
                  Goals
                </div>
                <ul className="flex flex-col gap-1.5 pl-6">
                  {week.goals.map((goal, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-chart-2" />
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Activities */}
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Heart className="h-4 w-4 text-accent" />
                  Daily Activities
                </div>
                <ul className="flex flex-col gap-1.5 pl-6">
                  {week.activities.map((activity, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground"
                    >
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Tips */}
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Lightbulb className="h-4 w-4 text-chart-4" />
                  Tips
                </div>
                <ul className="flex flex-col gap-1.5 pl-6">
                  {week.tips.map((tip, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground"
                    >
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
