'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export const CategoryModal = ({ isOpen, onClose, onSelectCategory }: any) => {
  const [categories, setCategories] = useState<any[]>([]);
  const searchParams = useSearchParams();
 
  const currentCategoryId = searchParams.get('category');

  useEffect(() => {
    fetch('http://localhost:3000/categories').then(res => res.json()).then(data => setCategories(data));
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

if (!isOpen) return null;

return (
  <>
    <div 
      className="fixed inset-0 top-[70px] bg-black/40 z-[100] transition-opacity duration-300 animate-in fade-in"
      onClick={onClose}
    />

    <div 
      className="fixed left-0 top-[70px] h-[calc(100%-70px)] w-[315px] bg-white shadow-2xl flex flex-col z-[105] animate-in slide-in-from-left duration-300"
      onClick={(e) => e.stopPropagation()} 
    >

      <nav className="flex-1 overflow-y-auto pl-[20px] pr-[10px] custom-scrollbar">
        <ul className="">
          {categories.map(cat => {
            const isActive = currentCategoryId === String(cat.id);

            return (
              <li key={cat.id}>
                <button 
                  onClick={() => { onSelectCategory(cat.id); onClose(); }}
                  className={`flex justify-between items-center w-full h-[65px] rounded-[10px] text-left px-[15px] py-[20px] hover:bg-[#F4F4F4] transition-colors font-medium ${
                    isActive ? 'bg-[#F4F4F4]' : 'text-black'
                  }`}
                >
                  {cat.name}
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 4.16699L12.5 10.0003L7.5 15.8337" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  </>
);
};