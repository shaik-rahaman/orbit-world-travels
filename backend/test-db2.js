const mongoose = require('mongoose');

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
    await mongoose.connect('mongodb+srv://orbitworlddocs_db_user:lsP6rD2ciGdLD7Pe@cluster0.ivxq3sa.mongodb.net/?appName=Cluster0', {
      dbName: 'orbit_world_db'
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
