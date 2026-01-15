'use client';
import { useEffect, useState } from 'react';
import $api from '@/api/axios';
import { MapPin, Plus, Pencil, X } from 'lucide-react';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (address: string) => void;
}

interface Address {
  id: number;
  address: string;
  is_default: boolean;
  comment?: string;
}

export const AddressModal = ({ isOpen, onClose, onSelect }: AddressModalProps) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Состояния для редактирования
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [addressData, setAddressData] = useState({
    street: '',
    floor: '',
    entrance: '',
    apartment: '',
    comment: ''
  });

  // Загрузка адресов
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      $api.get<Address[]>('/profile/addresses')
        .then(res => setAddresses(res.data))
        .catch(err => console.error("Ошибка загрузки адресов", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  // Блокировка скролла при открытии модалки редактирования
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = isAdding ? 'hidden' : 'unset';
    }
  }, [isAdding]);

  // ФУНКЦИЯ ПЕРЕХОДА В РЕЖИМ РЕДАКТИРОВАНИЯ
  const handleEditClick = (addr: Address) => {
    const fullString = addr.address || '';
    const parts = fullString.split(', ');
    const street = parts[0] || '';
    
    const findValue = (key: string) => {
      if (!parts || parts.length <= 1) return '';
      const found = parts.find((p: any) => p && typeof p === 'string' && p.includes(key));
      return found ? found.replace(key, '').trim() : '';
    };

    setAddressData({
      street: street,
      entrance: findValue('подъезд '),
      floor: findValue('этаж '),
      apartment: findValue('кв. '),
      comment: addr.comment || ''
    });
    
    setEditId(addr.id);
    setIsAdding(true);
  };

  // УНИВЕРСАЛЬНОЕ СОХРАНЕНИЕ (POST или PUT)
  const handleSaveAddress = async () => {
    if (!addressData.street.trim()) {
      alert("Пожалуйста, укажите адрес");
      return;
    }

    const fullAddress = [
      addressData.street,
      addressData.entrance ? `подъезд ${addressData.entrance}` : null,
      addressData.floor ? `этаж ${addressData.floor}` : null,
      addressData.apartment ? `кв. ${addressData.apartment}` : null
    ].filter(Boolean).join(', ');

    const method = editId ? 'PUT' : 'POST';
    const url = editId 
      ? `/profile/addresses/${editId}` 
      : '/profile/addresses';

    try {
      const res = await $api({
        method,
        url,
        data: { 
          address: fullAddress, 
          comment: addressData.comment,
          ...(!editId && { is_default: addresses.length === 0 })
        }
      });

      if (res.status === 200 || res.status === 201) {
        // Сбрасываем состояние
        setAddressData({ street: '', floor: '', entrance: '', apartment: '', comment: '' });
        setIsAdding(false);
        setEditId(null);
        
        // Перезагружаем список адресов
        const { data } = await $api.get<Address[]>('/profile/addresses');
        setAddresses(data);
      }
    } catch (err) { 
      console.error("Ошибка сохранения адреса", err);
      alert("Не удалось сохранить адрес");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[110] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white w-full max-w-[500px] rounded-[16px] p-[25px] animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
          <div className="flex mb-[25px] justify-between items-center">
            <h2 className="text-[24px] font-bold ">Мои адреса</h2>
            <button onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.2753 4.60893C16.5194 4.36486 16.5194 3.96913 16.2753 3.72505C16.0312 3.48097 15.6355 3.48097 15.3914 3.72505L10 9.11645L4.60863 3.72505C4.36455 3.48098 3.96882 3.48098 3.72475 3.72505C3.48067 3.96913 3.48067 4.36486 3.72475 4.60894L9.11615 10.0003L3.72477 15.3917C3.48069 15.6358 3.48069 16.0315 3.72477 16.2756C3.96885 16.5197 4.36457 16.5197 4.60865 16.2756L10 10.8842L15.3914 16.2756C15.6355 16.5197 16.0312 16.5197 16.2753 16.2756C16.5194 16.0315 16.5194 15.6358 16.2753 15.3917L10.8839 10.0003L16.2753 4.60893Z" fill="#212121"/>
              </svg>
            </button>
          </div>
          <button onClick={() => { setEditId(null); setIsAdding(true); }} className="flex gap-[15px] items-center mb-[25px]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.75 4C12.75 3.58579 12.4142 3.25 12 3.25C11.5858 3.25 11.25 3.58579 11.25 4L11.25 11.25H4C3.58579 11.25 3.25 11.5858 3.25 12C3.25 12.4142 3.58579 12.75 4 12.75H11.25V20C11.25 20.4142 11.5858 20.75 12 20.75C12.4142 20.75 12.75 20.4142 12.75 20V12.75H20C20.4142 12.75 20.75 12.4142 20.75 12C20.75 11.5858 20.4142 11.25 20 11.25H12.75L12.75 4Z" fill="#1565C0"/>
            </svg>
            <p className="text-[#1565C0] text-[16px]">Добавить новый</p>
          </button>
          <div className="space-y-3">
            {loading ? (
              <p className="text-center py-4 text-gray-500">Загрузка адресов...</p>
            ) : addresses.length > 0 ? (
              addresses.map((addr) => {
                const parts = addr.address.split(', ');
                const streetPart = parts[0];
                const detailsPart = parts.slice(1).join(', ');

                return (
                  <div 
                    key={addr.id}
                    className="p-[10px] border border-gray-100 rounded-2xl hover:border-[#1565C0] hover:bg-blue-50 transition-all group"
                  >
                    <div className="flex items-center justify-between ">
                      <button 
                        onClick={() => onSelect(addr.address)}
                        className="flex-1 text-left"
                      >
                        <div className="flex items-center gap-[20px]">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.5 13.4094V9.24826C17.5 5.67441 17.5 3.88749 16.4017 2.77724C15.3033 1.66699 13.5355 1.66699 10 1.66699C6.46447 1.66699 4.6967 1.66699 3.59835 2.77724C2.5 3.88749 2.5 5.67441 2.5 9.24826V13.4094C2.5 15.9899 2.5 17.2801 3.11176 17.8439C3.40351 18.1128 3.77179 18.2817 4.1641 18.3266C4.98668 18.4207 5.94728 17.5711 7.86847 15.8718C8.71768 15.1207 9.14229 14.7452 9.63356 14.6462C9.87548 14.5975 10.1245 14.5975 10.3664 14.6462C10.8577 14.7452 11.2823 15.1207 12.1315 15.8718C14.0527 17.5711 15.0133 18.4207 15.8359 18.3266C16.2282 18.2817 16.5965 18.1128 16.8882 17.8439C17.5 17.2801 17.5 15.9899 17.5 13.4094Z" stroke="#212121" stroke-width="1.5"/>
                            <path d="M12.5 5H7.5" stroke="#212121" stroke-width="1.5" stroke-linecap="round"/>
                          </svg>

                          <div>
                            <span className="text-[16px] text-[#212121] block">
                              {streetPart}
                            </span>
                            {detailsPart && (
                              <p className="text-[14px] text-[#757575]">{detailsPart}</p>
                            )}
                          </div>
                        </div>
                      </button>
                      
                      <button 
                        onClick={() => handleEditClick(addr)}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3.33331 18.333H16.6666" stroke="#212121" stroke-width="1.5" stroke-linecap="round"/>
                          <path d="M11.5734 3.05276L12.1913 2.43484C13.2151 1.41104 14.875 1.41104 15.8988 2.43484C16.9226 3.45865 16.9226 5.11856 15.8988 6.14236L15.2809 6.76028M11.5734 3.05276C11.5734 3.05276 11.6506 4.36584 12.8092 5.52444C13.9678 6.68304 15.2809 6.76028 15.2809 6.76028M11.5734 3.05276L5.89253 8.73359C5.50775 9.11837 5.31537 9.31075 5.14991 9.52288C4.95474 9.77311 4.7874 10.0439 4.65087 10.3303C4.53514 10.5732 4.4491 10.8313 4.27702 11.3475L3.54785 13.535M15.2809 6.76028L9.60005 12.4411C9.21527 12.8259 9.02288 13.0183 8.81076 13.1837C8.56052 13.3789 8.28977 13.5462 8.0033 13.6828C7.76044 13.7985 7.50233 13.8845 6.9861 14.0566L4.79859 14.7858M4.79859 14.7858L4.26387 14.964C4.00983 15.0487 3.72975 14.9826 3.5404 14.7932C3.35105 14.6039 3.28493 14.3238 3.36961 14.0698L3.54785 13.535M4.79859 14.7858L3.54785 13.535" stroke="#212121" stroke-width="1.5"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">У вас пока нет сохраненных адресов</p>
            )}
          </div>
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ/РЕДАКТИРОВАНИЯ АДРЕСА */}
      {isAdding && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setIsAdding(false); setEditId(null); }} />
          <div className="relative bg-white rounded-[16px] p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                {editId ? 'Редактировать адрес' : 'Добавить адрес'}
              </h3>
              <button 
                onClick={() => { 
                  setIsAdding(false); 
                  setEditId(null); 
                  setAddressData({street:'', floor:'', entrance:'', apartment:'', comment:''}); 
                }}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-gray-700">Адрес *</p>
                <input 
                  placeholder="Улица, номер дома" 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#1565C0] focus:ring-2 focus:ring-blue-100 outline-none"
                  value={addressData.street}
                  onChange={e => setAddressData({...addressData, street: e.target.value})}
                  maxLength={50}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="mb-2 text-gray-700">Подъезд</p>
                  <input 
                    placeholder="№" 
                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#1565C0] outline-none"
                    value={addressData.entrance}
                    onChange={e => setAddressData({...addressData, entrance: e.target.value})}
                    maxLength={10}
                  />
                </div>
                
                <div>
                  <p className="mb-2 text-gray-700">Этаж</p>
                  <input 
                    placeholder="№" 
                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#1565C0] outline-none"
                    value={addressData.floor}
                    onChange={e => setAddressData({...addressData, floor: e.target.value})}
                    maxLength={10}
                  />
                </div>
                
                <div>
                  <p className="mb-2 text-gray-700">Квартира</p>
                  <input 
                    placeholder="№" 
                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#1565C0] outline-none"
                    value={addressData.apartment}
                    onChange={e => setAddressData({...addressData, apartment: e.target.value})}
                    maxLength={10}
                  />
                </div>
              </div>
              
              <div>
                <p className="mb-2 text-gray-700">Комментарий для курьера</p>
                <textarea 
                  placeholder="Дополнительная информация для курьера" 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#1565C0] focus:ring-2 focus:ring-blue-100 outline-none h-24 resize-none"
                  value={addressData.comment}
                  onChange={e => setAddressData({...addressData, comment: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => { 
                  setIsAdding(false); 
                  setEditId(null); 
                  setAddressData({street:'', floor:'', entrance:'', apartment:'', comment:''}); 
                }} 
                className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button 
                onClick={handleSaveAddress}
                className="flex-1 py-3 bg-[#1565C0] text-white rounded-xl font-medium hover:bg-[#0D47A1] transition-colors"
              >
                {editId ? 'Сохранить' : 'Добавить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
    