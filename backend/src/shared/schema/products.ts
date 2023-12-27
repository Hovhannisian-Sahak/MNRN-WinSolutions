import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
export enum categoryType {
  operatingSystem = 'Operating System',
  applicationSoftware = 'Application Software',
}
export enum platformType {
  windows = 'Windows',
  mac = 'Mac',
  linux = 'Linux',
  android = 'Android',
  ios = 'iOS',
}

export enum baseType {
  computer = 'Computer',
  mobile = 'Mobile',
}
@Schema({ timestamps: true })
export class Feedbackers extends mongoose.Document {
  @Prop({ requied: true })
  customerId: string;
  @Prop({ requied: true })
  customerName: string;
  @Prop({ requied: true })
  rating: number;
  @Prop({ requied: true })
  feedbackMsg: string;
}
export const FeedbackSchema = SchemaFactory.createForClass(Feedbackers);

@Schema({ timestamps: true })
export class SkuDetails extends mongoose.Document {
  @Prop({})
  skuName: string;
  @Prop({})
  price: number;
  @Prop({})
  validity: number; //in days
  @Prop({})
  lifetime: boolean;
  @Prop({})
  stripePriceId: string;
  @Prop({})
  skuCode?: string;
}
export const SkuDetailsSchema = SchemaFactory.createForClass(SkuDetails);

@Schema({ timestamps: true })
export class Products {
  @Prop({ requied: true })
  productName: string;
  @Prop({ requied: true })
  description: string;
  @Prop({
    default:
      'https://png.pngtree.com/png-vector/20221125/ourmid/pngtree-no-image-available-icon-flatvector-illustration-pic-design-profile-vector-png-image_40966566.jpg',
  })
  image?: string;
  @Prop({
    requied: true,
    enum: [categoryType.applicationSoftware, categoryType.operatingSystem],
  })
  category: string;
  @Prop({ requied: true, enum: [baseType.computer, baseType.mobile] })
  baseType: string;
  @Prop({
    requied: true,
    enum: [
      platformType.android,
      platformType.ios,
      platformType.linux,
      platformType.mac,
      platformType.windows,
    ],
  })
  platformType: string;
  @Prop({ requied: true })
  productUrl: string;
  @Prop({ requied: true })
  downloadUrl: string;
  @Prop({})
  avgRating: number;
  @Prop([{ type: FeedbackSchema }])
  feedbackDetails: Feedbackers[];
  @Prop([{ type: SkuDetailsSchema }])
  skuDetails: SkuDetails[];
  @Prop({ type: Object })
  imageDetails: Record<string, any>;
  @Prop({})
  requirementSpecification: Record<string, any>[];
  @Prop({})
  highlights: string[];
  @Prop({})
  stripeProductId: string;
}
export const ProductSchema = SchemaFactory.createForClass(Products);
