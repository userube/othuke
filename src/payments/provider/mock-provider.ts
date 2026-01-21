import { PaymentProvider } from './payment-provider.interface';

export class MockPaymentProvider
    implements PaymentProvider
{
    async initializePayment() {
        return {
            paymentUrl: 'https://mock-payment.com/pay',
        };
    }

    async verifyPayment() {
        return { success: true };
    }
}
