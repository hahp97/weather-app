import { getConfigs } from "@/utils/configs";
import { storeEmailPreview } from "@/utils/emailPreview";
import ejs from "ejs";
import fs from "fs";
import nodemailer from "nodemailer";
import path from "path";

const { emailHost, emailPort, emailUser, emailPass, emailFrom, nodeEnv } = getConfigs();

class EmailJob {
  private transporter!: nodemailer.Transporter;
  private templateDir: string;
  private isInitializing: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.templateDir = path.resolve(__dirname, "templates");

    // Initialize with a placeholder transporter
    this.transporter = {
      sendMail: async () => {
        console.error("Email transporter not yet initialized!");
        return { messageId: "error-not-initialized" };
      },
    } as any;

    // Always use Ethereal for easier OTP access
    this.isInitializing = true;
    this.initializationPromise = this.createTestTransporter()
      .then(() => {
        this.isInitializing = false;
      })
      .catch((error) => {
        console.error("Failed to create test transporter:", error);
        this.useConsoleTransport();
        this.isInitializing = false;
      });
  }

  // Create a test transporter using Ethereal
  private async createTestTransporter(): Promise<void> {
    try {
      // Generate test SMTP service account from ethereal.email
      const testAccount = await nodemailer.createTestAccount();

      // Create reusable transporter with test account
      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      console.log(`Created test email account: ${testAccount.user}`);
    } catch (error) {
      console.error("Failed to create test email account:", error);
      // Fallback to console logging
      this.useConsoleTransport();
    }
  }

  // Fallback to console logging when all else fails
  private useConsoleTransport() {
    console.warn("Using console transport for emails (messages will be logged but not sent)");
    this.transporter = {
      sendMail: async (mailOptions: any) => {
        console.log("============= EMAIL NOT SENT (DEBUG MODE) =============");
        console.log(`From: ${mailOptions.from}`);
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log("Content:", mailOptions.html.substring(0, 500) + "...");
        console.log("======================================================");
        return { messageId: "debug-mode-" + Date.now() };
      },
    } as any;
  }

  async perform(data: {
    email: string;
    subject: string;
    to: string;
    user?: any;
    otp?: string;
    code?: string;
    callbackUrl?: string;
  }) {
    // Wait for transporter initialization if it's in progress
    if (this.isInitializing && this.initializationPromise) {
      console.log("Waiting for email transporter to initialize...");
      await this.initializationPromise;
    }

    const { email: templateName, subject, to, ...templateData } = data;

    try {
      // Get template file
      const templatePath = path.join(this.templateDir, `${templateName}.ejs`);

      // Check if template exists
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Email template not found: ${templateName}`);
      }

      // Render the template
      const template = fs.readFileSync(templatePath, "utf-8");
      const html = ejs.render(template, templateData);

      // Send email
      const mailOptions = {
        from: emailFrom,
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent: ${info.messageId}`);

      // Always provide the preview URL for Ethereal emails
      if (info.messageId) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log(`Email preview URL: ${previewUrl}`);
          // Always store the preview URL for later retrieval
          storeEmailPreview(to, subject, previewUrl as string, info.messageId);
        }
      }

      return info;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
}

export default new EmailJob();
