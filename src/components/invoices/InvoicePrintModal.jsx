import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import PrintableInvoice from './PrintableInvoice';
import { Printer, Download, X, Copy, Check } from 'lucide-react';

export default function InvoicePrintModal() {
  const { activeInvoiceForPrint, isPrintModalOpen, closeInvoicePrint, settings } = useApp();
  const [copyType, setCopyType] = useState('ORIGINAL FOR RECIPIENT');
  const [copied, setCopied] = useState(false);

  const [isDownloading, setIsDownloading] = useState(false);

  if (!isPrintModalOpen || !activeInvoiceForPrint) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      const invoiceElem = document.getElementById('printable-invoice-element');
      if (!invoiceElem) {
        window.print();
        return;
      }

      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;

      const invoiceNum = (activeInvoiceForPrint.invoiceNumber || 'Invoice').replace(/[\/\\]/g, '_');
      const opt = {
        margin: [8, 8, 8, 8],
        filename: `${invoiceNum}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(invoiceElem).save();
    } catch (err) {
      console.error('Direct PDF export error, falling back to print dialog:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(activeInvoiceForPrint.invoiceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="invoice-modal-overlay fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
      
      {/* Container Card */}
      <div className="invoice-modal-card bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:max-h-none print:w-full print:bg-white">
        
        {/* Top Action Bar (hidden when printing) */}
        <div className="no-print bg-slate-900 text-white px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Printer className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">
                Tax Invoice Preview: {activeInvoiceForPrint.invoiceNumber}
              </h3>
              <p className="text-[11px] text-slate-400">
                A4 Printable Layout | GST Compliant Automobile Bill
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            
            {/* Copy Type Selector */}
            <select
              value={copyType}
              onChange={(e) => setCopyType(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ORIGINAL FOR RECIPIENT">Original (Recipient)</option>
              <option value="DUPLICATE FOR TRANSPORTER">Duplicate (Transporter)</option>
              <option value="TRIPLICATE FOR SUPPLIER">Triplicate (Office Copy)</option>
            </select>

            {/* Direct Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Download pure A4 PDF file directly"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isDownloading ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Print directly to standard A4 paper or browser print"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print A4</span>
            </button>

            {/* Close button */}
            <button
              onClick={closeInvoicePrint}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 print:p-0 print:overflow-visible">
          <PrintableInvoice 
            invoice={activeInvoiceForPrint} 
            settings={settings} 
            copyType={copyType} 
          />
        </div>

        {/* Bottom helper bar (hidden when printing) */}
        <div className="no-print bg-white px-6 py-2.5 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Formatted for standard 80GSM A4 paper (Portrait)</span>
          </div>
          <button
            onClick={closeInvoicePrint}
            className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
          >
            Close Preview
          </button>
        </div>

      </div>

    </div>
  );
}
