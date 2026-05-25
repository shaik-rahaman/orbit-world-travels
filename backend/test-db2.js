const mongoose = require('mongoose');
require('dotenv').config();

// Validate MONGODB_URI is set
if (!process.env.MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI environment variable is not set');
  console.error('   Please add MONGODB_URI to your .env file');
  process.exit(1);
}

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: String,
  status: String,
  totalCustomerAmount: Number,
  totalVendorCost: Number,
  totalMargin: Number,
  createdAt: Date
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'orbit_world_db'
    });
    
    const invoiceCount = await Invoice.countDocuments();
    console.log('📊 Invoice count:', invoiceCount);
    
    const invoices = await Invoice.find().limit(3).lean();
    console.log('\n📋 Sample invoices:');
    invoices.forEach(inv => {
      console.log(`  - ${inv.invoiceNumber}: ${inv.totalCustomerAmount} (status: ${inv.status})`);
    });
    
    const stats = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          revenue: { $sum: '$totalCustomerAmount' },
          profit: { $sum: '$totalMargin' },
          count: { $sum: 1 }
        }
      }
    ]);
    console.log('\n💰 Invoice stats:', JSON.stringify(stats, null, 2));
    
    // Check all collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📦 Collections in database:', collections.map(c => c.name));
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
