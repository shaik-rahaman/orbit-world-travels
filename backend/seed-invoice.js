const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

// Minimal schemas for demo purposes
const userSchema = new mongoose.Schema({
  email: String,
  firstName: String,
  lastName: String,
  role: String,
});

const clientSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  city: String,
  country: String,
  createdAt: { type: Date, default: Date.now },
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: String,
  clientId: mongoose.Schema.Types.ObjectId,
  status: String,
  vendorCost: Number,
  customerAmount: Number,
  margin: Number,
  gst: Number,
  totalAmount: Number,
  financialYear: String,
  description: String,
  items: Array,
  documents: Array,
  createdBy: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

async function seedSampleInvoice() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not set in .env file');
      process.exit(1);
    }

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, { dbName: 'orbit_world_db' });
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', userSchema);
    const Client = mongoose.model('Client', clientSchema);
    const Invoice = mongoose.model('Invoice', invoiceSchema);

    // Get or create a user (admin user who will create the invoice)
    let user = await User.findOne({ role: 'ADMIN' });
    if (!user) {
      console.log('📝 Creating admin user...');
      user = await User.create({
        email: 'admin@orbitworld.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
      });
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️  Admin user found');
    }

    // Get or create a client
    let client = await Client.findOne({ name: 'John Doe Travel Services' });
    if (!client) {
      console.log('📝 Creating sample client...');
      client = await Client.create({
        name: 'John Doe Travel Services',
        email: 'john@example.com',
        phone: '+1-555-0123',
        address: '123 Travel Street',
        city: 'New York',
        country: 'United States',
      });
      console.log('✅ Sample client created');
    } else {
      console.log('ℹ️  Sample client found');
    }

    // Create a sample invoice
    const invoiceNumber = `INV-${Date.now()}`;
    const vendorCost = 5000;
    const customerAmount = 7500;
    const margin = customerAmount - vendorCost;
    const gst = Math.round(customerAmount * 0.18);
    const totalAmount = customerAmount + gst;

    const invoice = await Invoice.create({
      invoiceNumber,
      clientId: client._id,
      status: 'DRAFT',
      vendorCost,
      customerAmount,
      margin,
      gst,
      totalAmount,
      financialYear: new Date().getFullYear().toString(),
      description: 'Complete travel package including visa, flight, hotel, and insurance',
      items: [],
      createdBy: user._id,
    });

    console.log('\n✅ Sample Invoice Created Successfully!\n');
    console.log('📋 Invoice Details:');
    console.log(`   Invoice Number: ${invoice.invoiceNumber}`);
    console.log(`   Client: ${client.name}`);
    console.log(`   Vendor Cost: ₹${vendorCost}`);
    console.log(`   Customer Amount: ₹${customerAmount}`);
    console.log(`   Margin: ₹${margin} (${((margin / vendorCost) * 100).toFixed(2)}%)`);
    console.log(`   GST (18%): ₹${gst}`);
    console.log(`   Total Amount: ₹${totalAmount}`);
    console.log(`   Status: ${invoice.status}`);
    console.log(`   Created: ${invoice.createdAt}`);

    console.log('\n🎉 You can now see the invoice in the Invoice page!');

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedSampleInvoice();
