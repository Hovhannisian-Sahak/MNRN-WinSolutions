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
};
