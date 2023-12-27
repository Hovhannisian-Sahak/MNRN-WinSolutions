import Api, { responsePayload } from "./api";
export const User = {
  getUsers: async (): Promise<responsePayload> => await Api.get("/users"),
  createUsers: async (user: Record<string, any>): Promise<responsePayload> =>
    await Api.post("/users", user),
  updateUser: async (
    id: string,
    user: Record<string, any>
  ): Promise<responsePayload> =>
    await Api.patch("/users/update-name-password/" + id, user),
  loginUser: async (user: Record<string, any>): Promise<responsePayload> =>
    await Api.post("/users/login", user),
  logoutUser: async (): Promise<responsePayload> =>
    await Api.put("/users/logout", {}),
  forgotPassword: async (email: string): Promise<responsePayload> =>
    await Api.get("/users/forgot-password/" + email),
  resendOtp: async (email: string): Promise<responsePayload> =>
    await Api.get("/users/send-otp-email/" + email),
  verifyOtp: async (otp: string, email: string): Promise<responsePayload> =>
    await Api.get("/users/verify-email/" + otp + "/" + email),
};
