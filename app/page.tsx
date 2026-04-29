"use client"
import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Mic, Monitor, BarChart3, Eye, Hand, FlaskConical, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export default function HomePage() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center animate-in zoom-in duration-500">
              <Hand className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-foreground">Silent Classrooms</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="/auth/login" className="hidden sm:block">
              <Button variant="ghost" size="lg" className="text-base hover:scale-105 transition-transform">
                Teacher Login
              </Button>
            </Link>
            <Link href="/auth/student-login" className="hidden sm:block">
              <Button variant="outline" size="lg" className="text-base bg-transparent hover:scale-105 transition-transform">
                Student Login
              </Button>
            </Link>
            <Link href="/auth/login" className="sm:hidden">
              <Button variant="ghost" size="sm" className="text-sm">
                Login
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="hover:scale-110 transition-transform"
            >
              {mounted ? (resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />) : <Moon className="h-5 w-5 opacity-0" />}
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main id="main-content">
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto text-center max-w-4xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 text-balance animate-in fade-in slide-in-from-bottom-4 duration-700">
              Visual Learning for Every Student
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed text-pretty animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              Transform text lessons into engaging visual content with images, videos, and sign language support.
              Designed specifically for deaf and hard-of-hearing students.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full hover:scale-105 transition-transform">
                  Get Started as Teacher
                </Button>
              </Link>
              <Link href="/demo-learn" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full bg-transparent gap-2 hover:scale-105 transition-transform">
                  <FlaskConical className="h-5 w-5" />
                  Try Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4" aria-labelledby="features-heading">
          <div className="container mx-auto max-w-6xl">
            <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-center mb-12">
              Features Built for Accessibility
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Mic className="w-8 h-8" />}
                title="Voice to Visual"
                description="Speak your lesson content and automatically generate relevant images, videos, and animations."
              />
              <FeatureCard
                icon={<Monitor className="w-8 h-8" />}
                title="Classroom Display Mode"
                description="Full-screen kiosk mode with large visuals and simple navigation for classroom presentations."
              />
              <FeatureCard
                icon={<BookOpen className="w-8 h-8" />}
                title="Maharashtra Curriculum"
                description="Pre-loaded subjects aligned with Maharashtra State Board syllabus for Standards 6-8."
              />
              <FeatureCard
                icon={<Hand className="w-8 h-8" />}
                title="Sign Language Support"
                description="Attach sign language videos to concepts for comprehensive visual learning."
              />
              <FeatureCard
                icon={<BarChart3 className="w-8 h-8" />}
                title="Progress Tracking"
                description="Monitor student engagement with detailed analytics on views, understanding, and replays."
              />
              <FeatureCard
                icon={<Eye className="w-8 h-8" />}
                title="Visual Recall"
                description="Spaced repetition system to reinforce learning through scheduled visual reviews."
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4 bg-secondary/50" aria-labelledby="how-it-works-heading">
          <div className="container mx-auto max-w-4xl">
            <h2 id="how-it-works-heading" className="text-3xl md:text-4xl font-bold text-center mb-12">
              How It Works
            </h2>
            <div className="space-y-8">
              <StepCard
                number="1"
                title="Create or Speak Your Lesson"
                description="Type or use voice input to enter your lesson content. Our AI will extract key concepts and keywords."
              />
              <StepCard
                number="2"
                title="Generate Visual Content"
                description="Automatically fetch relevant images and educational videos from trusted sources like YouTube, Pixabay, and Unsplash."
              />
              <StepCard
                number="3"
                title="Present in Classroom"
                description="Use the full-screen display mode with large buttons for students to navigate through visual content."
              />
              <StepCard
                number="4"
                title="Track Understanding"
                description="Students tap 'Understood' to confirm learning. Teachers see real-time analytics on comprehension."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Classroom?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join educators making learning accessible for every student.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-10 py-6">
                Start Teaching Today
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 bg-card">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Hand className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold">Silent Classrooms</span>
              </div>
              <p className="text-sm text-muted-foreground">Making education accessible through visual learning.</p>
              <div className="pt-2">
                <a 
                  href="https://wa.me/917507075722?text=Hi,%20I%20want%20to%20know%20more%20about%20Silent%20Classrooms" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp: +91 7507075722
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href="#features-heading" className="hover:text-foreground transition-colors hover:translate-x-1 inline-block">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works-heading" className="hover:text-foreground transition-colors hover:translate-x-1 inline-block">
                    How It Works
                  </a>
                </li>
                <li>
                  <Link href="/demo-learn" className="hover:text-foreground transition-colors hover:translate-x-1 inline-block">
                    Try Demo
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className="hover:text-foreground transition-colors hover:translate-x-1 inline-block">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-foreground transition-colors hover:translate-x-1 inline-block">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors hover:translate-x-1 inline-block">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <a 
                    href="https://wa.me/917507075722?text=Hi,%20I%20need%20support%20with%20Silent%20Classrooms" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors hover:translate-x-1 inline-block"
                  >
                    WhatsApp Support
                  </a>
                </li>
                <li>
                  <Link href="/accessibility" className="hover:text-foreground transition-colors hover:translate-x-1 inline-block">
                    Accessibility
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors hover:translate-x-1 inline-block">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors hover:translate-x-1 inline-block">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Silent Classrooms. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-6 items-start">
      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shrink-0">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
