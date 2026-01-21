// src/users/responses/user.response.ts
export const mapUserResponse = (user: any) => ({
    id: user.id,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    customerProfile: user.customerProfile,
    vendorProfile: user.vendorProfile,
    createdAt: user.createdAt,
});
