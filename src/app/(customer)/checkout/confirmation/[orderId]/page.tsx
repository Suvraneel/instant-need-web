"use client";

import { use } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Package,
  MapPin,
  CreditCard,
  ArrowRight,
  ClipboardList,
  Printer,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { useOrder } from "@/lib/hooks/useOrders";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

const NAVY = "#0d2b5e";
const BLUE = "#1a56db";

const COMPANY = {
  name: "InstantNeed Private Limited",
  line1: "5959, 12 Cross Road",
  line2: "Ambala Cantt, Haryana 133001",
  phone: "+91 8295781959",
  email: "Support@instantneed.in",
  website: "www.instantneed.in",
};

function orderRef(id: string) {
  const letters = id.replace(/[^a-fA-F]/g, "").slice(0, 2).toUpperCase();
  const digits = id.replace(/\D/g, "").slice(0, 4);
  return `IN${letters}${digits}`;
}

function formatInvoiceDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function amountToWords(amount: number): string {
  const num = Math.round(amount);
  if (num === 0) return "Zero Rupees Only";
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tensArr = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  function words(n: number): string {
    if (n === 0) return "";
    if (n < 20) return ones[n] + " ";
    if (n < 100) return tensArr[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "") + " ";
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred " + words(n % 100);
    if (n < 100000) return words(Math.floor(n / 1000)) + "Thousand " + words(n % 1000);
    if (n < 10000000) return words(Math.floor(n / 100000)) + "Lakh " + words(n % 100000);
    return words(Math.floor(n / 10000000)) + "Crore " + words(n % 10000000);
  }
  return "Rupees " + words(num).trim() + " Only";
}

interface ConfirmationPageProps {
  params: Promise<{ orderId: string }>;
}

export default function OrderConfirmationPage({ params }: ConfirmationPageProps) {
  const { orderId } = use(params);
  const { data: order, isLoading } = useOrder(orderId);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-6">
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-xl font-semibold">Order not found</h1>
        <p className="text-muted-foreground text-sm">
          We couldn&apos;t load your order details. Your order may still have been placed.
        </p>
        <Link href="/account/orders" className={cn(buttonVariants())}>
          View my orders
        </Link>
      </div>
    );
  }

  const roundOff = Math.round(order.totalAmount) - order.totalAmount;
  const displayTotal = Math.round(order.totalAmount);
  const orderDisplay = order.orderNumber || orderRef(order.id);
  const addr = order.shippingAddress;

  return (
    <>
      {/* Print-page CSS */}
      <style>{`
        @media print {
          @page { margin: 8mm 12mm; size: A4 portrait; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* ── Screen layout ─────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8 print:hidden">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-9 w-9 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Order placed!</h1>
          <p className="text-muted-foreground">
            Thank you for your order. We&apos;ll notify you when it ships.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-sm font-medium">
            <ClipboardList className="h-4 w-4" />
            #{orderDisplay}
          </div>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-muted/40 border-b">
            <div className="text-sm">
              <span className="text-muted-foreground">Placed on </span>
              <span className="font-medium">{formatDateTime(order.placedAt)}</span>
            </div>
            <StatusBadge status={order.status} />
          </div>
          <div className="divide-y">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                  <Package className="h-5 w-5 text-muted-foreground/40" strokeWidth={1} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.sku} · Quantity: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium shrink-0">
                  {formatCurrency(item.lineTotal, item.currencyCode)}
                </p>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 bg-muted/20 border-t space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotalAmount, order.currencyCode)}</span>
            </div>
            {order.shippingAmount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{formatCurrency(order.shippingAmount, order.currencyCode)}</span>
              </div>
            )}
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>−{formatCurrency(order.discountAmount, order.currencyCode)}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount, order.currencyCode)}</span>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Shipping to
            </div>
            {addr ? (
              <div className="text-sm text-muted-foreground space-y-0.5">
                <p className="font-medium text-foreground">{addr.fullName}</p>
                <p>{addr.addressLine1}</p>
                {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                {addr.phoneNumber && <p>{addr.phoneNumber}</p>}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Address not available</p>
            )}
          </div>
          <div className="rounded-xl border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Payment
            </div>
            <p className="text-sm text-muted-foreground capitalize">
              {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}
            </p>
            <p className="text-xs text-muted-foreground">Payment due on delivery</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href={`/account/orders/${order.id}`}
            className={cn(buttonVariants(), "flex-1 justify-center")}
          >
            Track order <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href="/products"
            className={cn(buttonVariants({ variant: "outline" }), "flex-1 justify-center")}
          >
            Continue shopping
          </Link>
          <button
            onClick={() => window.print()}
            className={cn(buttonVariants({ variant: "ghost" }), "sm:ml-auto")}
            aria-label="Print order confirmation"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
        </div>
      </div>

      {/* ── Print / PDF invoice ────────────────────────────────────────────── */}
      <div
        className="hidden print:block"
        style={{
          fontFamily: "'Arial', sans-serif",
          fontSize: "11px",
          color: "#222",
          lineHeight: "1.4",
        }}
      >
        {/* ── Top header: logo + order confirmation ── */}
        <table style={{ width: "100%", marginBottom: "10px", borderBottom: `2px solid #d0d8ea`, paddingBottom: "10px" }}>
          <tbody>
            <tr>
              <td style={{ verticalAlign: "top" }}>
                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {/* Same SVG as InstantNeedIcon in brand.tsx */}
                  <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="64" height="64" rx="15" fill="#2563eb"/>
                    <path d="M35 10L19 37L30 37L24 54L40 27L30 27Z" fill="white"/>
                  </svg>
                  <div>
                    <div style={{ fontSize: "22px", fontWeight: "bold", lineHeight: 1 }}>
                      <span style={{ color: BLUE }}>Instant</span>
                      <span style={{ color: NAVY }}>Need</span>
                    </div>
                    <div style={{ color: "#666", fontSize: "10px", marginTop: "2px" }}>Your Business, Our Priority.</div>
                    <div style={{ borderBottom: "1px solid #ccd4e8", marginTop: "5px", width: "170px" }} />
                  </div>
                </div>
              </td>
              <td style={{ textAlign: "right", verticalAlign: "top" }}>
                <div style={{ color: BLUE, fontSize: "19px", fontWeight: "bold", marginBottom: "6px", letterSpacing: "0.3px" }}>
                  ORDER CONFIRMATION
                </div>
                <div style={{ marginBottom: "3px" }}><strong>Order ID:</strong> #{orderDisplay}</div>
                <div><strong>Date:</strong> {formatInvoiceDate(order.placedAt)}</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── Company info + Order Placed ── */}
        <table style={{ width: "100%", marginBottom: "18px" }}>
          <tbody>
            <tr>
              <td style={{ verticalAlign: "top", width: "55%" }}>
                <div style={{ color: BLUE, fontWeight: "bold", fontSize: "12px", marginBottom: "4px" }}>{COMPANY.name}</div>
                <div>{COMPANY.line1}</div>
                <div style={{ marginBottom: "5px" }}>{COMPANY.line2}</div>
                <table>
                  <tbody>
                    <tr>
                      <td style={{ paddingRight: "6px", color: BLUE }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 14 19.79 19.79 0 0 1 1.92 5.45 2 2 0 0 1 3.89 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17.92z"/></svg>
                      </td>
                      <td><strong>Phone:</strong> {COMPANY.phone}</td>
                    </tr>
                    <tr>
                      <td style={{ paddingRight: "6px", color: BLUE }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      </td>
                      <td><strong>Email:</strong> {COMPANY.email}</td>
                    </tr>
                    <tr>
                      <td style={{ paddingRight: "6px", color: BLUE }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                      </td>
                      <td><strong>Website:</strong> {COMPANY.website}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td style={{ verticalAlign: "top", width: "45%", paddingLeft: "16px" }}>
                <div style={{ border: "1px solid #d0d8ea", borderRadius: "8px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "50%", backgroundColor: BLUE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <div style={{ color: BLUE, fontWeight: "bold", fontSize: "14px", marginBottom: "3px" }}>Order Placed!</div>
                    <div style={{ color: "#555", fontSize: "10.5px" }}>Thank you for your order.</div>
                    <div style={{ color: "#555", fontSize: "10.5px" }}>We&apos;ll notify you when it ships.</div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── Order Summary ── */}
        <div style={{ marginBottom: "12px" }}>
          {/* Header bar with chevron arrow on right */}
          <div style={{ backgroundColor: NAVY, color: "white", padding: "8px 14px", display: "flex", alignItems: "center", gap: "8px", position: "relative", clipPath: "polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            <span style={{ fontWeight: "bold", fontSize: "13px", letterSpacing: "0.5px" }}>ORDER SUMMARY</span>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #d0d8ea", borderTop: "none" }}>
            <thead>
              {/* Column headers — brighter blue, matching img2 */}
              <tr style={{ backgroundColor: BLUE, color: "white" }}>
                <th style={{ padding: "8px 10px", width: "36px", textAlign: "center", fontSize: "10.5px", fontWeight: "bold", letterSpacing: "0.4px" }}>#</th>
                <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "10.5px", fontWeight: "bold", letterSpacing: "0.4px" }}>ITEM NAME</th>
                <th style={{ padding: "8px 10px", textAlign: "center", fontSize: "10.5px", fontWeight: "bold", letterSpacing: "0.4px" }}>QUANTITY</th>
                <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "10.5px", fontWeight: "bold", letterSpacing: "0.4px" }}>RATE (₹)</th>
                <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "10.5px", fontWeight: "bold", letterSpacing: "0.4px" }}>AMOUNT (₹)</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, i) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #e4eaf5" }}>
                  {/* Row number in blue */}
                  <td style={{ padding: "10px", textAlign: "center", color: BLUE, fontWeight: "600" }}>{i + 1}</td>
                  <td style={{ padding: "10px" }}>
                    <div style={{ fontWeight: "700", fontSize: "12px", marginBottom: "2px" }}>{item.productName}</div>
                    <div style={{ color: BLUE, fontSize: "10px" }}>{item.sku}</div>
                  </td>
                  <td style={{ padding: "10px", textAlign: "center", fontSize: "12px" }}>{item.quantity}</td>
                  <td style={{ padding: "10px", textAlign: "right", fontSize: "12px" }}>
                    {item.unitPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: "10px", textAlign: "right", fontSize: "12px" }}>
                    {item.lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "2px solid #d0d8ea" }}>
                <td colSpan={2}></td>
                <td colSpan={2} style={{ padding: "7px 10px", color: BLUE, fontWeight: "700", textAlign: "right" }}>Subtotal</td>
                <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: "700" }}>
                  ₹{order.subtotalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
              {order.shippingAmount > 0 && (
                <tr>
                  <td colSpan={2}></td>
                  <td colSpan={2} style={{ padding: "3px 10px", color: "#555", textAlign: "right" }}>Shipping</td>
                  <td style={{ padding: "3px 10px", textAlign: "right" }}>
                    ₹{order.shippingAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              )}
              {order.discountAmount > 0 && (
                <tr>
                  <td colSpan={2}></td>
                  <td colSpan={2} style={{ padding: "3px 10px", color: "#16a34a", textAlign: "right" }}>Discount</td>
                  <td style={{ padding: "3px 10px", textAlign: "right", color: "#16a34a" }}>
                    −₹{order.discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              )}
              {Math.abs(roundOff) >= 0.01 && (
                <tr>
                  <td colSpan={2}></td>
                  <td colSpan={2} style={{ padding: "3px 10px", color: "#555", textAlign: "right" }}>Round Off</td>
                  <td style={{ padding: "3px 10px", textAlign: "right" }}>
                    ₹{roundOff.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              )}
              <tr style={{ backgroundColor: NAVY, color: "white" }}>
                <td colSpan={3} style={{ padding: "10px" }}></td>
                <td style={{ padding: "10px", fontWeight: "bold", fontSize: "12px", letterSpacing: "0.4px", textAlign: "right" }}>TOTAL AMOUNT</td>
                <td style={{ padding: "10px", textAlign: "right", fontWeight: "bold", fontSize: "16px" }}>
                  ₹{displayTotal.toLocaleString("en-IN")}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* ── Amount in Words ── */}
        <p style={{ marginBottom: "12px", fontSize: "11px" }}>
          <strong style={{ color: NAVY }}>Amount in Words:</strong>{" "}
          {amountToWords(displayTotal)}
        </p>

        {/* ── Shipping + Payment ── */}
        <table style={{ width: "100%", marginBottom: "12px", borderCollapse: "separate", borderSpacing: "10px 0" }}>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #d0d8ea", borderRadius: "7px", padding: "10px 12px", verticalAlign: "top", width: "50%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", color: BLUE, fontWeight: "bold", fontSize: "11px", marginBottom: "7px", paddingBottom: "6px", borderBottom: "1px dashed #d0d8ea" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  SHIPPING ADDRESS
                </div>
                {addr ? (
                  <div style={{ lineHeight: "1.6", fontSize: "11px" }}>
                    <div style={{ fontWeight: "600" }}>{addr.fullName}</div>
                    <div>{addr.addressLine1}</div>
                    {addr.addressLine2 && <div>{addr.addressLine2}</div>}
                    <div>{addr.city}, {addr.state} {addr.postalCode}</div>
                    {addr.phoneNumber && <div>{addr.phoneNumber}</div>}
                  </div>
                ) : (
                  <div style={{ color: "#888" }}>Address not available</div>
                )}
              </td>
              <td style={{ border: "1px solid #d0d8ea", borderRadius: "7px", padding: "10px 12px", verticalAlign: "top", width: "50%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", color: BLUE, fontWeight: "bold", fontSize: "11px", marginBottom: "7px", paddingBottom: "6px", borderBottom: "1px dashed #d0d8ea" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  PAYMENT METHOD
                </div>
                <div style={{ fontWeight: "600", marginBottom: "3px" }}>
                  {order.paymentMethod === "cod" ? "Cash On Delivery" : order.paymentMethod}
                </div>
                <div style={{ color: "#666", fontSize: "10.5px" }}>Payment due on delivery</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── Feature icons — horizontal layout (icon left, text right) ── */}
        <table style={{ width: "100%", border: "1px solid #d0d8ea", borderRadius: "7px", marginBottom: "12px", borderCollapse: "collapse", overflow: "hidden" }}>
          <tbody>
            <tr>
              {[
                {
                  icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
                  label: "100%", sub: "Authentic Products",
                },
                {
                  icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="16" y1="8" x2="8" y2="16"/><circle cx="8.5" cy="8.5" r="1.5"/><circle cx="15.5" cy="15.5" r="1.5"/></svg>,
                  label: "Best", sub: "Prices",
                },
                {
                  icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/><line x1="5" y1="8" x2="1" y2="8"/></svg>,
                  label: "Fast & Safe", sub: "Delivery",
                },
                {
                  icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>,
                  label: "Dedicated", sub: "Support",
                },
              ].map((f, i) => (
                <td
                  key={f.sub}
                  style={{
                    padding: "10px 12px",
                    borderRight: i < 3 ? "1px solid #d0d8ea" : "none",
                    width: "25%",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ flexShrink: 0 }}>{f.icon}</div>
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "11px", color: "#222" }}>{f.label}</div>
                      <div style={{ fontSize: "10px", color: "#555" }}>{f.sub}</div>
                    </div>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        {/* ── Pre-footer ── */}
        <table style={{ width: "100%", marginBottom: "10px" }}>
          <tbody>
            <tr>
              <td style={{ verticalAlign: "top", fontSize: "10.5px", lineHeight: "1.7" }}>
                <div style={{ color: NAVY, fontWeight: "bold", marginBottom: "3px" }}>Need Help?</div>
                <div>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 14 19.79 19.79 0 0 1 1.92 5.45 2 2 0 0 1 3.89 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17.92z"/></svg>
                  Phone: {COMPANY.phone}
                </div>
                <div>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  Email: {COMPANY.email}
                </div>
                <div>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Mon – Sat | 10:00 AM – 7:00 PM
                </div>
              </td>
              <td style={{ textAlign: "right", verticalAlign: "bottom" }}>
                <div style={{ color: BLUE, fontWeight: "bold", fontSize: "12.5px", marginBottom: "3px" }}>
                  Thank you for choosing InstantNeed.
                </div>
                <div style={{ color: "#555", fontSize: "10.5px" }}>
                  We look forward to serving your business again!
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── Bottom bar ── */}
        <div style={{ backgroundColor: NAVY, color: "white", padding: "8px 14px", borderRadius: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", fontWeight: "bold", fontSize: "12px" }}>
            <svg width="16" height="16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="64" height="64" rx="15" fill="white" fillOpacity="0.2"/>
              <path d="M35 10L19 37L30 37L24 54L40 27L30 27Z" fill="white"/>
            </svg>
            InstantNeed
          </div>
          <div style={{ color: "#c0ceea", fontSize: "10px" }}>
            This is a system generated invoice and does not require a signature.
          </div>
        </div>
      </div>
    </>
  );
}
