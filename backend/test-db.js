const mongoose = require('mongoose');
require('dotenv').config();

// Validate MONGODB_URI is set
if (!process.env.MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI environment variable is not set');
  console.error('   Please add MONGODB_URI to your .env file');
  process.exit(1);
}

const visaSchema = new mongoose.Schema({
  applicantName: String,
  country: String,
  visaType: String,
  customerAmount: Number,
  vendorCost: Number,
  margin: Number,
  createdAt: Date
});

const flightSchema = new mongoose.Schema({
  passengerName: String,
  airline: String,
  customerAmount: Number,
  vendorCost: Number,
  margin: Number,
  createdAt: Date
});

const Visa = mongoose.model('Visa', visaSchema);
const Flight = mongoose.model('Flight', flightSchema);

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'orbit_world_db'
    });
    
    const visaCount = await Visa.countDocuments();
    console.log('📊 Visa count:', visaCount);
    
    const flightCount = await Flight.countDocuments();
    console.log('📊 Flight count:', flightCount);
    
    const visas = await Visa.find().limit(2).lean();
    console.log('\n📋 Sample visas:', JSON.stringify(visas, null, 2));
    
    const visaStats = await Visa.aggregate([
      {
        $group: {
          _id: null,
          revenue: { $sum: '$customerAmount' },
          profit: { $sum: '$margin' },
          count: { $sum: 1 }
        }
      }
    ]);
    console.log('\n💰 Visa stats:', JSON.stringify(visaStats, null, 2));
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
