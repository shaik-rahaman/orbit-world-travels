import { Hotel } from '@/models/schemas';
import { Types } from 'mongoose';

export class HotelRepository {
  async createHotel(data: any) {
    const payload: any = {
      ...data,
      cost: data.vendorCost ?? data.cost,
      sellingPrice: data.customerAmount ?? data.sellingPrice,
    };
    const hotel = await Hotel.create(payload);
    return hotel.populate([
      { path: 'clientId', select: '_id name email' }
    ]);
  }

  async getHotelById(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Hotel.findById(id).populate([
      { path: 'clientId', select: '_id name email' }
    ]);
  }

  async getAllHotels(skip: number = 0, take: number = 10, filters?: any) {
    const where: any = {};
    if (filters?.city) {
      where.city = { $regex: filters.city, $options: 'i' };
    }
    if (filters?.hotelName) {
      where.hotelName = { $regex: filters.hotelName, $options: 'i' };
    }
    if (filters?.clientId && Types.ObjectId.isValid(filters.clientId)) {
      where.clientId = new Types.ObjectId(filters.clientId);
    }

    const [hotels, total] = await Promise.all([
      Hotel.find(where)
        .skip(skip)
        .limit(take)
        .populate([
          { path: 'clientId', select: 'name' }
        ])
        .sort({ checkInDate: -1 }),
      Hotel.countDocuments(where)
    ]);

    return { hotels, total };
  }

  async updateHotel(id: string, data: any) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Hotel.findByIdAndUpdate(id, data, { new: true }).populate([
      { path: 'clientId', select: '_id name email' }
    ]);
  }

  async deleteHotel(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Hotel.findByIdAndDelete(id);
  }
}
