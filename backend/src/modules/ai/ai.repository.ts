import { Flight, Visa, Hotel, Insurance } from '@/models/schemas';
import { DocumentProcessor, ExtractedData, ModuleType } from './document-processor';
import { CreateFlightDTO } from '@/shared/dtos/flight.dto';
import { CreateVisaDTO } from '@/shared/dtos/visa.dto';
import { CreateHotelDTO } from '@/shared/dtos/hotel.dto';
import { CreateInsuranceDTO } from '@/shared/dtos/insurance.dto';
import { Types } from 'mongoose';

export interface ExtractedRecord {
  moduleType: ModuleType;
  data: any;
  confidence: number;
  status: 'success' | 'warning' | 'error';
  message: string;
}

/**
 * AI repository - Handles storage of extracted data
 */
export class AIRepository {
  /**
   * Save extracted flight data
   */
  static async saveFlightData(
    extractedData: ExtractedData,
    clientId: string,
    createdBy: string
  ): Promise<ExtractedRecord> {
    try {
      const flightData = extractedData.data as CreateFlightDTO;

      // Check PNR uniqueness
      const existingFlight = await Flight.findOne({ pnr: flightData.pnr });

      if (existingFlight) {
        return {
          moduleType: 'FLIGHT',
          data: null,
          confidence: 0,
          status: 'error',
          message: `Flight with PNR ${flightData.pnr} already exists`,
        };
      }

      // Provide safe defaults so partially-extracted files can still be persisted
      const safePnr = flightData.pnr || `PNR-${Date.now()}`;
      const safeAirline = flightData.airline || 'Unknown Airline';
      const safePassenger = flightData.passengerName || 'Unknown Passenger';
      const safeDeparture = flightData.departureDate ? new Date(flightData.departureDate) : new Date();
      const safeVendorCost = typeof flightData.vendorCost === 'number' ? flightData.vendorCost : 0;
      const safeCustomerAmount = typeof flightData.customerAmount === 'number' ? flightData.customerAmount : 0;

      const flight = await Flight.create({
        ...(clientId ? { clientId: new Types.ObjectId(clientId) } : {}),
        createdBy: new Types.ObjectId(createdBy),
        airline: safeAirline,
        pnr: safePnr,
        flightNumber: flightData.flightNumber || safePnr,
        sector: flightData.sector || 'UNKNOWN',
        passengerName: safePassenger,
        departureDate: safeDeparture,
        returnDate: flightData.returnDate ? new Date(flightData.returnDate) : null,
        cost: safeVendorCost,
        sellingPrice: safeCustomerAmount,
        margin: safeCustomerAmount - safeVendorCost,
      });

      return {
        moduleType: 'FLIGHT',
        data: flight,
        confidence: extractedData.confidence,
        status: extractedData.confidence >= 80 ? 'success' : 'warning',
        message:
          extractedData.confidence >= 80
            ? 'Flight data extracted and saved successfully'
            : 'Flight data extracted with low confidence. Please verify.',
      };
    } catch (error) {
      console.error('Error saving flight data:', error);
      return {
        moduleType: 'FLIGHT',
        data: null,
        confidence: 0,
        status: 'error',
        message: `Failed to save flight data: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Save extracted visa data
   */
  static async saveVisaData(
    extractedData: ExtractedData,
    clientId: string,
    createdBy: string
  ): Promise<ExtractedRecord> {
    try {
      const visaData = extractedData.data as CreateVisaDTO;

      const safeApplicant = visaData.applicantName || 'Unknown Applicant';
      const safePassport = visaData.passportNumber || `PASS-${Date.now()}`;
      const safeCountry = visaData.country || 'Unknown Country';
      const safeVisaType = visaData.visaType || 'Unknown';
      const safeVendorCostVisa = typeof visaData.vendorCost === 'number' ? visaData.vendorCost : 0;
      const safeCustomerAmountVisa = typeof visaData.customerAmount === 'number' ? visaData.customerAmount : 0;

      const visa = await Visa.create({
        ...(clientId ? { clientId: new Types.ObjectId(clientId) } : {}),
        createdBy: new Types.ObjectId(createdBy),
        applicantName: safeApplicant,
        passportNumber: safePassport,
        country: safeCountry,
        visaType: safeVisaType,
        status: (visaData as any).status || 'PENDING',
        cost: safeVendorCostVisa,
        sellingPrice: safeCustomerAmountVisa,
        margin: safeCustomerAmountVisa - safeVendorCostVisa,
      });

      return {
        moduleType: 'VISA',
        data: visa,
        confidence: extractedData.confidence,
        status: extractedData.confidence >= 80 ? 'success' : 'warning',
        message:
          extractedData.confidence >= 80
            ? 'Visa data extracted and saved successfully'
            : 'Visa data extracted with low confidence. Please verify.',
      };
    } catch (error) {
      console.error('Error saving visa data:', error);
      return {
        moduleType: 'VISA',
        data: null,
        confidence: 0,
        status: 'error',
        message: `Failed to save visa data: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Save extracted hotel data
   */
  static async saveHotelData(
    extractedData: ExtractedData,
    clientId: string,
    createdBy: string
  ): Promise<ExtractedRecord> {
    try {
      const hotelData = extractedData.data as CreateHotelDTO;

      const safeHotelName = hotelData.hotelName || 'Unknown Hotel';
      const safeCity = hotelData.city || 'Unknown City';
      const safeCheckIn = hotelData.checkInDate ? new Date(hotelData.checkInDate) : new Date();
      const safeCheckOut = hotelData.checkOutDate ? new Date(hotelData.checkOutDate) : new Date(safeCheckIn.getTime() + 24 * 60 * 60 * 1000);
      const safeVendorCostHotel = typeof hotelData.vendorCost === 'number' ? hotelData.vendorCost : 0;
      const safeCustomerAmountHotel = typeof hotelData.customerAmount === 'number' ? hotelData.customerAmount : 0;

      const hotel = await Hotel.create({
        ...(clientId ? { clientId: new Types.ObjectId(clientId) } : {}),
        createdBy: new Types.ObjectId(createdBy),
        hotelName: safeHotelName,
        city: safeCity,
        checkInDate: safeCheckIn,
        checkOutDate: safeCheckOut,
        roomType: hotelData.roomType || 'Unknown',
        guestName: hotelData.guestName || 'Unknown Guest',
        bookingReference: hotelData.bookingReference || null,
        cost: safeVendorCostHotel,
        sellingPrice: safeCustomerAmountHotel,
        margin: safeCustomerAmountHotel - safeVendorCostHotel,
      });

      return {
        moduleType: 'HOTEL',
        data: hotel,
        confidence: extractedData.confidence,
        status: extractedData.confidence >= 80 ? 'success' : 'warning',
        message:
          extractedData.confidence >= 80
            ? 'Hotel data extracted and saved successfully'
            : 'Hotel data extracted with low confidence. Please verify.',
      };
    } catch (error) {
      console.error('Error saving hotel data:', error);
      return {
        moduleType: 'HOTEL',
        data: null,
        confidence: 0,
        status: 'error',
        message: `Failed to save hotel data: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Save extracted insurance data
   */
  static async saveInsuranceData(
    extractedData: ExtractedData,
    clientId: string,
    createdBy: string
  ): Promise<ExtractedRecord> {
    try {
      const insuranceData = extractedData.data as CreateInsuranceDTO;

      // Check policy number uniqueness
      const existingPolicy = await Insurance.findOne({ policyNumber: insuranceData.policyNumber });

      if (existingPolicy) {
        return {
          moduleType: 'INSURANCE',
          data: null,
          confidence: 0,
          status: 'error',
          message: `Insurance policy ${insuranceData.policyNumber} already exists`,
        };
      }

      const safePolicyNumber = insuranceData.policyNumber || `POL-${Date.now()}`;
      const safePolicyType = insuranceData.policyType || insuranceData.policyType || 'Unknown';
      const safeInsuredName = insuranceData.insuredName || (insuranceData as any).holderName || 'Unknown Holder';
      const safeCoverage = typeof insuranceData.coverageAmount === 'number' ? insuranceData.coverageAmount : 0;
      const safeDuration = typeof (insuranceData as any).durationDays === 'number' ? (insuranceData as any).durationDays : 0;
      const safeVendorCostIns = typeof insuranceData.vendorCost === 'number' ? insuranceData.vendorCost : 0;
      const safeCustomerAmountIns = typeof insuranceData.customerAmount === 'number' ? insuranceData.customerAmount : 0;

      const insurance = await Insurance.create({
        ...(clientId ? { clientId: new Types.ObjectId(clientId) } : {}),
        createdBy: new Types.ObjectId(createdBy),
        policyNumber: safePolicyNumber,
        insuranceType: safePolicyType,
        holderName: safeInsuredName,
        coverageAmount: safeCoverage,
        duration: safeDuration,
        cost: safeVendorCostIns,
        sellingPrice: safeCustomerAmountIns,
        margin: safeCustomerAmountIns - safeVendorCostIns,
      });

      return {
        moduleType: 'INSURANCE',
        data: insurance,
        confidence: extractedData.confidence,
        status: extractedData.confidence >= 80 ? 'success' : 'warning',
        message:
          extractedData.confidence >= 80
            ? 'Insurance data extracted and saved successfully'
            : 'Insurance data extracted with low confidence. Please verify.',
      };
    } catch (error) {
      console.error('Error saving insurance data:', error);
      return {
        moduleType: 'INSURANCE',
        data: null,
        confidence: 0,
        status: 'error',
        message: `Failed to save insurance data: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Save extracted invoice data
   * Note: Invoice records are not directly saved from extraction.
   * The extracted data is returned to the frontend for user review and manual invoice creation.
   */
  static async saveInvoiceData(
    extractedData: ExtractedData,
    clientId: string,
    createdBy: string
  ): Promise<ExtractedRecord> {
    try {
      // For invoices, we just validate and return the extracted data
      // The user will use this data to create an invoice through the invoice creation flow
      const invoiceData = extractedData.data;

      // Validate required fields
      const requiredFields = ['invoice_number', 'client_name', 'total_amount', 'status'];
      const missingFields = requiredFields.filter(field => !invoiceData[field]);

      if (missingFields.length > 0) {
        return {
          moduleType: 'INVOICE',
          data: invoiceData,
          confidence: extractedData.confidence,
          status: 'warning',
          message: `Invoice extracted with missing fields: ${missingFields.join(', ')}. Please review before creating.`,
        };
      }

      return {
        moduleType: 'INVOICE',
        data: invoiceData,
        confidence: extractedData.confidence,
        status: extractedData.confidence >= 80 ? 'success' : 'warning',
        message:
          extractedData.confidence >= 80
            ? 'Invoice data extracted successfully'
            : 'Invoice data extracted with low confidence. Please verify before creating.',
      };
    } catch (error) {
      console.error('Error processing invoice data:', error);
      return {
        moduleType: 'INVOICE',
        data: null,
        confidence: 0,
        status: 'error',
        message: `Failed to process invoice data: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Save extracted data based on module type
   */
  static async saveExtractedData(
    extractedData: ExtractedData,
    clientId: string,
    createdBy: string
  ): Promise<ExtractedRecord> {
    // Validate provided IDs before attempting DB operations
    // createdBy must be a valid ObjectId (session user)
    if (!Types.ObjectId.isValid(createdBy)) {
      return {
        moduleType: extractedData.moduleType,
        data: null,
        confidence: 0,
        status: 'error',
        message: 'Invalid user session. Please log in again.',
      };
    }

    // Note: clientId validation is now handled by the Joi schema in ai.dto.ts
    // so we don't need to validate it again here

    switch (extractedData.moduleType) {
      case 'FLIGHT':
        return this.saveFlightData(extractedData, clientId, createdBy);
      case 'VISA':
        return this.saveVisaData(extractedData, clientId, createdBy);
      case 'HOTEL':
        return this.saveHotelData(extractedData, clientId, createdBy);
      case 'INSURANCE':
        return this.saveInsuranceData(extractedData, clientId, createdBy);
      case 'INVOICE':
        return this.saveInvoiceData(extractedData, clientId, createdBy);
      default:
        return {
          moduleType: extractedData.moduleType,
          data: null,
          confidence: 0,
          status: 'error',
          message: `Unknown module type: ${extractedData.moduleType}`,
        };
    }
  }

  /**
   * Get extraction history
   */
  static async getExtractionHistory(clientId: string) {
    if (!Types.ObjectId.isValid(clientId)) {
      return { flights: [], visas: [], hotels: [], insurance: [] };
    }

    const objId = new Types.ObjectId(clientId);
    return {
      flights: await Flight.find({ clientId: objId }),
      visas: await Visa.find({ clientId: objId }),
      hotels: await Hotel.find({ clientId: objId }),
      insurance: await Insurance.find({ clientId: objId }),
    };
  }
}
