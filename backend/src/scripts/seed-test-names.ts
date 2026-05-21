import { User, Client, Visa, Flight, Hotel, Insurance, Gender } from '@/models/schemas';
import mongoose from 'mongoose';
import { config } from '@/config/env';

const seedTestNames = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database.mongoUri!);
    console.log('✅ MongoDB connected');

    // Get existing client
    const client = await Client.findOne({ name: 'ABC Travel Solutions' });
    if (!client) {
      console.error('❌ Client not found');
      process.exit(1);
    }

    console.log('📋 Adding test records with searchable names...');

    // Add Shaik Visa
    await Visa.create({
      applicantName: 'Shaik Ahmed',
      applicantEmail: 'shaik@example.com',
      gender: Gender.MALE,
      passportNumber: 'IND987654321',
      visaType: 'Business',
      country: 'USA',
      status: 'APPROVED',
      applicationDate: new Date('2024-02-01'),
      cost: 150,
      sellingPrice: 250,
      margin: 100,
      clientId: client._id,
    });

    // Add John Flight
    await Flight.create({
      pnr: 'DEF456GHI',
      passengerName: 'John Smith',
      passengerEmail: 'john.smith@example.com',
      airline: 'Lufthansa',
      flightNumber: 'LH400',
      sector: 'NYC-FRA',
      departureDate: new Date('2024-03-10'),
      returnDate: new Date('2024-03-17'),
      seatClass: 'BUSINESS',
      cost: 800,
      sellingPrice: 1200,
      margin: 400,
      clientId: client._id,
    });

    // Add Alex Hotel
    await Hotel.create({
      guestName: 'Alex Johnson',
      guestEmail: 'alex@example.com',
      hotelName: 'Marriott Downtown',
      city: 'Paris',
      roomType: 'Suite',
      checkInDate: new Date('2024-03-10'),
      checkOutDate: new Date('2024-03-17'),
      noOfNights: 7,
      cost: 700,
      sellingPrice: 1050,
      margin: 350,
      clientId: client._id,
    });

    console.log('✅✅✅ Test data added successfully!');
    console.log('\n🔍 You can now search:');
    console.log('   - "shaik" → finds Shaik Ahmed (Visa)');
    console.log('   - "john" → finds John Smith (Flight)');
    console.log('   - "alex" → finds Alex Johnson (Hotel)');
    console.log('   - "sarah" → finds Sarah Johnson (Visa - from original seed)');
    console.log('   - "mark" → finds Mark Wilson (Flight - from original seed)');
    console.log('   - "emma" → finds Emma Brown (Hotel - from original seed)');

    // Disconnect from MongoDB
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Execute seeding
seedTestNames().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
