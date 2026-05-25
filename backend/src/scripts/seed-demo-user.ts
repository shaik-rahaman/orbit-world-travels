import { User, UserRole } from '@/models/schemas';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { config } from '@/config/env';

/**
 * Seed script to create or update demo user
 * Usage: npx ts-node src/scripts/seed-demo-user.ts
 */
const seedDemoUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database.mongoUri!);
    console.log('✅ MongoDB connected');

    console.log('🌱 Setting up demo user...');

    const DEMO_EMAIL = 'demo@orbitworld.com';
    const DEMO_PASSWORD = 'Demo123!';

    // Hash password
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

    // Check if demo user already exists
    const existingDemoUser = await User.findOne({ email: DEMO_EMAIL });

    if (existingDemoUser) {
      console.log('ℹ️  Demo user already exists, updating...');
      existingDemoUser.password = hashedPassword;
      existingDemoUser.role = UserRole.DEMO;
      existingDemoUser.isActive = true;
      await existingDemoUser.save();
      console.log('✅ Demo user updated');
    } else {
      // Create demo user
      const demoUser = await User.create({
        email: DEMO_EMAIL,
        password: hashedPassword,
        firstName: 'Demo',
        lastName: 'User',
        role: UserRole.DEMO,
        isActive: true,
      });
      console.log('✅ Demo user created');
    }

    // Print demo credentials
    console.log('\n📋 Demo Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${DEMO_EMAIL}`);
    console.log(`Password: ${DEMO_PASSWORD}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔒 Access Level: READ-ONLY');
    console.log('Demo users can view all data but cannot:');
    console.log('  • Create new records');
    console.log('  • Edit existing records');
    console.log('  • Delete records');
    console.log('  • Access admin settings');
    console.log('  • Manage users');

    await mongoose.connection.close();
    console.log('\n✅ Demo user setup complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up demo user:', error);
    process.exit(1);
  }
};

// Run if executed directly
if (require.main === module) {
  seedDemoUser();
}

export default seedDemoUser;
