// src/bids/dto/create-bid.dto.ts
import {
    IsDateString,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateBidDto {
    @IsNumber()
    price: number;

    @IsDateString()
    availabilityDate: string;

    @IsString()
    deliveryTimeline: string;

    /**
     * Confirms vendor satisfies required custom fields
     */
    @IsObject()
    specificationsMatch: Record<string, any>;

    @IsOptional()
    @IsString()
    message?: string;
}
