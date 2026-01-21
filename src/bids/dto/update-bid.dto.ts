// src/bids/dto/update-bid.dto.ts
import {
    IsDateString,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
} from 'class-validator';

export class UpdateBidDto {
    @IsOptional()
    @IsNumber()
    price?: number;

    @IsOptional()
    @IsDateString()
    availabilityDate?: string;

    @IsOptional()
    @IsString()
    deliveryTimeline?: string;

    @IsOptional()
    @IsObject()
    specificationsMatch?: Record<string, any>;

    @IsOptional()
    @IsString()
    message?: string;
}
