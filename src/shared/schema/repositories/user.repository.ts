import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Users } from '../Users';
import { Injectable } from '@nestjs/common';
@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(Users.name) private readonly userModel: Model<Users>,
  ) {}
  async findOne(query: any) {
    return await this.userModel.findOne(query);
  }
  async findAll(query: any) {
    console.log('start');
    return await this.userModel.find(query);
  }
  async create(data: Record<string, any>) {
    return await this.userModel.create(data);
  }
  async updateOne(query: any, data: Record<string, any>) {
    return await this.userModel.updateOne(query, data);
  }
  async findById(id: string) {
    return await this.userModel.findById(id);
  }
}
