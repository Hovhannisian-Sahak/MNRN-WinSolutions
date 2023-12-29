import { Product } from './../../../../frontend/services/Products.services';
import { InjectModel } from '@nestjs/mongoose';
import { Products } from '../schema/products';
import { Model } from 'mongoose';
import { CreateProductDto } from 'src/products/dto/create-product.dto';
import { Injectable } from '@nestjs/common';
import { ParsedOptions } from 'qs-to-mongo/lib/query/options-to-mongo';
import { License } from '../schema/license';
@Injectable()
export class ProductRepository {
  constructor(
    @InjectModel(Products.name) private readonly productModel: Model<Products>,
    @InjectModel(License.name) private readonly licenseModel: Model<License>,
  ) {}
  async create(product: CreateProductDto) {
    const createdProduct = await this.productModel.create(product);
    return createdProduct;
  }

  async findOneProduct(query: any) {
    const product = await this.productModel.findOne(query);
    return product;
  }
  async findOneAndUpdate(query: any, update: any) {
    const product = await this.productModel.findOneAndUpdate(query, update, {
      new: true,
    });
    return product;
  }
  async findOneAndUpdateWithOptions(query: any, update: any, options: any) {
    const product = await this.productModel.findOneAndUpdate(
      query,
      update,
      options,
    );
    return product;
  }
  async findOneAndDelete(query: any) {
    const product = await this.productModel.findOneAndDelete(query);
    return product;
  }
  async findProductWithGroupBy() {
    const products = await this.productModel.aggregate([
      {
        $facet: {
          latestProducts: [{ $sort: { createdAt: -1 } }, { $limit: 4 }],
          topRatedProducts: [{ $sort: { avgRating: -1 } }, { $limit: 8 }],
        },
      },
    ]);
    return products;
  }
  async find(query: Record<string, any>, options: ParsedOptions) {
    options.sort = options.sort || { _id: 1 };
    options.limit = options.limit || 12;
    options.skip = options.skip || 0;

    if (query.search) {
      query.productName = new RegExp(query.search, 'i');
      delete query.search;
    }
    const products = await this.productModel.aggregate([
      { $match: query },
      { $sort: options.sort },
      { $skip: options.skip },
      { $limit: options.limit },
    ]);
    const totalProductCount = await this.productModel.countDocuments(query);
    return { totalProductCount, products };
  }
  async findRelatedProducts(query: Record<string, any>) {
    const products = await this.productModel.aggregate([
      { $match: query },
      {
        $sample: { size: 4 },
      },
    ]);
    return products;
  }
  async createLicense(product: string, productSku: string, licenseKey: string) {
    const license = await this.licenseModel.create({
      product,
      productSku,
      licenseKey,
    });
    return license;
  }
  async deleteLicense(query: any) {
    return await this.licenseModel.deleteOne(query);
  }
  async getLicenses(query: any) {
    return await this.licenseModel.find(query);
  }
  async updateLicense(query: any, update: any) {
    return await this.licenseModel.updateOne(query, update, { new: true });
  }
  async findLicense(query: any, limit?: number) {
    if (limit && limit > 0) {
      return await this.licenseModel.find(query).limit(limit);
    }
    return await this.licenseModel.find(query);
  }
  async updateLicenseMany(query: any, data: any) {
    return await this.licenseModel.updateMany(query, data);
  }
  async deleteSku(id: string, skuId: string) {
    return await this.productModel.updateOne(
      { _id: id },
      {
        $pull: {
          skuDetails: { _id: skuId },
        },
      },
    );
  }
  async deleteAllLicences(id: string, skuId: string) {
    if (id) {
      return await this.licenseModel.deleteMany({ product: id });
    }
    return await this.licenseModel.deleteMany({ productSku: skuId });
  }
}
