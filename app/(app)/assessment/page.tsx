"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ClipboardList, ChevronRight, ChevronLeft } from "lucide-react"

const STEPS = [
  "Type & Profile",
  "Usage Pattern",
  "Physical Health",
  "Mental & Emotional",
  "Social & Background",
]

export default function AssessmentPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)

  const [form, setForm] = useState({
    addiction_type: "",
    age: "",
    gender: "",
    frequency_per_week: "",
    duration_years: "",
    withdrawal_symptoms: false,
    mental_stress: 3,
    employment_status: "",
  })

  const update = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const next = () => setStep((s) => s + 1)
  const back = () => setStep((s) => s - 1)

  const submit = () => {
    console.log("Assessment Data:", form)
    router.push("/dashboard")
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="text-center mb-6">
        <ClipboardList className="mx-auto mb-2" />
        <h1 className="text-2xl font-bold">Addiction Assessment</h1>
        <p className="text-sm text-muted-foreground">
          Step {step + 1} of {STEPS.length}
        </p>
      </div>

      <div className="border rounded-xl p-6 shadow">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Your Profile</h2>

            <input
              type="number"
              placeholder="Age"
              className="w-full border p-2 rounded"
              value={form.age}
              onChange={(e) => update("age", e.target.value)}
            />

            <select
              className="w-full border p-2 rounded"
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Usage Pattern</h2>

            <input
              type="number"
              placeholder="Frequency per week"
              className="w-full border p-2 rounded"
              value={form.frequency_per_week}
              onChange={(e) => update("frequency_per_week", e.target.value)}
            />

            <input
              type="number"
              placeholder="Duration (years)"
              className="w-full border p-2 rounded"
              value={form.duration_years}
              onChange={(e) => update("duration_years", e.target.value)}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Physical Health</h2>

            <label>
              <input
                type="checkbox"
                checked={form.withdrawal_symptoms}
                onChange={(e) =>
                  update("withdrawal_symptoms", e.target.checked)
                }
              />
              Withdrawal Symptoms
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Mental Health</h2>

            <input
              type="range"
              min="1"
              max="5"
              value={form.mental_stress}
              onChange={(e) =>
                update("mental_stress", Number(e.target.value))
              }
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Social</h2>

            <select
              className="w-full border p-2 rounded"
              value={form.employment_status}
              onChange={(e) =>
                update("employment_status", e.target.value)
              }
            >
              <option value="">Employment Status</option>
              <option value="employed">Employed</option>
              <option value="student">Student</option>
              <option value="unemployed">Unemployed</option>
            </select>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button
            onClick={back}
            disabled={step === 0}
            className="px-4 py-2 border rounded"
          >
            <ChevronLeft size={16} /> Back
          </button>

          {step < 4 ? (
            <button
              onClick={next}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={submit}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Submit Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
