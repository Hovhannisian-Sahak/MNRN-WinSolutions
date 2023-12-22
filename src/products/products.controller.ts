import { Roles } from './../shared/middleware/role.decorators';
import { userTypes } from './../shared/schema/users';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  Query,
  UseInterceptors,
  UploadedFile,
  Put,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductQueryDto } from './dto/get-product-query-dto';
import { FileInterceptor } from '@nestjs/platform-express';
import config from 'config';
import { ProductSkuDto, ProductSkuDtoArr } from './dto/product-sku.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(201)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @Get()
  async findAll(@Query() query: GetProductQueryDto) {
    return await this.productsService.findAllProducts(query);
  }

  @Get(':id')
  async findOneProduct(@Param('id') id: string) {
    return await this.productsService.findOneProduct(id);
  }

  @Patch(':id')
  @Roles(userTypes.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: CreateProductDto,
  ) {
    return await this.productsService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.productsService.removeProduct(id);
  }
  @Post(':id/image')
  @Roles(userTypes.ADMIN)
  @UseInterceptors(
    FileInterceptor('productImage', {
      dest: config.get('fileStoragePath'),
      limits: {
        fileSize: 3145728,
      },
    }),
  )
  async uploadProductImage(
    @Param('id') id: string,
    @UploadedFile() file: ParameterDecorator,
  ) {
    return await this.productsService.updateProductImage(id, file);
  }

  @Post(':id/skus')
  @Roles(userTypes.ADMIN)
  async updateProductSku(
    @Param('id') id: string,
    @Body() updateProductSkuDto: ProductSkuDtoArr,
  ) {
    return await this.productsService.updateProductSku(id, updateProductSkuDto);
  }
  @Put('/:id/skus/:skuId')
  @Roles(userTypes.ADMIN)
  async updateProductById(
    @Param('id') id: string,
    @Param('skuId') skuId: string,
    @Body() updateProductSkuDto: ProductSkuDto,
  ) {
    return await this.productsService.updateProductSkuByID(
      id,
      skuId,
      updateProductSkuDto,
    );
  }
  @Post('/:id/skus/:skuId/licenses')
  @Roles(userTypes.ADMIN)
  async addProductSkuLicense(
    @Param('id') id: string,
    @Param('skuId') skuId: string,
    @Body('licenseKey') licenseKey: string,
  ) {
    return await this.productsService.addProductSkuLicense(
      id,
      skuId,
      licenseKey,
    );
  }
  @Delete('/licenses/:licenseKeyId')
  @Roles(userTypes.ADMIN)
  async removeProductLicense(@Param('licenseKeyId') licenseId: string) {
    return await this.productsService.deleteProductLicense(licenseId);
  }
  @Get('/:id/skus/:skuId/licenses')
  @Roles(userTypes.ADMIN)
  async getProductSkuLicences(
    @Param('id') id: string,
    @Param('skuId') skuId: string,
  ) {
    return await this.productsService.getProductSkuLicences(id, skuId);
  }
  @Put('/:id/skus/:skuId/licenses/:licenseKeyId')
  @Roles(userTypes.ADMIN)
  async updateProductLicense(
    @Param('id') id: string,
    @Param('skuId') skuId: string,
    @Param('licenseKeyId') licenseKeyId: string,
    @Body('licenseKey') licenseKey: string,
  ) {
    return await this.productsService.updateProductLicense(
      id,
      skuId,
      licenseKeyId,
      licenseKey,
    );
  }
}
