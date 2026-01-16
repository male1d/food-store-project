'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Trash2 } from 'lucide-react';
import { Link } from '@/navigation';
import { OrdersList } from './components/OrdersList';
import $api from '@/api/axios';
import { CardsList } from './components/CardsList';
import { useTranslations } from 'next-intl';



export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, token, setUserAddress } = useAuthStore();
  const [activeTab, setActiveTab] = useState('data');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [addressData, setAddressData] = useState({
    street: '',
    floor: '',
    entrance: '',
    apartment: '',
    comment: ''
  });

  const t = useTranslations('Profile');

  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    if (token && activeTab === 'orders') {
      setIsLoadingOrders(true);
      $api.get('/users/me/orders')
        .then(res => setOrders(res.data))
        .catch(err => console.error(t("loadingError"), err))
        .finally(() => setIsLoadingOrders(false));
    }
  }, [token, activeTab]);
  
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleUrlChange = () => {
      const hash = window.location.hash;
      const tab = searchParams.get('tab');
      if (tab === 'cards') {
        setActiveTab('payment');
      } 
      else if (hash === '#addresses') {
        setActiveTab('addresses');
      } 
      else if (hash === '#data' || (window.location.pathname === '/profile' && !hash && !tab)) {
        setActiveTab('data');
      }
    };

    handleUrlChange();

    window.addEventListener('hashchange', handleUrlChange);
    return () => window.removeEventListener('hashchange', handleUrlChange);
  }, [searchParams]);

  useEffect(() => {
    if (window.location.hash === '#addresses') {
      setActiveTab('addresses');
      const element = document.getElementById('addresses');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = (isAdding || deleteId !== null) ? 'hidden' : 'unset';
    }
  }, [isAdding, deleteId]);

  const fetchAddresses = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3000/profile/addresses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const sortedData = data.sort((a: any, b: any) => a.id - b.id);
        setAddresses(sortedData);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (activeTab === 'addresses' && token) fetchAddresses();
  }, [activeTab, token]);

  const handleEditClick = (addr: any) => {
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
      entrance: findValue(t("entrance")),
      floor: findValue(t("floor")),
      apartment: findValue(t("flat")),
      comment: addr.comment || ''
    });
    
    setEditId(addr.id);
    setIsAdding(true);
  };


  const handleSaveAddress = async () => {
    if (!addressData.street.trim()) {
      alert(t("provide"));
      return;
    }

    const fullAddress = [
      addressData.street,
      addressData.entrance ? `${t("entrance")}${addressData.entrance}` : null,
      addressData.floor ? `${t("floor")}${addressData.floor}` : null,
      addressData.apartment ? `${t("flat")}${addressData.apartment}` : null
    ].filter(Boolean).join(', ');

    const method = editId ? 'PUT' : 'POST';
    const url = editId 
      ? `http://localhost:3000/profile/addresses/${editId}` 
      : 'http://localhost:3000/profile/addresses';

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          address: fullAddress, 
          comment: addressData.comment,
          ...( !editId && { is_default: addresses.length === 0 })
        })
      });

      if (res.ok) {
        if (editId) {
          const editingAddr = addresses.find(a => a.id === editId);
          if (editingAddr?.is_default) {
            setUserAddress(addressData.street);
          }
        } else if (addresses.length === 0) {
          setUserAddress(addressData.street);
        }

        setAddressData({ street: '', floor: '', entrance: '', apartment: '', comment: '' });
        setIsAdding(false);
        setEditId(null);
        fetchAddresses();
      }
    } catch (err) { console.error(err); }
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;

    const addressToDelete = addresses.find(a => a.id === deleteId);
    const wasDefault = addressToDelete?.is_default;

    try {
      const res = await fetch(`http://localhost:3000/profile/addresses/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const response = await fetch('http://localhost:3000/profile/addresses', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const updatedAddresses = await response.json();
        const sorted = updatedAddresses.sort((a: any, b: any) => a.id - b.id);
        setAddresses(sorted);

        if (sorted.length === 0) {
          setUserAddress(t("specify"));
        } else if (wasDefault) {
          const nextAddress = sorted[0];
          await handleSetDefault(nextAddress.id); 
        }

        setDeleteId(null);
      }
    } catch (err) {
      console.error(t("errorDeleting"), err);
    }
  };

  const handleSetDefault = async (id: number) => {
  try {
    const res = await fetch(`http://localhost:3000/profile/addresses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ is_default: true })
    });

    if (res.ok) {
      const selectedAddr = addresses.find(a => a.id === id);
      if (selectedAddr) {
        setUserAddress(selectedAddr.address.split(', ')[0]);
      }
      fetchAddresses();
    }
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1565C0]"></div>
      </div>
    );
  }


  const menuItems = [
    { 
      id: 'data', 
      label: t("myData"), 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="6" r="4" stroke="currentColor" strokeWidth="1.5"/>
          <ellipse cx="12" cy="17" rx="7" ry="4" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      )
    },
    { 
      id: 'orders', 
      label: t("myOrders"), 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.79375 12.0291C4.33092 9.34329 4.5995 8.00036 5.48697 7.13543C5.651 6.97557 5.82845 6.8301 6.01737 6.70061C7.03956 6 8.40907 6 11.1481 6H12.851C15.5901 6 16.9596 6 17.9818 6.70061C18.1707 6.8301 18.3482 6.97557 18.5122 7.13543C19.3996 8.00036 19.6682 9.34329 20.2054 12.0291C20.9766 15.8851 21.3622 17.8131 20.4745 19.1793C20.3138 19.4267 20.1262 19.6555 19.9152 19.8616C18.7496 21 16.7834 21 12.851 21H11.1481C7.21574 21 5.24955 21 4.08398 19.8616C3.87293 19.6555 3.68534 19.4267 3.52461 19.1793C2.63695 17.8131 3.02255 15.8851 3.79375 12.0291Z" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="15" cy="9" r="1" fill="currentColor"/>
          <circle cx="9" cy="9" r="1" fill="currentColor"/>
          <path d="M9 6V5C9 3.34315 10.3431 2 12 2C13.6569 2 15 3.34315 15 5V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      id: 'payment', 
      label: t("paymentMethods"), 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12C22 15.7712 22 17.6569 20.8284 18.8284C19.6569 20 17.7712 20 14 20H10C6.22876 20 4.34315 20 3.17157 18.8284C2 17.6569 2 15.7712 2 12Z" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M10 16.5H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8 13.5H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M2 10L22 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M14 15C14 14.0572 14 13.5858 14.2929 13.2929C14.5858 13 15.0572 13 16 13C16.9428 13 17.4142 13 17.7071 13.2929C18 13.5858 18 14.0572 18 15C18 15.9428 18 16.4142 17.7071 16.7071C17.4142 17 16.9428 17 16 17C15.0572 17 14.5858 17 14.2929 16.7071C14 16.4142 14 15.9428 14 15Z" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      )
    },
    { 
      id: 'addresses', 
      label: t("myAddresses"), 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M13.4227 17.3618L16.9348 8.19598C17.2164 7.46107 16.5389 6.78361 15.804 7.06521L6.63824 10.5773C5.80779 10.8955 5.78079 12.06 6.5981 12.3083L10.0751 13.3648C10.3455 13.447 10.553 13.6545 10.6352 13.9249L11.6917 17.4019C11.94 18.2192 13.1045 18.1922 13.4227 17.3618Z" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      )
    },
  ];

  return (
    <div className="w-[1340px] mx-auto py-[20px] flex">
      <aside className="">
        <Link href="/" className="flex gap-[10px] items-center my-[20px]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15.8334L7.5 10L12.5 4.16671" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="text-[16px]">{t("return")}</p>
        </Link>
        <h2 className="font-bold text-[24px]">{t("account")}</h2>
        
        <nav className="flex flex-col gap-[15px] mt-[20px]">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center justify-between ${
                activeTab === item.id 
                ? ' text-[#1565C0]' 
                : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3 transition-all duration-200 hover:translate-x-1">
                {item.icon}
                <span className="text-[16px]">{item.label}</span>
              </div>
            </button>
          ))}
        </nav>

        <button 
          onClick={() => setIsLogoutModalOpen(true)}
          className="mt-[50px] hover:opacity-80"
        >
          <span className="text-[#757575] font-[16px] transition-all duration-200 hover:text-red-500">{t("exit")}</span>
        </button>
      </aside>

      <section className="flex-1 mt-[100px] ml-[33px]">
        {activeTab === 'data' && (
          <div className="animate-in fade-in">
            <h3 className="text-[18px] font-bold">{t("myData")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">{t("name")}</p>
                <p className="text-gray-800 font-medium">{user.first_name} {user.last_name}</p>
              </div>
              <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">{t("telephone")}</p>
                <p className="text-gray-800 font-medium">{user.phone || ""}</p>
              </div>
              <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Email</p>
                <p className="text-gray-800 font-medium">{user.email}</p>
              </div>
              <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">{t("role")}</p>
                <p className="text-gray-800 font-medium capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="animate-in fade-in">
            {orders.length > 0 ? (
             <div>
                <h3 className="text-[18px] font-bold">{t("myOrders")}</h3>
                <OrdersList />
              </div>
            ) : (
              <div className="animate-in fade-in">
                <h3 className="text-[18px] font-bold">{t("myOrders")}</h3>
                <div className="flex items-center min-h-[209px]  gap-[50px] pt-[100px] ml-[190px]">
                  <div className="flex items-center justify-center w-[189px] h-[189px] bg-[#1565C0]/10 rounded-full shrink-0 pt-[21px]">
                    <svg width="120" height="168" viewBox="0 0 123 171" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M121.5 78.1562V93.6064" stroke="#1565C0" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M121.5 115.424V169.499H22.9654L1.5 148.616V9.47949H121.5V61.0934" stroke="#1565C0" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M96.1542 1.5H26.7578V18.3934H96.1542V1.5Z" stroke="#1565C0" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M1.5 148.617H22.9654V169.5L1.5 148.617Z" stroke="#1565C0" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M23.9141 47.6816H99.0863" stroke="#1565C0" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M23.9141 63.9805H99.0863" stroke="#1565C0" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M23.9141 80.2793H99.0863" stroke="#1565C0" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M23.9141 96.4932H99.0863" stroke="#1565C0" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M23.9141 112.793H70.9829" stroke="#1565C0" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-[20px] w-[300px]">
                    <h4 className="font-bold text-[32px]">{t("nothing")}</h4>
                    <p className="text-[20px]">{t("appear")}</p>
                    <Link href="/" >
                      <button className="px-[32px] py-[9px] bg-[#1565C0] text-white rounded-[12px]">
                        {t("startShopping")}
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'payment' && ( <CardsList />  )}

        {isLogoutModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm">
            <div className="bg-white p-[25px] rounded-[12px] w-[430px] shadow-2xl scale-in-center">
              <h2 className="text-2xl font-bold mb-4 text-[#212121] text-center">{t("logout")}</h2>
              <p className="text-[#757575] mb-8 text-center">
                {t("sure")}
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-100 rounded-xl text-[#757575] font-semibold hover:bg-gray-100 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95"
                >
                  {t("exit")}
                </button>
              </div>
            </div>
          </div>
        )}

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
              <h3 className="text-[20px] font-bold mt-[16px] text-[#181D27]">{t("delete")}</h3>
              <p className="text-[16px] leading-[20px] text-gray-500 mb-[32px]">
                {t("deleted")}
              </p>
              
              <div className="flex gap-[12px] h-[42px]">
                <button onClick={() => setDeleteId(null)} className="flex-1 border-2 border-gray-300 rounded-[8px] text-gray-700 font-bold hover:bg-gray-100 transition-colors">
                  {t("canc")}
                </button>
                <button onClick={confirmDelete}className="flex-1 bg-red-600 font-bold text-white rounded-[8px] hover:bg-red-700 transition-colors shadow-lg shadow-red-100">
                  {t("remove")}
                </button>
              </div>
            </div>
          </div>
        )}

        {isAdding && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[16px] p-[25px] w-full max-w-[700px] animate-in zoom-in-95 duration-200 shadow-2xl">
              <h3 className="text-[20px] font-bold mb-6">
                {editId ? t("editAddress") : t("adding")}
              </h3>
              <div className="flex flex-col gap-0">
                <p className="ml-[5px]">{t("address")}</p>
                <input 
                  placeholder={t("house")}
                  className="p-4 border border-gray-100 rounded-xl outline-none focus:border-[#1565C0] bg-gray-50/30"
                  value={addressData.street}
                  onChange={e => setAddressData({...addressData, street: e.target.value})}
                  maxLength={50}
                />
                <div className="grid grid-cols-3 gap-2 mt-[20px]">
                  <div>
                    <p className="ml-[5px]">{t("flor")}</p>
                    <input maxLength={10} placeholder={t("flor")} className="w-[200px] p-4 border border-gray-100 rounded-xl outline-none focus:border-[#1565C0] bg-gray-50/30" value={addressData.entrance} onChange={e => setAddressData({...addressData, entrance: e.target.value})}/>
                  </div>
                  <div>
                    <p className="ml-[5px]">{t("entran")}</p>
                    <input maxLength={10} placeholder={t("entran")} className="w-[200px] p-4 border border-gray-100 rounded-xl outline-none focus:border-[#1565C0] bg-gray-50/30" value={addressData.floor} onChange={e => setAddressData({...addressData, floor: e.target.value})}/>
                  </div>
                  <div>
                    <p className="ml-[5px]">{t("fl")}</p>
                    <input maxLength={10} placeholder={t("fl")} className="w-[200px] p-4 border border-gray-100 rounded-xl outline-none focus:border-[#1565C0] bg-gray-50/30" value={addressData.apartment} onChange={e => setAddressData({...addressData, apartment: e.target.value})}/>
                  </div>
                </div>
                <p className="mt-[20px] ml-[5px]">{t("comment")}</p>
                <textarea 
                  placeholder={t("courier")}
                  className="p-4 border border-gray-100 rounded-xl outline-none h-[100px] resize-none focus:border-[#1565C0] bg-gray-50/30"
                  value={addressData.comment}
                  onChange={e => setAddressData({...addressData, comment: e.target.value})}
                />
                <div className="flex gap-[20px] mt-[25px]">
                  <button 
                    onClick={() => { 
                      setIsAdding(false); 
                      setEditId(null); 
                      setAddressData({street:'', floor:'', entrance:'', apartment:'', comment:''}); 
                    }} 
                    className="flex-1 py-4 border border-gray-200 rounded-xl text-gray-500 
                              hover:bg-gray-100 hover:border-gray-300 active:scale-[0.98] 
                              transition-all duration-200"
                  >
                    {t("cancel")}
                  </button>
                  <button 
                    onClick={handleSaveAddress} 
                    className="flex-1 py-4 bg-[#1565C0] text-white rounded-xl shadow-lg shadow-blue-200
                              hover:bg-[#1255A3] hover:shadow-blue-300 active:scale-[0.98] 
                              transition-all duration-200"
                  >
                    {editId ? t("save") : t("add")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[18px] font-bold">{t("myAddresses")}</h3>
              <button onClick={() => { setEditId(null); setIsAdding(true); }} className="flex gap-[15px] items-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.75 4C12.75 3.58579 12.4142 3.25 12 3.25C11.5858 3.25 11.25 3.58579 11.25 4L11.25 11.25H4C3.58579 11.25 3.25 11.5858 3.25 12C3.25 12.4142 3.58579 12.75 4 12.75H11.25V20C11.25 20.4142 11.5858 20.75 12 20.75C12.4142 20.75 12.75 20.4142 12.75 20V12.75H20C20.4142 12.75 20.75 12.4142 20.75 12C20.75 11.5858 20.4142 11.25 20 11.25H12.75L12.75 4Z" fill="#1565C0"/>
                </svg>
                <p className="text-[#1565C0] text-[16px]">{t("newOne")}</p>
              </button>
            </div>

            <div className="space-y-3">
              {addresses.length > 0 ? (
                addresses.map((addr) => {
                  const parts = addr.address.split(', ');
                  const streetPart = parts[0];
                  const detailsPart = parts.slice(1).join(', ');

                  return (
                    <div key={addr.id} className="p-[20px] border-2 border-gray-50 rounded-[25px] flex justify-between items-center bg-white transition-all">
                      <div className="flex items-center gap-4 flex-1">
                        <div 
                          onClick={() => handleSetDefault(addr.id)}
                          className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${addr.is_default ? 'border-[#1565C0]' : 'border-gray-200'}`}
                        >
                          {addr.is_default && <div className="w-[12px] h-[12px] rounded-full bg-[#1565C0] animate-in zoom-in-50" />}
                        </div>

                        <div className="flex flex-col">
                          <p className="font-bold text-[16px] leading-tight">
                            {streetPart}
                          </p>
                          {detailsPart && <p className="text-[14px] text-gray-400 mt-[5px]">{detailsPart}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-[10px]">
                        <button 
                          onClick={() => handleEditClick(addr)}
                          className="text-gray-300 hover:text-[#1565C0] transition-colors"
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.3335 18.333H16.6668" stroke="#212121" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M11.5735 3.05276L12.1915 2.43484C13.2153 1.41104 14.8752 1.41104 15.899 2.43484C16.9228 3.45865 16.9228 5.11856 15.899 6.14236L15.2811 6.76028M11.5735 3.05276C11.5735 3.05276 11.6508 4.36584 12.8094 5.52444C13.968 6.68304 15.2811 6.76028 15.2811 6.76028M11.5735 3.05276L5.89271 8.73359C5.50794 9.11837 5.31555 9.31075 5.15009 9.52288C4.95492 9.77311 4.78759 10.0439 4.65106 10.3303C4.53532 10.5732 4.44928 10.8313 4.2772 11.3475L3.54803 13.535M15.2811 6.76028L9.60023 12.4411C9.21546 12.8259 9.02307 13.0183 8.81094 13.1837C8.56071 13.3789 8.28996 13.5462 8.00348 13.6828C7.76063 13.7985 7.50251 13.8845 6.98628 14.0566L4.79878 14.7858M4.79878 14.7858L4.26406 14.964C4.01002 15.0487 3.72993 14.9826 3.54058 14.7932C3.35123 14.6039 3.28511 14.3238 3.3698 14.0698L3.54803 13.535M4.79878 14.7858L3.54803 13.535" stroke="#212121" stroke-width="1.5"/>
                          </svg>
                        </button>

                        <button onClick={() => setDeleteId(addr.id)} className="text-black hover:text-red-500">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="mt-[20px] py-5 border-2 border-dashed border-gray-200 rounded-xl text-center text-gray-400">
                  {t("notAdded")}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}