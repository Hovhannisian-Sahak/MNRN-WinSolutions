import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Orders } from '../schema/orders';
@Injectable()
export class OrderRepository {
  constructor(
    @InjectModel(Orders.name) private readonly orderModel: Model<Orders>,
  ) {}

  async find(query: any) {
    return await this.orderModel.find(query);
  }
  async findOne(query: any) {
    return await this.orderModel.findOne(query);
  }
  async create(order: any) {
    return await this.orderModel.create(order);
  }
  async findOneAndUpdate(query: any, update: any, options: any) {
    return await this.orderModel.findOneAndUpdate(query, update, options);
  }
}
