# EmailJS Setup Guide for Contact Form

## ⚠️ IMPORTANT: Fix Required

The contact form needs your **EmailJS Public Key** to work properly.

## Quick Fix (3 Steps)

### Step 1: Get Your Public Key

1. Go to https://dashboard.emailjs.com/admin/account
2. Find your **Public Key** (looks like: `user_xxxxxxxxxxxxx` or a random string)
3. Copy it

### Step 2: Update the Code

Open `app/contact/page.tsx` and replace line 26:

```typescript
// BEFORE (line 26):
emailjs.init("YOUR_PUBLIC_KEY") // TODO: Add your EmailJS public key here

// AFTER:
emailjs.init("your_actual_public_key_here") // Replace with your key from step 1
```

### Step 3: Verify Template IDs

Make sure your EmailJS templates match these IDs:

**In EmailJS Dashboard** → **Email Templates**:
- Admin template ID: `template_mgzb2bl`
- User auto-reply template ID: `template_4rz3bmg`

If your template IDs are different, update them in `app/contact/page.tsx` lines 34 and 45.

---

## Current Configuration

### Service & Templates:
- **Service ID**: `service_e25hvxf`
- **Admin Template**: `template_mgzb2bl` (sends to shreyasmahajan0306@gmail.com)
- **User Template**: `template_4rz3bmg` (auto-reply to user)
- **Public Key**: ⚠️ **NEEDS TO BE ADDED**

### Template Variables

Your EmailJS templates should use these variables:

#### Admin Template (`template_mgzb2bl`):
```
Subject: New Contact from {{name}}

From: {{name}}
Email: {{email}}
Subject: {{subject}}

Message:
{{message}}

---
Sent via Silent Classrooms Contact Form
```

#### User Auto-Reply Template (`template_4rz3bmg`):
```
Subject: Thank you for contacting Silent Classrooms

Hi {{to_name}},

Thank you for reaching out to Silent Classrooms!

We have received your message regarding: {{subject}}

Your message:
{{message}}

Our team will review your inquiry and get back to you within 24 hours at {{email}}.

Best regards,
Silent Classrooms Team

---
This is an automated response. Please do not reply to this email.
```

---

## Installation

If EmailJS package is not installed, run:

```bash
npm install @emailjs/browser --legacy-peer-deps
```

OR

```bash
yarn add @emailjs/browser
```

---

## Testing

1. **Add your public key** (Step 2 above)
2. **Restart dev server**: Stop and run `npm run dev` again
3. **Go to**: http://localhost:3001/contact
4. **Fill the form** with test data
5. **Click "Send Message"**
6. **Check**:
   - ✅ Success toast appears
   - ✅ Admin receives email at shreyasmahajan0306@gmail.com
   - ✅ User receives auto-reply

---

## Troubleshooting

### Error: "400 Bad Request"
**Cause**: Wrong public key or template IDs

**Fix**:
1. Double-check public key from EmailJS dashboard
2. Verify template IDs match exactly
3. Make sure service ID is correct

### Error: "Cannot read properties of undefined"
**Cause**: EmailJS not initialized properly

**Fix**:
1. Make sure public key is added
2. Check that `emailjs.init()` is called before sending
3. Verify EmailJS package is installed

### Emails not received
**Check**:
1. EmailJS dashboard → Check email quota (200/month free)
2. Spam folder in email
3. Template variables match the code
4. Service is active in EmailJS dashboard

### Browser Console Errors
Open DevTools (F12) → Console tab to see detailed errors

---

## Security & Limits

- ✅ Public key is safe in client-side code
- ✅ EmailJS handles rate limiting
- ⚠️ Free tier: 200 emails/month
- 💡 Consider adding reCAPTCHA for production

---

## Alternative Contact Methods

The contact page also includes:
- 📱 WhatsApp: +91 7507075722
- ☎️ Phone: +91 7507075722
- 📧 Direct email: shreyasmahajan0306@gmail.com

---

## Next Steps

1. ✅ Add your EmailJS public key (Step 2 above)
2. ✅ Verify template IDs match
3. ✅ Test the contact form
4. ✅ Check emails are received
5. 🎨 Customize email templates in EmailJS dashboard
6. 🔒 Add reCAPTCHA (optional, for production)

---

## Need Help?

- EmailJS Docs: https://www.emailjs.com/docs/
- EmailJS Dashboard: https://dashboard.emailjs.com/
- Support: Contact via WhatsApp (+91 7507075722)

