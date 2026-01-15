'use client';
import { useEffect, useState } from 'react';
import $api from '@/api/axios';
import { CreditCard, Trash2, Plus, X } from 'lucide-react';
import Image from 'next/image';
import myIllustration from './Card.jpg';

interface PaymentMethod {
  id: number;
  card_type: string;
  last_four_digits: string;
  is_default: boolean;
}

export const CardsList = () => {
  const [cards, setCards] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    card_number: '',
    card_holder: '',
    expiry_date: '',
    cvv: '',
    card_type: 'visa'
  });

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
        return <CreditCard size={size} className="text-gray-400" />;
    }
  };

  const fetchCards = async () => {
    try {
      const res = await $api.get<PaymentMethod[]>('/payments/methods');
      setCards(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCards(); }, []);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    setFormData({ ...formData, card_number: val.replace(/(\d{4})(?=\d)/g, '$1 ') });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
    setFormData({ ...formData, expiry_date: val });
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    try {
      await $api.delete(`/payments/methods/${deleteId}`);
      setCards(cards.filter(c => c.id !== deleteId));
      setDeleteId(null);
    } catch (err) { alert("Ошибка удаления"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBtnLoading(true);
    const [month, year] = formData.expiry_date.split('/');
    const payload = {
      card_number: formData.card_number.replace(/\s/g, ''),
      card_holder: formData.card_holder.toUpperCase(),
      expiry_month: month,
      expiry_year: year,
      cvv: formData.cvv,
      card_type: formData.card_type
    };

    try {
      // Оставлено только создание новой карты
      await $api.post('/payments/methods', payload);
      setIsModalOpen(false);
      setFormData({ card_number: '', card_holder: '', expiry_date: '', cvv: '', card_type: 'visa' });
      fetchCards();
    } catch (err) { alert("Ошибка сохранения"); }
    finally { setBtnLoading(false); }
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);





  const renderFormModal = isModalOpen && (
    <div className="fixed inset-0 z-[120] flex items-center justify-center  bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-[480px] rounded-[16px] p-[25px] shadow-2xl relative my-auto">
        
        <Image 
          src={myIllustration} 
          alt="Нет карт" 
          className=""
        />

        <div className="my-[20px]">
          <h2 className="text-[18px] font-bold">Добавьте новую карту</h2>
          <p className="text-[#757575] text-[15px]">Введите данные новой карты</p>
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-[16px]">
          <div>
            <p className="text-[15px]">Номер карты</p>
            <input required placeholder="0000 0000 0000 0000" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#1565C0]" value={formData.card_number} onChange={handleCardNumberChange} />
          </div>
          <div>
            <p className="text-[15px]">Имя на карте</p>
            <input required placeholder="Olivia Rhye" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#1565C0]" value={formData.card_holder} onChange={e => setFormData({...formData, card_holder: e.target.value})} />
          </div>
          <div>
            <p className="text-[15px]">Срок</p>
            <input required placeholder="06/28" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-center outline-none focus:border-[#1565C0]" value={formData.expiry_date} onChange={handleExpiryChange} />
          </div>
          <div>
            <p className="text-[15px]">CVV</p>
            <input required type="password" placeholder="•••" maxLength={3} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-center outline-none focus:border-[#1565C0]" value={formData.cvv} onChange={e => setFormData({...formData, cvv: e.target.value.replace(/\D/g, '')})} />
          </div>
          <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">Отмена</button>
          <button type="submit" disabled={btnLoading} className="flex-1 py-3 bg-[#1565C0] text-white rounded-xl font-medium hover:bg-[#0D47A1] transition-colors">
            {btnLoading ? '...' : 'Добавить'}
          </button>
        </form>
      </div>
    </div>
  );



  if (!loading && cards.length === 0) {
    return (
      <div className="animate-in fade-in">
        <div className="flex justify-between">
          <h3 className="text-[18px] font-bold">Способы оплаты</h3>
          <button onClick={() => setIsModalOpen(true)} className="flex gap-[15px]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.75 4C12.75 3.58579 12.4142 3.25 12 3.25C11.5858 3.25 11.25 3.58579 11.25 4L11.25 11.25H4C3.58579 11.25 3.25 11.5858 3.25 12C3.25 12.4142 3.58579 12.75 4 12.75H11.25V20C11.25 20.4142 11.5858 20.75 12 20.75C12.4142 20.75 12.75 20.4142 12.75 20V12.75H20C20.4142 12.75 20.75 12.4142 20.75 12C20.75 11.5858 20.4142 11.25 20 11.25H12.75L12.75 4Z" fill="#1565C0"/>
            </svg>
            <p className="text-[#1565C0] text-[16px]">Добавить карту</p>
          </button>
        </div>
        <div className="mt-[20px] py-5 border-2 border-dashed border-gray-200 rounded-xl text-center text-gray-400">
          Карты не привязаны
        </div>
        {renderFormModal}
      </div>
    );
  }

  return (
    <div className="animate-in fade-in">
      <div className="flex justify-between mb-[15px]">
        <h3 className="text-[18px] font-bold">Способы оплаты</h3>
        <button onClick={() => setIsModalOpen(true)} className="flex gap-[15px]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.75 4C12.75 3.58579 12.4142 3.25 12 3.25C11.5858 3.25 11.25 3.58579 11.25 4L11.25 11.25H4C3.58579 11.25 3.25 11.5858 3.25 12C3.25 12.4142 3.58579 12.75 4 12.75H11.25V20C11.25 20.4142 11.5858 20.75 12 20.75C12.4142 20.75 12.75 20.4142 12.75 20V12.75H20C20.4142 12.75 20.75 12.4142 20.75 12C20.75 11.5858 20.4142 11.25 20 11.25H12.75L12.75 4Z" fill="#1565C0"/>
          </svg>
          <p className="text-[#1565C0] text-[16px]">Добавить карту</p>
        </button>
      </div>
      <div className="grid gap-[20px]">
        {cards.map((card) => (
          <div key={card.id} className="flex items-center justify-between p-[16px] rounded-[12px] border border-[2px] border-[#F4F4F4] bg-white">
            <div className="flex items-center gap-4">
              <div className="bg-gray-50 w-12 h-12 flex items-center justify-center">
                {getCardIcon(card.card_type)}
              </div>
              <div className="text-[#F4F4F4]">
                <p className="first-letter:uppercase text-[16px] text-gray-600">
                  {card.card_type} заканчивается на {card.last_four_digits}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setDeleteId(card.id)} className="p-2 text-black hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {/* МОДАЛКА УДАЛЕНИЯ */}
        {deleteId !== null && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-white p-[24px] rounded-[16px] max-w-[400px] w-full shadow-2xl scale-in-center">
              <div className="flex justify-between">
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="4" width="48" height="48" rx="24" fill="#FEE4E2"/>
                  <rect x="4" y="4" width="48" height="48" rx="24" stroke="#FEF3F2" stroke-width="8"/>
                  <path d="M32 22V21.2C32 20.0799 32 19.5198 31.782 19.092C31.5903 18.7157 31.2843 18.4097 30.908 18.218C30.4802 18 29.9201 18 28.8 18H27.2C26.0799 18 25.5198 18 25.092 18.218C24.7157 18.4097 24.4097 18.7157 24.218 19.092C24 19.5198 24 20.0799 24 21.2V22M26 27.5V32.5M30 27.5V32.5M19 22H37M35 22V33.2C35 34.8802 35 35.7202 34.673 36.362C34.3854 36.9265 33.9265 37.3854 33.362 37.673C32.7202 38 31.8802 38 30.2 38H25.8C24.1198 38 23.2798 38 22.638 37.673C22.0735 37.3854 21.6146 36.9265 21.327 36.362C21 35.7202 21 34.8802 21 33.2V22" stroke="#D92D20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <button onClick={() => setDeleteId(null)}>
                  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M28 16L16 28M16 16L28 28" stroke="#717680" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
              <h3 className="text-[20px] font-bold mt-[16px] text-[#181D27]">Удалить карту</h3>
              <p className="text-[16px] leading-[20px] text-gray-500 mb-[32px]">
                Карта будет удалена. Это действие нельзя отменить.
              </p>
              <div className="flex gap-[12px] h-[42px]">
                <button onClick={() => setDeleteId(null)} className="flex-1 border-2 border-gray-300 rounded-[8px] text-gray-700 font-bold hover:bg-gray-100 transition-colors">
                  Отменить
                </button>
                <button onClick={confirmDelete}className="flex-1 bg-red-600 font-bold text-white rounded-[8px] hover:bg-red-700 transition-colors shadow-lg shadow-red-100">
                  Удалить
                </button>
              </div>
            </div>
          </div>
        )}
        {renderFormModal}
      </div>
    </div>
  );
};


/* if (cardNumber.startsWith('4')) cardType = 'visa';
  else if (cardNumber.startsWith('5')) cardType = 'mastercard';
  else if (cardNumber.startsWith('2')) cardType = 'mir'; */


  