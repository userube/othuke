import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterVendorDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    businessName: string;
}
