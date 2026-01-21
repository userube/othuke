// src/item-requests/dto/update-item-request.dto.ts
import {
    IsArray,
    IsObject,
    IsOptional,
    IsString,
} from 'class-validator';

export class UpdateItemRequestDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsArray()
    images?: string[];

    @IsOptional()
    @IsObject()
    customFieldValues?: Record<string, any>;
}
