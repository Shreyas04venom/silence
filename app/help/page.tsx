"use client"
import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Hand, ArrowLeft, BookOpen, Mic, Monitor, BarChart3, Video, MessageCircle } from "lucide-react"

export default function HelpCenterPage() {
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

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about Silent Classrooms
          </p>
        </div>

        {/* Quick Start Guides */}
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <h2 className="text-2xl font-bold mb-6">Quick Start Guides</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-all hover:scale-105 duration-300 cursor-pointer group">
              <CardHeader>
                <BookOpen className="w-10 h-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Teacher Guide</CardTitle>
                <CardDescription>Learn how to create and manage lessons</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Create lessons with voice or text input</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Generate visual content automatically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Track student progress and engagement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Manage classes and student accounts</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-all hover:scale-105 duration-300 cursor-pointer group">
              <CardHeader>
                <Monitor className="w-10 h-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Student Guide</CardTitle>
                <CardDescription>Navigate and learn with visual content</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Access lessons in full-screen display mode</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Watch videos and view images</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Mark concepts as understood</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Navigate with large, easy-to-use buttons</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                How do I create my first lesson?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Sign up as a teacher and log in to your dashboard</li>
                  <li>Click on "Create New Lesson" button</li>
                  <li>Select a subject and class from the dropdown</li>
                  <li>Type or speak your lesson content using the microphone icon</li>
                  <li>Click "Generate Visual Content" to automatically create images and videos</li>
                  <li>Review and save your lesson</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                How does voice input work?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Click the microphone icon <Mic className="w-4 h-4 inline" /> and speak your lesson content. 
                Our AI will transcribe your speech and extract key concepts to generate relevant visual content. 
                Make sure to allow microphone permissions in your browser.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                What is Classroom Display Mode?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Classroom Display Mode is a full-screen kiosk interface designed for students to navigate lessons 
                independently. It features large buttons, clear visuals, and simple navigation. Students can view 
                images, watch videos, and mark concepts as "Understood" without teacher intervention.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                How do I add sign language videos?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                When creating or editing a lesson, you can attach sign language videos to specific concepts. 
                Upload your own videos or provide YouTube links. These videos will appear alongside the visual 
                content in the student display mode.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                How can I track student progress?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Go to the Analytics section in your dashboard. You'll see detailed metrics including:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Number of views per lesson</li>
                  <li>Concepts marked as "Understood"</li>
                  <li>Video replay counts</li>
                  <li>Time spent on each concept</li>
                  <li>Individual student progress reports</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left">
                What subjects are available?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We currently support Maharashtra State Board curriculum for Standards 6-8, including:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Mathematics</li>
                  <li>Science</li>
                  <li>Social Studies (History, Geography, Civics)</li>
                  <li>English</li>
                  <li>Marathi</li>
                </ul>
                More subjects and standards are being added regularly.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger className="text-left">
                Is internet connection required?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes, an internet connection is required to generate visual content and access videos. 
                However, once a lesson is loaded, students can view images offline. We're working on 
                a full offline mode for areas with limited connectivity.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger className="text-left">
                How do I register students?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Go to your Classes section</li>
                  <li>Create a new class or select an existing one</li>
                  <li>Click "Add Students"</li>
                  <li>Enter student names and generate login credentials</li>
                  <li>Share the credentials with students for their first login</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Video Tutorials */}
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <h2 className="text-2xl font-bold mb-6">Video Tutorials</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <Video className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Creating Your First Lesson</CardTitle>
                <CardDescription>Complete walkthrough of lesson creation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative group">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      id="video-lesson-creation"
                      src="https://drive.google.com/file/d/13Oiq4-Uo7OlryeGVW5qq9fnU2TjAULUG/preview"
                      className="w-full h-full"
                      allow="autoplay"
                      title="Creating Your First Lesson Tutorial"
                      allowFullScreen
                    />
                  </div>
                  <button
                    onClick={() => {
                      const iframe = document.getElementById('video-lesson-creation') as HTMLIFrameElement
                      if (iframe.requestFullscreen) {
                        iframe.requestFullscreen()
                      }
                    }}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                    title="Fullscreen"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Learn how to create engaging visual lessons using voice input and AI-generated content.
                </p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <Video className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Using Display Mode</CardTitle>
                <CardDescription>Student-friendly classroom display demo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative group">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      id="video-display-mode"
                      src="https://drive.google.com/file/d/11G9vKgwBtL_g_ef7kDbK4VYj82R0V0vr/preview"
                      className="w-full h-full"
                      allow="autoplay"
                      title="Using Display Mode Tutorial"
                      allowFullScreen
                    />
                  </div>
                  <button
                    onClick={() => {
                      const iframe = document.getElementById('video-display-mode') as HTMLIFrameElement
                      if (iframe.requestFullscreen) {
                        iframe.requestFullscreen()
                      }
                    }}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                    title="Fullscreen"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  See how students navigate lessons independently using the full-screen kiosk mode.
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Additional Tips */}
          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              Video Tips
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
              <li>Click the play button to start the video</li>
              <li>Hover over the video and click the fullscreen button (top-right corner) for better viewing</li>
              <li>Videos can be paused and replayed anytime</li>
              <li>Follow along step-by-step for best results</li>
              <li>Press ESC to exit fullscreen mode</li>
            </ul>
          </div>
        </section>

        {/* Contact Support */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="text-center">
              <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl">Still Need Help?</CardTitle>
              <CardDescription className="text-base">
                Our support team is here to assist you
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="w-full sm:w-auto">
                  Contact Support
                </Button>
              </Link>
              <a 
                href="https://wa.me/917507075722?text=Hi,%20I%20need%20help%20with%20Silent%20Classrooms" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp Support
                </Button>
              </a>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
