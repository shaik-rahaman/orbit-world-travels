import { Flight } from '@/models/schemas';
import { Types } from 'mongoose';

export class FlightRepository {
  async createFlight(data: any) {
    // Normalize incoming field names: accept vendorCost/customerAmount but store as cost/sellingPrice
    const payload: any = {
      ...data,
      cost: data.vendorCost ?? data.cost,
      sellingPrice: data.customerAmount ?? data.sellingPrice,
    };
    const flight = await Flight.create(payload);
    return flight.populate([
      { path: 'clientId', select: '_id name email' }
    ]);
  }

  async getFlightById(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Flight.findById(id).populate([
      { path: 'clientId', select: '_id name email' }
    ]);
  }

  async getFlightByPNR(pnr: string) {
    return Flight.findOne({ pnr });
  }

  async getAllFlights(skip: number = 0, take: number = 10, filters?: any) {
    const where: any = {};
    if (filters?.airline) where.airline = filters.airline;
    if (filters?.passengerName) {
      where.passengerName = { $regex: filters.passengerName, $options: 'i' };
    }
    if (filters?.clientId && Types.ObjectId.isValid(filters.clientId)) {
      where.clientId = new Types.ObjectId(filters.clientId);
    }

    const [flights, total] = await Promise.all([
      Flight.find(where)
        .skip(skip)
        .limit(take)
        .populate([
          { path: 'clientId', select: 'name' }
        ])
        .sort({ createdAt: -1 }),
      Flight.countDocuments(where)
    ]);

    return { flights, total };
  }

  async updateFlight(id: string, data: any) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Flight.findByIdAndUpdate(id, data, { new: true }).populate([
      { path: 'clientId', select: '_id name email' }
    ]);
  }

  async deleteFlight(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Flight.findByIdAndDelete(id);
  }
}
