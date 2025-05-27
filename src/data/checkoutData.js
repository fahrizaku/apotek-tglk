//file: src/data/checkoutData.js
import { CreditCard, Package } from "lucide-react";

// Area data with shipping costs and express costs
export const areaData = [
  { name: "Krandegan", cost: 0, expressCost: 5000 },
  { name: "Sukorame", cost: 5000, expressCost: 7000 },
  { name: "Melis", cost: 5000, expressCost: 8000 },
  { name: "Karanganyar", cost: 8000, expressCost: 10000 },
  { name: "Widoro", cost: 8000, expressCost: 12000 },
  { name: "Ngadirenggo", cost: 10000, expressCost: 15000 },
  { name: "Ngetal", cost: 10000, expressCost: 15000 },
  { name: "Wonocoyo", cost: 12000, expressCost: 18000 },
  { name: "Bendorejo", cost: 12000, expressCost: 20000 },
];

// Delivery time options with global availability
export const deliveryTimeOptions = [
  {
    id: "regular",
    name: "Regular",
    description: "Pengiriman standar",
    available: true,
  },
  {
    id: "secepatnya",
    name: "Secepatnya",
    description: "Prioritas pengiriman cepat",
    available: true, // Set to false to disable express for all areas
  },
];

// Payment methods
export const paymentMethods = [
  {
    id: "cod",
    name: "Bayar di Tempat (COD)",
    description: "Bayar saat barang diterima",
    icon: <Package className="w-5 h-5" />,
  },
  {
    id: "transfer",
    name: "Transfer Bank",
    description: "Transfer ke rekening apotek",
    icon: <CreditCard className="w-5 h-5" />,
  },
];
