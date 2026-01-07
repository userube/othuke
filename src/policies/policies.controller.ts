import { Controller, Post, UploadedFile, UseInterceptors, Param } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { PoliciesService } from './policies.service'

@Controller('policies')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

    @Get()
    async getPolicies(
      @Query('page') page?: string,
      @Query('limit') limit?: string,
      @Query('status') status?: string,
      @Query('type') type?: string,
      @Query('holderName') holderName?: string,
    ) {
      return this.policiesService.findAll({
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
        status,
        type,
        holderName,
      });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.policiesService.findOne(id)
    }

    @Post('bulk')
    async bulkUpload(@Body() body: { providerId: string; policies: any[] }) {
      return this.policiesService.createBulkFromCSV(body.providerId, body.policies);
    }

    @Post('upload/:providerId')
      @UseInterceptors(FileInterceptor('file'))
      async uploadCSV(@UploadedFile() file: Express.Multer.File, @Param('providerId') providerId: string) {
        if (!file) return { message: 'No file uploaded' }

        const csv = file.buffer.toString('utf-8')
        const rows = csv.split('\n').slice(1) // skip header
        const policies = rows.map(row => {
          const [policyNo, holderName, type, premium, status, startDate, endDate] = row.split(',')
          return { policyNo, holderName, type, premium: Number(premium), status, startDate: new Date(startDate), endDate: new Date(endDate) }
        })

        return this.policiesService.createBulkFromCSV(providerId, policies)
      }
}
