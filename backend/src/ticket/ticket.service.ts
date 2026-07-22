import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketService {
  constructor(private prisma: PrismaService) {}

  async createTicket(dealerId: string, subject: string, message: string) {
    return this.prisma.ticket.create({
      data: { dealerId, subject, message },
    });
  }

  async getMyTickets(dealerId: string) {
    return this.prisma.ticket.findMany({
      where: { dealerId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
