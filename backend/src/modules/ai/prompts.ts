/**
 * Prompt templates for AI extraction and SQL generation
 */

export const EXTRACTION_PROMPTS = {
  flight: `Extract flight booking information from the document and return JSON.
Return ONLY valid JSON in this format:
{
  "airline": "airline name",
  "flightNumber": "flight number or PNR code",
  "pnr": "booking reference code",
  "sector": "departure-arrival (e.g., BLR-COK)",
  "passengerName": "main passenger name",
  "departureDate": "YYYY-MM-DD",
  "returnDate": "YYYY-MM-DD or null",
  "ticketUrl": "URL or null",
  "vendorCost": 0,
  "customerAmount": 0
}`,

  visa: `Extract visa application information from the document and return JSON.
Return ONLY valid JSON in this format:
{
  "applicantName": "applicant name",
  "country": "destination country",
  "visaType": "type of visa",
  "status": "PENDING",
  "vendorCost": 0,
  "customerAmount": 0
}`,

  hotel: `Extract hotel booking information from the document and return JSON.
Return ONLY valid JSON in this format:
{
  "hotelName": "hotel name",
  "city": "city name",
  "checkInDate": "YYYY-MM-DD",
  "checkOutDate": "YYYY-MM-DD",
  "roomType": "room type",
  "guestName": "guest name",
  "bookingReference": "reference or null",
  "vendorCost": 0,
  "customerAmount": 0
}`,

  insurance: `Extract insurance policy information from the document and return JSON.
Return ONLY valid JSON in this format:
{
  "policyNumber": "policy number",
  "policyType": "type of insurance",
  "insuredName": "insured person name",
  "coverageAmount": 0,
  "durationDays": 0,
  "vendorCost": 0,
  "customerAmount": 0
}`,

  invoice: `Extract invoice information from the document and return JSON.
Return ONLY valid JSON in this format:
{
  "invoice_number": "invoice number",
  "client_name": "client name",
  "client_email": "client email or null",
  "invoice_date": "YYYY-MM-DD",
  "due_date": "YYYY-MM-DD or null",
  "total_amount": 0,
  "currency": "currency code",
  "status": "DRAFT",
  "description": "brief description or null"
}`,
};

export const SQL_GENERATION_PROMPT = `You are a SQL expert. Generate ONLY SELECT queries for the following database schema:

Database Tables:
- users (id, email, name, role)
- clients (id, name, email, country)
- invoices (id, invoice_number, client_id, total_vendor_cost, total_customer_amount, total_margin, status, financial_year)
- invoice_items (id, invoice_id, module_type, reference_id, description, vendor_cost, customer_amount, margin)
- visas (id, client_id, applicant, country, visa_type, status, vendor_cost, customer_amount, margin)
- flights (id, client_id, airline, pnr, sector, passenger, departure_date, return_date, vendor_cost, customer_amount, margin)
- hotels (id, client_id, name, city, check_in_date, check_out_date, room_type, guest_name, vendor_cost, customer_amount, margin)
- insurance (id, client_id, policy_number, policy_type, insured_name, coverage_amount, duration_days, vendor_cost, customer_amount, margin)

Rules:
1. ONLY generate SELECT queries
2. NEVER use DELETE, UPDATE, DROP, ALTER, INSERT
3. NEVER use subqueries that modify data
4. Use JOIN when needed
5. Return SQL query ONLY, no explanation

User Query: {query}

Generate SQL:`;

export const CHATBOT_SYSTEM_PROMPT = `You are an AI assistant for Orbit World travel operations. 
Help users by:
1. Understanding their natural language query
2. Asking clarifying questions if needed
3. Generating safe SQL queries to fetch data
4. Presenting results in a friendly format

CRITICAL: You can ONLY read data. No data modifications allowed.`;
