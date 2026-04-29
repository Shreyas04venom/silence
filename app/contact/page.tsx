"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Hand, ArrowLeft, Mail, Phone, MapPin, MessageCircle, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import emailjs from '@emailjs/browser'

export default function ContactPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init("template_mgzb2bl") // Your public key
  }, [])

  const sendEmail = async (data: typeof formData) => {
    try {
      // Send to ADMIN
      await emailjs.send(
        "service_e25hvxf",
        "contact_to_admin",
        {
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
        }
      )

      // Auto reply to USER
      await emailjs.send(
        "service_e25hvxf",
        "auto_reply_user",
        {
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
        }
      )

      return true
    } catch (error) {
      console.error("EmailJS Error:", error)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const success = await sendEmail(formData)
      
      if (success) {
        toast({
          title: "Message Sent Successfully!",
          description: "We'll get back to you within 24 hours. Check your email for confirmation.",
        })
        setFormData({ name: "", email: "", subject: "", message: "" })
      } else {
        toast({
          title: "Failed to Send Message",
          description: "Please try again or contact us via WhatsApp.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

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

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground">
            We'd love to hear from you. Get in touch with our team.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Phone className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Phone</CardTitle>
                <CardDescription>Mon-Fri from 9am to 6pm</CardDescription>
              </CardHeader>
              <CardContent>
                <a href="tel:+917507075722" className="text-lg font-semibold hover:text-primary transition-colors">
                  +91 7507075722
                </a>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <MessageCircle className="w-8 h-8 text-primary mb-2" />
                <CardTitle>WhatsApp</CardTitle>
                <CardDescription>Quick support via WhatsApp</CardDescription>
              </CardHeader>
              <CardContent>
                <a 
                  href="https://wa.me/917507075722?text=Hi,%20I%20want%20to%20know%20more%20about%20Silent%20Classrooms" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat on WhatsApp
                  </Button>
                </a>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Mail className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Email</CardTitle>
                <CardDescription>We'll respond within 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <a href="mailto:shreyasmahajan0306@gmail.com" className="text-lg font-semibold hover:text-primary transition-colors break-all">
                  shreyasmahajan0306@gmail.com
                </a>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <MapPin className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Office</CardTitle>
                <CardDescription>Visit us in person</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Maharashtra, India<br />
                  Education Technology Hub
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 animate-in fade-in slide-in-from-right-4 duration-700">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="What is this regarding?"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Contact Options */}
            <div className="mt-6 p-6 bg-primary/5 rounded-lg border border-primary/20">
              <h3 className="font-semibold mb-3">Need Immediate Assistance?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                For urgent matters, reach out directly via WhatsApp or phone for faster response.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a 
                  href="https://wa.me/917507075722?text=Hi,%20I%20need%20urgent%20assistance%20with%20Silent%20Classrooms" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp Now
                  </Button>
                </a>
                <a href="tel:+917507075722" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
