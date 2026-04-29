# EmailJS Setup Guide for Contact Form

## Current Status
The contact form in `/app/contact/page.tsx` is configured to use EmailJS for sending emails.

## Installation

Run one of these commands to install EmailJS:

```bash
npm install @emailjs/browser --legacy-peer-deps
```

OR

```bash
yarn add @emailjs/browser
```

## EmailJS Configuration

### Your Current Setup:
- **Service ID**: `service_e25hvxf`
- **Template IDs**:
  - Admin notification: `contact_to_admin`
  - User auto-reply: `auto_reply_user`
- **Public Key**: `template_mgzb2bl`

### How It Works:

1. **User submits the contact form**
2. **Two emails are sent**:
   - One to admin (shreyasmahajan0306@gmail.com) with the user's message
   - One auto-reply to the user confirming their message was received

### Email Templates

#### Admin Email Template (`contact_to_admin`):
```
Subject: New Contact Form Submission from {{name}}

From: {{name}}
Email: {{email}}
Subject: {{subject}}

Message:
{{message}}
```

#### User Auto-Reply Template (`auto_reply_user`):
```
Subject: We received your message - Silent Classrooms

Hi {{name}},

Thank you for contacting Silent Classrooms!

We have received your message regarding: {{subject}}

Our team will review your inquiry and get back to you within 24 hours at {{email}}.

Your message:
{{message}}

Best regards,
Silent Classrooms Team
```

## Testing the Contact Form

1. Make sure EmailJS package is installed
2. Go to http://localhost:3001/contact
3. Fill out the form with:
   - Name
   - Email
   - Subject
   - Message
4. Click "Send Message"
5. Check:
   - Toast notification appears
   - Admin receives email at shreyasmahajan0306@gmail.com
   - User receives auto-reply at their email

## Troubleshooting

### If emails are not sending:

1. **Check EmailJS Dashboard**:
   - Login to https://dashboard.emailjs.com/
   - Verify service is active
   - Check email quota (free tier: 200 emails/month)

2. **Verify Template IDs**:
   - Make sure template IDs match in EmailJS dashboard
   - Check template variables are correct

3. **Check Browser Console**:
   - Open DevTools (F12)
   - Look for EmailJS errors
   - Verify API calls are being made

4. **Test EmailJS Connection**:
   ```javascript
   // In browser console
   emailjs.send('service_e25hvxf', 'contact_to_admin', {
     name: 'Test',
     email: 'test@example.com',
     subject: 'Test',
     message: 'Test message'
   })
   ```

## Security Notes

- Public key is safe to expose in client-side code
- EmailJS handles rate limiting automatically
- Consider adding reCAPTCHA for production to prevent spam
- Email quota: 200 emails/month on free tier

## Alternative: Backend Email Service

If you prefer server-side email sending, consider:
- Nodemailer with Gmail SMTP
- SendGrid API
- AWS SES
- Resend

## Current Implementation

The contact form (`app/contact/page.tsx`) includes:
- ✅ Form validation
- ✅ Loading states
- ✅ Success/error toast notifications
- ✅ Form reset after successful submission
- ✅ Dual email sending (admin + user)
- ✅ WhatsApp integration as backup
- ✅ Phone contact option
- ✅ Responsive design

## Next Steps

1. Install EmailJS package (if not already done)
2. Test the contact form
3. Verify emails are received
4. Customize email templates in EmailJS dashboard
5. Consider adding reCAPTCHA for spam protection
