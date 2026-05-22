const mongoose = require('mongoose');

async function test() {
  try {
    // Try connecting without specifying dbName
    const conn = await mongoose.connect('mongodb+srv://orbitworlddocs_db_user:lsP6rD2ciGdLD7Pe@cluster0.ivxq3sa.mongodb.net/orbit_world_db');
    
    console.log('📍 Connected to database:', mongoose.connection.name);
    console.log('📍 URI:', mongoose.connection.getClient().topology?.seedlist);
    
    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📦 Collections:', collections.map(c => c.name));
    
    // Check each collection
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`  - ${col.name}: ${count} documents`);
    }
    
    // Try querying visas
    const visas = await db.collection('visas').find({}).toArray();
    console.log('\n📋 Visas:', visas.length, 'records');
    if (visas.length > 0) {
      console.log(JSON.stringify(visas[0], null, 2));
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

test();
