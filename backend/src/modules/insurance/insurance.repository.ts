import { Insurance } from '@/models/schemas';
import { Types } from 'mongoose';

export class InsuranceRepository {
  async createInsurance(data: any) {
    // Normalize DTO fields to model fields
    const payload: any = {
      policyNumber: data.policyNumber,
      holderName: data.insuredName ?? data.holderName,
      insuranceType: data.policyType ?? data.insuranceType,
      coverageAmount: data.coverageAmount,
      // duration expected by model: prefer provided, otherwise compute from dates
      duration: data.duration ?? (data.startDate && data.endDate ? Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0),
      cost: data.vendorCost ?? data.cost,
      sellingPrice: data.customerAmount ?? data.sellingPrice,
      startDate: data.startDate,
      endDate: data.endDate,
      notes: data.notes,
      createdBy: data.createdBy,
      clientId: data.clientId,
    };
    const insurance = await Insurance.create(payload);
    return insurance.populate([
      { path: 'clientId', select: '_id name email' }
    ]);
  }

  async getInsuranceById(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Insurance.findById(id).populate([
      { path: 'clientId', select: '_id name email' }
    ]);
  }

  async getInsuranceByPolicyNumber(policyNumber: string) {
    return Insurance.findOne({ policyNumber });
  }

  async getAllInsurance(skip: number = 0, take: number = 10, filters?: any) {
    const where: any = {};
    if (filters?.policyType) where.policyType = filters.policyType;
    if (filters?.insuredName) {
      where.insuredName = { $regex: filters.insuredName, $options: 'i' };
    }
    if (filters?.clientId && Types.ObjectId.isValid(filters.clientId)) {
      where.clientId = new Types.ObjectId(filters.clientId);
    }

    const [insurance, total] = await Promise.all([
      Insurance.find(where)
        .skip(skip)
        .limit(take)
        .populate([
          { path: 'clientId', select: 'name' }
        ])
        .sort({ createdAt: -1 }),
      Insurance.countDocuments(where)
    ]);

    return { insurance, total };
  }

  async updateInsurance(id: string, data: any) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Insurance.findByIdAndUpdate(id, data, { new: true }).populate([
      { path: 'clientId', select: '_id name email' }
    ]);
  }

  async deleteInsurance(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Insurance.findByIdAndDelete(id);
  }
}
