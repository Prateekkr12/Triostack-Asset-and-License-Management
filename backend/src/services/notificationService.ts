import nodemailer from 'nodemailer';
import Asset from '../models/Asset';
import User from '../models/User';
import { EmailNotification } from '../types';

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Email templates
const getEmailTemplates = () => ({
  assetExpiry: {
    subject: 'Asset Expiry Alert - {assetName}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Asset Expiry Alert</h2>
        <p>Dear {userName},</p>
        <p>The following asset is expiring soon:</p>
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #dc2626; margin-top: 0;">{assetName}</h3>
          <p><strong>Type:</strong> {assetType}</p>
          <p><strong>Category:</strong> {category}</p>
          <p><strong>Serial Number:</strong> {serialNumber}</p>
          <p><strong>Expiry Date:</strong> {expiryDate}</p>
          <p><strong>Days Until Expiry:</strong> {daysUntilExpiry}</p>
          {assignedTo && <p><strong>Assigned To:</strong> {assignedTo}</p>}
        </div>
        <p>Please take necessary action to renew or replace this asset.</p>
        <p>Best regards,<br>Triostack Asset Management System</p>
      </div>
    `,
    text: `
      Asset Expiry Alert
      
      Dear {userName},
      
      The following asset is expiring soon:
      
      Asset: {assetName}
      Type: {assetType}
      Category: {category}
      Serial Number: {serialNumber}
      Expiry Date: {expiryDate}
      Days Until Expiry: {daysUntilExpiry}
      {assignedTo}
      
      Please take necessary action to renew or replace this asset.
      
      Best regards,
      Triostack Asset Management System
    `
  },
  
  assetExpired: {
    subject: 'Asset Expired - {assetName}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Asset Expired</h2>
        <p>Dear {userName},</p>
        <p>The following asset has expired:</p>
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #dc2626; margin-top: 0;">{assetName}</h3>
          <p><strong>Type:</strong> {assetType}</p>
          <p><strong>Category:</strong> {category}</p>
          <p><strong>Serial Number:</strong> {serialNumber}</p>
          <p><strong>Expiry Date:</strong> {expiryDate}</p>
          {assignedTo && <p><strong>Assigned To:</strong> {assignedTo}</p>}
        </div>
        <p><strong>Immediate action is required!</strong> Please renew or replace this asset immediately.</p>
        <p>Best regards,<br>Triostack Asset Management System</p>
      </div>
    `,
    text: `
      Asset Expired
      
      Dear {userName},
      
      The following asset has expired:
      
      Asset: {assetName}
      Type: {assetType}
      Category: {category}
      Serial Number: {serialNumber}
      Expiry Date: {expiryDate}
      {assignedTo}
      
      IMMEDIATE ACTION IS REQUIRED! Please renew or replace this asset immediately.
      
      Best regards,
      Triostack Asset Management System
    `
  }
});

/**
 * Send email notification
 */
export const sendEmailNotification = async (notification: EmailNotification): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: notification.to,
      subject: notification.subject,
      html: notification.template,
      text: notification.template.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${notification.to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Get expiring assets and send notifications
 */
export const sendExpiryNotifications = async (days: number = 30): Promise<void> => {
  try {
    const expiringAssets = await Asset.findExpiringAssets(days);
    
    // Get all admin users for notifications
    const adminUsers = await User.find({ 
      role: 'admin', 
      isActive: true 
    }).select('email name');

    const templates = getEmailTemplates();
    
    for (const asset of expiringAssets) {
      const daysUntilExpiry = asset.expiryDate ? 
        Math.ceil((asset.expiryDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : null;
      const isExpired = daysUntilExpiry && daysUntilExpiry <= 0;
      
      // Send notifications to all admin users
      for (const admin of adminUsers) {
        const template = isExpired ? templates.assetExpired : templates.assetExpiry;
        
        const emailData = {
          userName: admin.name,
          assetName: asset.name,
          assetType: asset.type,
          category: asset.category,
          serialNumber: asset.serialNumber || 'N/A',
          expiryDate: asset.expiryDate?.toLocaleDateString() || 'N/A',
          daysUntilExpiry: daysUntilExpiry || 0,
          assignedTo: (asset.assignedTo as any)?.name || 'Unassigned'
        };

        // Replace placeholders in template
        let htmlTemplate = template.html;
        let subject = template.subject;
        
        Object.entries(emailData).forEach(([key, value]) => {
          const placeholder = `{${key}}`;
          htmlTemplate = htmlTemplate.replace(new RegExp(placeholder, 'g'), String(value));
          subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
        });

        await sendEmailNotification({
          to: admin.email,
          subject,
          template: htmlTemplate,
          data: emailData
        });
      }
    }

    console.log(`Sent expiry notifications for ${expiringAssets.length} assets`);
  } catch (error) {
    console.error('Error sending expiry notifications:', error);
    throw error;
  }
};

/**
 * Send notification to specific user about asset assignment
 */
export const sendAssetAssignmentNotification = async (
  userEmail: string,
  userName: string,
  assetName: string,
  assetType: string,
  assignedBy: string
): Promise<void> => {
  try {
    const subject = `Asset Assigned - ${assetName}`;
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Asset Assigned</h2>
        <p>Dear ${userName},</p>
        <p>You have been assigned a new asset:</p>
        <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2563eb; margin-top: 0;">${assetName}</h3>
          <p><strong>Type:</strong> ${assetType}</p>
          <p><strong>Assigned By:</strong> ${assignedBy}</p>
          <p><strong>Assignment Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>Please log in to your account to view more details.</p>
        <p>Best regards,<br>Triostack Asset Management System</p>
      </div>
    `;

    await sendEmailNotification({
      to: userEmail,
      subject,
      template: 'custom',
      data: { userName, assetName, assetType, assignedBy }
    });
  } catch (error) {
    console.error('Error sending assignment notification:', error);
    throw error;
  }
};

/**
 * Send notification when asset is returned
 */
export const sendAssetReturnNotification = async (
  userEmail: string,
  userName: string,
  assetName: string,
  assetType: string
): Promise<void> => {
  try {
    const subject = `Asset Returned - ${assetName}`;
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Asset Returned</h2>
        <p>Dear ${userName},</p>
        <p>The following asset has been returned:</p>
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #059669; margin-top: 0;">${assetName}</h3>
          <p><strong>Type:</strong> ${assetType}</p>
          <p><strong>Return Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>Thank you for returning the asset on time.</p>
        <p>Best regards,<br>Triostack Asset Management System</p>
      </div>
    `;

    await sendEmailNotification({
      to: userEmail,
      subject,
      template: 'custom',
      data: { userName, assetName, assetType }
    });
  } catch (error) {
    console.error('Error sending return notification:', error);
    throw error;
  }
};
