"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DonationForm } from "@/components/donation-form"
import { getAllDonations } from "@/utils/payment-service"
import { formatDate } from "@/utils/date-utils"
import { createClient } from "@supabase/supabase-js"
import { Heart, Users, ArrowRight } from "lucide-react"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function DonatePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [recentDonations, setRecentDonations] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [showForm, setShowForm] = useState<boolean>(false)

  useEffect(() => {
    const fetchUserAndDonations = async () => {
      try {
        // Check if user is authenticated
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          setUserId(user.id)
        }

        try {
          // Fetch recent donations
          const donations = await getAllDonations()
          setRecentDonations(donations.slice(0, 5)) // Show only the 5 most recent
        } catch (donationError) {
          console.error("Error fetching donations:", donationError)
          // Set empty array to avoid undefined errors
          setRecentDonations([])
        }
      } catch (err) {
        console.error("Error fetching user:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndDonations()
  }, [])

  const handleDonateClick = () => {
    if (!userId) {
      router.push("/login")
      return
    }

    setShowForm(true)
  }

  const handleDonationSuccess = () => {
    setShowForm(false)
    // Refresh donations list
    getAllDonations().then((donations) => {
      setRecentDonations(donations.slice(0, 5))
    })
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-display font-bold text-navy mb-2">Support Our Rowing Club</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your donations help us maintain equipment, subsidize sessions for those in need, and grow our rowing
            community.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-sand p-6 h-full">
              <h2 className="text-2xl font-display font-bold text-navy mb-4">Why Donate?</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary w-10 h-10 rounded-full flex items-center justify-center mr-4 text-white">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy">Support Inclusivity</h3>
                    <p className="text-gray-600">
                      Help us provide scholarships and subsidized sessions for those who cannot afford full fees.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-secondary w-10 h-10 rounded-full flex items-center justify-center mr-4 text-white">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy">Grow Our Community</h3>
                    <p className="text-gray-600">
                      Your donations help us organize community events and outreach programs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-coral w-10 h-10 rounded-full flex items-center justify-center mr-4 text-white">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy">Maintain Equipment</h3>
                    <p className="text-gray-600">
                      Help us keep our boats and equipment in top condition for everyone's safety and enjoyment.
                    </p>
                  </div>
                </div>
              </div>

              {!showForm && (
                <Button onClick={handleDonateClick} className="mt-6 bg-primary hover:bg-primary/90">
                  Donate Now
                  <Heart className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          <div>
            {showForm ? (
              <DonationForm userId={userId!} onSuccess={handleDonationSuccess} onCancel={() => setShowForm(false)} />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-sand p-6 h-full">
                <h2 className="text-2xl font-display font-bold text-navy mb-4">Recent Donations</h2>
                {loading ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 mx-auto text-coral animate-pulse" />
                    <p className="mt-4 text-gray-500">Loading recent donations...</p>
                  </div>
                ) : recentDonations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No donations yet. Be the first to donate!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentDonations.map((donation) => (
                      <Card key={donation.id} className="border-sand">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-navy">
                                {donation.is_anonymous
                                  ? "Anonymous Donor"
                                  : `${donation.profiles.first_name} ${donation.profiles.last_name}`}
                              </p>
                              <p className="text-sm text-gray-500">{formatDate(donation.created_at)}</p>
                              {donation.message && (
                                <p className="text-sm text-gray-600 mt-2 italic">"{donation.message}"</p>
                              )}
                            </div>
                            <div className="font-bold text-primary">${donation.amount.toFixed(2)}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <div className="text-center mt-6">
                      <Button variant="link" className="text-primary" onClick={handleDonateClick}>
                        Join them in supporting our club
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-primary text-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-display font-bold mb-4">Our Donation Goal</h2>
          <div className="w-full bg-white/20 rounded-full h-6 mb-4">
            <div className="bg-coral h-6 rounded-full" style={{ width: "65%" }}></div>
          </div>
          <div className="flex justify-between text-sm mb-6">
            <span>$0</span>
            <span className="font-bold">$6,500 raised of $10,000 goal</span>
          </div>
          <p className="mb-6">Your contribution, no matter how small, makes a difference in our community.</p>
          <Button onClick={handleDonateClick} className="bg-white text-primary hover:bg-sand hover:text-primary">
            Make a Donation
            <Heart className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </PageLayout>
  )
}

