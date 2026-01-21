// src/users/dto/update-vendor-profile.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UpdateVendorProfileDto {
    @IsOptional()
    @IsString()
    businessName?: string;
}
