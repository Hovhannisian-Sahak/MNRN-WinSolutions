import { License } from './../shared/schema/license';
import { Inject, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductRepository } from 'src/shared/repositories/product.repository';
import { InjectStripe } from 'nestjs-stripe';
import Stripe from 'stripe';
import { Products, SkuDetails } from 'src/shared/schema/products';
import { GetProductQueryDto } from './dto/get-product-query-dto';
import qs2m from 'qs-to-mongo';
import cloudinary from 'cloudinary';
import config from 'config';
import { unlinkSync } from 'fs';
import { ProductSkuDto, ProductSkuDtoArr } from './dto/product-sku.dto';
@Injectable()
export class ProductsService {
  constructor(
    @Inject(ProductRepository) private readonly productDB: ProductRepository,
    @InjectStripe() private readonly stripeClient: Stripe,
  ) {
    cloudinary.v2.config({
      cloud_name: config.get('cloudinary.cloud_name'),
      api_key: config.get('cloudinary.api_key'),
      api_secret: config.get('cloudinary.api_secret'),
    });
  }
  async createProduct(createProductDto: CreateProductDto): Promise<{
    message: string;
    result: Products;
    success: boolean;
  }> {
    try {
      if (!createProductDto.stripeProductId) {
        const createdProductInStripe = await this.stripeClient.products.create({
          name: createProductDto.productName,
          description: createProductDto.description,
        });
        createProductDto.stripeProductId = createdProductInStripe.id;
      }
      const createProductInDB = await this.productDB.create(createProductDto);
      return {
        message: 'product created successfully',
        result: createProductInDB,
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  async findOneProduct(id: string): Promise<{
    message: string;
    result: { product: Products; relatedProducts: Products[] };
    success: boolean;
  }> {
    try {
      const product: Products = await this.productDB.findOneProduct({
        _id: id,
      });
      if (!product) {
        throw new Error('Product does not exist');
      }
      const relatedProducts: Products[] =
        await this.productDB.findRelatedProducts({
          category: product.category,
          _id: { $ne: id },
        });

      return {
        message: 'Product fetched successfully',
        result: {
          product,
          relatedProducts,
        },
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(
    id: string,
    updateProductDto: CreateProductDto,
  ): Promise<{
    message: string;
    result: Products;
    success: boolean;
  }> {
    try {
      const product = await this.productDB.findOneProduct({ _id: id });
      if (!product) {
        throw new Error('product does not exist');
      }
      const updatedProduct = await this.productDB.findOneAndUpdate(
        { _id: id },
        updateProductDto,
      );
      if (!updatedProduct.stripeProductId) {
        await this.stripeClient.products.update(product.stripeProductId, {
          name: updateProductDto.productName,
          description: updateProductDto.description,
        });
      }
      return {
        message: 'Product updated successfully',
        result: updatedProduct,
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  async removeProduct(id: string): Promise<{
    message: string;
    success: boolean;
    result: null;
  }> {
    try {
      const product = await this.productDB.findOneProduct(id);
      if (!product) {
        throw new Error('product does not exist');
      }
      await this.productDB.findOneAndDelete({ _id: id });
      await this.stripeClient.products.del(product.stripeProductId);
      return {
        message: 'Product removed successfully',
        success: true,
        result: null,
      };
    } catch (error) {
      throw error;
    }
  }
  async findAllProducts(query: GetProductQueryDto) {
    try {
      let callForHomePage = false;
      if (query.homepage) {
        callForHomePage = true;
      }
      delete query.homepage;
      const { criteria, options, links } = qs2m(query);
      if (callForHomePage) {
        const products = await this.productDB.findProductWithGroupBy();
        return {
          message:
            products.length > 0
              ? 'Products fetched successfully'
              : 'no products found',
          result: products,
          success: true,
        };
      }
      const { totalProductCount, products } = await this.productDB.find(
        criteria,
        options,
      );
      return {
        message:
          products.length > 0
            ? 'Products fetched successfully'
            : 'no products found',
        result: {
          metadata: {
            skip: options.skip || 0,
            limit: options.limit || 10,
            total: totalProductCount,
            pages: options.limit
              ? Math.ceil(totalProductCount / options.limit)
              : 1,
            links: links('/', totalProductCount),
          },
          products,
        },
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }
  async updateProductImage(
    id: string,
    file: any,
  ): Promise<{
    message: string;
    success: boolean;
    result: string;
  }> {
    try {
      const product = await this.productDB.findOneProduct({ _id: id });
      if (!product) {
        throw new Error('product does not exist');
      }
      if (product.imageDetails?.public_id) {
        await cloudinary.v2.uploader.destroy(product.imageDetails.public_id, {
          invalidate: true,
        });
      }
      const resOfCloudinary = await cloudinary.v2.uploader.upload(file.path, {
        folder: config.get('cloudinary.folderPath'),
        public_id: `${config.get('cloudinary.publicId_prefix')}${Date.now()}`,
        transformation: [
          {
            width: config.get('cloudinary.bigSize').toString().split('X')[0],
            height: config.get('cloudinary.bigSize').toString().split('X')[1],
            crop: 'fill',
          },
          { quality: 'auto' },
        ],
      });
      unlinkSync(file.path);
      await this.productDB.findOneAndUpdate(
        { _id: id },
        {
          imageDetails: resOfCloudinary,
          image: resOfCloudinary.secure_url,
        },
      );
      await this.stripeClient.products.update(product.stripeProductId, {
        images: [resOfCloudinary.secure_url],
      });

      return {
        message: 'Image uploaded successfully',
        success: true,
        result: resOfCloudinary.secure_url,
      };
    } catch (error) {
      throw error;
    }
  }
  //create one or multiple sku for product
  async updateProductSku(id: string, data: ProductSkuDtoArr) {
    try {
      const product = await this.productDB.findOneProduct({ _id: id });
      if (!product) {
        throw new Error('product does not exist');
      }
      const skuCode = Math.random().toString(36).substring(2, 5) + Date.now();
      for (let i = 0; i < data.skuDetails.length; i++) {
        if (!data.skuDetails[i].stripePriceId) {
          const stripPriceDetails = await this.stripeClient.prices.create({
            unit_amount: data.skuDetails[i].price * 100,
            currency: 'inr',
            product: product.stripeProductId,
            metadata: {
              skuCode: skuCode,
              lifetime: data.skuDetails[i].lifetime + '',
              productId: id,
              price: data.skuDetails[i].price,
              productName: product.productName,
              productImage: product.image,
            },
          });
          data.skuDetails[i].stripePriceId = stripPriceDetails.id;
        }
        data.skuDetails[i].skuCode = skuCode;
      }

      await this.productDB.findOneAndUpdate(
        { _id: id },
        { $push: { skuDetails: data.skuDetails } },
      );
      return {
        message: 'product sku updated successfully',
        success: true,
        result: null,
      };
    } catch (error) {
      throw error;
    }
  }
  async updateProductSkuByID(id: string, skuId: string, data: ProductSkuDto) {
    try {
      const product = await this.productDB.findOneProduct({ _id: id });
      if (!product) {
        throw new Error('product does not exist');
      }
      const sku = product.skuDetails.find((sku) => sku._id == skuId);
      if (!sku) {
        throw new Error('Sku does not exist');
      }
      if (data.price !== sku.price) {
        const stripPriceDetails = await this.stripeClient.prices.create({
          unit_amount: data.price * 100,
          currency: 'inr',
          product: product.stripeProductId,
          metadata: {
            skuCode: sku.skuCode,
            lifetime: data.lifetime + '',
            productId: id,
            price: data.price,
            productName: product.productName,
            productImage: product.image,
          },
        });
        data.stripePriceId = stripPriceDetails.id;
      }
      await this.productDB.findOneAndUpdateWithOptions(
        {
          _id: id,
          'skuDetails._id': skuId,
        },
        { $set: { 'skuDetails.$[element].price': data.price } },
        { arrayFilters: [{ 'element._id': skuId }] },
      );

      return {
        message: 'product sku updated by ID successfully',
        success: true,
        result: null,
      };
    } catch (error) {
      throw error;
    }
  }
  async addProductSkuLicense(id: string, skuId: string, licenseKey: string) {
    try {
      const product = await this.productDB.findOneProduct({ _id: id });
      if (!product) {
        throw new Error('Product does not exist');
      }

      const sku = product.skuDetails.find((sku) => sku._id == skuId);
      if (!sku) {
        throw new Error('Sku does not exist');
      }
      console.log('Inside addProductSkuLicense method:', {
        id,
        skuId,
        licenseKey,
      });
      const res = await this.productDB.createLicense(id, skuId, licenseKey);
      return {
        message: 'License key added successfully',
        success: true,
        result: res,
      };
    } catch (error) {
      throw error;
    }
  }
  async deleteProductLicense(id: string) {
    try {
      const res = await this.productDB.deleteLicense({ _id: id });
      return {
        message: 'License deleted successfully',
        success: true,
        result: res,
      };
    } catch (error) {
      throw error;
    }
  }
  async getProductSkuLicences(id: string, skuId: string) {
    try {
      const product = await this.productDB.findOneProduct({ _id: id });
      if (!product) {
        throw new Error('product does not exist');
      }
      const sku = product.skuDetails.find((sku) => sku._id == skuId);
      if (!sku) {
        throw new Error('Sku does not exist');
      }
      const licenses = await this.productDB.getLicenses({
        product: id,
        productSku: skuId,
      });
      return {
        message: 'licence list fetched Successfully',
        success: true,
        result: licenses,
      };
    } catch (error) {
      throw error;
    }
  }
  async updateProductLicense(
    id: string,
    skuId: string,
    licenseKeyId: string,
    licenseKey: string,
  ) {
    try {
      const product = await this.productDB.findOneProduct({ _id: id });
      if (!product) {
        throw new Error('product does not exist');
      }
      const sku = product.skuDetails.find((sku) => sku._id == skuId);
      if (!sku) {
        throw new Error('Sku does not exist');
      }
      const result = await this.productDB.updateLicense(
        { _id: licenseKeyId },
        { licenseKey: licenseKey },
      );
      return {
        message: 'License updated successfully',
        success: true,
        result,
      };
    } catch (error) {
      throw error;
    }
  }
}
