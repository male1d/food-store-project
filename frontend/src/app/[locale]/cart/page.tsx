'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/navigation'
import { Product } from '@/types';
import { useTranslations } from 'next-intl';



interface CartItem extends Product {
  cartQuantity: number;
}

export default function BasketPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const deliveryPrice = 200;

  useEffect(() => {
  if (showConfirm) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }

  return () => {
    document.body.style.overflow = 'auto';
  };
  }, [showConfirm]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cart', JSON.stringify(cart.filter(i => i.cartQuantity > 0)));
    }
  }, [cart, isLoaded]);

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, cartQuantity: item.cartQuantity + delta };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const activeItems = cart.filter(i => i.cartQuantity > 0);
  const totalPrice = activeItems.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
  const totalCount = activeItems.reduce((s, i) => s + i.cartQuantity, 0);

  const t = useTranslations('Cart');

  if (!isLoaded) {
    return <div className="max-w-[1200px] mx-auto p-20 text-center">{t("loading")}</div>;
  }

  return (
    <div className="w-[1340px] mx-auto py-[20px] min-h-[600px] grid">
      {cart.length === 0 ? (
        <div className="flex items-center justify-center w-full min-h-[209px] self-center gap-[50px]">
          <div className="flex items-center justify-center w-[189px] h-[189px] bg-[#1565C0]/10 rounded-full shrink-0">
             <svg width="179" height="142" viewBox="0 0 179 142" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-[18px]">
               <path d="M163.287 52.7034V127.478C163.287 133.387 158.47 138.203 152.561 138.203H22.8513C16.9424 138.203 12.1267 133.387 12.1267 127.478V52.7034H163.287Z" stroke="#212121" strokeWidth="1.10133"/>
               <path d="M65.9605 138.754H22.8517C16.6385 138.754 11.5759 133.691 11.5759 127.478V52.1526H163.838V127.478C163.838 133.691 158.775 138.754 152.562 138.754H116.203" stroke="#212121" strokeWidth="5.50667" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M98.4838 138.754H85.5205" stroke="#212121" strokeWidth="5.50667" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M32.9741 31.9021L79.3813 2.75378" stroke="#212121" strokeWidth="5.50667" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M32.5898 28.1575C36.9457 28.1575 40.4765 31.6884 40.4766 36.0442C40.4766 40.4001 36.9457 43.9309 32.5898 43.9309C28.234 43.9308 24.7031 40.4 24.7031 36.0442C24.7032 31.6885 28.2341 28.1576 32.5898 28.1575Z" stroke="#212121" strokeWidth="1.10133"/>
               <path d="M32.59 44.482C37.25 44.482 41.0277 40.7044 41.0277 36.0444C41.0277 31.3844 37.25 27.6067 32.59 27.6067C27.93 27.6067 24.1523 31.3844 24.1523 36.0444C24.1523 40.7044 27.93 44.482 32.59 44.482Z" stroke="#212121" strokeWidth="5.50667" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M145.196 31.902L98.7891 2.75372" stroke="#212121" strokeWidth="5.50667" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M145.502 28.1575C149.858 28.1575 153.389 31.6884 153.389 36.0442C153.389 40.4001 149.858 43.9309 145.502 43.9309C141.146 43.9308 137.615 40.4 137.615 36.0442C137.615 31.6885 141.146 28.1576 145.502 28.1575Z" stroke="#212121" strokeWidth="1.10133"/>
               <path d="M145.502 44.482C150.162 44.482 153.94 40.7044 153.94 36.0444C153.94 31.3844 150.162 27.6067 145.502 27.6067C140.842 27.6067 137.064 31.3844 137.064 36.0444C137.064 40.7044 140.842 44.482 145.502 44.482Z" stroke="#212121" strokeWidth="5.50667" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M174.792 36.595V51.6018H3.3042V36.595H174.792Z" stroke="#212121" strokeWidth="1.10133"/>
               <path d="M175.342 36.0442H2.75342V52.1524H175.342V36.0442Z" stroke="#212121" strokeWidth="5.50667" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M33.5112 64.579V126.327" stroke="#212121" strokeWidth="5.50667" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M55.1426 64.579V126.327" stroke="#212121" strokeWidth="5.50667" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M76.8516 64.579V126.327" stroke="#212121" strokeWidth="5.50667" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M98.4814 64.579V126.327" stroke="#212121" strokeWidth="5.50667" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M120.19 64.579V126.327" stroke="#212121" strokeWidth="5.50667" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M141.821 64.579V126.327" stroke="#212121" strokeWidth="5.50667" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
          </div>
          <div className="flex flex-col gap-[32px]">
            <h3 className="font-bold text-[28px]">{t("noProducts")}</h3>
            <p className="text-[18px]">{t("goTo")}</p>
            <Link href="/" >
              <button className="px-[32px] py-[9px] bg-[#1565C0] text-white rounded-[12px]">
                {t("start")}
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-[20px]">
            <Link href="/" className="flex gap-[10px] items-center mb-[10px]">
               <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M12.5 15.8334L7.5 10L12.5 4.16671" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
               <p className="text-[16px]">{t("main")}</p>
            </Link>
            <div className="flex items-end w-[880px] justify-between">
              <div className="flex items-end">
                <h1 className="font-bold text-[24px] mr-[10px]">{t("cart")}</h1>
                <p className="text-[15px] text-[#757575]">
                  {t('products_count', { count: totalCount })}
                </p>
              </div>
              <button onClick={() => setShowConfirm(true)} className="flex gap-[10px] items-center hover:opacity-70 transition-opacity">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M10.0002 1.04163C7.81404 1.04163 6.04183 2.81383 6.04183 4.99996V5.20829H3.3335C2.98832 5.20829 2.7085 5.48811 2.7085 5.83329C2.7085 6.17847 2.98832 6.45829 3.3335 6.45829H16.6668C17.012 6.45829 17.2918 6.17847 17.2918 5.83329C17.2918 5.48811 17.012 5.20829 16.6668 5.20829H13.9585V4.99996C13.9585 2.81383 12.1863 1.04163 10.0002 1.04163ZM10.0002 2.29163C11.4959 2.29163 12.7085 3.50419 12.7085 4.99996V5.20829H7.29183V4.99996C7.29183 3.50419 8.50439 2.29163 10.0002 2.29163Z" fill="#757575"/>
                  <path d="M4.78903 7.44084C4.75638 7.09721 4.45134 6.84511 4.10771 6.87776C3.76408 6.91041 3.51198 7.21545 3.54463 7.55908C3.62336 8.38764 3.76543 9.40855 3.94806 10.7208L4.18268 12.4067C4.40699 14.019 4.5342 14.9334 4.80941 15.6824C5.32158 17.0765 6.23521 18.194 7.41021 18.6898C8.04827 18.9591 8.7781 18.9588 9.8646 18.9583H10.1357C11.2222 18.9588 11.9521 18.9591 12.5901 18.6898C13.7651 18.194 14.6787 17.0765 15.1909 15.6824C15.4661 14.9334 15.5933 14.019 15.8176 12.4067L16.0523 10.7209C16.2349 9.40856 16.377 8.38765 16.4557 7.55908C16.4883 7.21545 16.2362 6.91041 15.8926 6.87776C15.549 6.84511 15.2439 7.09721 15.2113 7.44084C15.1354 8.23915 14.9972 9.23332 14.8121 10.5634L14.5935 12.1342C14.3514 13.8739 14.2405 14.6446 14.0176 15.2514C13.5877 16.4215 12.8728 17.2138 12.1041 17.5382C11.729 17.6965 11.2745 17.7083 10.0002 17.7083C8.72586 17.7083 8.27136 17.6965 7.89619 17.5382C7.12749 17.2138 6.41263 16.4215 5.98272 15.2514C5.75979 14.6446 5.64892 13.8739 5.40681 12.1342L5.1882 10.5634C5.00309 9.23332 4.86488 8.23915 4.78903 7.44084Z" fill="#757575"/>
                  <path d="M8.9585 8.33329C8.9585 7.98812 8.67867 7.70829 8.3335 7.70829C7.98832 7.70829 7.7085 7.98812 7.7085 8.33329V15C7.7085 15.3451 7.98832 15.625 8.3335 15.625C8.67867 15.625 8.9585 15.3451 8.9585 15V8.33329Z" fill="#757575"/>
                  <path d="M12.2918 8.33329C12.2918 7.98812 12.012 7.70829 11.6668 7.70829C11.3217 7.70829 11.0418 7.98812 11.0418 8.33329V15C11.0418 15.3451 11.3217 15.625 11.6668 15.625C12.012 15.625 12.2918 15.3451 12.2918 15V8.33329Z" fill="#757575"/>
                </svg>
                <p className="text-[#757575]">{t("clear")}</p>
              </button>
              {showConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                  <div className="bg-white p-[24px] rounded-[16px] max-w-[400px] w-full shadow-2xl scale-in-center">
                    <div className="flex justify-between">
                      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="4" width="48" height="48" rx="24" fill="#FEE4E2"/>
                        <rect x="4" y="4" width="48" height="48" rx="24" stroke="#FEF3F2" stroke-width="8"/>
                        <path d="M32 22V21.2C32 20.0799 32 19.5198 31.782 19.092C31.5903 18.7157 31.2843 18.4097 30.908 18.218C30.4802 18 29.9201 18 28.8 18H27.2C26.0799 18 25.5198 18 25.092 18.218C24.7157 18.4097 24.4097 18.7157 24.218 19.092C24 19.5198 24 20.0799 24 21.2V22M26 27.5V32.5M30 27.5V32.5M19 22H37M35 22V33.2C35 34.8802 35 35.7202 34.673 36.362C34.3854 36.9265 33.9265 37.3854 33.362 37.673C32.7202 38 31.8802 38 30.2 38H25.8C24.1198 38 23.2798 38 22.638 37.673C22.0735 37.3854 21.6146 36.9265 21.327 36.362C21 35.7202 21 34.8802 21 33.2V22" stroke="#D92D20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <button onClick={() => setShowConfirm(false)}>
                        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M28 16L16 28M16 16L28 28" stroke="#717680" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </button>
                    </div>
                    <h3 className="text-[20px] font-bold mt-[16px] text-[#181D27]">{t("empty")}</h3>
                    <p className="text-[16px] leading-[20px] text-gray-500 mb-[32px]">
                      {t("warning")}
                    </p>
                    
                    <div className="flex gap-[12px] h-[42px]">
                      <button 
                        onClick={() => setShowConfirm(false)}
                        className="flex-1 border-2 border-gray-300 rounded-[8px] text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                      >
                        {t("cancel")}
                      </button>
                      <button 
                        onClick={() => {
                          clearCart();
                          setShowConfirm(false);
                        }}
                        className="flex-1 bg-red-600 font-bold text-white rounded-[8px] hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
                      >
                        {t("remove")}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-10 flex-col lg:flex-row items-start justify-between">
            <div className="flex flex-col gap-[10px] w-[880px]">
              {cart.map((item) => {
                const isRemoved = item.cartQuantity === 0;
                
                return (
                  <div key={item.id} className="flex items-center gap-6 p-[15px] rounded-[30px] shadow-sm transition-all hover:shadow-md border border-transparent">
                    
                    <div className={`w-28 h-28 bg-gray-50 rounded-[24px] overflow-hidden flex-shrink-0 border border-gray-50 transition-all ${isRemoved ? 'grayscale opacity-40' : ''}`}>
                      {item.image_url ? (
                        <img src={`http://localhost:3000/uploads/${item.image_url}`} className="w-full h-full object-cover" alt={item.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">{t("no")}</div>
                      )}
                    </div>
                    
                    <div className={`flex-1 transition-all ${isRemoved ? 'grayscale opacity-40' : ''}`}>
                      <h3 className="font-bold text-[18px] text-[#212121]">{item.name}</h3>
                      <p className="text-[#757575] text-[14px]">{formatPrice(item.price)} ₽ / {item.unit || 'шт.'}</p>
                    </div>

                    <div className="flex-shrink-0">
                      {isRemoved ? (
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="bg-[#E7F2FF] text-[#1565C0] text-[14px] rounded-[12px] h-[35px] w-[100px] hover:bg-[#D1E7FF] transition-all active:scale-95"
                        >
                          {t("return")}
                        </button>
                      ) : (
                        <div className="flex items-center bg-[#E7F2FF] rounded-[12px] h-[35px] w-[100px] overflow-hidden border border-transparent">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)} 
                            className="w-1/3 h-full text-[#1565C0] font-bold text-xl hover:bg-white/60 transition-colors flex items-center justify-center"
                          >
                            −
                          </button>
                          
                          <span className="w-1/3 h-full flex items-center justify-center text-[#1565C0] text-center select-none font-bold text-[16px]">
                            {item.cartQuantity}
                          </span>
                          
                          <button 
                            onClick={() => updateQuantity(item.id, 1)} 
                            className="w-1/3 h-full text-[#1565C0] font-bold text-xl hover:bg-white/60 transition-colors flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                    <div className={`text-right min-w-[120px] transition-all ${isRemoved ? 'grayscale opacity-40' : ''}`}>
                      <p className="font-bold text-[18px] text-[#212121]">
                        {formatPrice(item.price * item.cartQuantity)} ₽
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="w-[390px] sticky top-10 border border-[#757575]/50 rounded-[15px]">
              <div className="p-[20px]">
                <h2 className="text-[24px] font-bold mb-[10px]">{t("information")}</h2>
                <p className="text-[15px] text-[#757575]">{t("delivery")}</p>
                <div className="h-[2px] bg-[#1565C0]/50 my-[15px]"></div>
                
                <div className="flex flex-col mb-8 gap-3">
                  <div className="flex justify-between font-[15px]">
                    <span>{t("products")}</span>
                    <span className="font-[16px] font-bold">{formatPrice(totalPrice)} ₽</span>
                  </div>
                  <div className="flex justify-between font-[15px]">
                    <span>{t("deliveryP")}</span>
                    <span className="font-[16px] font-bold">{formatPrice(deliveryPrice)} ₽</span>
                  </div>
                  <div className="h-[2px] bg-[#1565C0]/50 my-[15px]"></div>
                  <div className="flex justify-between items-end">
                    <span className="text-[24px] font-bold">{t("paid")}</span>
                    <span className="text-[24px] font-bold leading-none">
                      {formatPrice(totalPrice + deliveryPrice)} ₽
                    </span>
                  </div>
                </div>
                <Link href="/checkout">
                  <button className="w-full bg-[#1565C0] h-[47px] text-white rounded-[12px] text-[16px] font-bold hover:bg-[#0D47A1] transition-all shadow-xl shadow-blue-100 active:scale-[0.98]">
                    {t("toPayment")}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}