"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@supabase/supabase-js"
import { LogoLink } from "@/components/logo"
import { CheckCircle2, ChevronRight } from "lucide-react"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function Onboarding() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Personal information
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")

  // Rowing experience
  const [experienceLevel, setExperienceLevel] = useState("")
  const [yearsRowing, setYearsRowing] = useState("")
  const [preferredPosition, setPreferredPosition] = useState("")

  // Availability
  const [weekdayMornings, setWeekdayMornings] = useState(false)
  const [weekdayEvenings, setWeekdayEvenings] = useState(false)
  const [weekendMornings, setWeekendMornings] = useState(false)
  const [weekendAfternoons, setWeekendAfternoons] = useState(false)

  // Preferences
  const [crewSize, setCrewSize] = useState("")
  const [competitiveLevel, setCompetitiveLevel] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState("")

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("No authenticated user found")

      // Save profile data to profiles table
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        updated_at: new Date().toISOString(),
      })

      if (profileError) throw profileError

      // Save rowing experience to rowing_experience table
      const { error: experienceError } = await supabase.from("rowing_experience").upsert({
        user_id: user.id,
        experience_level: experienceLevel,
        years_rowing: Number.parseInt(yearsRowing),
        preferred_position: preferredPosition,
      })

      if (experienceError) throw experienceError

      // Save availability to availability table
      const { error: availabilityError } = await supabase.from("availability").upsert({
        user_id: user.id,
        weekday_mornings: weekdayMornings,
        weekday_evenings: weekdayEvenings,
        weekend_mornings: weekendMornings,
        weekend_afternoons: weekendAfternoons,
      })

      if (availabilityError) throw availabilityError

      // Save preferences to preferences table
      const { error: preferencesError } = await supabase.from("preferences").upsert({
        user_id: user.id,
        crew_size: crewSize,
        competitive_level: competitiveLevel,
        additional_info: additionalInfo,
      })

      if (preferencesError) throw preferencesError

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error: any) {
      setError(error.message || "Failed to save profile information")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-sand-light flex flex-col">
      <div className="container mx-auto px-4 py-4">
        <LogoLink />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-display font-bold text-navy">Complete Your Profile</h1>
            <p className="text-gray-600 mt-2">Help us match you with the perfect crew</p>

            <div className="flex justify-center mt-6 space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      i < step
                        ? "bg-secondary text-white"
                        : i === step
                          ? "bg-primary text-white"
                          : "bg-white border border-sand text-gray-400"
                    }`}
                  >
                    {i < step ? <CheckCircle2 className="h-5 w-5" /> : i}
                  </div>
                  <div
                    className={`h-1 w-16 ${i < 4 ? "block" : "hidden"} ${i < step ? "bg-secondary" : "bg-gray-200"}`}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          <Card className="border-sand shadow-sm">
            {step === 1 && (
              <>
                <CardHeader className="bg-sand-light border-b border-sand">
                  <CardTitle className="text-navy">Personal Information</CardTitle>
                  <CardDescription>Tell us a bit about yourself</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="border-sand focus:border-primary focus:ring-primary"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="border-sand focus:border-primary focus:ring-primary"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="border-sand focus:border-primary focus:ring-primary"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t border-sand pt-4">
                  <Button onClick={nextStep} className="bg-primary hover:bg-primary/90">
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </>
            )}

            {step === 2 && (
              <>
                <CardHeader className="bg-sand-light border-b border-sand">
                  <CardTitle className="text-navy">Rowing Experience</CardTitle>
                  <CardDescription>Tell us about your rowing background</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                      <SelectTrigger id="experienceLevel" className="border-sand focus:ring-primary">
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearsRowing">Years of Rowing</Label>
                    <Input
                      id="yearsRowing"
                      type="number"
                      min="0"
                      value={yearsRowing}
                      onChange={(e) => setYearsRowing(e.target.value)}
                      className="border-sand focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferredPosition">Preferred Position</Label>
                    <Select value={preferredPosition} onValueChange={setPreferredPosition}>
                      <SelectTrigger id="preferredPosition" className="border-sand focus:ring-primary">
                        <SelectValue placeholder="Select your preferred position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bow">Bow</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="7">7</SelectItem>
                        <SelectItem value="stroke">Stroke</SelectItem>
                        <SelectItem value="cox">Cox</SelectItem>
                        <SelectItem value="any">Any position</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t border-sand pt-4">
                  <Button variant="outline" onClick={prevStep} className="border-sand">
                    Back
                  </Button>
                  <Button onClick={nextStep} className="bg-primary hover:bg-primary/90">
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </>
            )}

            {step === 3 && (
              <>
                <CardHeader className="bg-sand-light border-b border-sand">
                  <CardTitle className="text-navy">Availability</CardTitle>
                  <CardDescription>When are you available to row?</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2 bg-white p-3 rounded-md border border-sand hover:border-primary transition-colors">
                        <input
                          type="checkbox"
                          id="weekdayMornings"
                          checked={weekdayMornings}
                          onChange={(e) => setWeekdayMornings(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="weekdayMornings" className="cursor-pointer flex-1">
                          Weekday Mornings
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 bg-white p-3 rounded-md border border-sand hover:border-primary transition-colors">
                        <input
                          type="checkbox"
                          id="weekdayEvenings"
                          checked={weekdayEvenings}
                          onChange={(e) => setWeekdayEvenings(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="weekdayEvenings" className="cursor-pointer flex-1">
                          Weekday Evenings
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 bg-white p-3 rounded-md border border-sand hover:border-primary transition-colors">
                        <input
                          type="checkbox"
                          id="weekendMornings"
                          checked={weekendMornings}
                          onChange={(e) => setWeekendMornings(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="weekendMornings" className="cursor-pointer flex-1">
                          Weekend Mornings
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 bg-white p-3 rounded-md border border-sand hover:border-primary transition-colors">
                        <input
                          type="checkbox"
                          id="weekendAfternoons"
                          checked={weekendAfternoons}
                          onChange={(e) => setWeekendAfternoons(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="weekendAfternoons" className="cursor-pointer flex-1">
                          Weekend Afternoons
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t border-sand pt-4">
                  <Button variant="outline" onClick={prevStep} className="border-sand">
                    Back
                  </Button>
                  <Button onClick={nextStep} className="bg-primary hover:bg-primary/90">
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </>
            )}

            {step === 4 && (
              <>
                <CardHeader className="bg-sand-light border-b border-sand">
                  <CardTitle className="text-navy">Preferences</CardTitle>
                  <CardDescription>Tell us about your rowing preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="crewSize" className="text-navy">
                      Preferred Crew Size
                    </Label>
                    <RadioGroup value={crewSize} onValueChange={setCrewSize} className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2 bg-white p-3 rounded-md border border-sand hover:border-primary transition-colors">
                        <RadioGroupItem value="1x" id="1x" className="text-primary" />
                        <Label htmlFor="1x" className="cursor-pointer flex-1">
                          Single (1x)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 bg-white p-3 rounded-md border border-sand hover:border-primary transition-colors">
                        <RadioGroupItem value="2x" id="2x" className="text-primary" />
                        <Label htmlFor="2x" className="cursor-pointer flex-1">
                          Double (2x)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 bg-white p-3 rounded-md border border-sand hover:border-primary transition-colors">
                        <RadioGroupItem value="4x" id="4x" className="text-primary" />
                        <Label htmlFor="4x" className="cursor-pointer flex-1">
                          Quad (4x)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 bg-white p-3 rounded-md border border-sand hover:border-primary transition-colors">
                        <RadioGroupItem value="8+" id="8+" className="text-primary" />
                        <Label htmlFor="8+" className="cursor-pointer flex-1">
                          Eight (8+)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="competitiveLevel">Competitive Level</Label>
                    <Select value={competitiveLevel} onValueChange={setCompetitiveLevel}>
                      <SelectTrigger id="competitiveLevel" className="border-sand focus:ring-primary">
                        <SelectValue placeholder="Select your competitive level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recreational">Recreational</SelectItem>
                        <SelectItem value="club">Club</SelectItem>
                        <SelectItem value="competitive">Competitive</SelectItem>
                        <SelectItem value="elite">Elite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalInfo">Additional Information</Label>
                    <Textarea
                      id="additionalInfo"
                      placeholder="Anything else we should know about your rowing preferences?"
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      className="border-sand focus:border-primary focus:ring-primary"
                    />
                  </div>

                  {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
                </CardContent>
                <CardFooter className="flex justify-between border-t border-sand pt-4">
                  <Button variant="outline" onClick={prevStep} className="border-sand">
                    Back
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading} className="bg-primary hover:bg-primary/90">
                    {loading ? "Saving..." : "Complete Profile"}
                  </Button>
                </CardFooter>
              </>
            )}
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} WaveRowers. All rights reserved.</p>
      </div>
    </div>
  )
}

