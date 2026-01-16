'use client';

import { useState, useEffect } from 'react';
import $api from '@/api/axios';
import { CreditCard, X, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ICard {
  id: number;
  card_type: string;
  last_four_digits: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (card: ICard) => void;
}

export const PaymentModal = ({ isOpen, onClose, onSelect }: PaymentModalProps) => {
  const [cards, setCards] = useState<ICard[]>([]);
  const [loading, setLoading] = useState(false);

  const t = useTranslations('PaymentModal');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchCards();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await $api.get('/payments/methods');
      setCards(res.data);
    } catch (err) {
      console.error(t("error"), err);
    } finally {
      setLoading(false);
    }
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
        return <CreditCard size={size} className="text-gray-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-[480px] rounded-[16px] p-[25px] shadow-2xl relative max-h-[90vh] flex flex-col">
        <div className="flex justify-between mb-[15px]">
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_d_1120_2013)">
            <rect x="2" y="1" width="48" height="48" rx="10" fill="white"/>
            <rect x="2.5" y="1.5" width="47" height="47" rx="9.5" stroke="#E9EAEB"/>
            <path d="M22.5 27.6667C22.5 28.9553 23.5447 30 24.8333 30H27C28.3807 30 29.5 28.8807 29.5 27.5C29.5 26.1193 28.3807 25 27 25H25C23.6193 25 22.5 23.8807 22.5 22.5C22.5 21.1193 23.6193 20 25 20H27.1667C28.4553 20 29.5 21.0447 29.5 22.3333M26 18.5V20M26 30V31.5M36 25C36 30.5228 31.5228 35 26 35C20.4772 35 16 30.5228 16 25C16 19.4772 20.4772 15 26 15C31.5228 15 36 19.4772 36 25Z" stroke="#414651" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            <defs>
            <filter id="filter0_d_1120_2013" x="0" y="0" width="52" height="52" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dy="1"/>
            <feGaussianBlur stdDeviation="1"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0.0392157 0 0 0 0 0.0509804 0 0 0 0 0.0705882 0 0 0 0.05 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1120_2013"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1120_2013" result="shape"/>
            </filter>
            </defs>
          </svg>
          <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-black transition-colors">
            <X size={24} />
          </button>
        </div>
        <h2 className="text-xl font-bold">{t("choose")}</h2>
        <p className="font-[15px] text-gray-600 mb-[20px]">{t("update")}</p>

        <div className="overflow-y-auto flex-1 space-y-3 pr-2 custom-scrollbar">
          {loading ? (
            <div className="text-center py-10 text-gray-400">{t("uploading")}</div>
          ) : cards.length === 0 ? (
            <div className="text-center py-6">
               <p className="text-gray-500 mb-6">{t("donHave")}</p>
               <button 
                onClick={() => window.location.href = '/profile?tab=cards'}
                className="bg-[#1565C0] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0D47A1] transition-all"
               >
                {t("add")}
               </button>
            </div>
          ) : (
            <>
              {cards.map((card) => (
                <div 
                  key={card.id}
                  onClick={() => onSelect(card)}
                  className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:border-[#1565C0] hover:bg-blue-50 cursor-pointer transition-all group"
                >
                  <div className="shrink-0">
                    {getCardIcon(card.card_type, 32)}
                  </div>
                  <div className="flex-1">
                    <p className="first-letter:uppercase text-[16px] text-gray-600">
                      {card.card_type} {t("ends")} {card.last_four_digits}
                    </p>
                  </div>
                  <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-[#1565C0]">
                     <div className="w-3 h-3 rounded-full bg-[#1565C0] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => window.location.href = '/profile?tab=cards'}
                className="w-full flex items-center justify-between gap-2 p-4 text-[#1565C0] font-bold border-2 border-blue-200 border-gray-100 rounded-2xl hover:bg-blue-50 transition-all mt-4"
              >
                <span>{t("new")}</span>
                <Plus size={20} /> 
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};