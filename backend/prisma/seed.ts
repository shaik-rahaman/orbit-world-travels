import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.visa.deleteMany();
  await prisma.flight.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.insurance.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleared existing data');

  // Create users
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const staffPassword = await bcrypt.hash('Staff@123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@orbittravels.com',
      password: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const staff1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@orbittravels.com',
      password: staffPassword,
      role: UserRole.STAFF,
      isActive: true,
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@orbittravels.com',
      password: staffPassword,
      role: UserRole.STAFF,
      isActive: true,
    },
  });

  console.log('✅ Created users');

  // Create clients
  const client1 = await prisma.client.create({
    data: {
      name: 'ABC Travel Company',
      email: 'contact@abctravel.com',
      phone: '+91-9876543210',
      address: 'New Delhi, India',
      country: 'India',
      createdById: admin.id,
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'XYZ Tours',
      email: 'info@xyztours.com',
      phone: '+91-8765432109',
      address: 'Mumbai, India',
      country: 'India',
      createdById: staff1.id,
    },
  });

  console.log('✅ Created clients');

  // Create visa records
  const visa1 = await prisma.visa.create({
    data: {
      applicantName: 'Raj Kumar',
      country: 'USA',
      visaType: 'Tourist',
      status: 'APPROVED',
      vendorCost: 50000,
      customerAmount: 65000,
      margin: 15000,
      notes: 'US Visa for tourism',
      createdById: staff1.id,
      clientId: client1.id,
    },
  });

  const visa2 = await prisma.visa.create({
    data: {
      applicantName: 'Priya Singh',
      country: 'UK',
      visaType: 'Business',
      status: 'PENDING',
      vendorCost: 45000,
      customerAmount: 60000,
      margin: 15000,
      notes: 'UK Business Visa',
      createdById: staff2.id,
      clientId: client2.id,
    },
  });

  console.log('✅ Created visas');

  // Create flight records
  const flight1 = await prisma.flight.create({
    data: {
      airline: 'Air India',
      flightNumber: 'AI 302',
      pnr: 'ABC12345',
      sector: 'DEL-DXB',
      passengerName: 'Raj Kumar',
      vendorCost: 15000,
      customerAmount: 18000,
      margin: 3000,
      departureDate: new Date('2024-02-15'),
      returnDate: new Date('2024-02-20'),
      notes: 'Round trip Dubai',
      createdById: staff1.id,
      clientId: client1.id,
    },
  });

  const flight2 = await prisma.flight.create({
    data: {
      airline: 'Indigo',
      flightNumber: '6E 456',
      pnr: 'XYZ67890',
      sector: 'BOM-LON',
      passengerName: 'Priya Singh',
      vendorCost: 60000,
      customerAmount: 75000,
      margin: 15000,
      departureDate: new Date('2024-03-01'),
      returnDate: new Date('2024-03-10'),
      notes: 'London business trip',
      createdById: staff2.id,
      clientId: client2.id,
    },
  });

  console.log('✅ Created flights');

  // Create hotel records
  const hotel1 = await prisma.hotel.create({
    data: {
      hotelName: 'Taj Hotel Dubai',
      city: 'Dubai',
      checkInDate: new Date('2024-02-15'),
      checkOutDate: new Date('2024-02-20'),
      roomType: 'Deluxe Suite',
      guestName: 'Raj Kumar',
      vendorCost: 8000,
      customerAmount: 10000,
      margin: 2000,
      bookingReference: 'TAJ-DXB-12345',
      notes: '5-night luxury stay',
      createdById: staff1.id,
      clientId: client1.id,
    },
  });

  const hotel2 = await prisma.hotel.create({
    data: {
      hotelName: 'The Savoy London',
      city: 'London',
      checkInDate: new Date('2024-03-01'),
      checkOutDate: new Date('2024-03-10'),
      roomType: 'Premium Room',
      guestName: 'Priya Singh',
      vendorCost: 15000,
      customerAmount: 20000,
      margin: 5000,
      bookingReference: 'SAV-LON-67890',
      notes: '9-night premium accommodation',
      createdById: staff2.id,
      clientId: client2.id,
    },
  });

  console.log('✅ Created hotels');

  // Create insurance records
  const insurance1 = await prisma.insurance.create({
    data: {
      policyNumber: 'POL-2024-001',
      insuredName: 'Raj Kumar',
      policyType: 'Travel Insurance',
      coverageAmount: 500000,
      vendorCost: 2000,
      customerAmount: 2500,
      margin: 500,
      startDate: new Date('2024-02-15'),
      endDate: new Date('2024-02-20'),
      notes: 'Dubai trip insurance',
      createdById: staff1.id,
      clientId: client1.id,
    },
  });

  const insurance2 = await prisma.insurance.create({
    data: {
      policyNumber: 'POL-2024-002',
      insuredName: 'Priya Singh',
      policyType: 'Travel Insurance',
      coverageAmount: 1000000,
      vendorCost: 3500,
      customerAmount: 4500,
      margin: 1000,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-03-10'),
      notes: 'London trip insurance',
      createdById: staff2.id,
      clientId: client2.id,
    },
  });

  console.log('✅ Created insurance policies');

  // Create invoices
  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'OR-202627/0001',
      financialYear: 2027,
      status: 'FINALIZED',
      totalVendorCost: 25000,
      totalCustomerAmount: 33000,
      totalMargin: 8000,
      notes: 'Dubai travel package',
      createdById: staff1.id,
      clientId: client1.id,
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'OR-202627/0002',
      financialYear: 2027,
      status: 'DRAFT',
      totalVendorCost: 78500,
      totalCustomerAmount: 99500,
      totalMargin: 21000,
      notes: 'London business trip',
      createdById: staff2.id,
      clientId: client2.id,
    },
  });

  console.log('✅ Created invoices');

  // Create invoice items
  await prisma.invoiceItem.create({
    data: {
      invoiceId: invoice1.id,
      moduleType: 'VISA',
      referenceId: visa1.id,
      vendorCost: 50000,
      customerAmount: 65000,
      margin: 15000,
      description: 'US Visa Processing',
    },
  });

  await prisma.invoiceItem.create({
    data: {
      invoiceId: invoice1.id,
      moduleType: 'FLIGHT',
      referenceId: flight1.id,
      vendorCost: 15000,
      customerAmount: 18000,
      margin: 3000,
      description: 'Air India Flight DEL-DXB',
    },
  });

  await prisma.invoiceItem.create({
    data: {
      invoiceId: invoice2.id,
      moduleType: 'VISA',
      referenceId: visa2.id,
      vendorCost: 45000,
      customerAmount: 60000,
      margin: 15000,
      description: 'UK Business Visa',
    },
  });

  console.log('✅ Created invoice items');

  console.log('✨ Database seeded successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('   Admin: admin@orbittravels.com / Admin@123');
  console.log('   Staff: john@orbittravels.com / Staff@123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
