const mongoose = require('mongoose');

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
    await mongoose.connect('mongodb+srv://orbitworlddocs_db_user:lsP6rD2ciGdLD7Pe@cluster0.ivxq3sa.mongodb.net/?appName=Cluster0', {
      dbName: 'orbit_world_db'
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
