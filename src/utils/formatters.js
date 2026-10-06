/**
 * Utility formatters and calculations for Automobile GST Inventory & Billing
 */

export const INDIAN_STATES = [
  { code: '01', name: 'Jammu & Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '27', name: 'Maharashtra' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
];

export function formatCurrency(amount, withSymbol = true) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return withSymbol ? '₹0.00' : '0.00';
  }
  const formatted = Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return withSymbol ? `₹${formatted}` : formatted;
}

export function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString) {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

/**
 * Calculates line item details:
 * Qty, Rate, Discount, GST %, Inclusive/Exclusive
 */
export function calculateLineItem(item, isGstInclusive = false) {
  const qty = Number(item.quantity) || 0;
  const rate = Number(item.rate) || 0;
  const discount = Number(item.discount) || 0; // either flat amount or handled outside
  const gstRate = Number(item.gstPercent) || 0;

  let gross = qty * rate;
  let taxableValue = 0;
  let gstAmount = 0;
  let totalAmount = 0;

  if (isGstInclusive) {
    // If rate includes GST:
    // Taxable = (Gross - Discount) / (1 + GST / 100)
    const discountedGross = Math.max(0, gross - discount);
    taxableValue = discountedGross / (1 + gstRate / 100);
    gstAmount = discountedGross - taxableValue;
    totalAmount = discountedGross;
  } else {
    // Standard GST Exclusive
    taxableValue = Math.max(0, gross - discount);
    gstAmount = (taxableValue * gstRate) / 100;
    totalAmount = taxableValue + gstAmount;
  }

  return {
    gross: Number(gross.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    taxableValue: Number(taxableValue.toFixed(2)),
    gstAmount: Number(gstAmount.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2)),
  };
}

/**
 * Calculate full invoice totals including intra-state vs inter-state tax split
 */
export function calculateInvoiceTotals({
  items,
  overallDiscount = 0,
  businessStateCode = '27',
  customerStateCode = '27',
  isGstInclusive = false,
}) {
  let subtotal = 0;
  let totalDiscount = Number(overallDiscount) || 0;
  let totalTaxable = 0;
  let totalGst = 0;

  const calculatedItems = items.map((item) => {
    const calc = calculateLineItem(item, isGstInclusive);
    subtotal += calc.gross;
    totalDiscount += calc.discount;
    totalTaxable += calc.taxableValue;
    totalGst += calc.gstAmount;
    return {
      ...item,
      ...calc,
    };
  });

  const isIntraState = businessStateCode === customerStateCode;

  const cgstAmount = isIntraState ? totalGst / 2 : 0;
  const sgstAmount = isIntraState ? totalGst / 2 : 0;
  const igstAmount = isIntraState ? 0 : totalGst;

  const rawGrandTotal = totalTaxable + totalGst;
  const grandTotalRounded = Math.round(rawGrandTotal);
  const roundOff = grandTotalRounded - rawGrandTotal;

  return {
    items: calculatedItems,
    subtotal: Number(subtotal.toFixed(2)),
    totalDiscount: Number(totalDiscount.toFixed(2)),
    taxableAmount: Number(totalTaxable.toFixed(2)),
    cgst: Number(cgstAmount.toFixed(2)),
    sgst: Number(sgstAmount.toFixed(2)),
    igst: Number(igstAmount.toFixed(2)),
    totalTax: Number(totalGst.toFixed(2)),
    roundOff: Number(roundOff.toFixed(2)),
    grandTotal: grandTotalRounded,
    isIntraState,
  };
}
