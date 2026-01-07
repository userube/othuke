// src/uploads/uploads.controller.ts
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { parse } from 'csv-parse/sync';
import { PoliciesService } from '../policies/policies.service';

@Controller('uploads')
export class UploadsController {
  constructor(private policiesService: PoliciesService) {}

  @Post('policies')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCSV(@UploadedFile() file: Express.Multer.File, @Body('providerId') providerId: string) {
    const records = parse(file.buffer.toString(), { columns: true });
    return this.policiesService.createBulkFromCSV(providerId, records);
  }
}
