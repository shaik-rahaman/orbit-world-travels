import { CrmRepository } from './crm.repository';
import { CreateClientDTO, UpdateClientDTO, ClientResponseDTO } from '@/shared/dtos';
import { NotFoundException, ConflictException } from '@/shared/exceptions';

export class CrmService {
  private crmRepository: CrmRepository;

  constructor() {
    this.crmRepository = new CrmRepository();
  }

  async createClient(
    data: CreateClientDTO,
    userId: string
  ): Promise<ClientResponseDTO> {
    // Check if email already exists
    const existingClient = await this.crmRepository.getClientByEmail(data.email);
    if (existingClient) {
      throw new ConflictException('Client with this email already exists');
    }

    const client = await this.crmRepository.createClient({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      country: data.country,
      createdBy: userId,
    });

    return this.mapClientToDTO(client);
  }

  async getClientById(id: string): Promise<ClientResponseDTO & { _count?: any }> {
    const client = await this.crmRepository.getClientById(id);

    if (!client) {
      throw new NotFoundException('Client');
    }

    return this.mapClientToDTO(client);
  }

  async getAllClients(
    page: number = 1,
    limit: number = 10,
    filters?: any
  ): Promise<{ clients: (ClientResponseDTO & { _count?: any })[]; total: number }> {
    const skip = (page - 1) * limit;
    const { clients, total } = await this.crmRepository.getAllClients(
      skip,
      limit,
      filters
    );

    return {
      clients: clients.map((client) => this.mapClientToDTO(client)),
      total,
    };
  }

  async updateClient(
    id: string,
    data: UpdateClientDTO
  ): Promise<ClientResponseDTO> {
    const client = await this.crmRepository.getClientById(id);

    if (!client) {
      throw new NotFoundException('Client');
    }

    // Check email uniqueness if changing email
    if (data.email && data.email !== client.email) {
      const existingClient = await this.crmRepository.getClientByEmail(data.email);
      if (existingClient) {
        throw new ConflictException('Email already in use');
      }
    }

    const updatedClient = await this.crmRepository.updateClient(id, data);
    return this.mapClientToDTO(updatedClient);
  }

  async deleteClient(id: string): Promise<void> {
    const client = await this.crmRepository.getClientById(id);

    if (!client) {
      throw new NotFoundException('Client');
    }

    await this.crmRepository.deleteClient(id);
  }

  private mapClientToDTO(client: any): ClientResponseDTO & { _count?: any } {
    return {
      id: client._id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      country: client.country,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      _count: client._count,
    };
  }
}
