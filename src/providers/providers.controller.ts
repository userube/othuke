import { Controller, Post, UseGuards, UploadedFile, UseInterceptors, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProviderApiGuard } from '../common/guards/provider-api.guard';
import { PoliciesService } from '../policies/policies.service';
import * as csvParser from 'csv-parse/lib/sync';

@Controller('provider')
export class ProvidersController {
  constructor(private policiesService: PoliciesService) {}

  @UseGuards(ProviderApiGuard)
  @Post('policies')
  async ingestPolicies(@Req() req, @Body() body: { policies: any[] }) {
    const providerId = req.provider.id;
    return this.policiesService.createBulkFromCSV(providerId, body.policies);
  }

  @UseGuards(ProviderApiGuard)
  @Post('claims')
  async ingestClaims(@Req() req, @Body() body: { claims: any[] }) {
    const providerId = req.provider.id;
    return this.policiesService.createBulkClaimsFromProvider(providerId, body.claims);
  }

  @UseGuards(ProviderApiGuard)
    @Post('policies/upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadPoliciesCSV(@Req() req, @UploadedFile() file: Express.Multer.File) {
      const csv = file.buffer.toString();
      const records = csvParser(csv, {
        columns: true,
        skip_empty_lines: true,
      });

      const providerId = req.provider.id;
      return this.policiesService.createBulkFromCSV(providerId, records);
    }
}
