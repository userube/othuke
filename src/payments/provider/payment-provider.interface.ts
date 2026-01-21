export interface PaymentProvider {
    initializePayment(
        amount: number,
        email: string,
        reference: string,
    ): Promise<{ paymentUrl: string }>;

    verifyPayment(
        reference: string,
    ): Promise<{ success: boolean }>;
}
