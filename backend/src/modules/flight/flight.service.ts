import { FlightRepository } from './flight.repository';
import { CreateFlightDTO, UpdateFlightDTO, FlightResponseDTO } from '@/shared/dtos';
import { NotFoundException, ConflictException } from '@/shared/exceptions';
import { MarginCalculator } from '@/shared/utils/helpers';


export class FlightService {
  private flightRepository: FlightRepository;

  constructor() {
    this.flightRepository = new FlightRepository();
  }

  async createFlight(
    data: CreateFlightDTO,
    userId: string
  ): Promise<FlightResponseDTO> {
    // Check if PNR already exists
    const existingFlight = await this.flightRepository.getFlightByPNR(data.pnr);
    if (existingFlight) {
      throw new ConflictException('Flight with this PNR already exists');
    }

    const margin = MarginCalculator.calculateMargin(
      data.customerAmount,
      data.vendorCost
    );

    const flight = await this.flightRepository.createFlight({
      airline: data.airline,
      flightNumber: data.flightNumber,
      pnr: data.pnr,
      sector: data.sector,
      passengerName: data.passengerName,
      vendorCost: data.vendorCost,
      customerAmount: data.customerAmount,
      margin,
      departureDate: data.departureDate,
      returnDate: data.returnDate,
      notes: data.notes,
      createdBy: userId,
      clientId: data.clientId,
    });

    return this.mapFlightToDTO(flight);
  }

  async getFlightById(id: string): Promise<FlightResponseDTO> {
    const flight = await this.flightRepository.getFlightById(id);

    if (!flight) {
      throw new NotFoundException('Flight');
    }

    return this.mapFlightToDTO(flight);
  }

  async getAllFlights(
    page: number = 1,
    limit: number = 10,
    filters?: any
  ): Promise<{ flights: FlightResponseDTO[]; total: number }> {
    const skip = (page - 1) * limit;
    const { flights, total } = await this.flightRepository.getAllFlights(
      skip,
      limit,
      filters
    );

    return {
      flights: flights.map((flight) => this.mapFlightToDTO(flight)),
      total,
    };
  }

  async updateFlight(
    id: string,
    data: UpdateFlightDTO
  ): Promise<FlightResponseDTO> {
    const flight = await this.flightRepository.getFlightById(id);

    if (!flight) {
      throw new NotFoundException('Flight');
    }

    const updateData: any = { ...data };

    if ((data as any).vendorCost || (data as any).customerAmount) {
      const cost = (data as any).vendorCost ?? (flight as any).cost ?? (flight as any).vendorCost;
      const sellingPrice = (data as any).customerAmount ?? (flight as any).sellingPrice ?? (flight as any).customerAmount;
      updateData.margin = MarginCalculator.calculateMargin(
        sellingPrice,
        cost
      );
    }

    const updatedFlight = await this.flightRepository.updateFlight(id, updateData);
    return this.mapFlightToDTO(updatedFlight);
  }

  async deleteFlight(id: string): Promise<void> {
    const flight = await this.flightRepository.getFlightById(id);

    if (!flight) {
      throw new NotFoundException('Flight');
    }

    await this.flightRepository.deleteFlight(id);
  }

  private mapFlightToDTO(flight: any): FlightResponseDTO {
    return {
      id: flight._id,
      airline: flight.airline,
      flightNumber: flight.flightNumber,
      pnr: flight.pnr,
      sector: flight.sector,
      passengerName: flight.passengerName,
      vendorCost: flight.vendorCost ?? flight.cost,
      customerAmount: flight.customerAmount ?? flight.sellingPrice,
      margin: flight.margin,
      departureDate: flight.departureDate,
      returnDate: flight.returnDate,
      ticketUrl: flight.ticketUrl,
      notes: flight.notes,
      createdAt: flight.createdAt,
      updatedAt: flight.updatedAt,
    };
  }
}
