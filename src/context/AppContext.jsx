import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_BUSINESS_SETTINGS,
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_BRANDS,
  INITIAL_SUPPLIERS,
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
  INITIAL_INVOICES,
  INITIAL_PURCHASES,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_PAYMENTS
} from '../data/initialData';
import { api, supabase } from '../services/supabaseClient';

const AppContext = createContext();

const STORAGE_KEY = 'ROUTH_AUTO_DATA_LIVE_V2';

export function AppProvider({ children }) {
  // Load stored state or use clean initial state
  const [data, setData] = useState(() => {
    try {
      // Remove legacy keys containing old mock data
      localStorage.removeItem('AUTOPRO_DATA_V1');
      localStorage.removeItem('ROUTH_AUTO_DATA_V1');
      
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.users = INITIAL_USERS;
        if (parsed.settings) {
          parsed.settings.businessName = 'Routh Automobile';
          parsed.settings.address = 'kanchanpur,khanta.bankura';
          parsed.settings.phone = '9641454272';
          parsed.settings.email = 'routhautomobiles@gmail.com';
          parsed.settings.city = 'Bankura';
          parsed.settings.state = 'West Bengal';
          parsed.settings.stateCode = '19';
          parsed.settings.accountName = 'ROUTH AUTOMOBILE';
          parsed.settings.invoicePrefix = 'RAM/2026/';
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading stored Routh Automobile data:', e);
    }
    return {
      settings: INITIAL_BUSINESS_SETTINGS,
      users: INITIAL_USERS,
      categories: INITIAL_CATEGORIES,
      brands: INITIAL_BRANDS,
      suppliers: INITIAL_SUPPLIERS,
      customers: INITIAL_CUSTOMERS,
      products: INITIAL_PRODUCTS,
      invoices: INITIAL_INVOICES,
      purchases: INITIAL_PURCHASES,
      stockMovements: INITIAL_STOCK_MOVEMENTS,
      payments: INITIAL_PAYMENTS,
    };
  });

  // Current active user & authentication
  const [currentUser, setCurrentUser] = useState(() => {
    return data.users.find(u => u.role === 'admin') || INITIAL_USERS[0];
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Active view navigation (focused on Billing and Inventory)
  const [activeTab, setActiveTab] = useState('billing');
  
  // Quick invoice printing / modal state
  const [activeInvoiceForPrint, setActiveInvoiceForPrint] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Save to localStorage on any data change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [data]);

  // Load and sync live data from Supabase on startup
  useEffect(() => {
    let isMounted = true;
    async function loadSupabaseData() {
      if (!supabase) return;
      try {
        const [dbProducts, dbCustomers, dbInvoices, dbSettings] = await Promise.allSettled([
          api.products.getAll(),
          api.customers.getAll(),
          api.invoices.getAll(),
          api.settings.get(),
        ]);

        if (!isMounted) return;

        setData(prev => {
          const updated = { ...prev };
          if (dbProducts.status === 'fulfilled' && Array.isArray(dbProducts.value)) {
            updated.products = dbProducts.value;
          }
          if (dbCustomers.status === 'fulfilled' && Array.isArray(dbCustomers.value)) {
            updated.customers = dbCustomers.value;
          }
          if (dbInvoices.status === 'fulfilled' && Array.isArray(dbInvoices.value)) {
            updated.invoices = dbInvoices.value;
          }
          if (dbSettings.status === 'fulfilled' && dbSettings.value) {
            updated.settings = { ...prev.settings, ...dbSettings.value };
          }
          return updated;
        });
      } catch (err) {
        console.warn('Supabase sync notice:', err);
      }
    }

    loadSupabaseData();
    return () => { isMounted = false; };
  }, []);

  // Auth functions - strictly 1 Admin and 1 User
  const login = (roleOrName = 'admin') => {
    const isUser = typeof roleOrName === 'string' && (
      roleOrName.toLowerCase() === 'user' || 
      roleOrName.toLowerCase().includes('user') ||
      roleOrName.toLowerCase() === 'staff'
    );
    const user = isUser 
      ? (data.users.find(u => u.role === 'user') || INITIAL_USERS[1])
      : (data.users.find(u => u.role === 'admin') || INITIAL_USERS[0]);
    setCurrentUser(user);
    setIsAuthenticated(true);
    showToast(`Logged in as ${user.name}`);
  };

  const logout = () => {
    setIsAuthenticated(false);
    showToast('Logged out successfully', 'info');
  };

  // Reset to initial demo data
  const resetToSampleData = () => {
    const freshData = {
      settings: INITIAL_BUSINESS_SETTINGS,
      users: INITIAL_USERS,
      categories: INITIAL_CATEGORIES,
      brands: INITIAL_BRANDS,
      suppliers: INITIAL_SUPPLIERS,
      customers: INITIAL_CUSTOMERS,
      products: INITIAL_PRODUCTS,
      invoices: INITIAL_INVOICES,
      purchases: INITIAL_PURCHASES,
      stockMovements: INITIAL_STOCK_MOVEMENTS,
      payments: INITIAL_PAYMENTS,
    };
    setData(freshData);
    setCurrentUser(freshData.users[0]);
    showToast('Application reset to realistic automotive sample data');
  };

  // Export / Backup JSON
  const exportBackupJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `Routh_Automobile_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup JSON exported successfully');
  };

  // Import / Restore JSON
  const importBackupJSON = (jsonObj) => {
    try {
      if (!jsonObj.products || !jsonObj.settings) {
        throw new Error('Invalid backup file structure');
      }
      setData(jsonObj);
      showToast('Data restored successfully from backup!');
    } catch (err) {
      showToast(`Restore failed: ${err.message}`, 'error');
    }
  };

  // Settings update
  const updateSettings = (newSettings) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
    api.settings.update(newSettings).catch(err => {
      console.warn('Supabase settings update notice:', err.message);
    });
    showToast('Business & invoice settings updated');
  };

  // Product Operations (Inventory CRUD with Supabase)
  const addProduct = (productData) => {
    const newId = `prod-${Date.now()}`;
    const sku = productData.sku?.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
    const initialQty = Number(productData.currentQuantity) || 0;

    const newProduct = {
      ...productData,
      id: newId,
      sku,
      purchasePrice: Number(productData.purchasePrice) || 0,
      sellingPrice: Number(productData.sellingPrice) || 0,
      mrp: Number(productData.mrp) || Number(productData.sellingPrice) || 0,
      gstPercent: Number(productData.gstPercent) || 18,
      currentQuantity: initialQty,
      minStockLevel: Number(productData.minStockLevel) || 5,
      isActive: productData.isActive !== false,
    };

    let newMovements = [...data.stockMovements];
    if (initialQty > 0) {
      newMovements.unshift({
        id: `mov-${Date.now()}`,
        date: new Date().toISOString(),
        productId: newId,
        productName: newProduct.name,
        sku: newProduct.sku,
        type: 'STOCK_IN',
        quantity: initialQty,
        previousStock: 0,
        newStock: initialQty,
        reason: 'Initial inventory opening balance',
        reference: 'Opening Stock',
        user: currentUser?.name || 'Admin'
      });
    }

    setData(prev => ({
      ...prev,
      products: [newProduct, ...prev.products],
      stockMovements: newMovements
    }));

    api.products.create(newProduct)
      .then(() => {
        showToast(`Product "${newProduct.name}" saved to Supabase!`);
      })
      .catch(err => {
        console.error('Supabase product create error:', err);
        showToast(`Supabase write blocked: ${err.message}`, 'error');
      });

    return newProduct;
  };

  const updateProduct = (id, updatedFields) => {
    let oldProduct = data.products.find(p => p.id === id);
    if (!oldProduct) return;

    const newQty = updatedFields.currentQuantity !== undefined 
      ? Number(updatedFields.currentQuantity) 
      : oldProduct.currentQuantity;
    
    let newMovements = [...data.stockMovements];
    if (newQty !== oldProduct.currentQuantity) {
      const diff = newQty - oldProduct.currentQuantity;
      newMovements.unshift({
        id: `mov-${Date.now()}`,
        date: new Date().toISOString(),
        productId: id,
        productName: updatedFields.name || oldProduct.name,
        sku: updatedFields.sku || oldProduct.sku,
        type: diff > 0 ? 'STOCK_IN' : 'STOCK_OUT',
        quantity: diff,
        previousStock: oldProduct.currentQuantity,
        newStock: newQty,
        reason: 'Direct product inventory edit',
        reference: 'Stock Correction',
        user: currentUser?.name || 'Admin'
      });
    }

    const mergedProduct = {
      ...oldProduct,
      ...updatedFields,
      currentQuantity: newQty,
    };

    setData(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? {
        ...p,
        ...updatedFields,
        purchasePrice: updatedFields.purchasePrice !== undefined ? Number(updatedFields.purchasePrice) : p.purchasePrice,
        sellingPrice: updatedFields.sellingPrice !== undefined ? Number(updatedFields.sellingPrice) : p.sellingPrice,
        mrp: updatedFields.mrp !== undefined ? Number(updatedFields.mrp) : p.mrp,
        gstPercent: updatedFields.gstPercent !== undefined ? Number(updatedFields.gstPercent) : p.gstPercent,
        currentQuantity: newQty,
        minStockLevel: updatedFields.minStockLevel !== undefined ? Number(updatedFields.minStockLevel) : p.minStockLevel,
      } : p),
      stockMovements: newMovements
    }));

    api.products.update(id, mergedProduct).catch(err => {
      console.warn('Supabase product update notice:', err.message);
    });

    showToast(`Updated product "${updatedFields.name || oldProduct.name}"`);
  };

  const deleteProduct = (id) => {
    const prod = data.products.find(p => p.id === id);
    setData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id)
    }));

    api.products.delete(id).catch(err => {
      console.warn('Supabase product delete notice:', err.message);
    });

    showToast(`Deleted product "${prod?.name || id}"`, 'info');
  };

  // Stock Adjustment Operation
  const adjustStock = ({ productId, adjustmentType, quantity, reason }) => {
    const product = data.products.find(p => p.id === productId);
    if (!product) return;

    const qty = Number(quantity);
    let previousStock = product.currentQuantity;
    let newStock = previousStock;
    let qtyDelta = 0;
    let type = 'ADJUSTMENT';

    if (adjustmentType === 'ADD') {
      qtyDelta = qty;
      newStock = previousStock + qty;
      type = 'STOCK_IN';
    } else if (adjustmentType === 'REMOVE') {
      qtyDelta = -qty;
      newStock = Math.max(0, previousStock - qty);
      type = 'STOCK_OUT';
    } else if (adjustmentType === 'CORRECTION') {
      qtyDelta = qty - previousStock;
      newStock = qty;
      type = qtyDelta >= 0 ? 'STOCK_IN' : 'STOCK_OUT';
    }

    const movement = {
      id: `mov-${Date.now()}`,
      date: new Date().toISOString(),
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type,
      quantity: qtyDelta,
      previousStock,
      newStock,
      reason: reason || 'Manual stock adjustment',
      reference: 'Manual Adjustment',
      user: currentUser?.name || 'Staff'
    };

    setData(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === productId ? { ...p, currentQuantity: newStock } : p),
      stockMovements: [movement, ...prev.stockMovements]
    }));

    showToast(`Stock adjusted for "${product.name}": ${previousStock} → ${newStock}`);
  };

  // Customer Operations (Supabase CRUD)
  const addCustomer = (customerData) => {
    const newId = `cust-${Date.now()}`;
    const newCustomer = {
      ...customerData,
      id: newId,
      outstandingBalance: Number(customerData.outstandingBalance) || 0,
      vehicles: customerData.vehicles || []
    };

    setData(prev => ({
      ...prev,
      customers: [newCustomer, ...prev.customers]
    }));

    api.customers.create(newCustomer)
      .then(() => {
        showToast(`Customer "${newCustomer.name}" saved to Supabase!`);
      })
      .catch(err => {
        console.error('Supabase customer create error:', err);
        showToast(`Supabase write blocked: ${err.message}`, 'error');
      });

    return newCustomer;
  };

  const updateCustomer = (id, updatedFields) => {
    const existing = data.customers.find(c => c.id === id);
    const merged = { ...existing, ...updatedFields };

    setData(prev => ({
      ...prev,
      customers: prev.customers.map(c => c.id === id ? merged : c)
    }));

    api.customers.update(id, merged).catch(err => {
      console.warn('Supabase customer update notice:', err.message);
    });

    showToast('Customer details updated');
  };

  const deleteCustomer = (id) => {
    const cust = data.customers.find(c => c.id === id);
    setData(prev => ({
      ...prev,
      customers: prev.customers.filter(c => c.id !== id)
    }));

    api.customers.delete(id).catch(err => {
      console.warn('Supabase customer delete notice:', err.message);
    });

    showToast(`Customer "${cust?.name || id}" removed`, 'info');
  };

  // Supplier Operations
  const addSupplier = (supplierData) => {
    const newId = `sup-${Date.now()}`;
    const newSupplier = {
      ...supplierData,
      id: newId,
      outstandingPayable: Number(supplierData.outstandingPayable) || 0
    };

    setData(prev => ({
      ...prev,
      suppliers: [newSupplier, ...prev.suppliers]
    }));

    showToast(`Added supplier "${newSupplier.name}"`);
    return newSupplier;
  };

  const updateSupplier = (id, updatedFields) => {
    setData(prev => ({
      ...prev,
      suppliers: prev.suppliers.map(s => s.id === id ? { ...s, ...updatedFields } : s)
    }));
    showToast('Supplier details updated');
  };

  // Create Invoice (Billing Engine)
  const createInvoice = (invoicePayload) => {
    const invoiceNum = invoicePayload.invoiceNumber || 
      `${data.settings.invoicePrefix || 'APM/2026/'}${data.settings.nextInvoiceNumber || 104}`;
    
    // Check available stock unless negative stock is allowed
    if (!data.settings.allowNegativeStock) {
      for (const item of invoicePayload.items) {
        const prod = data.products.find(p => p.id === item.productId);
        if (prod && prod.currentQuantity < item.quantity) {
          throw new Error(`Insufficient stock for "${prod.name}". Available: ${prod.currentQuantity}, Requested: ${item.quantity}`);
        }
      }
    }

    const paid = Number(invoicePayload.paidAmount) || 0;
    const grandTotal = Number(invoicePayload.grandTotal) || 0;
    const balance = Math.max(0, grandTotal - paid);

    let paymentStatus = 'UNPAID';
    if (balance <= 0) {
      paymentStatus = 'PAID';
    } else if (paid > 0) {
      paymentStatus = 'PARTIAL';
    }

    const invoiceId = `inv-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newInvoice = {
      ...invoicePayload,
      id: invoiceId,
      invoiceNumber: invoiceNum,
      date: invoicePayload.date || nowIso,
      dueDate: invoicePayload.dueDate || nowIso,
      paidAmount: paid,
      balanceDue: balance,
      paymentStatus,
      createdBy: currentUser?.name || 'Staff'
    };

    // 1. Reduce product stock & record stock movements
    const movements = [];
    const updatedProducts = data.products.map(p => {
      const soldItem = invoicePayload.items.find(item => item.productId === p.id);
      if (soldItem) {
        const prevStock = p.currentQuantity;
        const newStock = prevStock - Number(soldItem.quantity);
        movements.push({
          id: `mov-${Date.now()}-${p.id}`,
          date: nowIso,
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          type: 'STOCK_OUT',
          quantity: -Number(soldItem.quantity),
          previousStock: prevStock,
          newStock: newStock,
          reason: `Sale to ${invoicePayload.customerName}`,
          reference: `INV #${invoiceNum}`,
          user: currentUser?.name || 'Staff'
        });
        return {
          ...p,
          currentQuantity: newStock
        };
      }
      return p;
    });

    // 2. Create payment record if paid > 0
    let updatedPayments = [...data.payments];
    if (paid > 0) {
      updatedPayments.unshift({
        id: `pay-${Date.now()}`,
        date: nowIso,
        invoiceId: invoiceId,
        invoiceNumber: invoiceNum,
        customerId: invoicePayload.customerId,
        customerName: invoicePayload.customerName,
        amount: paid,
        mode: invoicePayload.paymentMode || 'Cash',
        reference: invoicePayload.paymentReference || 'Initial Payment at Billing',
        notes: `Payment for invoice ${invoiceNum}`
      });
    }

    // 3. Update customer outstanding balance & vehicle list if vehicle given
    const updatedCustomers = data.customers.map(c => {
      if (c.id === invoicePayload.customerId) {
        let vehicles = [...(c.vehicles || [])];
        if (invoicePayload.vehicleNumber) {
          const existingVeh = vehicles.find(v => v.vehicleNumber.toLowerCase() === invoicePayload.vehicleNumber.toLowerCase());
          if (!existingVeh) {
            vehicles.push({
              vehicleNumber: invoicePayload.vehicleNumber,
              makeModel: invoicePayload.vehicleModel || 'Automobile',
              vin: '',
              lastKm: invoicePayload.odometerKm || ''
            });
          } else if (invoicePayload.odometerKm) {
            existingVeh.lastKm = invoicePayload.odometerKm;
          }
        }
        return {
          ...c,
          outstandingBalance: Number(c.outstandingBalance || 0) + balance,
          vehicles
        };
      }
      return c;
    });

    // 4. Increment invoice number counter in settings
    const nextNum = (data.settings.nextInvoiceNumber || 104) + 1;

    setData(prev => ({
      ...prev,
      invoices: [newInvoice, ...prev.invoices],
      products: updatedProducts,
      stockMovements: [...movements, ...prev.stockMovements],
      payments: updatedPayments,
      customers: updatedCustomers,
      settings: {
        ...prev.settings,
        nextInvoiceNumber: nextNum
      }
    }));

    // Persist Invoice and Stock Changes to Supabase
    api.invoices.create(newInvoice)
      .then(() => {
        showToast(`Invoice ${invoiceNum} generated & saved in Supabase!`);
      })
      .catch(err => {
        console.error('Supabase invoice create error:', err);
        showToast(`Invoice saved locally, but Supabase blocked write: ${err.message}`, 'error');
      });

    api.settings.update({ nextInvoiceNumber: nextNum }).catch(err => {
      console.warn('Supabase settings update notice:', err.message);
    });
    if (invoicePayload.items && invoicePayload.items.length > 0) {
      invoicePayload.items.forEach(it => {
        const prod = data.products.find(p => p.id === it.productId);
        if (prod) {
          const newQty = Math.max(0, prod.currentQuantity - Number(it.quantity));
          api.products.update(prod.id, { currentQuantity: newQty }).catch(() => {});
        }
      });
    }

    return newInvoice;
  };

  // Delete / Cancel Invoice (Restores Stock and Reverses Balance!)
  const deleteInvoice = (id) => {
    const inv = data.invoices.find(i => i.id === id);
    if (!inv) return;

    const nowIso = new Date().toISOString();

    // 1. Restore product stock
    const movements = [];
    const restoredProducts = data.products.map(p => {
      const soldItem = inv.items.find(item => item.productId === p.id);
      if (soldItem) {
        const prevStock = p.currentQuantity;
        const newStock = prevStock + Number(soldItem.quantity);
        movements.push({
          id: `mov-rev-${Date.now()}-${p.id}`,
          date: nowIso,
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          type: 'STOCK_IN',
          quantity: Number(soldItem.quantity),
          previousStock: prevStock,
          newStock: newStock,
          reason: `Invoice ${inv.invoiceNumber} cancelled/deleted (Stock Restored)`,
          reference: `CANCEL #${inv.invoiceNumber}`,
          user: currentUser?.name || 'Admin'
        });
        return {
          ...p,
          currentQuantity: newStock
        };
      }
      return p;
    });

    // 2. Adjust customer balance
    const updatedCustomers = data.customers.map(c => {
      if (c.id === inv.customerId) {
        return {
          ...c,
          outstandingBalance: Math.max(0, (c.outstandingBalance || 0) - (inv.balanceDue || 0))
        };
      }
      return c;
    });

    setData(prev => ({
      ...prev,
      invoices: prev.invoices.filter(i => i.id !== id),
      products: restoredProducts,
      stockMovements: [...movements, ...prev.stockMovements],
      customers: updatedCustomers
    }));

    // Delete in Supabase and restore stock in Supabase
    api.invoices.delete(id).catch(err => {
      console.warn('Supabase invoice delete notice:', err.message);
    });
    if (inv.items && inv.items.length > 0) {
      inv.items.forEach(it => {
        const prod = data.products.find(p => p.id === it.productId);
        if (prod) {
          const restoredQty = prod.currentQuantity + Number(it.quantity);
          api.products.update(prod.id, { currentQuantity: restoredQty }).catch(() => {});
        }
      });
    }

    showToast(`Invoice ${inv.invoiceNumber} cancelled. Stock restored to inventory.`, 'info');
  };

  // Record customer payment for existing invoice
  const recordCustomerPayment = ({ invoiceId, customerId, amount, mode, reference, notes }) => {
    const payAmount = Number(amount);
    if (payAmount <= 0) return;

    const targetInvoice = data.invoices.find(i => i.id === invoiceId);
    if (!targetInvoice) return;

    const nowIso = new Date().toISOString();
    const newPaid = targetInvoice.paidAmount + payAmount;
    const newBalance = Math.max(0, targetInvoice.grandTotal - newPaid);
    const newStatus = newBalance <= 0 ? 'PAID' : 'PARTIAL';

    const newPaymentRecord = {
      id: `pay-${Date.now()}`,
      date: nowIso,
      invoiceId: targetInvoice.id,
      invoiceNumber: targetInvoice.invoiceNumber,
      customerId: customerId || targetInvoice.customerId,
      customerName: targetInvoice.customerName,
      amount: payAmount,
      mode: mode || 'UPI',
      reference: reference || 'Receipt',
      notes: notes || `Payment against invoice ${targetInvoice.invoiceNumber}`
    };

    const updatedInvoices = data.invoices.map(i => {
      if (i.id === invoiceId) {
        return {
          ...i,
          paidAmount: newPaid,
          balanceDue: newBalance,
          paymentStatus: newStatus
        };
      }
      return i;
    });

    const updatedCustomers = data.customers.map(c => {
      if (c.id === (customerId || targetInvoice.customerId)) {
        return {
          ...c,
          outstandingBalance: Math.max(0, (c.outstandingBalance || 0) - payAmount)
        };
      }
      return c;
    });

    setData(prev => ({
      ...prev,
      invoices: updatedInvoices,
      customers: updatedCustomers,
      payments: [newPaymentRecord, ...prev.payments]
    }));

    showToast(`Payment of ₹${payAmount.toLocaleString('en-IN')} recorded for ${targetInvoice.invoiceNumber}`);
  };

  // Create Purchase (Increases Product Stock!)
  const createPurchase = (purchasePayload) => {
    const purchaseNum = purchasePayload.purchaseInvoiceNumber || 
      `${data.settings.purchasePrefix || 'PO-2026/'}${data.settings.nextPurchaseNumber || 15}`;

    const paid = Number(purchasePayload.paidAmount) || 0;
    const total = Number(purchasePayload.totalAmount) || 0;
    const balance = Math.max(0, total - paid);

    const nowIso = new Date().toISOString();
    const purchaseId = `po-${Date.now()}`;

    const newPurchase = {
      ...purchasePayload,
      id: purchaseId,
      purchaseInvoiceNumber: purchaseNum,
      date: purchasePayload.date || nowIso,
      paidAmount: paid,
      balanceDue: balance,
      status: 'RECEIVED'
    };

    // Increase stock for each item & create stock movement
    const movements = [];
    const updatedProducts = data.products.map(p => {
      const item = purchasePayload.items.find(i => i.productId === p.id);
      if (item) {
        const prevStock = p.currentQuantity;
        const newStock = prevStock + Number(item.quantity);
        movements.push({
          id: `mov-po-${Date.now()}-${p.id}`,
          date: nowIso,
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          type: 'STOCK_IN',
          quantity: Number(item.quantity),
          previousStock: prevStock,
          newStock: newStock,
          reason: `Purchase consignment from ${purchasePayload.supplierName}`,
          reference: `PO #${purchaseNum}`,
          user: currentUser?.name || 'Staff'
        });
        return {
          ...p,
          currentQuantity: newStock,
          // optionally update purchase price if provided
          purchasePrice: Number(item.rate) || p.purchasePrice
        };
      }
      return p;
    });

    // Update supplier payable
    const updatedSuppliers = data.suppliers.map(s => {
      if (s.id === purchasePayload.supplierId) {
        return {
          ...s,
          outstandingPayable: Number(s.outstandingPayable || 0) + balance
        };
      }
      return s;
    });

    const nextPoNum = (data.settings.nextPurchaseNumber || 15) + 1;

    setData(prev => ({
      ...prev,
      purchases: [newPurchase, ...prev.purchases],
      products: updatedProducts,
      stockMovements: [...movements, ...prev.stockMovements],
      suppliers: updatedSuppliers,
      settings: {
        ...prev.settings,
        nextPurchaseNumber: nextPoNum
      }
    }));

    showToast(`Purchase order #${purchaseNum} saved! Inventory stock increased.`);
    return newPurchase;
  };

  // Record Supplier Payment
  const recordSupplierPayment = ({ supplierId, amount, mode, reference, notes }) => {
    const payAmount = Number(amount);
    if (payAmount <= 0) return;

    const supplier = data.suppliers.find(s => s.id === supplierId);
    if (!supplier) return;

    const updatedSuppliers = data.suppliers.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          outstandingPayable: Math.max(0, (s.outstandingPayable || 0) - payAmount)
        };
      }
      return s;
    });

    setData(prev => ({
      ...prev,
      suppliers: updatedSuppliers
    }));

    showToast(`Payment of ₹${payAmount.toLocaleString('en-IN')} paid to ${supplier.name}`);
  };

  // Helper trigger to open invoice in print modal
  const openInvoicePrint = (invoice) => {
    setActiveInvoiceForPrint(invoice);
    setIsPrintModalOpen(true);
  };

  const closeInvoicePrint = () => {
    setIsPrintModalOpen(false);
    setActiveInvoiceForPrint(null);
  };

  return (
    <AppContext.Provider
      value={{
        // Data collections
        settings: data.settings,
        users: data.users,
        categories: data.categories,
        brands: data.brands,
        suppliers: data.suppliers,
        customers: data.customers,
        products: data.products,
        invoices: data.invoices,
        purchases: data.purchases,
        stockMovements: data.stockMovements,
        payments: data.payments,

        // Auth
        currentUser,
        isAuthenticated,
        setCurrentUser,
        login,
        logout,

        // Navigation
        activeTab,
        setActiveTab,

        // Print modal
        activeInvoiceForPrint,
        isPrintModalOpen,
        openInvoicePrint,
        closeInvoicePrint,

        // Notifications
        toast,
        showToast,

        // Operations
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addSupplier,
        updateSupplier,
        createInvoice,
        deleteInvoice,
        recordCustomerPayment,
        createPurchase,
        recordSupplierPayment,
        updateSettings,

        // Backup & Reset
        resetToSampleData,
        exportBackupJSON,
        importBackupJSON
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
