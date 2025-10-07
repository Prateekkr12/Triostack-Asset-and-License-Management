import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import { UserRole } from '../types';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/triostack-asset-manager';

const addAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Admin credentials to add (customize these before running)
    const newAdmin = {
      name: process.env.ADMIN_NAME || 'Admin User',
      email: process.env.ADMIN_EMAIL || 'newadmin@triostack.com',
      password: process.env.ADMIN_PASSWORD || 'changeThisPassword123!', // Will be hashed by the pre-save middleware
      role: UserRole.ADMIN,
      department: process.env.ADMIN_DEPARTMENT || 'IT',
      isActive: true
    };

    // Check if user already exists
    const existingUser = await User.findOne({ email: newAdmin.email });
    if (existingUser) {
      console.log(`⚠️  User with email ${newAdmin.email} already exists`);
      console.log(`   Current role: ${existingUser.role}`);
      
      // Update to admin and password
      existingUser.role = UserRole.ADMIN;
      existingUser.password = newAdmin.password; // This will be hashed by pre-save middleware
      await existingUser.save();
      console.log(`✅ Updated ${newAdmin.email} to ADMIN role with new password`);
    } else {
      // Create new admin user
      const adminUser = new User(newAdmin);
      await adminUser.save();
      console.log('✅ New admin user created successfully!');
      console.log(`   Email: ${newAdmin.email}`);
      console.log(`   Password: ${newAdmin.password}`);
      console.log(`   Role: ${newAdmin.role}`);
    }

    await mongoose.disconnect();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error adding admin user:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

addAdminUser();

