import React from 'react';
import { numberToWordsIndian } from '../../utils/numberToWords';
import { formatDate } from '../../utils/formatters';

export default function PrintableInvoice({ invoice, settings }) {
  if (!invoice) return null;

  const currentSettings = settings || {};
  const businessName = currentSettings.businessName || 'Routh Automobile';
  const shopAddress = currentSettings.address || 'kanchanpur,khanta.bankura';
  const phone = currentSettings.phone || '9641454272';
  const email = currentSettings.email || 'routhautomobiles@gmail.com';

  const invoiceDate = formatDate(invoice.date);

  const subtotal = Number(invoice.subtotal || 0);
  const totalDiscount = Number(invoice.totalDiscount || 0);
  const roundOff = invoice.roundOff ? Number(invoice.roundOff) : 0;
  const grandTotal = Number(invoice.grandTotal || 0);
  const paidAmount = Number(invoice.paidAmount || 0);
  const balanceDue = Number(
    invoice.balanceDue !== undefined && invoice.balanceDue !== null
      ? invoice.balanceDue
      : Math.max(0, grandTotal - paidAmount)
  );

  const formatNum = (val, decimals = 2) => {
    return Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const amountInWords = numberToWordsIndian(grandTotal);

  return (
    <div className="printable-invoice bg-white text-black mx-auto w-full max-w-[800px] p-6 sm:p-8 font-sans text-xs select-text print:p-0 print:border-none print:shadow-none print:max-w-none">
      
      {/* Top Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight leading-tight">
            {businessName}
          </h1>
          <p className="text-xs text-black mt-1 leading-normal">
            {shopAddress}
          </p>
          <p className="text-xs text-black leading-normal">
            Phone: {phone}
          </p>
          {email && (
            <p className="text-xs text-black leading-normal">
              Email: {email}
            </p>
          )}
        </div>

        <div className="text-right">
          <div className="text-xs text-black font-normal">
            Date: {invoiceDate}
          </div>
          {invoice.invoiceNumber && (
            <div className="text-xs text-black mt-0.5">
              Bill No: {invoice.invoiceNumber}
            </div>
          )}
        </div>
      </div>

      {/* BILL TO Box */}
      <div className="border border-black p-3 mb-4 bg-white">
        <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
          BILL TO
        </div>
        <div className="font-bold text-sm text-black">
          {invoice.customerName || 'Customer'}
        </div>
        {invoice.customerPhone && (
          <div className="text-xs text-black mt-0.5">
            Phone: {invoice.customerPhone}
          </div>
        )}
        {invoice.vehicleNumber && (
          <div className="text-xs text-black mt-0.5">
            Vehicle: {invoice.vehicleNumber} {invoice.vehicleModel ? `(${invoice.vehicleModel})` : ''}
          </div>
        )}
        {invoice.customerAddress && invoice.customerAddress !== 'Counter Sale / Local' && (
          <div className="text-xs text-slate-700 mt-0.5">
            {invoice.customerAddress}
          </div>
        )}
      </div>

      {/* ITEMS TABLE */}
      <div className="border border-black overflow-hidden mb-4">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-black">
              <th className="border-r border-black py-2 px-2 text-center font-bold text-black uppercase w-[7%]">
                S.No.
              </th>
              <th className="border-r border-black py-2 px-3 text-left font-bold text-black uppercase w-[45%]">
                ITEMS
              </th>
              <th className="border-r border-black py-2 px-3 text-right font-bold text-black uppercase w-[13%]">
                QTY
              </th>
              <th className="border-r border-black py-2 px-3 text-right font-bold text-black uppercase w-[11%]">
                RATE
              </th>
              <th className="border-r border-black py-2 px-3 text-right font-bold text-black uppercase w-[10%]">
                DISC.
              </th>
              <th className="py-2 px-3 text-right font-bold text-black uppercase w-[14%]">
                AMOUNT
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items && invoice.items.map((item, index) => {
              const qty = Number(item.quantity) || 1;
              const rate = Number(item.rate) || 0;
              const disc = Number(item.discount) || 0;
              const gross = qty * rate;
              const itemTotal = item.totalAmount || Math.max(0, gross - disc);
              const unitStr = item.unit ? ` ${item.unit}` : '';

              return (
                <tr key={index}>
                  <td className="border-r border-black py-1.5 px-2 text-center text-black">
                    {index + 1}
                  </td>
                  <td className="border-r border-black py-1.5 px-3 text-left text-black">
                    <div>{item.name}</div>
                    {item.partNumber && (
                      <div className="text-[10px] text-slate-500">Part: {item.partNumber}</div>
                    )}
                  </td>
                  <td className="border-r border-black py-1.5 px-3 text-right text-black">
                    {Number(qty).toFixed(1)}{unitStr}
                  </td>
                  <td className="border-r border-black py-1.5 px-3 text-right text-black">
                    {formatNum(rate)}
                  </td>
                  <td className="border-r border-black py-1.5 px-3 text-right text-black">
                    {formatNum(disc)}
                  </td>
                  <td className="py-1.5 px-3 text-right text-black">
                    {formatNum(itemTotal)}
                  </td>
                </tr>
              );
            })}

            {/* Subtotal Row */}
            <tr>
              <td className="border-r border-black py-1.5 px-2"></td>
              <td className="border-r border-black py-1.5 px-3 font-bold italic text-black">
                Subtotal
              </td>
              <td className="border-r border-black py-1.5 px-3 text-right text-black">-</td>
              <td className="border-r border-black py-1.5 px-3 text-right text-black">-</td>
              <td className="border-r border-black py-1.5 px-3 text-right text-black">-</td>
              <td className="py-1.5 px-3 text-right font-bold text-black">
                {formatNum(subtotal)}
              </td>
            </tr>

            {/* Dashed Separator Line */}
            <tr className="border-t border-dashed border-black">
              <td className="border-r border-black py-1 px-2"></td>
              <td className="border-r border-black py-1 px-3 font-bold italic text-black">
                Round Off
              </td>
              <td className="border-r border-black py-1 px-3 text-right text-black">-</td>
              <td className="border-r border-black py-1 px-3 text-right text-black">-</td>
              <td className="border-r border-black py-1 px-3 text-right text-black">-</td>
              <td className="py-1 px-3 text-right text-black">
                {roundOff !== 0 ? formatNum(roundOff) : ''}
              </td>
            </tr>

            {/* TOTAL Row */}
            <tr className="border-t border-black">
              <td className="border-r border-black py-1.5 px-2"></td>
              <td className="border-r border-black py-1.5 px-3 font-bold text-black">
                TOTAL
              </td>
              <td className="border-r border-black py-1.5 px-3"></td>
              <td className="border-r border-black py-1.5 px-3"></td>
              <td className="border-r border-black py-1.5 px-3 text-right font-bold text-black">
                {formatNum(totalDiscount)}
              </td>
              <td className="py-1.5 px-3 text-right font-bold text-black">
                {formatNum(grandTotal)}
              </td>
            </tr>

            {/* RECEIVED AMOUNT Row */}
            <tr className="border-t border-black">
              <td className="border-r border-black py-1.5 px-2"></td>
              <td className="border-r border-black py-1.5 px-3 font-bold text-black">
                RECEIVED AMOUNT
              </td>
              <td className="border-r border-black py-1.5 px-3"></td>
              <td className="border-r border-black py-1.5 px-3"></td>
              <td className="border-r border-black py-1.5 px-3"></td>
              <td className="py-1.5 px-3 text-right text-black">
                {formatNum(paidAmount)}
              </td>
            </tr>

            {/* INVOICE BALANCE Row */}
            <tr className="border-t border-black">
              <td className="border-r border-black py-1.5 px-2"></td>
              <td className="border-r border-black py-1.5 px-3 font-bold text-black">
                INVOICE BALANCE
              </td>
              <td className="border-r border-black py-1.5 px-3"></td>
              <td className="border-r border-black py-1.5 px-3"></td>
              <td className="border-r border-black py-1.5 px-3"></td>
              <td className="py-1.5 px-3 text-right font-bold text-black">
                {formatNum(balanceDue)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* TOTAL AMOUNT IN WORDS Box */}
      <div className="border border-black p-3 bg-white">
        <div className="text-[11px] font-bold text-black uppercase tracking-wide mb-1">
          TOTAL AMOUNT IN WORDS
        </div>
        <div className="text-xs text-black">
          {amountInWords}
        </div>
      </div>

    </div>
  );
}
