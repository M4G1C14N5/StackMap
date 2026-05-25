"use client";

import React, { useState } from 'react';
import { Search, Map, List, Layers } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function FloatingSidebar() {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <aside className="fixed left-6 top-6 bottom-6 w-72 bg-gray-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 flex flex-col z-50">
      <div className="flex items-center gap-3 mb-8">
        <Layers className="w-8 h-8 text-blue-500" />
        <h1 className="text-xl font-bold text-white tracking-tight">StackMap</h1>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search infrastructure..."
          defaultValue={searchParams.get('q') || ''}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full bg-slate-800/50 border border-slate-700 text-sm text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <nav className="flex flex-col gap-2">
        <a href="/" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${pathname === '/' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white'}`}>
          <Map className="w-4 h-4" /> Canvas View
        </a>
        <a href="/list" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${pathname === '/list' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white'}`}>
          <List className="w-4 h-4" /> List View
        </a>
      </nav>
    </aside>
  );
}
