import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from 'src/shared/schema/repositories/user.repository';
import { userTypes } from 'src/shared/schema/users';
import config from 'config';
import {
  comparePassword,
  generatePasswordHash,
} from 'src/shared/utils/password-manager';
import { generateAuthToken } from 'src/shared/utils/token-generator';
import { sendEmail } from 'src/shared/utils/mail-handler';
@Injectable()
export class UsersService {
  constructor(
    @Inject(UsersRepository) private readonly userModel: UsersRepository,
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      createUserDto.password = await generatePasswordHash(
        createUserDto.password,
      );

      if (
        createUserDto.type === userTypes.ADMIN &&
        createUserDto.secretToken !== config.get('adminSecretToken')
      ) {
        throw new Error('not allowed to create admin');
      } else {
        createUserDto.isVerified = true;
      }
      const user = await this.userModel.findOne({
        email: createUserDto.email,
      });
      if (user) {
        throw new Error('User already Exist');
      }
      const otp = Math.floor(Math.random() * 900000) * 100000;
      const otpExpireTime = new Date();
      otpExpireTime.setMinutes(otpExpireTime.getMinutes() * 10);
      const newUser = await this.userModel.create({
        ...createUserDto,
        otp,
        otpExpireTime,
      });
      if (newUser.type !== userTypes.ADMIN) {
        sendEmail(
          newUser.email,
          config.get('emailService.emailTemplates.verifyEmail'),
          'Email verification-WinSolutions',
          {
            customerName: newUser.name,
            customerEmail: newUser.email,
            otp,
          },
        );
      }
      return {
        success: true,
        message:
          newUser.type !== userTypes.ADMIN
            ? 'Admin Created Successfully'
            : 'Please activate your account by verifying your email.We have sent you email with otp',
        result: { email: newUser.email },
      };
    } catch (error) {
      throw error;
    }
  }
  async login(email: string, password: string) {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new Error('invalid email or password');
      }
      if (!user.isVerified) {
        throw new Error('Please verify your email');
      }
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        throw new Error('invalid email or password');
      }
      const token = await generateAuthToken(user._id);
      return {
        success: true,
        message: 'login successful',
        result: {
          user: {
            name: user.name,
            email: user.email,
            type: user.type,
            id: user._id,
          },
          token,
        },
      };
    } catch (error) {
      console.log(error);
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
function generateHashPassword(password: string): string {
  throw new Error('Function not implemented.');
}
