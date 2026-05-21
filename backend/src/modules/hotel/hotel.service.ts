import { HotelRepository } from './hotel.repository';
import { CreateHotelDTO, UpdateHotelDTO, HotelResponseDTO } from '@/shared/dtos';
import { NotFoundException } from '@/shared/exceptions';
import { MarginCalculator } from '@/shared/utils/helpers';

export class HotelService {
  private hotelRepository: HotelRepository;

  constructor() {
    this.hotelRepository = new HotelRepository();
  }

  async createHotel(
    data: CreateHotelDTO,
    userId: string
  ): Promise<HotelResponseDTO> {
    const margin = MarginCalculator.calculateMargin(
      data.customerAmount,
      data.vendorCost
    );

    const hotel = await this.hotelRepository.createHotel({
      hotelName: data.hotelName,
      city: data.city,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      roomType: data.roomType,
      guestName: data.guestName,
      vendorCost: data.vendorCost,
      customerAmount: data.customerAmount,
      margin,
      bookingReference: data.bookingReference,
      notes: data.notes,
      createdBy: userId,
      clientId: data.clientId,
    });

    return this.mapHotelToDTO(hotel);
  }

  async getHotelById(id: string): Promise<HotelResponseDTO> {
    const hotel = await this.hotelRepository.getHotelById(id);

    if (!hotel) {
      throw new NotFoundException('Hotel');
    }

    return this.mapHotelToDTO(hotel);
  }

  async getAllHotels(
    page: number = 1,
    limit: number = 10,
    filters?: any
  ): Promise<{ hotels: HotelResponseDTO[]; total: number }> {
    const skip = (page - 1) * limit;
    const { hotels, total } = await this.hotelRepository.getAllHotels(
      skip,
      limit,
      filters
    );

    return {
      hotels: hotels.map((hotel) => this.mapHotelToDTO(hotel)),
      total,
    };
  }

  async updateHotel(
    id: string,
    data: UpdateHotelDTO
  ): Promise<HotelResponseDTO> {
    const hotel = await this.hotelRepository.getHotelById(id);

    if (!hotel) {
      throw new NotFoundException('Hotel');
    }

    const updateData: any = { ...data };

    if ((data as any).vendorCost || (data as any).customerAmount) {
      const cost = (data as any).vendorCost ?? (hotel as any).cost ?? (hotel as any).vendorCost;
      const sellingPrice = (data as any).customerAmount ?? (hotel as any).sellingPrice ?? (hotel as any).customerAmount;
      updateData.margin = MarginCalculator.calculateMargin(
        sellingPrice,
        cost
      );
    }

    const updatedHotel = await this.hotelRepository.updateHotel(id, updateData);
    return this.mapHotelToDTO(updatedHotel);
  }

  async deleteHotel(id: string): Promise<void> {
    const hotel = await this.hotelRepository.getHotelById(id);

    if (!hotel) {
      throw new NotFoundException('Hotel');
    }

    await this.hotelRepository.deleteHotel(id);
  }

  private mapHotelToDTO(hotel: any): HotelResponseDTO {
    return {
      id: hotel._id,
      hotelName: hotel.hotelName,
      city: hotel.city,
      checkInDate: hotel.checkInDate,
      checkOutDate: hotel.checkOutDate,
      roomType: hotel.roomType,
      guestName: hotel.guestName,
      vendorCost: hotel.vendorCost ?? hotel.cost,
      customerAmount: hotel.customerAmount ?? hotel.sellingPrice,
      margin: hotel.margin,
      bookingReference: hotel.bookingReference,
      notes: hotel.notes,
      createdAt: hotel.createdAt,
      updatedAt: hotel.updatedAt,
    };
  }
}
