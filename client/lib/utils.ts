import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | null | undefined) {
  const num = typeof amount === "string" ? Number(amount) : amount ?? 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      // Changed to 'NGN' for Nigerian Nair
      currency: "NGN",
      maximumFractionDigits: 2,
    }).format(isFinite(num as number) ? (num as number) : 0);
  } catch {
    // Changed fallback to use the Naira symbol (₦)
    return `₦${Number(num || 0).toFixed(2)}`;
  }
}
