"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Loader2, Lightbulb, TrendingUp, Gavel } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"

export default function OutcomePredictorPage() {
  const [caseType, setCaseType] = useState("")
  const [caseDescription, setCaseDescription] = useState("")
  const [relevantLaws, setRelevantLaws] = useState("")
  const [prediction, setPrediction] = useState<any | null>(null)
  const [debugInfo, setDebugInfo] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handlePredictOutcome = async () => {
    if (!caseType || !caseDescription || !relevantLaws) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to get a prediction.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setPrediction(null)
    setDebugInfo(null)
    try {
      const response = await fetch('/api/prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ caseType, caseDescription, relevantLaws }),
      });

      if (!response.ok) {
        throw new Error('Failed to get prediction');
      }

      const data = await response.json();
      setPrediction(data.hfResponse);
      setDebugInfo(data);
    } catch (error) {
      console.error('Error predicting outcome:', error);
      toast({
        title: "Prediction Failed",
        description: "Could not get a prediction from the AI.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Outcome Predictor</h1>
            <p className="text-gray-400">Leverage AI to predict potential outcomes for your cases.</p>
          </div>
        </div>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              Case Details for Prediction
            </CardTitle>
            <CardDescription className="text-gray-400">
              Provide comprehensive details for a more accurate prediction.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="case-type" className="text-gray-300">
                Case Type
              </Label>
              <Select value={caseType} onValueChange={setCaseType} disabled={isLoading}>
                <SelectTrigger className="w-full bg-gray-800/50 border-gray-700 text-white focus:ring-yellow-400">
                  <SelectValue placeholder="Select case type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-white">
                  <SelectItem value="contract">Contract Law</SelectItem>
                  <SelectItem value="criminal">Criminal Law</SelectItem>
                  <SelectItem value="property">Property Law</SelectItem>
                  <SelectItem value="family">Family Law</SelectItem>
                  <SelectItem value="corporate">Corporate Law</SelectItem>
                  <SelectItem value="intellectual_property">Intellectual Property</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="case-description" className="text-gray-300">
                Case Description
              </Label>
              <Textarea
                id="case-description"
                placeholder="Summarize the key facts, parties involved, and the core dispute. E.g., 'Client is suing a contractor for breach of contract due to unfinished work on a residential property. Contractor claims delays were due to unforeseen material shortages.'"
                value={caseDescription}
                onChange={(e) => setCaseDescription(e.target.value)}
                className="min-h-[120px] bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-yellow-400"
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="relevant-laws" className="text-gray-300">
                Relevant Laws/Precedents (Optional but Recommended)
              </Label>
              <Input
                id="relevant-laws"
                placeholder="e.g., Indian Contract Act, Specific Relief Act, landmark judgments"
                value={relevantLaws}
                onChange={(e) => setRelevantLaws(e.target.value)}
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-yellow-400"
                disabled={isLoading}
              />
            </div>

            <Button
              onClick={handlePredictOutcome}
              disabled={isLoading || !caseType || !caseDescription}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" /> Predict Outcome
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {prediction !== null && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Gavel className="w-5 h-5 text-yellow-400" />
                Prediction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white">{prediction[0].sequence}</p>
            </CardContent>
          </Card>
        )}

      </div>
    </DashboardLayout>
  )
}
