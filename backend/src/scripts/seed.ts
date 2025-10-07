import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User';
import { UserRole } from '../types';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/triostack-asset-manager';

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@triostack.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      await mongoose.disconnect();
      return;
    }

    // Create default admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@triostack.com',
      password: 'admin123', // Will be hashed by the pre-save middleware
      role: UserRole.ADMIN,
      department: 'IT',
      isActive: true
    });

    await adminUser.save();
    console.log('Default admin user created successfully!');
    console.log('Email: admin@triostack.com');
    console.log('Password: admin123');

    // Create some sample users for testing
    const sampleUsers = [
      {
        name: 'John Doe',
        email: 'john@triostack.com',
        password: 'password123',
        role: UserRole.EMPLOYEE,
        department: 'Engineering'
      },
      {
        name: 'Jane Smith',
        email: 'jane@triostack.com',
        password: 'password123',
        role: UserRole.HR,
        department: 'Human Resources'
      }
    ];

    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`Created user: ${userData.email}`);
      }
    }

    console.log('Database seeding completed!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding database:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDatabase();
