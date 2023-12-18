import { userTypes } from 'src/shared/schema/users';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsIn,
  IsEmail,
  Length,
} from 'class-validator';
export class CreateUserDto {
  @IsNotEmpty({ message: 'Please Enter Full Name' })
  @IsString({ message: 'Please Enter Valid Name' })
  name: string;
  @IsEmail()
  email: string;
  @Length(6, 50, {
    message: 'Password length Must be between 6 and 50 charcters',
  })
  password: string;
  @IsNotEmpty({ message: 'Please Enter Type' })
  @IsString({ message: 'Please Enter Type' })
  @IsIn([userTypes.ADMIN, userTypes.CUSTOMER])
  type: string;
  @IsString()
  @IsOptional()
  secretToken?: string;
  isVerified: boolean;
}
