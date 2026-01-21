// src/item-requests/dto/create-item-request.dto.ts
import {
    IsArray,
    IsObject,
    IsString,
} from 'class-validator';

export class CreateItemRequestDto {
    @IsString()
    categoryId: string;

    @IsString()
    title: string;

    @IsString()
    description: string;

    /**
     * Array of image URLs (uploaded separately via S3/Cloudinary)
     */
    @IsArray()
    images: string[];

    /**
     * Key-value pairs matching CategoryField names
     */
    @IsObject()
    customFieldValues: Record<string, any>;
}
