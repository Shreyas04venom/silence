"use client"
import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Hand, ArrowLeft, Eye, Ear, Keyboard, Monitor, Volume2, Type, Contrast } from "lucide-react"

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Hand className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Silent Classrooms</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Accessibility Features</h1>
          <p className="text-xl text-muted-foreground">
            Designed for every learner, with special focus on deaf and hard-of-hearing students
          </p>
        </div>

        {/* Core Accessibility Features */}
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <h2 className="text-3xl font-bold mb-6">Our Commitment to Accessibility</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Silent Classrooms is built from the ground up with accessibility at its core. 
            We believe every student deserves equal access to quality education.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-all hover:scale-105 duration-300">
              <CardHeader>
                <Hand className="w-10 h-10 text-primary mb-3" />
                <CardTitle className="text-xl">Sign Language Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Attach Indian Sign Language (ISL) videos to any concept. Students can watch 
                  sign language interpretations alongside visual content for comprehensive understanding.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all hover:scale-105 duration-300">
              <CardHeader>
                <Eye className="w-10 h-10 text-primary mb-3" />
                <CardTitle className="text-xl">Visual-First Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Every lesson is transformed into rich visual content with images, videos, and 
                  animations. Text is supplemented, not primary, making learning accessible without audio.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all hover:scale-105 duration-300">
              <CardHeader>
                <Monitor className="w-10 h-10 text-primary mb-3" />
                <CardTitle className="text-xl">Large Display Mode</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Full-screen kiosk mode with extra-large buttons and text. Designed for easy 
                  navigation on classroom displays and tablets without teacher assistance.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all hover:scale-105 duration-300">
              <CardHeader>
                <Type className="w-10 h-10 text-primary mb-3" />
                <CardTitle className="text-xl">Clear Typography</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  High-contrast text with adjustable sizes. Dyslexia-friendly fonts and generous 
                  spacing ensure readability for all students.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all hover:scale-105 duration-300">
              <CardHeader>
                <Keyboard className="w-10 h-10 text-primary mb-3" />
                <CardTitle className="text-xl">Keyboard Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Full keyboard support with visible focus indicators. Navigate through lessons 
                  using Tab, Enter, and Arrow keys without requiring a mouse.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all hover:scale-105 duration-300">
              <CardHeader>
                <Contrast className="w-10 h-10 text-primary mb-3" />
                <CardTitle className="text-xl">Dark/Light Themes</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Switch between dark and light modes for comfortable viewing in any lighting 
                  condition. Reduces eye strain during extended learning sessions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all hover:scale-105 duration-300">
              <CardHeader>
                <Volume2 className="w-10 h-10 text-primary mb-3" />
                <CardTitle className="text-xl">Optional Audio</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Audio descriptions and narration are available but never required. All content 
                  is fully accessible through visual means alone.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all hover:scale-105 duration-300">
              <CardHeader>
                <Ear className="w-10 h-10 text-primary mb-3" />
                <CardTitle className="text-xl">No Audio Dependencies</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Unlike traditional e-learning platforms, Silent Classrooms never requires 
                  audio to understand content. Perfect for deaf and hard-of-hearing learners.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Technical Standards */}
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Accessibility Standards</CardTitle>
              <CardDescription className="text-base">
                We strive to meet and exceed international accessibility guidelines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">WCAG 2.1 Level AA Compliance</h3>
                <p className="text-muted-foreground">
                  Our platform follows Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA, 
                  ensuring compatibility with assistive technologies.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Screen Reader Compatible</h3>
                <p className="text-muted-foreground">
                  All interface elements include proper ARIA labels and semantic HTML for 
                  screen reader users.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Responsive Design</h3>
                <p className="text-muted-foreground">
                  Works seamlessly on desktops, laptops, tablets, and mobile devices. 
                  Touch-friendly interface for tablet-based learning.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* User Manual */}
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <h2 className="text-3xl font-bold mb-6">User Manual</h2>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">For Teachers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1. Creating Accessible Lessons</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Use clear, simple language in lesson descriptions</li>
                    <li>Add sign language videos for key concepts</li>
                    <li>Ensure images have descriptive alt text</li>
                    <li>Break complex topics into smaller visual chunks</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">2. Using Display Mode</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Click "Display Mode" to enter full-screen kiosk view</li>
                    <li>Students can navigate independently using large buttons</li>
                    <li>Press ESC or click exit button to return to teacher view</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">3. Monitoring Progress</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Check Analytics dashboard for student engagement</li>
                    <li>Review which concepts students marked as "Understood"</li>
                    <li>Identify concepts that need additional explanation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">For Students</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1. Navigating Lessons</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Use large arrow buttons to move between concepts</li>
                    <li>Click on images to view them in full size</li>
                    <li>Tap video thumbnails to watch educational videos</li>
                    <li>Watch sign language videos for additional explanation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">2. Marking Understanding</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Click "I Understood" button when you grasp a concept</li>
                    <li>Replay videos as many times as needed</li>
                    <li>Take your time - there's no rush</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">3. Keyboard Shortcuts</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Arrow Right: Next concept</li>
                    <li>Arrow Left: Previous concept</li>
                    <li>Space: Play/Pause video</li>
                    <li>ESC: Exit full screen</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Feedback */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Help Us Improve</CardTitle>
              <CardDescription className="text-base">
                Your feedback helps us make Silent Classrooms more accessible for everyone
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                If you encounter any accessibility barriers or have suggestions for improvement, 
                please let us know. We're committed to continuous enhancement.
              </p>
              <Link href="/contact">
                <Button size="lg">
                  Share Accessibility Feedback
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
