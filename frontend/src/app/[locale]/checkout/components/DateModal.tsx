'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';



interface DateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (dateTime: string) => void;
}

const TIME_SLOTS = {
  morning: ['10:00 - 11:00', '11:00 - 12:00'],
  afternoon: ['12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00'],
  evening: ['18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00', '21:00 - 22:00'],
};

export const DateModal = ({ isOpen, onClose, onSelect }: DateModalProps) => {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedTime, setSelectedTime] = useState('');

  const t = useTranslations('DateModal');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const getDateLabel = (daysToAdd: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    });
  };

  const days = [
    { label: t("tomorrow"), dateValue: getDateLabel(1) },
    { label: t("afterTomorrow"), dateValue: getDateLabel(2) },
  ];

  const handleConfirm = () => {
    if (selectedTime) {
      onSelect(`${days[selectedDayIdx].dateValue}, ${selectedTime}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-[600px] rounded-[12px] px-[25px] py-[20px] flex flex-col max-h-[90vh]">
        <div className="flex justify-between">
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_d_856_34778)">
            <rect x="2" y="1" width="48" height="48" rx="10" fill="white"/>
            <rect x="2.5" y="1.5" width="47" height="47" rx="9.5" stroke="#E9EAEB"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M26 15.75C20.8914 15.75 16.75 19.8914 16.75 25C16.75 30.1086 20.8914 34.25 26 34.25C31.1086 34.25 35.25 30.1086 35.25 25C35.25 19.8914 31.1086 15.75 26 15.75ZM15.25 25C15.25 19.0629 20.0629 14.25 26 14.25C31.9371 14.25 36.75 19.0629 36.75 25C36.75 30.9371 31.9371 35.75 26 35.75C20.0629 35.75 15.25 30.9371 15.25 25ZM26 20.25C26.4142 20.25 26.75 20.5858 26.75 21V24.6893L29.0303 26.9697C29.3232 27.2626 29.3232 27.7374 29.0303 28.0303C28.7374 28.3232 28.2626 28.3232 27.9697 28.0303L25.4697 25.5303C25.329 25.3897 25.25 25.1989 25.25 25V21C25.25 20.5858 25.5858 20.25 26 20.25Z" fill="#1C274C"/>
            </g>
            <defs>
            <filter id="filter0_d_856_34778" x="0" y="0" width="52" height="52" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dy="1"/>
            <feGaussianBlur stdDeviation="1"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0.0392157 0 0 0 0 0.0509804 0 0 0 0 0.0705882 0 0 0 0.05 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_856_34778"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_856_34778" result="shape"/>
            </filter>
            </defs>
          </svg>
          <button onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="#717680" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <h2 className="text-gray-900 font-bold text-[24px] my-[15px]">{t("select")}</h2>

        <div className="flex gap-[15px] mb-[20px] bg-[#E7F2FF] rounded-[12px]">
          {days.map((day, idx) => (
            <button
              key={day.label}
              onClick={() => setSelectedDayIdx(idx)}
              className={`flex-1 h-[40px] rounded-[12px] text-[16px] transition-all ${
                selectedDayIdx === idx 
                ? 'bg-[#1565C0] text-white' 
                : 'bg-transparent text-[#121212] hover:bg-blue-100'
              }`}
            >
                <span>{day.label}</span>
            </button>
          ))}
        </div>

        <div className="mb-[20px] flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6" >
          {Object.entries(TIME_SLOTS).map(([period, slots]) => (
            <div key={period}>
              <h3 className="text-[16px] mb-[10px]">{t(period)}</h3>
              <div className="grid grid-cols-2 gap-y-[15px] gap-x-[32px]">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`h-[49px] rounded-[9999px] border text-[14px] transition-all text-center ${
                      selectedTime === slot
                        ? 'bg-[#1565C0] border-none text-white font-bold'
                        : 'bg-[#0000000F] text-[#000000E0] font-bold hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-[20px]">
          <button 
            onClick={onClose}
            className="flex-1 h-[40px] border border-[#E0E0E0] rounded-[12px] text-[#757575] text-[14px] hover:bg-[#E0E0E0] transition-colors"
          >
            {t("cancel")}
          </button>
          <button 
            onClick={handleConfirm}
            disabled={!selectedTime}
            className="flex-1 h-[40px] bg-[#1565C0] text-white rounded-[12px] text-[14px] hover:bg-[#0D47A1] transition-all disabled:opacity-50"
          >
            {t("choose")}
          </button>
        </div>
      </div>
    </div>
  );
};