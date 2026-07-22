import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DEALER, Role.CUSTOMER)
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni destek talebi oluştur' })
  async createTicket(
    @Body('subject') subject: string,
    @Body('message') message: string,
    @Request() req: any,
  ) {
    return this.ticketService.createTicket(req.user.id, subject, message);
  }

  @Get('my')
  @ApiOperation({ summary: 'Kendi destek taleplerim' })
  async getMyTickets(@Request() req: any) {
    return this.ticketService.getMyTickets(req.user.id);
  }
}
