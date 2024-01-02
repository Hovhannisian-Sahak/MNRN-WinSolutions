import Api, { responsePayload } from "./api";
export const Product = {
  createProduct: async (
    product: Record<string, any>
  ): Promise<responsePayload> => await Api.post("/products", product),
  updateProduct: async (
    id: string,
    product: Record<string, any>
  ): Promise<responsePayload> => await Api.patch("/products/" + id, product),
  deleteProduct: async (id: string): Promise<responsePayload> =>
    await Api.del("/products/" + id),
  getProducts: async (): Promise<responsePayload> => await Api.get("/products"),
  uploadProductImage: async (
    id: string,
    formData: any
  ): Promise<responsePayload> => {
    return await Api.post(`/products/${id}/image`, formData);
  },
  updateSku: async (
    id: string,
    skuid: string,
    sku: Record<string, any>
  ): Promise<responsePayload> =>
    await Api.put(`/products/${id}/skus/${skuid}`, sku),
  createSku: async (
    id: string,
    sku: Record<string, any>
  ): Promise<responsePayload> => await Api.post(`/products/${id}/skus`, sku),
  deleteSku: async (id: string, skuId: string): Promise<responsePayload> => {
    return await Api.del(`/products/${id}/skus/${skuId}`);
  },
  updateLicense: async (
    id: string,
    skuId: string,
    licenseKeyForUpdate: string,
    data: Record<string, any>
  ): Promise<responsePayload> =>
    await Api.put(
      `/products/${id}/skus/${skuId}/licenses/${licenseKeyForUpdate}`,
      data
    ),

  createLicense: async (
    id: string,
    skuId: string,
    data: Record<string, any>
  ): Promise<responsePayload> =>
    await Api.post(`/products/${id}/skus/${skuId}/licenses`, data),

  deleteLicense: async (licenseId: string): Promise<responsePayload> =>
    await Api.del(`/products/licenses/${licenseId}`),

  getSkuLicenses: async (productId: string, skuId: string) =>
    await Api.get(`/products/${productId}/skus/${skuId}/licenses`),
};
