import { userTypes } from 'src/shared/schema/users';
import { IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';
export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNotEmpty()
  @IsString()
  email: string;
  @IsNotEmpty()
  @IsString()
  password: string;
  @IsNotEmpty()
  @IsString()
  @IsIn([userTypes.ADMIN, userTypes.CUSTOMER])
  type: string;
  @IsString()
  @IsOptional()
  secretToken?: string;
  isVerified: boolean;
}
