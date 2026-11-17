import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)));
  return `Rp${formatted}`;
}

export interface UmkmCartLine {
  name: string;
  price: number;
  qty: number;
  unitLabel: string;
}

export function formatUmkmWhatsAppMessage(params: {
  businessName: string;
  items: UmkmCartLine[];
  customerName: string;
  fulfillment: "Ambil di Tempat" | "Kurir Instan";
  address: string;
  notes: string;
}): string {
  const validItems = params.items.filter((item) => item.qty > 0);
  const total = validItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const lines = [
    `Halo ${params.businessName}, saya mau pesan:`,
    "",
    ...validItems.map(
      (item, index) =>
        `${index + 1}. ${item.name} (${item.qty} ${item.unitLabel}) - ${formatRupiah(item.price * item.qty)}`
    ),
    "",
    `Total Perkiraan: ${formatRupiah(total)}`,
    `Atas Nama: ${params.customerName.trim() || "Pelanggan"}`,
    `Pengambilan: ${params.fulfillment}`,
  ];

  if (params.fulfillment === "Kurir Instan" && params.address.trim()) {
    lines.push(`Alamat Antar: ${params.address.trim()}`);
  }
  if (params.notes.trim()) {
    lines.push(`Catatan: ${params.notes.trim()}`);
  }

  return lines.join("\n");
}

export function normalizeWhatsAppPhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }
  return digits;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalized = normalizeWhatsAppPhone(phone);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function buildWeddingGuestLink(baseUrl: string, guestName: string): string {
  const trimmedBase = baseUrl.replace(/\/+$/, "");
  const trimmedGuest = guestName.trim();
  if (!trimmedGuest) return trimmedBase;
  return `${trimmedBase}/?to=${encodeURIComponent(trimmedGuest)}`;
}
