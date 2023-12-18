import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty({ message: 'Please Enter Full Name' })
  @IsString({ message: 'Please Enter Valid Name' })
  name?: string;
  @Length(6, 50, {
    message: 'Password length Must be between 6 and 50 charcters',
  })
  oldPassword?: string;
  @Length(6, 50, {
    message: 'Password length Must be between 6 and 50 charcters',
  })
  newPassword?: string;
}
