import { Controller, Get, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ClaimsService } from './claims.service'
import { FileInterceptor } from '@nestjs/platform-express'

@Controller('claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Get()
  async getClaims(
    @Query('policyId') policyId?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.claimsService.findAll({ policyId, status, type })
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.claimsService.findOne(id)
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadClaims(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { message: 'No file uploaded' }
    }
    const result = await this.claimsService.createBulkFromCSV(file.buffer)
    return { message: 'Claims uploaded successfully', result }
  }
}
