const axios = require('axios');

const API_URL = 'http://localhost:3008/api/orbit-world';
const ADMIN_EMAIL = 'admin@orbittravels.com';
const ADMIN_PASSWORD = 'Admin@123';

async function main() {
  // 1. Login to get JWT
  const loginRes = await axios.post(`${API_URL}/auth/login`, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  const token = loginRes.data.data.accessToken;
  console.log('✅ Logged in, got token');

  // 2. Get a client (use first client)
  const clientsRes = await axios.get(`${API_URL}/clients`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const client = clientsRes.data.data[0];
  if (!client) throw new Error('No client found');
  console.log('✅ Found client:', client.name);

  // 3. Create invoice
  const invoiceRes = await axios.post(
    `${API_URL}/invoices`,
    {
      financialYear: new Date().getFullYear(),
      clientId: client._id,
      notes: 'Sample invoice created via API',
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log('✅ Invoice created:', invoiceRes.data.data.invoiceNumber);
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
