import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Download, Upload, FileText, CheckCircle, AlertTriangle, X } from 'lucide-react';

export default function CsvImportExportModal({ isOpen, onClose }) {
  const { products, addProduct, showToast } = useApp();
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [parseError, setParseError] = useState('');

  if (!isOpen) return null;

  // Export inventory to CSV
  const handleExportCSV = () => {
    const headers = [
      'Name',
      'SKU',
      'Barcode',
      'Category',
      'Brand',
      'PartNumber',
      'VehicleCompatibility',
      'Unit',
      'PurchasePrice',
      'SellingPrice',
      'MRP',
      'GSTPercent',
      'CurrentQuantity',
      'MinStockLevel',
      'LocationRack',
      'Description'
    ];

    const rows = products.map(p => [
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${p.sku || ''}"`,
      `"${p.barcode || ''}"`,
      `"${p.category || ''}"`,
      `"${p.brand || ''}"`,
      `"${p.partNumber || ''}"`,
      `"${(p.vehicleCompatibility || '').replace(/"/g, '""')}"`,
      `"${p.unit || 'PCS'}"`,
      p.purchasePrice || 0,
      p.sellingPrice || 0,
      p.mrp || 0,
      p.gstPercent || 18,
      p.currentQuantity || 0,
      p.minStockLevel || 5,
      `"${p.locationRack || ''}"`,
      `"${(p.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Routh_Automobile_Inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('Inventory exported to CSV successfully');
  };

  // Download Sample Template
  const handleDownloadSample = () => {
    const sampleCsv = `Name,SKU,Barcode,Category,Brand,PartNumber,VehicleCompatibility,Unit,PurchasePrice,SellingPrice,MRP,GSTPercent,CurrentQuantity,MinStockLevel,LocationRack,Description
"Brembo Front Brake Disc Rotor","DSK-BRM-889","8901234008899","Brake Parts","Brembo","09.A112.11","Hyundai Creta / Kia Seltos","PAIR",3200,4800,5500,18,10,3,"Rack B-04","High carbon vented front disc rotors"
"Denso Iridium Power Spark Plug","SPK-DNS-IK20","8901234002020","Electrical","Denso","IK20-5304","Honda / Toyota / Suzuki","SET",1200,1850,2100,18,15,4,"Rack C-02","0.4mm laser welded iridium tip"`;

    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Routh_Automobile_Inventory_Template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Handle file select
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setCsvText(text);
        parseCsv(text);
      }
    };
    reader.readAsText(file);
  };

  const parseCsv = (text) => {
    setParseError('');
    try {
      const lines = text.trim().split('\n');
      if (lines.length < 2) {
        setParseError('CSV must have a header row and at least one product row');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const parsed = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        // Simple comma split handling quotes
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (parts.length >= 2) {
          const item = {
            name: (parts[0] || '').replace(/^"|"$/g, '').trim(),
            sku: (parts[1] || '').replace(/^"|"$/g, '').trim(),
            barcode: (parts[2] || '').replace(/^"|"$/g, '').trim(),
            category: (parts[3] || 'Brake Parts').replace(/^"|"$/g, '').trim(),
            brand: (parts[4] || 'Bosch').replace(/^"|"$/g, '').trim(),
            partNumber: (parts[5] || '').replace(/^"|"$/g, '').trim(),
            vehicleCompatibility: (parts[6] || '').replace(/^"|"$/g, '').trim(),
            unit: (parts[7] || 'PCS').replace(/^"|"$/g, '').trim(),
            purchasePrice: Number(parts[8]) || 0,
            sellingPrice: Number(parts[9]) || 0,
            mrp: Number(parts[10]) || 0,
            gstPercent: Number(parts[11]) || 18,
            currentQuantity: Number(parts[12]) || 0,
            minStockLevel: Number(parts[13]) || 5,
            locationRack: (parts[14] || '').replace(/^"|"$/g, '').trim(),
            description: (parts[15] || '').replace(/^"|"$/g, '').trim(),
          };
          if (item.name) parsed.push(item);
        }
      }

      setParsedRows(parsed);
    } catch (err) {
      setParseError(`Parse error: ${err.message}`);
    }
  };

  const handleImportParsed = () => {
    if (parsedRows.length === 0) return;

    let addedCount = 0;
    parsedRows.forEach(row => {
      addProduct(row);
      addedCount++;
    });

    showToast(`Successfully imported ${addedCount} products from CSV`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-400" />
            <h3 className="font-bold text-sm">Import / Export Automobile Products</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          
          {/* Export Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Export All Active Products</h4>
              <p className="text-[11px] text-slate-500">Download inventory spreadsheet with current stock and prices</p>
            </div>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-blue-600" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Import Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Import from CSV / Excel
              </h4>
              <button
                onClick={handleDownloadSample}
                className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Download className="h-3 w-3" />
                <span>Download Sample Template</span>
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-5 text-center bg-slate-50/50">
              <Upload className="h-7 w-7 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-700">
                Upload CSV file containing automobile spare parts
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Comma separated (.csv) with headers Name, SKU, Category, Price, Stock...
              </p>
              <label className="mt-3 inline-block">
                <span className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors">
                  Choose CSV File
                </span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {parseError && (
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {parsedRows.length > 0 && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-900 font-bold">
                  <span>Found {parsedRows.length} valid product rows</span>
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="max-h-32 overflow-y-auto text-[11px] text-slate-700 divide-y divide-emerald-100 font-mono">
                  {parsedRows.slice(0, 3).map((r, i) => (
                    <div key={i} className="py-1 flex justify-between">
                      <span className="truncate max-w-[240px]">{r.name}</span>
                      <span>Stock: {r.currentQuantity} | ₹{r.sellingPrice}</span>
                    </div>
                  ))}
                  {parsedRows.length > 3 && (
                    <div className="py-1 text-slate-500 italic">
                      + {parsedRows.length - 3} more parts...
                    </div>
                  )}
                </div>
                <button
                  onClick={handleImportParsed}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Import {parsedRows.length} Products to Inventory
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
