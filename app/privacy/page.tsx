"use client"
import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Hand, ArrowLeft, Shield, Lock, Eye, Database, UserCheck, FileText } from "lucide-react"

export default function PrivacyPolicyPage() {
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
          <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                Silent Classrooms ("we," "our," or "us") is committed to protecting the privacy of our users, 
                especially students. This Privacy Policy explains how we collect, use, disclose, and safeguard 
                your information when you use our educational platform.
              </p>
              <p>
                We take special care to comply with children's privacy laws and regulations, including the 
                Children's Online Privacy Protection Act (COPPA) and applicable Indian data protection laws.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Teacher Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Name and email address</li>
                  <li>School or institution name</li>
                  <li>Subject and grade level taught</li>
                  <li>Lesson content and materials created</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Student Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>First name and student ID (no personal identifiers)</li>
                  <li>Class and grade level</li>
                  <li>Learning progress and engagement metrics</li>
                  <li>Concepts marked as understood</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Usage Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Device type and browser information</li>
                  <li>IP address and general location (city/state level)</li>
                  <li>Pages visited and features used</li>
                  <li>Time spent on lessons and content</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>We use the collected information to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide and maintain our educational services</li>
                <li>Generate visual content for lessons</li>
                <li>Track student learning progress and engagement</li>
                <li>Improve our platform and develop new features</li>
                <li>Communicate with teachers about their accounts</li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
              <p className="font-semibold text-foreground">
                We do NOT sell, rent, or share student data with third parties for marketing purposes.
              </p>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-250">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>We implement industry-standard security measures to protect your data:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication with Firebase</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and user permissions</li>
                <li>Secure cloud infrastructure (Google Cloud Platform)</li>
              </ul>
              <p>
                While we strive to protect your information, no method of transmission over the internet 
                is 100% secure. We cannot guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          {/* Student Privacy */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Student Privacy Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>We take extra precautions to protect student privacy:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Students are identified by non-personal IDs, not full names</li>
                <li>No email addresses or contact information collected from students</li>
                <li>Student data is only accessible to their assigned teachers</li>
                <li>Parents can request to view or delete their child's data</li>
                <li>No behavioral advertising or tracking of students</li>
                <li>Compliance with COPPA and educational privacy laws</li>
              </ul>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-350">
            <CardHeader>
              <CardTitle>Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>We use the following third-party services:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Firebase:</strong> Authentication and database services</li>
                <li><strong>Google AI:</strong> Content generation and image creation</li>
                <li><strong>YouTube API:</strong> Educational video content</li>
                <li><strong>Unsplash/Pixabay:</strong> Educational images</li>
              </ul>
              <p>
                These services have their own privacy policies. We ensure they comply with educational 
                privacy standards before integration.
              </p>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
            <CardHeader>
              <CardTitle>Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your account and data</li>
                <li>Export your data in a portable format</li>
                <li>Opt-out of non-essential communications</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p>
                To exercise these rights, please contact us at{" "}
                <a href="mailto:shreyasmahajan0306@gmail.com" className="text-primary hover:underline">
                  shreyasmahajan0306@gmail.com
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-450">
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                We retain your information only as long as necessary to provide our services and comply 
                with legal obligations:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Active accounts: Data retained while account is active</li>
                <li>Inactive accounts: Data deleted after 2 years of inactivity</li>
                <li>Student data: Deleted upon teacher request or graduation</li>
                <li>Analytics data: Anonymized after 1 year</li>
              </ul>
            </CardContent>
          </Card>

          {/* Changes to Policy */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <CardHeader>
              <CardTitle>Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes 
                by posting the new policy on this page and updating the "Last updated" date.
              </p>
              <p>
                For significant changes, we will provide prominent notice or seek consent as required by law.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="bg-primary/5 border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-550">
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>If you have questions about this Privacy Policy, please contact us:</p>
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
                    href="https://wa.me/917507075722?text=Hi,%20I%20have%20a%20question%20about%20privacy" 
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
