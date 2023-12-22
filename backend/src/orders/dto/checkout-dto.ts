import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class checkoutDto {
  @IsString()
  @IsNotEmpty()
  skuPriceId: string;
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
  @IsString()
  @IsNotEmpty()
  skuId: string;
}
export class checkoutDtoArr {
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  checkoutDetails: checkoutDto[];
}
