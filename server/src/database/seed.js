import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { User } from '../modules/auth/user.model.js';
import { OfficeSettings } from '../modules/office/office.model.js';
import { Attendance } from '../modules/attendance/attendance.model.js';
import { Leave } from '../modules/leave/leave.model.js';

const seedData = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB for Seeding...');

    // Clear previous data
    await User.deleteMany({});
    await OfficeSettings.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});

    // 1. Create Default Office Settings
    const office = await OfficeSettings.create({
      officeName: 'Global Tech Park - HQ',
      latitude: 28.6139,
      longitude: 77.209,
      allowedRadiusMeters: 500,
      workStartTime: '09:00',
      workEndTime: '18:00',
      graceTimeMinutes: 15,
      overtimeRateMultiplier: 1.5,
      lateDeductionPerMinute: 5,
      earlyExitDeductionPerMinute: 5,
    });

    console.log('Office Settings Seeded.');

    // 2. Create Admin User
    const admin = await User.create({
      employeeId: 'ADM-001',
      name: 'System Admin',
      email: 'admin@company.com',
      password: 'adminpassword123',
      role: 'Admin',
      department: 'Management',
      designation: 'HR & Operations Director',
      baseSalary: 120000,
      hourlyRate: 750,
      phone: '+91 98765 43210',
      status: 'Active',
      isEmailVerified: true,
    });

    console.log('Admin User Seeded (admin@company.com / adminpassword123)');

    // 3. Create Sample Employees
    const emp1 = await User.create({
      employeeId: 'EMP-101',
      name: 'Rahul Sharma',
      email: 'rahul@company.com',
      password: 'employeepassword123',
      role: 'Employee',
      department: 'Engineering',
      designation: 'Senior Full Stack Developer',
      baseSalary: 75000,
      hourlyRate: 450,
      paidLeaveQuota: 15,
      phone: '+91 98111 22233',
      status: 'Active',
      isEmailVerified: true,
    });

    const emp2 = await User.create({
      employeeId: 'EMP-102',
      name: 'Priya Patel',
      email: 'priya@company.com',
      password: 'employeepassword123',
      role: 'Employee',
      department: 'Design',
      designation: 'UI/UX Product Designer',
      baseSalary: 60000,
      hourlyRate: 375,
      paidLeaveQuota: 18,
      phone: '+91 98222 33344',
      status: 'Active',
      isEmailVerified: true,
    });

    console.log('Sample Employees Seeded (rahul@company.com, priya@company.com / employeepassword123)');

    // 4. Create Sample Today Attendance Log
    const todayStr = new Date().toISOString().split('T')[0];
    await Attendance.create({
      employee: emp1._id,
      date: todayStr,
      punchIn: {
        timestamp: new Date(),
        latitude: 28.6140,
        longitude: 77.2091,
        distanceMeters: 45,
        isVerifiedGPS: true,
        status: 'On Time',
      },
      status: 'Present',
    });

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
