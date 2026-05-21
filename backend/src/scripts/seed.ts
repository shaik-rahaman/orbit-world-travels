import { User, Client, Invoice, Visa, Flight, Hotel, Insurance, UserRole, Gender } from '@/models/schemas';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { config } from '@/config/env';

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database.mongoUri!);
    console.log('✅ MongoDB connected');

    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Client.deleteMany({});
    await Visa.deleteMany({});
    await Flight.deleteMany({});
    await Hotel.deleteMany({});
    await Insurance.deleteMany({});
    await Invoice.deleteMany({});

    console.log('✅ Cleared existing data');

    // Create users
    const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);
    const hashedStaffPassword = await bcrypt.hash('Staff@123', 10);

    const adminUser = await User.create({
      email: 'admin@orbittravels.com',
      password: hashedAdminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isActive: true,
    });

    const staffUser = await User.create({
      email: 'john@orbittravels.com',
      password: hashedStaffPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.STAFF,
      isActive: true,
    });

    console.log('✅ Created users');

    // Create clients
    const client1 = await Client.create({
      name: 'ABC Travel Solutions',
      email: 'contact@abctravel.com',
      phone: '+1-800-123-4567',
      city: 'New York',
      country: 'USA',
    });

    const client2 = await Client.create({
      name: 'XYZ Corporate Travel',
      email: 'bookings@xyzcorp.com',
      phone: '+44-20-7123-4567',
      city: 'London',
      country: 'UK',
    });

    console.log('✅ Created clients');

    // Create sample visas
    await Visa.create({
      applicantName: 'Sarah Johnson',
      applicantEmail: 'sarah@example.com',
      gender: Gender.FEMALE,
      passportNumber: 'US123456789',
      visaType: 'Tourist',
      country: 'India',
      status: 'PENDING',
      applicationDate: new Date('2024-01-15'),
      cost: 100,
      sellingPrice: 150,
      margin: 50,
      clientId: client1._id,
    });

    await Flight.create({
      pnr: 'ABC123DEF',
      passengerName: 'Mark Wilson',
      passengerEmail: 'mark@example.com',
      airline: 'Emirates',
      flightNumber: 'EK201',
      sector: 'NYC-DXB',
      departureDate: new Date('2024-02-15'),
      returnDate: new Date('2024-02-22'),
      seatClass: 'ECONOMY',
      cost: 500,
      sellingPrice: 750,
      margin: 250,
      clientId: client1._id,
    });

    await Hotel.create({
      guestName: 'Emma Brown',
      guestEmail: 'emma@example.com',
      hotelName: 'Grand Plaza Hotel',
      city: 'Dubai',
      roomType: 'Deluxe',
      checkInDate: new Date('2024-02-15'),
      checkOutDate: new Date('2024-02-22'),
      noOfNights: 7,
      cost: 600,
      sellingPrice: 900,
      margin: 300,
      clientId: client2._id,
    });

    await Insurance.create({
      policyNumber: 'INS-2024-001',
      holderName: 'Michael Davis',
      holderEmail: 'michael@example.com',
      insuranceType: 'Travel',
      coverageAmount: 100000,
      duration: 14,
      cost: 50,
      sellingPrice: 75,
      margin: 25,
      clientId: client2._id,
    });

    console.log('✅ Created sample bookings');

    console.log('✅✅✅ Database seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Admin: admin@orbittravels.com / Admin@123');
    console.log('   Staff: john@orbittravels.com / Staff@123');

    // Disconnect from MongoDB
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Execute seeding
seedDatabase().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
