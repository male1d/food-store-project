'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';


interface AddToCartButtonProps {
  product: Product;
  className?: string;
}

export default function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const [count, setCount] = useState(0);
  const { isAuth } = useAuthStore();
  const router = useRouter();
  const t = useTranslations("AddToCartButton");
  

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => item.id === product.id);
    if (existingItem) {
      setCount(existingItem.cartQuantity || 1);
    }
  }, [product.id]);

  const updateCart = (newCount: number) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = cart.findIndex((item: any) => item.id === product.id);

    if (!isAuth) {
      router.push('/login');
      return;
    }

    if (newCount > 0) {
      if (existingItemIndex > -1) {
        cart[existingItemIndex].cartQuantity = newCount;
      } else {
        cart.push({ ...product, cartQuantity: newCount });
      }
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      if (existingItemIndex > -1) {
        cart.splice(existingItemIndex, 1);
      }
      localStorage.setItem('cart', JSON.stringify(cart));
    }
    setCount(newCount);
    
    window.dispatchEvent(new Event('storage'));
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    updateCart(count + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    updateCart(count - 1);
  };

  if (count === 0) {
    return (
      <button 
        onClick={handleIncrement}
        className={`${className ? className : 'bg-[#F4F4F4] text-[#212121]'} mt-[25px] w-full h-[40px] rounded-xl font-medium transition-all duration-300 hover:bg-[#1565C0] hover:text-white hover:shadow-lg active:scale-95`}
      >
        {t("addToCart")}
      </button>
    );
  }

  return (
    <div className={`mt-[25px] flex items-center justify-between w-full h-[40px] rounded-xl font-medium overflow-hidden shadow-md border border-[#1565C0] bg-white`}>
      <button 
        onClick={handleDecrement}
        className="w-1/3 h-full text-[#1565C0] flex items-center justify-center active:font-normal hover:bg-[#E7F2FF] transition-colors"
      >
        −
      </button>
      
      <span className="flex-1 text-[#1565C0] text-center select-none font-bold">
        {count}
      </span>

      <button 
        onClick={handleIncrement}
        className="w-1/3 h-full text-[#1565C0] flex items-center justify-center active:font-normal hover:bg-[#E7F2FF] transition-colors"
      >
        +
      </button>
    </div>
  );
}