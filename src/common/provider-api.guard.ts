// src/common/guards/provider-api.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProviderApiGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) throw new UnauthorizedException('Missing API key');

    const provider = await this.prisma.provider.findUnique({ where: { apiKey } });
    if (!provider) throw new UnauthorizedException('Invalid API key');

    // Attach provider to request for later use
    req.provider = provider;
    return true;
  }
}
