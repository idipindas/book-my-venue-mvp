import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/store/ui.store';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string;

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open(): void;
  on(event: 'payment.failed', handler: () => void): void;
}

function loadCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-checkout-js')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function useRazorpayCheckout() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const checkout = useCallback(
    async (bookingId: string, amount: number, venueName: string) => {
      const loaded = await loadCheckoutScript();
      if (!loaded) {
        toast.error('Failed to load payment gateway. Please try again.');
        return;
      }

      let orderId: string;
      let orderAmount: number;

      try {
        const { data } = await api.post<{
          success: boolean;
          data: { orderId: string; amount: number; currency: string };
        }>('/payments/initiate', { bookingId });
        orderId = data.data.orderId;
        orderAmount = data.data.amount;
      } catch (err: unknown) {
        const e = err as { response?: { data?: { error?: { message?: string } } } };
        toast.error(e?.response?.data?.error?.message ?? 'Could not create payment order.');
        return;
      }

      const rzp = new window.Razorpay({
        key: RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency: 'INR',
        name: 'BookMyVenue',
        description: venueName,
        order_id: orderId,
        prefill: { name: user?.name ?? '', email: user?.email ?? '' },
        theme: { color: '#0D9488' },
        modal: {
          ondismiss: () => toast.error('Payment cancelled.'),
        },
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              bookingId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success('Payment successful! Booking confirmed.');
            navigate('/dashboard/bookings');
          } catch {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
      });

      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.');
      });

      rzp.open();
    },
    [user, navigate]
  );

  return { checkout };
}
