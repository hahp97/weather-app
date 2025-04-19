import { getConfigs } from "@/utils/configs";
import ejs from "ejs";
import fs from "fs";
import nodemailer from "nodemailer";
import path from "path";

const { emailHost, emailPort, emailUser, emailPass, emailFrom } = getConfigs();

class EmailJob {
  private transporter: nodemailer.Transporter;
  private templateDir: string;

  constructor() {
    // Create nodemailer transporter
    this.transporter = nodemailer.createTransport({
      service: emailHost === "smtp.gmail.com" ? "gmail" : undefined,
      host: emailHost,
      port: Number(emailPort) || 587,
      secure: Number(emailPort) === 465, // true for 465, false for other ports
      auth: {
        user: emailUser || "",
        pass: emailPass || "",
      },
    } as nodemailer.TransportOptions);

    this.templateDir = path.resolve(__dirname, "templates");
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
      return info;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
}

export default new EmailJob();
