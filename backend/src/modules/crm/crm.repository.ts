import { Client, Invoice, Visa, Flight, Hotel, Insurance } from '@/models/schemas';
import { Types } from 'mongoose';

export class CrmRepository {
  async createClient(data: any) {
    const client = await Client.create(data);
    return client.populate({ path: 'createdBy', select: '_id firstName lastName email' });
  }

  async getClientById(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    
    const [invoiceCount, visaCount, flightCount, hotelCount, insuranceCount] = await Promise.all([
      Invoice.countDocuments({ clientId: new Types.ObjectId(id) }),
      Visa.countDocuments({ clientId: new Types.ObjectId(id) }),
      Flight.countDocuments({ clientId: new Types.ObjectId(id) }),
      Hotel.countDocuments({ clientId: new Types.ObjectId(id) }),
      Insurance.countDocuments({ clientId: new Types.ObjectId(id) })
    ]);

    const client = await Client.findById(id).populate({
      path: 'createdBy',
      select: '_id firstName lastName email'
    });

    if (client) {
      const doc = client.toObject ? client.toObject() : client;
      (doc as any)._count = {
        invoices: invoiceCount,
        visas: visaCount,
        flights: flightCount,
        hotels: hotelCount,
        insurance: insuranceCount
      };
      return doc;
    }
    return null;
  }

  async getAllClients(skip: number = 0, take: number = 10, filters?: any) {
    const where: any = {};
    if (filters?.name) {
      where.name = { $regex: filters.name, $options: 'i' };
    }
    if (filters?.email) {
      where.email = { $regex: filters.email, $options: 'i' };
    }
    if (filters?.country) where.country = filters.country;

    const clients = await Client.find(where)
      .skip(skip)
      .limit(take)
      .sort({ createdAt: -1 });

    const total = await Client.countDocuments(where);

    // Add _count to each client
    const clientIds = clients.map(c => new Types.ObjectId(c._id));
    const counts = await Promise.all(
      clientIds.map(async cId => ({
        _id: cId,
        invoices: await Invoice.countDocuments({ clientId: cId }),
        visas: await Visa.countDocuments({ clientId: cId }),
        flights: await Flight.countDocuments({ clientId: cId }),
        hotels: await Hotel.countDocuments({ clientId: cId }),
        insurance: await Insurance.countDocuments({ clientId: cId })
      }))
    );

    const enriched = clients.map(client => {
      const doc = client.toObject ? client.toObject() : client;
      const countData = counts.find(c => c._id.toString() === client._id.toString());
      (doc as any)._count = {
        invoices: countData?.invoices || 0,
        visas: countData?.visas || 0,
        flights: countData?.flights || 0,
        hotels: countData?.hotels || 0,
        insurance: countData?.insurance || 0
      };
      return doc;
    });

    return { clients: enriched, total };
  }

  async updateClient(id: string, data: any) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Client.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteClient(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Client.findByIdAndDelete(id);
  }

  async getClientByEmail(email: string) {
    return Client.findOne({ email });
  }
}
