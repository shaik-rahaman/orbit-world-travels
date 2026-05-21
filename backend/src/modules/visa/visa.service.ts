import { VisaRepository } from './visa.repository';
import { CreateVisaDTO, UpdateVisaDTO, VisaResponseDTO } from '@/shared/dtos';
import { NotFoundException, BadRequestException } from '@/shared/exceptions';
import { MarginCalculator } from '@/shared/utils/helpers';

export class VisaService {
  private visaRepository: VisaRepository;

  constructor() {
    this.visaRepository = new VisaRepository();
  }

  async createVisa(
    data: CreateVisaDTO,
    userId: string
  ): Promise<VisaResponseDTO> {
    const margin = MarginCalculator.calculateMargin(
      data.customerAmount,
      data.vendorCost
    );

    const visa = await this.visaRepository.createVisa({
      applicantName: data.applicantName,
      country: data.country,
      passportNumber: data.passportNumber,
      visaType: data.visaType,
      // Visa schema uses `cost` and `sellingPrice` field names
      cost: data.vendorCost,
      sellingPrice: data.customerAmount,
      margin,
      notes: data.notes,
      createdBy: userId,
      clientId: data.clientId,
    });

    return this.mapVisaToDTO(visa);
  }

  async getVisaById(id: string): Promise<VisaResponseDTO> {
    const visa = await this.visaRepository.getVisaById(id);

    if (!visa) {
      throw new NotFoundException('Visa');
    }

    return this.mapVisaToDTO(visa);
  }

  async getAllVisas(
    page: number = 1,
    limit: number = 10,
    filters?: any
  ): Promise<{ visas: VisaResponseDTO[]; total: number }> {
    const skip = (page - 1) * limit;
    const { visas, total } = await this.visaRepository.getAllVisas(
      skip,
      limit,
      filters
    );

    return {
      visas: visas.map((visa) => this.mapVisaToDTO(visa)),
      total,
    };
  }

  async updateVisa(
    id: string,
    data: UpdateVisaDTO
  ): Promise<VisaResponseDTO> {
    const visa = await this.visaRepository.getVisaById(id);

    if (!visa) {
      throw new NotFoundException('Visa');
    }

    const updateData: any = { ...data };

    // Recalculate margin if costs changed
    if ((data as any).vendorCost || (data as any).customerAmount) {
      const cost = (data as any).vendorCost ?? (visa as any).cost ?? (visa as any).vendorCost;
      const sellingPrice = (data as any).customerAmount ?? (visa as any).sellingPrice ?? (visa as any).customerAmount;
      updateData.margin = MarginCalculator.calculateMargin(
        sellingPrice,
        cost
      );
    }

    const updatedVisa = await this.visaRepository.updateVisa(id, updateData);
    return this.mapVisaToDTO(updatedVisa);
  }

  async deleteVisa(id: string): Promise<void> {
    const visa = await this.visaRepository.getVisaById(id);

    if (!visa) {
      throw new NotFoundException('Visa');
    }

    await this.visaRepository.deleteVisa(id);
  }

  private mapVisaToDTO(visa: any): VisaResponseDTO {
    return {
      id: visa._id,
      applicantName: visa.applicantName,
      country: visa.country,
      visaType: visa.visaType,
      status: visa.status,
      vendorCost: visa.cost ?? visa.vendorCost,
      customerAmount: visa.sellingPrice ?? visa.customerAmount,
      margin: visa.margin,
      notes: visa.notes,
      createdAt: visa.createdAt,
      updatedAt: visa.updatedAt,
    };
  }
}
