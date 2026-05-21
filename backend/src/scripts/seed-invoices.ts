import { User, Client, Invoice, Visa, Flight, Hotel, Insurance, InvoiceItem, InvoiceStatus } from '@/models/schemas';
import mongoose from 'mongoose';
import { config } from '@/config/env';

const seedInvoices = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database.mongoUri!);
    console.log('✅ MongoDB connected');

    // Get existing data
    const admin = await User.findOne({ email: 'admin@orbittravels.com' });
    const client = await Client.findOne({ name: 'ABC Travel Solutions' });
    const visa = await Visa.findOne({ applicantName: 'Sarah Johnson' });
    const flight = await Flight.findOne({ pnr: 'ABC123DEF' });

    if (!admin || !client || !visa || !flight) {
      console.error('❌ Required seed data not found. Run db:seed first.');
      process.exit(1);
    }

    console.log('📋 Creating sample invoice...');

    // Create invoice
    const currentYear = new Date().getFullYear().toString();
    const invoice = await Invoice.create({
      invoiceNumber: `INV-${Date.now()}`,
      clientId: client._id,
      createdBy: admin._id,
      status: InvoiceStatus.FINALIZED,
      vendorCost: 600,
      customerAmount: 900,
      margin: 300,
      gst: 162,
      totalAmount: 1062,
      financialYear: currentYear,
      description: 'Sample invoice with Visa and Flight bookings',
      finalizedAt: new Date(),
    });

    console.log('✅ Created invoice:', invoice.invoiceNumber);

    // Create invoice items
    const visaItem = await InvoiceItem.create({
      invoiceId: invoice._id,
      moduleType: 'VISA',
      moduleRecordId: visa._id,
      vendorCost: 100,
      customerAmount: 150,
      margin: 50,
      amount: 150,
    });

    const flightItem = await InvoiceItem.create({
      invoiceId: invoice._id,
      moduleType: 'FLIGHT',
      moduleRecordId: flight._id,
      vendorCost: 500,
      customerAmount: 750,
      margin: 250,
      amount: 750,
    });

    console.log('✅ Created invoice items (Visa + Flight)');

    // Update invoice with items
    await Invoice.updateOne(
      { _id: invoice._id },
      { items: [visaItem._id, flightItem._id] }
    );

    console.log('✅✅✅ Invoice seeding completed successfully!');
    console.log('\n📊 Sample Invoice Details:');
    console.log(`   Invoice #: ${invoice.invoiceNumber}`);
    console.log(`   Client: ${client.name}`);
    console.log(`   Status: FINALIZED`);
    console.log(`   Items: 2 (Visa, Flight)`);
    console.log(`   Total Amount: $${invoice.totalAmount}`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Invoice seeding failed:', error);
    process.exit(1);
  }
};

// Execute seeding
seedInvoices().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
