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
import { runAssessment, generateRecoveryPlan } from "@/lib/ml-engine"
import { store } from "@/lib/store"

export default function AssessmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // 🔹 Profile Details
  const [name, setName] = useState("")
  const [profileAge, setProfileAge] = useState(18)
  const [gender, setGender] = useState("")
  const [weight, setWeight] = useState(60)
  const [height, setHeight] = useState(170)

  // 🔹 Addiction Details
  const [addictionType, setAddictionType] = useState<AddictionType>("alcohol")
  const [frequencyPerWeek, setFrequencyPerWeek] = useState(3)
  const [durationYears, setDurationYears] = useState(2)
  const [quantityLevel, setQuantityLevel] = useState(3)
  const [withdrawalSymptoms, setWithdrawalSymptoms] = useState(false)
  const [mentalStressLevel, setMentalStressLevel] = useState(3)
  const [sleepHours, setSleepHours] = useState(7)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name || !gender) {
      toast.error("Please fill all profile details")
      return
    }

    setLoading(true)

    const profileData = {
      name,
      age: profileAge,
      gender,
      weight,
      height,
    }

    localStorage.setItem("userProfile", JSON.stringify(profileData))

    const input: AssessmentInput = {
      addictionType,
      frequencyPerWeek,
      durationYears,
      quantityLevel,
      withdrawalSymptoms,
      mentalStressLevel,
      sleepHours,
      age: profileAge,
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

      toast.success("Assessment complete!")
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
        <ClipboardList className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold font-serif">
          Addiction Assessment
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">

          {/* 🔥 PROFILE SECTION */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Enter your basic health details
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">

              <div>
                <Label>Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Age</Label>
                  <Input
                    type="number"
                    value={profileAge}
                    onChange={(e) => setProfileAge(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Height (cm)</Label>
                  <Input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                  />
                </div>
              </div>

            </CardContent>
          </Card>

          {/* 🔥 Existing Addiction Cards remain same */}
          {/* (No changes needed below your existing cards) */}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Analyzing..." : "Run Assessment"}
          </Button>

        </div>
      </form>
    </div>
  )
}
