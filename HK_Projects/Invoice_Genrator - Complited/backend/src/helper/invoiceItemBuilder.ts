import { calculateGST } from "./gstCalculator";

export const buildInvoiceItems = (
  items: any[],
  products: any[],
  gstType: "IGST" | "CGST_SGST",
  gstPercent: number
) => {

  let subTotal = 0;
  let gstTotal = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;

  const invoiceItems: any[] = [];

  for (const item of items) {

    const product = products.find(
      (p) => p._id.toString() === item.productId
    );

    if (!product) throw new Error("PRODUCT_NOT_FOUND");

    const rate = item.rate || 0;
    const mrp = item.mrp || 0;
    const qty = item.qty || 1;

    const base = rate * qty;

    const { gst, cgst, sgst, igst } = calculateGST(
      base,
      gstType,
      gstPercent
    );

    const total = base + gst;

    subTotal += base;
    gstTotal += gst;
    cgstTotal += cgst;
    sgstTotal += sgst;
    igstTotal += igst;

    invoiceItems.push({
      productId: product._id,
      name: product.name,
      category: (product.category as any)?.name || "N/A",
      rate,
      mrp,
      qty,
      gstPercent,
      gstAmount: gst,
      cgstAmount: cgst,
      sgstAmount: sgst,
      igstAmount: igst,
      total,
    });
  }

  return {
    invoiceItems,
    subTotal,
    gstTotal,
    cgstTotal,
    sgstTotal,
    igstTotal,
  };
};