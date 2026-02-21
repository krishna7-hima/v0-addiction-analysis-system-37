"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ClipboardList } from "lucide-react"
import { toast } from "sonner"
import type { AddictionType, AssessmentInput } from "@/lib/types"
import { runAssessment } from "@/lib/ml-engine"
import { generateRecoveryPlan } from "@/lib/ml-engine"
import { store } from "@/lib/store"

export default function AssessmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [addictionType, setAddictionType] = useState<AddictionType>("alcohol")
  const [frequencyPerWeek, setFrequencyPerWeek] = useState(3)
  const [durationYears, setDurationYears] = useState(2)
  const [quantityLevel, setQuantityLevel] = useState(3)
  const [withdrawalSymptoms, setWithdrawalSymptoms] = useState(false)
  const [mentalStressLevel, setMentalStressLevel] = useState(3)
  const [sleepHours, setSleepHours] = useState(7)
  const [age, setAge] = useState(30)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const input: AssessmentInput = {
      addictionType,
      frequencyPerWeek,
      durationYears,
      quantityLevel,
      withdrawalSymptoms,
      mentalStressLevel,
      sleepHours,
      age,
    }

    setTimeout(() => {
      const result = runAssessment(input)
      store.addAssessment(result)

      const plan = generateRecoveryPlan(
        result.severityLevel,
        result.input.addictionType,
        result.recoveryWeeks
      )
      store.setRecoveryPlan(plan)

      toast.success("Assessment complete! View your results.")
      router.push("/dashboard")
    }, 800)
  }

  const addictionTypes = [
    { value: "alcohol", label: "Alcohol" },
    { value: "smoking", label: "Smoking / Tobacco" },
    { value: "drugs", label: "Drugs / Substances" },
    { value: "food", label: "Food / Eating" },
  ]

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <ClipboardList className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-serif">
            Addiction Assessment
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete the form below for a comprehensive severity analysis
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          {/* Addiction Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Addiction Type</CardTitle>
              <CardDescription>
                Select the primary type of addiction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={addictionType}
                onValueChange={(v) => setAddictionType(v as AddictionType)}
                className="grid grid-cols-2 gap-3"
              >
                {addictionTypes.map((type) => (
                  <div key={type.value} className="flex items-center gap-2">
                    <RadioGroupItem value={type.value} id={type.value} />
                    <Label htmlFor={type.value} className="cursor-pointer">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Usage Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Usage Details</CardTitle>
              <CardDescription>
                Provide information about your usage patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label>Frequency (times per week): {frequencyPerWeek}</Label>
                <Slider
                  value={[frequencyPerWeek]}
                  onValueChange={([v]) => setFrequencyPerWeek(v)}
                  min={0}
                  max={7}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>7 (daily)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="duration">Duration (years)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={0}
                    max={50}
                    value={durationYears}
                    onChange={(e) => setDurationYears(Number(e.target.value))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min={12}
                    max={100}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Quantity Level: {quantityLevel}/5</Label>
                <Select
                  value={String(quantityLevel)}
                  onValueChange={(v) => setQuantityLevel(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Very Low</SelectItem>
                    <SelectItem value="2">2 - Low</SelectItem>
                    <SelectItem value="3">3 - Moderate</SelectItem>
                    <SelectItem value="4">4 - High</SelectItem>
                    <SelectItem value="5">5 - Very High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <Label htmlFor="withdrawal">Withdrawal Symptoms</Label>
                  <p className="text-sm text-muted-foreground">
                    Do you experience withdrawal when not using?
                  </p>
                </div>
                <Switch
                  id="withdrawal"
                  checked={withdrawalSymptoms}
                  onCheckedChange={setWithdrawalSymptoms}
                />
              </div>
            </CardContent>
          </Card>

          {/* Mental & Physical */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Mental & Physical Health
              </CardTitle>
              <CardDescription>
                Rate your current mental stress and sleep patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label>Mental Stress Level: {mentalStressLevel}/5</Label>
                <Slider
                  value={[mentalStressLevel]}
                  onValueChange={([v]) => setMentalStressLevel(v)}
                  min={1}
                  max={5}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 (Low)</span>
                  <span>5 (Extreme)</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="sleep">Average Sleep Hours</Label>
                <Input
                  id="sleep"
                  type="number"
                  min={0}
                  max={24}
                  step={0.5}
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Analyzing..." : "Run Assessment"}
          </Button>
        </div>
      </form>
    </div>
  )
}
