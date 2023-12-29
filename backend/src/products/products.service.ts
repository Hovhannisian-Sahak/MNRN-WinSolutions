import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductRepository } from 'src/shared/repositories/product.repository';
import { InjectStripe } from 'nestjs-stripe';
import Stripe from 'stripe';
import { Products } from 'src/shared/schema/products';
import { GetProductQueryDto } from './dto/get-product-query-dto';
import qs2m from 'qs-to-mongo';
import cloudinary from 'cloudinary';
import config from 'config';
import { unlinkSync } from 'fs';
import { ProductSkuDto, ProductSkuDtoArr } from './dto/product-sku.dto';
import { OrderRepository } from 'src/shared/repositories/order.repository';
@Injectable()
export class ProductsService {
  constructor(
    @Inject(ProductRepository) private readonly productDB: ProductRepository,
    @Inject(OrderRepository) private readonly orderDB: OrderRepository,
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
      const product = await this.productDB.findOneProduct({ _id: id });
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
      const result = await this.productDB.findOneAndUpdateWithOptions(
        {
          _id: id,
          'skuDetails._id': skuId,
        },
        {
          $set: {
            'skuDetails.$[element].name': data.skuName,
            'skuDetails.$[element].price': data.price,
            'skuDetails.$[element].validity': data.validity,
          },
        },
        { arrayFilters: [{ 'element._id': skuId }], new: true },
      );
      return {
        message: 'product sku updated by ID successfully',
        success: true,
        result,
      };
    } catch (error) {
      throw error;
    }
  }
  async deleteProductSkuByID(id: string, skuId: string) {
    try {
      const product = await this.productDB.findOneProduct({ _id: id });
      const skuDetails = product.skuDetails.find(
        (sku) => sku._id.toString() === skuId,
      );
      await this.stripeClient.prices.update(skuDetails.stripePriceId, {
        active: false,
      });
      await this.productDB.deleteSku(id, skuId);
      await this.productDB.deleteAllLicences(undefined, skuId);
      return {
        message: 'Product sku details deleted successfully',
        success: true,
        result: {
          id,
          skuId,
        },
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
  async addProductReview(
    id: string,
    rating: number,
    review: string,
    user: Record<string, any>,
  ) {
    try {
      const product = await this.productDB.findOneProduct({ _id: id });
      if (!product) {
        throw new Error("The Product doesn't exists");
      }
      if (
        product.feedbackDetails.find(
          (value: { customerId: string }) =>
            value.customerId === user._id.toString(),
        )
      ) {
        throw new BadRequestException(
          'You have already gave review for this product',
        );
      }
      const order = await this.orderDB.findOne({
        userId: user._id.toString(),
        'orderedItems.productId': id,
      });
      if (!order) {
        throw new BadRequestException('You have not purchased this product');
      }
      const ratings: any[] = [];
      product.feedbackDetails.forEach((comment: { rating: any }) =>
        ratings.push(comment.rating),
      );

      let avgRating = String(rating);
      if (ratings.length > 0) {
        avgRating = (ratings.reduce((a, b) => a + b) / ratings.length).toFixed(
          2,
        );
      }
      const reviewDetails = {
        rating: rating,
        feedbackMsg: review,
        customerId: user._id,
        customerName: user.name,
      };
      const result = await this.productDB.findOneAndUpdate(
        { _id: id },
        { $set: { avgRating }, $push: { feedbackDetails: reviewDetails } },
      );
      return {
        message: 'Product review added successfully',
        success: true,
        result,
      };
    } catch (error) {
      throw error;
    }
  }
  async removeProductReview(id: string, reviewId: string) {
    try {
      const product = await this.productDB.findOneProduct({ _id: id });
      if (!product) {
        throw new Error('No such Product Found!');
      }
      const review = product.feedbackDetails.find(
        (review) => review._id == reviewId,
      );
      if (!review) {
        throw new Error('Review does not exist!');
      }
      const ratings: any[] = [];
      product.feedbackDetails.forEach((comment) => {
        if (comment._id.toString() !== reviewId) {
          ratings.push(comment.rating);
        }
      });

      let avgRating = '0';
      if (ratings.length > 0) {
        avgRating = (ratings.reduce((a, b) => a + b) / ratings.length).toFixed(
          2,
        );
      }

      const result = await this.productDB.findOneAndUpdate(
        { _id: id },
        { $set: { avgRating }, $pull: { feedbackDetails: { _id: reviewId } } },
      );

      return {
        message: 'Product review removed successfully',
        success: true,
        result,
      };
    } catch (error) {
      throw error;
    }
  }
}
