export {};

declare global {
  interface Window {
    addToCart: (productId: string) => Promise<void>;
    updateCartItem: (productId: string, action: 'add' | 'subtract' | 'remove') => Promise<void>;
    showToast: (message: string, isError?: boolean) => void;
  }
}