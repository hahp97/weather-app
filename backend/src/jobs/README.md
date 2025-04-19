# Email System

This directory contains the email job system for Weather Report. It handles:

- Email template rendering
- Sending emails using Nodemailer
- Managing email jobs through a simple queue system

## Structure

- `index.ts` - Job manager that handles registering and performing jobs
- `mailer/index.ts` - Email job handler that uses Nodemailer to send emails
- `mailer/templates/` - Directory containing EJS templates for emails

## Available Email Templates

1. `otp-verification-email.ejs` - Used to send OTP verification codes
2. `reset-password-email.ejs` - Used for password reset requests
3. `reset-password-successfully-email.ejs` - Notification when password is reset
4. `new-user-credential-email.ejs` - Sent to new users with their credentials

## How to Use

### Sending an Email

```typescript
import jobs from "@/jobs";

// Send an OTP email
jobs.perform(
  { id: "email-job" },
  {
    email: "otp-verification-email", // template name
    subject: "Your Verification Code",
    to: "user@example.com",
    otp: "123456",
  }
);

// Send a password reset email
jobs.perform(
  { id: "email-job" },
  {
    email: "reset-password-email",
    subject: "Reset Your Password",
    to: "user@example.com",
    user: userObject, // contains user info like name, email
    code: resetCode,
    callbackUrl: "https://example.com/reset-password",
  }
);
```

### Creating a New Template

1. Create a new EJS file in `mailer/templates/`
2. Use variables passed to the template (e.g., `user`, `otp`, `code`, `callbackUrl`)
3. Use the template by specifying its name (without .ejs) in the `email` field

## Configuration

Email settings are configured through environment variables:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@weatherreport.com
```

For Gmail, you'll need to use an App Password. [Learn more](https://support.google.com/accounts/answer/185833?hl=en)
