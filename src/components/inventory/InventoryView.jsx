import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import ProductFormModal from './ProductFormModal';
import StockAdjustModal from './StockAdjustModal';
import CsvImportExportModal from './CsvImportExportModal';
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Layers,
  ArrowUpDown,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  History,
  Barcode,
  Tag,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';

export default function InventoryView({ initialSubTab = 'products' }) {
  const {
    products,
    deleteProduct,
    categories,
    brands,
    currentUser,
    stockMovements,
  } = useApp();

  const [subTab, setSubTab] = useState(initialSubTab); // 'products', 'stock', 'history'

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'stockAsc', 'stockDesc', 'priceAsc', 'priceDesc'
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [productToAdjust, setProductToAdjust] = useState(null);

  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch =
        (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.partNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.vehicleCompatibility || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchBrand = selectedBrand === 'ALL' || p.brand === selectedBrand;
      const matchLowStock = !filterLowStockOnly || (p.currentQuantity <= p.minStockLevel);

      return matchSearch && matchCategory && matchBrand && matchLowStock;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'stockAsc') return a.currentQuantity - b.currentQuantity;
      if (sortBy === 'stockDesc') return b.currentQuantity - a.currentQuantity;
      if (sortBy === 'priceAsc') return a.sellingPrice - b.sellingPrice;
      if (sortBy === 'priceDesc') return b.sellingPrice - a.sellingPrice;
      return 0;
    });
  }, [products, searchQuery, selectedCategory, selectedBrand, filterLowStockOnly, sortBy]);

  // Paginated items
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Actions
  const handleOpenAddProduct = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setProductToEdit(prod);
    setIsProductModalOpen(true);
  };

  const handleOpenAdjustStock = (prod) => {
    setProductToAdjust(prod);
    setIsAdjustModalOpen(true);
  };

  const handleDeleteProduct = (prod) => {
    if (currentUser.role !== 'admin') {
      alert('Only Admin users are permitted to delete inventory products.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${prod.name}" (${prod.sku})? This cannot be undone.`)) {
      deleteProduct(prod.id);
    }
  };

  return (
    <div className="space-y-5 pb-12">
      
      {/* Top Bar with Subtabs & Add Action */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span>Automobile Inventory & Spare Parts</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-brand OEM catalog, warehouse rack tracking, stock valuation and audit trail
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSubTab('products')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                subTab === 'products' ? 'bg-white shadow-2xs text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Catalog ({products.length})
            </button>
            <button
              onClick={() => setSubTab('stock')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                subTab === 'stock' ? 'bg-white shadow-2xs text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stock Management
            </button>
            <button
              onClick={() => setSubTab('history')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                subTab === 'history' ? 'bg-white shadow-2xs text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Audit Trail ({stockMovements.length})
            </button>
          </div>

          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="p-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="Import or Export CSV"
          >
            <Upload className="h-4 w-4" />
          </button>

          <button
            onClick={handleOpenAddProduct}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Part</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1 & 2: PRODUCTS & STOCK MANAGEMENT */}
      {(subTab === 'products' || subTab === 'stock') && (
        <div className="space-y-4">
          
          {/* Search & Filters Header */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center justify-between">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by part name, SKU, OEM no, vehicle (Swift, Creta)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* Brand Filter */}
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Brands</option>
                {brands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>

              {/* Sort selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 cursor-pointer"
              >
                <option value="name">Sort: Name (A-Z)</option>
                <option value="stockAsc">Sort: Stock (Low to High)</option>
                <option value="stockDesc">Sort: Stock (High to Low)</option>
                <option value="priceAsc">Sort: Price (Low to High)</option>
                <option value="priceDesc">Sort: Price (High to Low)</option>
              </select>

              {/* Low Stock Toggle button */}
              <button
                type="button"
                onClick={() => {
                  setFilterLowStockOnly(!filterLowStockOnly);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  filterLowStockOnly
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                <span>Low Stock Only</span>
              </button>

            </div>

          </div>

          {/* Products Table Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                    <th className="py-3 px-3">Part Details</th>
                    <th className="py-3 px-3">OEM / Fitment</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3 text-right">Cost (₹)</th>
                    <th className="py-3 px-3 text-right">Selling Price</th>
                    <th className="py-3 px-3 text-center">Stock Level</th>
                    <th className="py-3 px-3 text-center">Rack / Bin</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No spare parts match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map(prod => {
                      const isLowStock = prod.currentQuantity <= prod.minStockLevel && prod.currentQuantity > 0;
                      const isOutOfStock = prod.currentQuantity <= 0;

                      return (
                        <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                          
                          {/* Part Details */}
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900 text-xs">{prod.name}</div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-mono">
                              <span>SKU: <strong className="text-slate-700">{prod.sku}</strong></span>
                              {prod.barcode && <span>| Barcode: {prod.barcode}</span>}
                            </div>
                          </td>

                          {/* OEM & Fitment */}
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-800">
                              {prod.brand} <span className="font-mono text-slate-500 text-[10px]">[{prod.partNumber || 'OEM'}]</span>
                            </div>
                            {prod.vehicleCompatibility && (
                              <div className="text-[10px] text-slate-500 truncate max-w-[220px]" title={prod.vehicleCompatibility}>
                                {prod.vehicleCompatibility}
                              </div>
                            )}
                          </td>

                          {/* Category & GST */}
                          <td className="py-3 px-3">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                              {prod.category}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              GST: {prod.gstPercent}%
                            </div>
                          </td>

                          {/* Cost */}
                          <td className="py-3 px-3 text-right font-mono text-slate-600">
                            {currentUser.role === 'admin' ? formatCurrency(prod.purchasePrice) : '••••'}
                          </td>

                          {/* Selling Price */}
                          <td className="py-3 px-3 text-right font-mono font-bold text-blue-700">
                            {formatCurrency(prod.sellingPrice)}
                            {prod.mrp > prod.sellingPrice && (
                              <div className="text-[9.5px] text-slate-400 line-through">
                                MRP {formatCurrency(prod.mrp)}
                              </div>
                            )}
                          </td>

                          {/* Stock Status Pill */}
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                              isOutOfStock
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : isLowStock
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              {isOutOfStock ? (
                                <>Out of Stock</>
                              ) : (
                                <>{prod.currentQuantity} {prod.unit}</>
                              )}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Min: {prod.minStockLevel} {prod.unit}
                            </div>
                          </td>

                          {/* Location */}
                          <td className="py-3 px-3 text-center text-slate-600 text-[11px] font-medium">
                            {prod.locationRack || 'Floor'}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              
                              {/* Stock Adjust button */}
                              <button
                                onClick={() => handleOpenAdjustStock(prod)}
                                className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Adjust Stock Quantity (+/-)"
                              >
                                <Layers className="h-4 w-4" />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => handleOpenEditProduct(prod)}
                                className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Product Details"
                              >
                                <Edit className="h-4 w-4" />
                              </button>

                              {/* Delete (Admin only) */}
                              {currentUser.role === 'admin' && (
                                <button
                                  onClick={() => handleDeleteProduct(prod)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} items
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 font-semibold text-slate-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* SUBTAB 3: STOCK MOVEMENT HISTORY AUDIT TRAIL */}
      {subTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Stock Movement & Audit Trail</h3>
              <p className="text-xs text-slate-500">Immutable ledger of every inventory change, sale, purchase, or adjustment</p>
            </div>
            <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
              {stockMovements.length} audit records
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Product Name & SKU</th>
                  <th className="py-2.5 px-3 text-center">Movement Type</th>
                  <th className="py-2.5 px-3 text-center">Qty Change</th>
                  <th className="py-2.5 px-3 text-center">Previous → New</th>
                  <th className="py-2.5 px-3">Reason / Reference</th>
                  <th className="py-2.5 px-3 text-right">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockMovements.map(mov => (
                  <tr key={mov.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                      {formatDateTime(mov.date)}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{mov.productName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{mov.sku}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        mov.type === 'STOCK_IN'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {mov.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">
                      <span className={mov.quantity > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                        {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-700">
                      {mov.previousStock} → <strong className="text-slate-950">{mov.newStock}</strong>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      <div>{mov.reason}</div>
                      {mov.reference && (
                        <span className="text-[10px] font-mono text-blue-600 font-semibold">{mov.reference}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 font-medium">
                      {mov.user || 'System'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALS */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={productToEdit}
      />

      <StockAdjustModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        product={productToAdjust}
      />

      <CsvImportExportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
      />

    </div>
  );
}
