import nodemailer from 'nodemailer';
import { config } from '../../config/index.js';

// Create Nodemailer Transporter
const createTransporter = () => {
  if (!config.smtp.user || !config.smtp.pass) {
    return null;
  }
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465, // true for 465, false for 587
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });
};

export const sendOTPEmail = async ({ to, name, otp }) => {
  const transporter = createTransporter();

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #4f46e5; margin: 0;">AttendancePro HRMS</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Email Verification Request</p>
      </div>
      <hr style="border: none; border-top: 1px solid #e2e8f0;" />
      <div style="padding: 20px 0;">
        <p style="color: #334155; font-size: 15px;">Hello <strong>${name}</strong>,</p>
        <p style="color: #334155; font-size: 14px; line-height: 1.5;">
          Thank you for registering your account on AttendancePro HRMS. Please use the following 6-digit One-Time Password (OTP) to verify your email address:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4f46e5; background-color: #f1f5f9; padding: 12px 24px; border-radius: 8px; border: 1px inline-block;">
            ${otp}
          </span>
        </div>
        <p style="color: #64748b; font-size: 13px;">This code is valid for 10 minutes. If you did not initiate this request, please ignore this email.</p>
      </div>
      <hr style="border: none; border-top: 1px solid #e2e8f0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 15px;">
        &copy; ${new Date().getFullYear()} AttendancePro Systems. All rights reserved.
      </p>
    </div>
  `;

  if (!transporter) {
    console.log(`=================================================`);
    console.log(`📧 [Nodemailer Simulation - SMTP Credentials Not Set in .env]`);
    console.log(`Recipient: ${to}`);
    console.log(`Verification OTP: ${otp}`);
    console.log(`=================================================`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject: `${otp} is your AttendancePro Verification Code`,
      html: htmlContent,
    });
    console.log(`[Nodemailer]: Verification email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error(`[Nodemailer Error]: Failed to send email to ${to}:`, error.message);
    return false;
  }
};

export const sendApprovalNotificationEmail = async ({ to, name, status }) => {
  const transporter = createTransporter();
  if (!transporter) return;

  const isApproved = status === 'Active';
  const subject = isApproved
    ? 'Account Approved - Welcome to AttendancePro'
    : 'Registration Status Update';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: ${isApproved ? '#10b981' : '#f43f5e'}; margin: 0;">
        ${isApproved ? 'Account Approved 🎉' : 'Registration Status Update'}
      </h2>
      <p style="color: #334155; font-size: 14px; margin-top: 15px;">Hello <strong>${name}</strong>,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.5;">
        ${
          isApproved
            ? 'Your employee account registration has been officially approved by the Admin! You can now sign in to your dashboard and record attendance.'
            : 'Your registration request has been reviewed by the Admin team and was not approved.'
        }
      </p>
      ${
        isApproved
          ? `<div style="margin-top: 20px;"><a href="${config.clientUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Sign In to Dashboard</a></div>`
          : ''
      }
    </div>
  `;

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject,
      html: htmlContent,
    });
  } catch (err) {
    console.error('[Nodemailer Error]:', err.message);
  }
};
