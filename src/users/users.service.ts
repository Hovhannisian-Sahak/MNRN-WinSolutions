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
import { validate } from 'class-validator';

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
      } else if (createUserDto.type !== userTypes.CUSTOMER) {
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
          newUser.type === userTypes.ADMIN
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
      throw error;
    }
  }
  async verifyEmail(otp: string, email: string) {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }
      if (user.otp !== otp) {
        throw new Error('Invalid otp');
      }
      if (user.otpExpireTime < new Date()) {
        throw new Error('Otp expired');
      }

      await this.userModel.updateOne(
        {
          email,
        },
        {
          isVerified: true,
        },
      );
      return {
        success: true,
        message: 'Email verified successfuly',
      };
    } catch (error) {
      console.log(error);
    }
  }
  async sendOtpEmail(email: string) {
    try {
      const user = await this.userModel.findOne({ email });

      if (!user) {
        throw new Error('user not found');
      }
      if (user.isVerified) {
        throw new Error('This account has already been activated');
      }
      const otp = Math.floor(1000 + Math.random() * 900000) * 100000;
      const otpExpireTime = new Date();
      otpExpireTime.setMinutes(otpExpireTime.getMinutes() * 10);
      await this.userModel.updateOne(
        { email },
        {
          otp,
          otpExpireTime,
        },
      );
      sendEmail(
        user.email,
        config.get('emailService.emailTemplates.verifyEmail'),
        'Email verification-WinSolutions',
        {
          customerName: user.name,
          customerEmail: user.email,
          otp,
        },
      );
      return {
        success: true,
        message: 'Otp send successfully',
        result: { email: user.email },
      };
    } catch (error) {
      throw error;
    }
  }
  async forgotPassword(email: string) {
    try {
      const user = await this.userModel.findOne({ email });

      if (!user) {
        throw new Error('user not found');
      }
      let password = Math.random().toString(36).substring(2, 12);
      const tempPassword = password;
      password = await generatePasswordHash(password);
      await this.userModel.updateOne(
        { _id: user._id },
        {
          password,
        },
      );
      sendEmail(
        user.email,
        config.get('emailService.emailTemplates.forgotPassword'),
        'Email verification-WinSolutions',
        {
          customerName: user.name,
          customerEmail: user.email,
          newPassord: password,
          loginLink: config.get('loginLink'),
        },
      );
      return {
        success: true,
        message: 'Password sent to your email',
        result: { email: user.email, password: tempPassword },
      };
    } catch (error) {
      throw error;
    }
  }
  async updateNameOrPassword(id: string, updateUserDto: UpdateUserDto) {
    try {
      const errors = await validate(updateUserDto);
      if (errors.length > 0) {
        console.log(errors);
      }
      const { oldPassword, name, newPassword } = updateUserDto;
      if (!name || !newPassword) {
        throw new Error('please provide name or password');
      }
      const user = await this.userModel.findOne({ _id: id });
      if (!user) {
        throw new Error('User not found');
      }
      if (newPassword) {
        const isValidOldPassword = await comparePassword(
          oldPassword,
          user.password,
        );
        if (!isValidOldPassword) {
          throw new Error('invalid current password');
        }
        const hashedNewPassword = await generatePasswordHash(newPassword);
        await this.userModel.updateOne(
          { _id: id },
          { password: hashedNewPassword },
        );
      }
      if (name) {
        await this.userModel.updateOne({ _id: id }, { name });
      }
      return {
        success: true,
        message: 'User updated successfully',
        result: {
          name: user.name,
          email: user.email,
          type: user.type,
          id: user._id.toString(),
        },
      };
    } catch (error) {
      throw error;
    }
  }
  async findAll(type: string) {
    try {
      console.log("start");
      const users = await this.userModel.findAll({ type });
      console.log(users);
      return {
        success: true,
        message: 'Users fetched successfully',
        result: users,
      };
    } catch (error) {
      throw error;
    }
  }

  updateOne(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
function generateHashPassword(password: string): string {
  throw new Error('Function not implemented.');
}
