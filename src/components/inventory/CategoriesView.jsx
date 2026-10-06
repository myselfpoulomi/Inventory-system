import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Layers, Tag, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function CategoriesView() {
  const { categories, brands, products } = useApp();

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Layers className="h-5 w-5 text-blue-600" />
          <span>Automobile Categories & Brands Registry</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Standardized automotive component taxonomy and multi-brand OEM associations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Categories Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Automobile Spare Part Categories</h3>
              <p className="text-xs text-slate-500">{categories.length} active classifications</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {categories.map((cat, idx) => {
              const count = products.filter(p => p.category === cat).length;
              return (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    <span className="font-semibold text-slate-800">{cat}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-100 text-slate-600">
                    {count} parts
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Brands Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Supported OEM & Aftermarket Brands</h3>
              <p className="text-xs text-slate-500">{brands.length} manufacturer partners</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {brands.map((b, idx) => {
              const count = products.filter(p => p.brand === b).length;
              return (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-indigo-600" />
                    <span className="font-semibold text-slate-800">{b}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-100 text-slate-600">
                    {count} parts
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
