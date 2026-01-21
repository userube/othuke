import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterCustomerDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;
}
