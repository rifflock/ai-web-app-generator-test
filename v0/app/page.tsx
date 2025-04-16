import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageLayout } from "@/components/page-layout"
import { Anchor, Award, Calendar, Clock, Users } from "lucide-react"
import Image from "next/image"

export default function Home() {
  return (
    <PageLayout>
      <section className="relative py-20 overflow-hidden">
        {/* Background wave pattern */}
        <div className="absolute inset-0 z-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="#57c5b6"
              fillOpacity="1"
              d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 text-navy">
                Manage Your <span className="text-primary">Rowing Club</span> With Ease
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0">
                Streamline crew formation, track availability, and match rowers based on experience and preferences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/signup">
                  <Button size="lg" className="px-8 bg-primary hover:bg-primary/90">
                    Get Started
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline" className="px-8">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="relative w-full aspect-video md:aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-secondary/20 rounded-lg transform rotate-3"></div>
                <Image
                  src="/placeholder.svg?height=500&width=500"
                  alt="Rowing team"
                  width={500}
                  height={500}
                  className="relative z-10 rounded-lg shadow-lg object-cover"
                />
                <div className="absolute -bottom-4 -right-4 bg-coral text-white p-3 rounded-lg shadow-lg z-20">
                  <Anchor className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-4 text-navy">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform makes it easy to organize your rowing club and find the perfect crew match.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-sand-light p-6 rounded-lg shadow-sm border border-sand transition-all hover:shadow-md">
              <div className="bg-primary w-12 h-12 rounded-full flex items-center justify-center mb-4 text-white">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-navy">Create Your Profile</h3>
              <p className="text-gray-600">
                Share your experience, availability, and preferences for optimal crew matching.
              </p>
            </div>

            <div className="bg-sand-light p-6 rounded-lg shadow-sm border border-sand transition-all hover:shadow-md">
              <div className="bg-secondary w-12 h-12 rounded-full flex items-center justify-center mb-4 text-white">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-navy">Schedule Sessions</h3>
              <p className="text-gray-600">
                Find available times that work for your entire crew and book sessions easily.
              </p>
            </div>

            <div className="bg-sand-light p-6 rounded-lg shadow-sm border border-sand transition-all hover:shadow-md">
              <div className="bg-accent w-12 h-12 rounded-full flex items-center justify-center mb-4 text-white">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-navy">Track Progress</h3>
              <p className="text-gray-600">
                Monitor your rowing performance and celebrate achievements with your team.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-white to-sand-light">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt="Rowing schedule"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-display font-bold mb-4 text-navy">Effortless Scheduling</h2>
              <p className="text-lg text-gray-600 mb-6">
                No more spreadsheets or group texts. Our platform makes it easy to find times that work for everyone.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="bg-coral text-white p-1 rounded-full mt-1">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy">Availability Matching</h3>
                    <p className="text-gray-600">Automatically find times that work for your entire crew.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-coral text-white p-1 rounded-full mt-1">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy">Calendar Integration</h3>
                    <p className="text-gray-600">Sync with your personal calendar to avoid scheduling conflicts.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-coral text-white p-1 rounded-full mt-1">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy">Automated Reminders</h3>
                    <p className="text-gray-600">Never miss a session with timely notifications.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join WaveRowers today and transform how you manage your rowing club.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-primary hover:bg-sand hover:text-primary">
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>
    </PageLayout>
  )
}

