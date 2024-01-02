import Api, { responsePayload } from "./api";
export const Order = {
  checkoutSession: async (cartItems: any): Promise<responsePayload> =>
    await Api.post("/orders/checkout", {
      checkoutDetails: cartItems,
    }),
  fetchAll: async (status?: string): Promise<responsePayload> =>
    await Api.get(`/orders?status${status}`),
  getOrder: async (id: string): Promise<responsePayload> =>
    await Api.get(`/orders/${id}`),
};
