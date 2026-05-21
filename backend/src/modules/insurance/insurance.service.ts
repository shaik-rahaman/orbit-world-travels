import { InsuranceRepository } from './insurance.repository';
import { CreateInsuranceDTO, UpdateInsuranceDTO, InsuranceResponseDTO } from '@/shared/dtos';
import { NotFoundException, ConflictException } from '@/shared/exceptions';
import { MarginCalculator } from '@/shared/utils/helpers';


export class InsuranceService {
  private insuranceRepository: InsuranceRepository;

  constructor() {
    this.insuranceRepository = new InsuranceRepository();
  }

  async createInsurance(
    data: CreateInsuranceDTO,
    userId: string
  ): Promise<InsuranceResponseDTO> {
    // Check if policy already exists
    const existingPolicy = await this.insuranceRepository.getInsuranceByPolicyNumber(
      data.policyNumber
    );
    if (existingPolicy) {
      throw new ConflictException('Insurance policy with this number already exists');
    }

    const margin = MarginCalculator.calculateMargin(
      data.customerAmount,
      data.vendorCost
    );

    const insurance = await this.insuranceRepository.createInsurance({
      policyNumber: data.policyNumber,
      insuredName: data.insuredName,
      policyType: data.policyType,
      coverageAmount: data.coverageAmount,
      vendorCost: data.vendorCost,
      customerAmount: data.customerAmount,
      margin,
      startDate: data.startDate,
      endDate: data.endDate,
      notes: data.notes,
      createdBy: userId,
      clientId: data.clientId,
    });

    return this.mapInsuranceToDTO(insurance);
  }

  async getInsuranceById(id: string): Promise<InsuranceResponseDTO> {
    const insurance = await this.insuranceRepository.getInsuranceById(id);

    if (!insurance) {
      throw new NotFoundException('Insurance');
    }

    return this.mapInsuranceToDTO(insurance);
  }

  async getAllInsurance(
    page: number = 1,
    limit: number = 10,
    filters?: any
  ): Promise<{ insurance: InsuranceResponseDTO[]; total: number }> {
    const skip = (page - 1) * limit;
    const { insurance, total } = await this.insuranceRepository.getAllInsurance(
      skip,
      limit,
      filters
    );

    return {
      insurance: insurance.map((ins) => this.mapInsuranceToDTO(ins)),
      total,
    };
  }

  async updateInsurance(
    id: string,
    data: UpdateInsuranceDTO
  ): Promise<InsuranceResponseDTO> {
    const insurance = await this.insuranceRepository.getInsuranceById(id);

    if (!insurance) {
      throw new NotFoundException('Insurance');
    }

    const updateData: any = { ...data };

    if ((data as any).vendorCost || (data as any).customerAmount) {
      const cost = (data as any).vendorCost ?? (insurance as any).cost ?? (insurance as any).vendorCost;
      const sellingPrice = (data as any).customerAmount ?? (insurance as any).sellingPrice ?? (insurance as any).customerAmount;
      updateData.margin = MarginCalculator.calculateMargin(
        sellingPrice,
        cost
      );
    }

    const updatedInsurance = await this.insuranceRepository.updateInsurance(id, updateData);
    return this.mapInsuranceToDTO(updatedInsurance);
  }

  async deleteInsurance(id: string): Promise<void> {
    const insurance = await this.insuranceRepository.getInsuranceById(id);

    if (!insurance) {
      throw new NotFoundException('Insurance');
    }

    await this.insuranceRepository.deleteInsurance(id);
  }

  private mapInsuranceToDTO(insurance: any): InsuranceResponseDTO {
    return {
      id: insurance._id,
      policyNumber: insurance.policyNumber,
      insuredName: insurance.insuredName,
      policyType: insurance.policyType,
      coverageAmount: insurance.coverageAmount,
      vendorCost: insurance.vendorCost ?? insurance.cost,
      customerAmount: insurance.customerAmount ?? insurance.sellingPrice,
      margin: insurance.margin,
      startDate: insurance.startDate,
      endDate: insurance.endDate,
      notes: insurance.notes,
      createdAt: insurance.createdAt,
      updatedAt: insurance.updatedAt,
    };
  }
}
