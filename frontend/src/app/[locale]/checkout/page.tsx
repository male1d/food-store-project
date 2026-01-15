'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import $api from '@/api/axios';
import { Product } from '@/types';
import { Link } from '@/navigation'
import { CreditCard } from 'lucide-react';


// Импортируем будущие компоненты модалок (пока создадим заглушки ниже)
import { AddressModal } from './components/AddressModal';
import { PaymentModal } from './components/PaymentModal';
import { DateModal } from './components/DateModal';


interface CartItem extends Product {
  cartQuantity: number;
}

interface ICard {
  id: number;
  card_type: string;
  last_four_digits: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuth, user, token } = useAuthStore();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  
  // Состояния для выбранных данных
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Состояния для открытия модалок
  const [activeModal, setActiveModal] = useState<'address' | 'payment' | 'date' | null>(null); 
  const deliveryPrice = 200;
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.cartQuantity, 0);

  const [selectedCard, setSelectedCard] = useState<ICard | null>(null);

  const formatPrice = (price: number) => {
    return price.toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  useEffect(() => {
    if (!token) {
      router.push('/login?redirect=checkout');
      return;
    }
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (savedCart.length === 0) { router.push('/cart'); return; }
    setCart(savedCart);
    
    // Загружаем адрес по умолчанию из API
    fetchDefaultAddress();
  }, [token]);

  const fetchDefaultAddress = async () => {
    try {
      const { data } = await $api.get('/profile/addresses');
      const defaultAddr = data.find((a: any) => a.is_default) || data[0];
      if (defaultAddr) setSelectedAddress(defaultAddr.address);
    } catch (e) { console.error(e); }
  };


  const getCardIcon = (type: string, size = 24) => {
    const t = type.toLowerCase();
    switch (t) {
      case 'visa':
        return (
          <svg width="46" height="32" viewBox="0 0 46 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="45" height="31" rx="5.5" fill="white"/>
            <rect x="0.5" y="0.5" width="45" height="31" rx="5.5" stroke="#E0E0E0"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M14.3336 21.1441H11.5872L9.52784 13.0563C9.43009 12.6843 9.22255 12.3554 8.91725 12.2003C8.15535 11.8108 7.31579 11.5007 6.3999 11.3444V11.033H10.824C11.4346 11.033 11.8925 11.5007 11.9689 12.044L13.0374 17.878L15.7824 11.033H18.4524L14.3336 21.1441ZM19.9789 21.1441H17.3852L19.5209 11.033H22.1146L19.9789 21.1441ZM25.4702 13.8341C25.5465 13.2895 26.0044 12.9781 26.5387 12.9781C27.3783 12.8999 28.2928 13.0563 29.0561 13.4445L29.514 11.2676C28.7508 10.9562 27.9112 10.7998 27.1493 10.7998C24.6319 10.7998 22.8002 12.2003 22.8002 14.1441C22.8002 15.6228 24.0977 16.3993 25.0136 16.867C26.0044 17.3334 26.3861 17.6448 26.3097 18.1112C26.3097 18.8108 25.5465 19.1222 24.7846 19.1222C23.8687 19.1222 22.9528 18.889 22.1146 18.4994L21.6567 20.6777C22.5725 21.066 23.5634 21.2223 24.4793 21.2223C27.3019 21.2992 29.0561 19.9 29.0561 17.7998C29.0561 15.1551 25.4702 15.0001 25.4702 13.8341ZM38.1332 21.1441L36.0738 11.033H33.8618C33.4038 11.033 32.9459 11.3444 32.7932 11.8108L28.9797 21.1441H31.6497L32.1826 19.6668H35.4632L35.7685 21.1441H38.1332ZM34.2434 13.7559L35.0053 17.5666H32.8696L34.2434 13.7559Z" fill="#172B85"/>
          </svg>
        );
      case 'mastercard':
        return (
          <svg width="46" height="32" viewBox="0 0 46 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="45" height="31" rx="5.5" fill="white"/>
            <rect x="0.5" y="0.5" width="45" height="31" rx="5.5" stroke="#E0E0E0"/>
            <path d="M28.7695 6.70703C33.7627 6.70703 37.8105 10.7069 37.8105 15.6406C37.8104 20.5742 33.7626 24.5732 28.7695 24.5732C26.5311 24.5732 24.4842 23.768 22.9053 22.4365C21.3264 23.768 19.2795 24.5732 17.041 24.5732C12.0479 24.5732 8.00014 20.5742 8 15.6406C8 10.7069 12.0479 6.70703 17.041 6.70703C19.2794 6.70705 21.3264 7.51239 22.9053 8.84375C24.4841 7.51239 26.5312 6.70707 28.7695 6.70703Z" fill="#ED0006"/>
            <path d="M28.7695 6.70703C33.7627 6.70703 37.8105 10.7069 37.8105 15.6406C37.8104 20.5742 33.7626 24.5732 28.7695 24.5732C26.5311 24.5732 24.4842 23.768 22.9053 22.4365C24.8482 20.798 26.082 18.3624 26.082 15.6406C26.082 12.9186 24.8484 10.4823 22.9053 8.84375C24.4842 7.51239 26.5312 6.70706 28.7695 6.70703Z" fill="#F9A000"/>
            <path d="M22.9045 8.84375C24.8477 10.4822 26.0812 12.9177 26.0813 15.6396C26.0813 18.3616 24.8476 20.797 22.9045 22.4355C20.962 20.797 19.7288 18.3612 19.7288 15.6396C19.7289 12.9181 20.9618 10.4822 22.9045 8.84375Z" fill="#FF5E00"/>
          </svg>

        );
      case 'mir':
        return <span className="text-green-600 font-black italic shadow-sm" style={{ fontSize: size * 0.5 }}>МИР</span>;
      default:
        return <CreditCard strokeWidth={1} size={32} className="text-[#1C274C]" />
    }
  };


  const handleSubmit = async () => {
    if (!selectedAddress) return alert("Выберите адрес");
    setLoading(true);
    if (!selectedCard) return alert("Выберите карту для оплаты");
    try {
      await $api.post('/orders', {
        delivery_address: selectedAddress,
        payment_method_id: selectedCard.id,
        delivery_date: selectedDate,
        phone: user?.phone,
        email: user?.email,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.cartQuantity,
          price_at_time: item.price
        }))
      });
      localStorage.removeItem('cart');
      setIsOrderSuccess(true);
      setTimeout(() => router.push('/profile'), 3000);
    } catch (error: any) {
      alert("Ошибка при оформлении");
    } finally { setLoading(false); }
  };

  if (isOrderSuccess) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-2">Заказ принят!</h1>
      <p className="text-gray-500">Доставка на {selectedDate}</p>
    </div>
  );

  return (
    <div className="w-[1340px] mx-auto py-[20px] grid">
      <div className="mb-[20px]">
        <Link href="/cart" className="flex gap-[10px] items-center mb-[10px]">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 15.8334L7.5 10L12.5 4.16671" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-[16px]">Вернуться в корзину</p>
        </Link>
        <div className="flex items-end w-[880px] justify-between">
          <div className="flex items-end">
            <h1 className="font-bold text-[24px] mr-[10px]">Оформление заказа</h1>
          </div>
        </div>
      </div>
      <div className="flex gap-10 flex-col lg:flex-row items-start justify-between">



        <div className="flex flex-col gap-[25px] w-[860px]">
            {/* КНОПКА-ВЫБОР ОПЛАТЫ */}
            <div>
              <h3 className="text-[18px] font-bold mb-[10px]">Способ оплаты</h3>
              <button 
                onClick={() => setActiveModal('payment')}
                className="w-full flex items-center justify-between bg-white py-[20px] px-[25px] rounded-[12px] border border-[#E0E0E0] hover:border-blue-300 transition-all text-left"
              >
                <div className="flex items-center gap-[10px]">
                  <div className="shrink-0">
                    {selectedCard 
                      ? getCardIcon(selectedCard.card_type, 32) 
                      : <CreditCard strokeWidth={1} size={32} className="text-[#1C274C]" />
                    }
                  </div>          
                  <p className="text-[16px]">
                    {selectedCard ? (
                      <p className="first-letter:uppercase text-[16px]">
                        {selectedCard.card_type} заканчивается на {selectedCard.last_four_digits}
                      </p>
                    ) : (
                      'Выберите карту для оплаты'
                    )}
                  </p>
                </div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5L15 12L9 19" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>

            {/* КНОПКА-ВЫБОР АДРЕСА */}
            <div>
              <h3 className="text-[18px] font-bold mb-[10px]">Адрес доставки</h3>
              <button 
                onClick={() => setActiveModal('address')}
                className="w-full flex items-center justify-between bg-white py-[20px] px-[25px] rounded-[12px] border border-[#E0E0E0] hover:border-blue-300 transition-all text-left"
              >
                <div className="flex items-center gap-[10px]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 8.51464C5 4.9167 8.13401 2 12 2C15.866 2 19 4.9167 19 8.51464C19 12.0844 16.7658 16.2499 13.2801 17.7396C12.4675 18.0868 11.5325 18.0868 10.7199 17.7396C7.23416 16.2499 5 12.0844 5 8.51464Z" stroke="#1C274C" stroke-width="1.5"/>
                    <path d="M14 9C14 10.1046 13.1046 11 12 11C10.8954 11 10 10.1046 10 9C10 7.89543 10.8954 7 12 7C13.1046 7 14 7.89543 14 9Z" stroke="#1C274C" stroke-width="1.5"/>
                    <path d="M20.9605 15.5C21.6259 16.1025 22 16.7816 22 17.5C22 19.9853 17.5228 22 12 22C6.47715 22 2 19.9853 2 17.5C2 16.7816 2.37412 16.1025 3.03947 15.5" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                  <p className="text-[16px]">
                    {selectedAddress || 'Выберите адрес'}
                  </p>
                </div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5L15 12L9 19" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            
            
            {/* КНОПКА-ВЫБОР ДАТЫ */}
            <div>
              <h3 className="text-[18px] font-bold mb-[10px]">Дата доставки</h3>
              <button 
                onClick={() => setActiveModal('date')}
                className="w-full flex items-center justify-between bg-white py-[20px] px-[25px] rounded-[12px] border border-[#E0E0E0] hover:border-blue-300 transition-all text-left"
              >
                <div className="flex items-center gap-[10px]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12L14.5 14.5" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M5.60423 5.60414L5.0739 5.07381V5.07381L5.60423 5.60414ZM4.33785 6.87052L3.58786 6.87429C3.58993 7.28556 3.92282 7.61844 4.33408 7.62051L4.33785 6.87052ZM6.87964 7.6333C7.29384 7.63539 7.63131 7.30129 7.63339 6.88708C7.63548 6.47287 7.30138 6.1354 6.88717 6.13332L6.8834 6.88331L6.87964 7.6333ZM5.07505 4.3212C5.07297 3.90699 4.7355 3.5729 4.32129 3.57498C3.90708 3.57706 3.57299 3.91453 3.57507 4.32874L4.32506 4.32497L5.07505 4.3212ZM3.8267 10.7849C3.88295 10.3745 3.59587 9.99627 3.1855 9.94002C2.77512 9.88377 2.39684 10.1708 2.34059 10.5812L3.08365 10.6831L3.8267 10.7849ZM18.332 5.6681L18.8623 5.13777C15.0421 1.31758 8.86882 1.27889 5.0739 5.07381L5.60423 5.60414L6.13456 6.13447C9.33367 2.93536 14.5572 2.95395 17.8017 6.19843L18.332 5.6681ZM5.66819 18.3319L5.13786 18.8622C8.95805 22.6824 15.1314 22.7211 18.9263 18.9262L18.396 18.3959L17.8656 17.8655C14.6665 21.0646 9.443 21.0461 6.19852 17.8016L5.66819 18.3319ZM18.396 18.3959L18.9263 18.9262C22.7212 15.1313 22.6825 8.95796 18.8623 5.13777L18.332 5.6681L17.8017 6.19843C21.0461 9.44291 21.0647 14.6664 17.8656 17.8655L18.396 18.3959ZM5.60423 5.60414L5.0739 5.07381L3.80752 6.34019L4.33785 6.87052L4.86818 7.40085L6.13456 6.13447L5.60423 5.60414ZM4.33785 6.87052L4.33408 7.62051L6.87964 7.6333L6.8834 6.88331L6.88717 6.13332L4.34162 6.12053L4.33785 6.87052ZM4.33785 6.87052L5.08784 6.86675L5.07505 4.3212L4.32506 4.32497L3.57507 4.32874L3.58786 6.87429L4.33785 6.87052ZM3.08365 10.6831L2.34059 10.5812C1.93916 13.5099 2.87401 16.5984 5.13786 18.8622L5.66819 18.3319L6.19852 17.8016C4.27795 15.881 3.48673 13.2652 3.8267 10.7849L3.08365 10.6831Z" fill="#1C274C"/>
                  </svg>
                  <p className="text-[16px]">
                    {selectedDate || 'Выберите дату доставки'}
                  </p>
                </div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5L15 12L9 19" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
        </div>



        {/* ИТОГО */}
        <div className="w-[390px] sticky top-10 border border-[#757575]/50 rounded-[15px]">
          <div className="p-[20px]">
            <h2 className="text-[24px] font-bold mb-[10px]">Информация о заказе</h2>
            <p className="text-[15px] text-[#757575]">Доставка 1 день</p>
            <div className="h-[2px] bg-[#1565C0]/50 my-[15px]"></div>
            
            <div className="flex flex-col mb-8 gap-3">
              <div className="flex justify-between font-[15px]">
                <span>Товары</span>
                <span className="font-[16px] font-bold">{formatPrice(totalPrice)} ₽</span>
              </div>
              <div className="flex justify-between font-[15px]">
                <span>Доставка</span>
                <span className="font-[16px] font-bold">{formatPrice(deliveryPrice)} ₽</span>
              </div>
              <div className="h-[2px] bg-[#1565C0]/50 my-[15px]"></div>
              <div className="flex justify-between items-end">
                <span className="text-[24px] font-bold">К оплате</span>
                <span className="text-[24px] font-bold leading-none">
                  {formatPrice(totalPrice + deliveryPrice)} ₽
                </span>
              </div>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={loading || !selectedAddress || !selectedCard || !selectedDate}
              className="w-full bg-[#1565C0] h-[47px] text-white rounded-[12px] text-[16px] font-bold hover:bg-[#0D47A1] transition-all shadow-xl shadow-blue-100 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Оформление...' : 'Оплатить'}
            </button>
          </div>
        </div>
      </div>
      
      {/* МОДАЛЬНЫЕ ОКНА */}
      <AddressModal 
        isOpen={activeModal === 'address'} 
        onClose={() => setActiveModal(null)} 
        onSelect={(addr) => { setSelectedAddress(addr); setActiveModal(null); }}
      />
      <PaymentModal 
        isOpen={activeModal === 'payment'} 
        onClose={() => setActiveModal(null)} 
        onSelect={(card) => {
          setSelectedCard(card); // Сохраняем весь объект выбранной карты
          setActiveModal(null);
        }}
      />
      <DateModal 
        isOpen={activeModal === 'date'} 
        onClose={() => setActiveModal(null)} 
        onSelect={(date) => { setSelectedDate(date); setActiveModal(null); }}
      />
    </div>
  );
}