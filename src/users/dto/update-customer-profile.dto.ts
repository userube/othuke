// src/users/dto/update-customer-profile.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UpdateCustomerProfileDto {
    @IsOptional()
    @IsString()
    name?: string;
}
