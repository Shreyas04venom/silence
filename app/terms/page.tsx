"use client"
import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Hand, ArrowLeft, FileText, Scale, AlertCircle, CheckCircle } from "lucide-react"

export default function TermsOfServicePage() {
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
          <Scale className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          {/* Agreement */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                By accessing or using Silent Classrooms ("the Platform"), you agree to be bound by these 
                Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Platform.
              </p>
              <p>
                These Terms apply to all users, including teachers, students, administrators, and visitors.
              </p>
            </CardContent>
          </Card>

          {/* Eligibility */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Eligibility
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Teachers and Administrators</h3>
                <p>
                  You must be at least 18 years old and authorized by your educational institution 
                  to create an account and use the Platform for educational purposes.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Students</h3>
                <p>
                  Student accounts must be created by authorized teachers. Students under 13 require 
                  parental consent, which is obtained through the school or teacher.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <CardHeader>
              <CardTitle>User Accounts and Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>When you create an account, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Use the Platform only for lawful educational purposes</li>
              </ul>
              <p className="font-semibold text-foreground">
                Teachers are responsible for managing student accounts and ensuring appropriate use.
              </p>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-250">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Acceptable Use Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>You agree NOT to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Upload inappropriate, offensive, or harmful content</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Attempt to hack, disrupt, or compromise platform security</li>
                <li>Share account credentials with unauthorized users</li>
                <li>Use the Platform for commercial purposes without permission</li>
                <li>Collect or harvest user data without consent</li>
                <li>Impersonate others or create fake accounts</li>
              </ul>
            </CardContent>
          </Card>

          {/* Content Ownership */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <CardHeader>
              <CardTitle>Content and Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Your Content</h3>
                <p>
                  You retain ownership of lesson content you create. By uploading content, you grant 
                  us a license to store, display, and process it to provide our services.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Our Platform</h3>
                <p>
                  The Platform, including its design, features, and code, is owned by Silent Classrooms 
                  and protected by copyright and other intellectual property laws.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Generated Content</h3>
                <p>
                  AI-generated images and content are provided for educational use. We source images 
                  from licensed providers (Unsplash, Pixabay) and videos from YouTube under fair use.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Educational Use */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-350">
            <CardHeader>
              <CardTitle>Educational Use License</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                We grant you a limited, non-exclusive, non-transferable license to use the Platform 
                for educational purposes in accordance with these Terms.
              </p>
              <p>This license includes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Creating and managing lessons for your students</li>
                <li>Accessing generated visual content for classroom use</li>
                <li>Tracking student progress and engagement</li>
                <li>Using the Platform in your educational institution</li>
              </ul>
            </CardContent>
          </Card>

          {/* Privacy and Data */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
            <CardHeader>
              <CardTitle>Privacy and Data Protection</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                Your use of the Platform is also governed by our{" "}
                <Link href="/privacy" className="text-primary hover:underline font-semibold">
                  Privacy Policy
                </Link>
                . We are committed to protecting student privacy and complying with educational 
                privacy laws including COPPA and FERPA.
              </p>
              <p>Key privacy commitments:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Student data is never sold or used for advertising</li>
                <li>Data is encrypted and securely stored</li>
                <li>Parents can request data deletion at any time</li>
                <li>Minimal data collection from students</li>
              </ul>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-450">
            <CardHeader>
              <CardTitle>Disclaimers and Limitations</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                The Platform is provided "as is" without warranties of any kind. We do not guarantee:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Uninterrupted or error-free service</li>
                <li>Accuracy of AI-generated content</li>
                <li>Availability of third-party content (YouTube, images)</li>
                <li>Specific educational outcomes or results</li>
              </ul>
              <p className="font-semibold text-foreground">
                Teachers should review all generated content before presenting to students.
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <CardHeader>
              <CardTitle>Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                To the maximum extent permitted by law, Silent Classrooms shall not be liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Indirect, incidental, or consequential damages</li>
                <li>Loss of data, profits, or educational opportunities</li>
                <li>Damages resulting from unauthorized access to accounts</li>
                <li>Third-party content or services</li>
              </ul>
              <p>
                Our total liability shall not exceed the amount paid by you (if any) in the 
                12 months preceding the claim.
              </p>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-550">
            <CardHeader>
              <CardTitle>Termination</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                We reserve the right to suspend or terminate accounts that violate these Terms. 
                You may also terminate your account at any time by contacting us.
              </p>
              <p>Upon termination:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your access to the Platform will be revoked</li>
                <li>Your data will be deleted according to our retention policy</li>
                <li>You must cease all use of the Platform</li>
              </ul>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-600">
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                We may update these Terms from time to time. We will notify you of significant 
                changes via email or platform notification. Continued use after changes constitutes 
                acceptance of the new Terms.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-650">
            <CardHeader>
              <CardTitle>Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                These Terms are governed by the laws of India. Any disputes shall be resolved 
                in the courts of Maharashtra, India.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="bg-primary/5 border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
            <CardHeader>
              <CardTitle>Questions About These Terms?</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>If you have questions about these Terms of Service, please contact us:</p>
              <div className="space-y-2">
                <p>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:shreyasmahajan0306@gmail.com" className="text-primary hover:underline">
                    shreyasmahajan0306@gmail.com
                  </a>
                </p>
                <p>
                  <strong>Phone:</strong>{" "}
                  <a href="tel:+917507075722" className="text-primary hover:underline">
                    +91 7507075722
                  </a>
                </p>
                <p>
                  <strong>WhatsApp:</strong>{" "}
                  <a 
                    href="https://wa.me/917507075722?text=Hi,%20I%20have%20a%20question%20about%20Terms%20of%20Service" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Chat with us
                  </a>
                </p>
              </div>
              <div className="pt-4">
                <Link href="/contact">
                  <Button>Contact Support</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
