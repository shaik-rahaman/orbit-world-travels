const mongoose = require('mongoose');

async function test() {
  try {
    const conn = await mongoose.connect('mongodb+srv://orbitworlddocs_db_user:lsP6rD2ciGdLD7Pe@cluster0.ivxq3sa.mongodb.net/?appName=Cluster0', {
      dbName: 'orbit_world_db'
    });
    
    const db = mongoose.connection.db;
    
    // Query visas directly
    const visaCount = await db.collection('visas').countDocuments();
    console.log('📊 Visas count:', visaCount);
    
    const visaSample = await db.collection('visas').findOne();
    console.log('📋 Visa sample:', JSON.stringify(visaSample, null, 2));
    
    // Query flights directly
    const flightCount = await db.collection('flights').countDocuments();
    console.log('\n📊 Flights count:', flightCount);
    
    const flightSample = await db.collection('flights').findOne();
    console.log('📋 Flight sample:', JSON.stringify(flightSample, null, 2));
    
    // Query invoices directly
    const invoiceCount = await db.collection('invoices').countDocuments();
    console.log('\n📊 Invoices count:', invoiceCount);
    
    const invoiceSample = await db.collection('invoices').findOne();
    console.log('📋 Invoice sample:', JSON.stringify(invoiceSample, null, 2));
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
