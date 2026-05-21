import { Visa } from '@/models/schemas';
import { Types } from 'mongoose';

export class VisaRepository {
  async createVisa(data: any) {
    const visa = await Visa.create(data);
    return visa.populate([
      { path: 'clientId', select: '_id name email' }
    ]);
  }

  async getVisaById(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Visa.findById(id).populate([
      { path: 'clientId', select: '_id name email' }
    ]);
  }

  async getAllVisas(skip: number = 0, take: number = 10, filters?: any) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.country) where.country = filters.country;
    if (filters?.clientId && Types.ObjectId.isValid(filters.clientId)) {
      where.clientId = new Types.ObjectId(filters.clientId);
    }

    const [visas, total] = await Promise.all([
      Visa.find(where)
        .skip(skip)
        .limit(take)
        .populate([
          { path: 'clientId', select: 'name' }
        ])
        .sort({ createdAt: -1 }),
      Visa.countDocuments(where)
    ]);

    return { visas, total };
  }

  async updateVisa(id: string, data: any) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Visa.findByIdAndUpdate(id, data, { new: true }).populate([
      { path: 'clientId', select: '_id name email' }
    ]);
  }

  async deleteVisa(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Visa.findByIdAndDelete(id);
  }

  async getVisaByApplicantAndCountry(applicantName: string, country: string) {
    return Visa.findOne({ applicantName, country });
  }
}
