'use client';

import { useEffect, useState } from 'react';
import $api from '@/api/axios';
import { useTranslations } from 'next-intl';



export interface IOrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price_at_time: string;
}

export interface IOrder {
  id: number;
  status: string;
  total_amount: string;
  delivery_address: string;
  created_at: string;
  order_items: IOrderItem[];
}

export const OrdersList = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const delivery = 200;

  const t = useTranslations('OrdersList');

  useEffect(() => {
    $api.get('/users/me/orders')
      .then(res => setOrders(res.data))
      .catch(err => console.error(t("downloadError"), err))
      .finally(() => setLoading(false));
  }, []);

  const ProductListPreview = ({ productId }: { productId: number }) => {
    const [img, setImg] = useState<string | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
      $api.get(`/products/${productId}`)
        .then(res => setImg(res.data.image_url))
        .catch(() => setError(true));
    }, [productId]);

    return (
      <div className="w-[50px] h-[50px] rounded-[12px] bg-[#F4F4F4] flex items-center justify-center border border-[#1565C0]  overflow-hidden flex-shrink-0">
        {img && !error ? (
          <img 
            src={`http://localhost:3000/uploads/${img}`} 
            className="w-full h-full object-contain"
            onError={() => setError(true)}
          />
        ) : (
          <span className="text-[10px] text-[#757575] text-center leading-tight">
            {t("photoSoon")}
          </span>
        )}
      </div>
    );
  };

  const ProductSidebarInfo = ({ productId, item }: { productId: number, item : IOrderItem }) => {
    const [product, setProduct] = useState<{name: string, image_url: string} | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
      $api.get(`/products/${productId}`)
        .then(res => setProduct(res.data))
        .catch(() => setError(true));
    }, [productId]);

    const hasImg = product?.image_url && !error;

    return (
      <div className="flex items-center gap-[10px]  py-[5px]">
        <div className="w-[60px] h-[60px]  rounded-[12px] border border-gray-100 bg-gray-50 flex-shrink-0 flex items-center justify-center overflow-hidden">
          {hasImg ? (
            <img 
              src={`http://localhost:3000/uploads/${product.image_url}`} 
              className="w-full h-full object-contain"
              onError={() => setError(true)}
            />
          ) : (
            <span className="text-[8px] text-gray-400 font-bold uppercase text-center">{t("soon")}</span>
          )}
        </div>
        <div className="flex-1">
          <p className="text-[15px] ">{product?.name || `${t("loading")}`}</p>
          <p className="text-[14px] text-[#757575]">{item.quantity} {t("pieces")}</p>
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-10 text-center font-medium text-gray-500">{t("loadingStory")}</div>;

  return (
    <div className="relative flex min-h-[300px] overflow-hidden">
      <div className={`flex-1 p-[10px] transition-all duration-500 ${selectedOrder ? 'mr-[520px]' : 'mr-[200px]'}`}>
        <div className="grid gap-[20px]">
          {orders.map((order) => (
            <div 
              key={order.id} 
              onClick={() => setSelectedOrder(order)}
              className={`px-[20px] py-[15px] rounded-[12px] cursor-pointer transition-all border flex justify-between ${
                selectedOrder?.id === order.id 
                ? 'bg-white border-[#1565C0] scale-[1.02]' 
                : 'bg-white border-transparent hover:border-gray-300'
              }`}
            >
              <div>
                <p className="text-[18px] text-[#212121] font-bold mb-[8px]">{new Date(order.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</p>
                <div className="flex flex-wrap gap-[8px]">
                  {order.order_items.slice(0, 5).map((item) => (
                    <ProductListPreview key={item.id} productId={item.product_id} />
                  ))}
                  {order.order_items.length > 5 && (
                    <div className="w-[50px] h-[50px] rounded-[12px] bg-[#F4F4F4] flex items-center justify-center border border-[#757575] text-[#757575] text-[15px]">
                      +{order.order_items.length - 5}
                    </div>
                  )}
                </div>
              </div> 

              <div className="text-right">
                <p className="text-[24px] font-bold">{parseFloat(order.total_amount).toLocaleString('ru-RU')} ₽</p>
                <span className="text-[12px] font-bold lowercase text-[#212121] bg-[#F4F4F4] px-[15px] py-[7px] rounded-[12px]">{t("processing")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className={`fixed bottom-[30px] right-0 h-[calc(100vh-100px)] bg-white rounded-[12px] border border-[2px] border-[#F4F4F4] transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)  ${
        selectedOrder ? 'translate-x-0' : 'translate-x-full'
      }`} style={{ width: '520px' }}>

        {selectedOrder && (
          <div className="flex flex-col gap-[25px] h-full px-[35px] py-[25px] overflow-x-hidden overflow-y-auto ">

            <div className="flex justify-between text-[#757575] text-[15px] ">
              <button onClick={() => setSelectedOrder(null)} className="flex gap-[10px]">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.5 15.833L7.5 9.99967L12.5 4.16634" stroke="#757575" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>{t("order")} №{selectedOrder.id}</p>
              </button>
              <p>{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
            </div>

            <h3 className="text-[24px] font-bold text-center">{t("processingOrd")}</h3>
            <div className="h-[26px]">
              <svg width="448" height="26" viewBox="0 0 448 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_785_12586)">
                <path d="M25.4982 1.39551C23.2893 1.39551 21.1301 2.0505 19.2935 3.27767C17.4569 4.50484 16.0255 6.24905 15.1802 8.28975C14.3349 10.3305 14.1138 12.576 14.5447 14.7424C14.9756 16.9088 16.0393 18.8987 17.6011 20.4606C19.163 22.0225 21.153 23.0862 23.3194 23.5171C25.4858 23.948 27.7313 23.7269 29.772 22.8816C31.8127 22.0363 33.5569 20.6048 34.7841 18.7683C36.0113 16.9317 36.6663 14.7724 36.6663 12.5636C36.6663 9.60164 35.4896 6.76099 33.3952 4.66657C31.3008 2.57214 28.4601 1.39551 25.4982 1.39551ZM29.8258 16.1793C29.7751 16.256 29.7097 16.3219 29.6334 16.3733C29.5572 16.4247 29.4715 16.4605 29.3813 16.4787C29.2912 16.4968 29.1983 16.497 29.1081 16.4792C29.0179 16.4613 28.932 16.4258 28.8556 16.3747L24.7373 13.5827V7.50306C24.7373 7.31793 24.8109 7.14039 24.9418 7.00949C25.0727 6.87859 25.2502 6.80505 25.4354 6.80505C25.6205 6.80505 25.798 6.87859 25.9289 7.00949C26.0598 7.14039 26.1334 7.31793 26.1334 7.50306V12.8428L29.6234 15.209C29.7007 15.2592 29.7673 15.3242 29.8193 15.4002C29.8714 15.4762 29.9079 15.5618 29.9267 15.652C29.9455 15.7422 29.9463 15.8352 29.929 15.9257C29.9117 16.0162 29.8766 16.1024 29.8258 16.1793ZM29.5815 5.74408C28.5994 5.15211 27.5008 4.77961 26.3612 4.65213C25.2216 4.52465 24.0679 4.64521 22.9792 5.00554C21.8906 5.36587 20.8928 5.95744 20.0542 6.73966C19.2157 7.52188 18.5563 8.47624 18.1213 9.53726C17.6863 10.5983 17.486 11.7408 17.5341 12.8866C17.5822 14.0323 17.8776 15.154 18.4 16.1749C18.9223 17.1957 19.6594 18.0915 20.5605 18.8006C21.4616 19.5098 22.5055 20.0157 23.6205 20.2835L23.4042 21.3794C22.1254 21.0818 20.9264 20.5102 19.89 19.704C18.8537 18.8979 18.0046 17.8765 17.4014 16.7103C16.7982 15.5441 16.4553 14.2609 16.3963 12.9492C16.3373 11.6376 16.5637 10.3288 17.0597 9.11313C17.5558 7.89748 18.3098 6.80397 19.2696 5.90809C20.2295 5.0122 21.3723 4.33528 22.6192 3.92405C23.8661 3.51283 25.1874 3.37709 26.4918 3.52622C27.7963 3.67535 29.0529 4.10578 30.1748 4.78782L29.5815 5.74408Z" fill="#1565C0"/>
                </g>
                <path d="M66.3145 12.5645H117.02" stroke="#E0E0E0" stroke-width="3.58974" stroke-linecap="round"/>
                <path d="M167.78 11.5055C167.688 11.1086 167.51 10.7366 167.26 10.4155C167.005 10.0967 166.684 9.83733 166.32 9.65546C166.032 9.51388 165.719 9.429 165.4 9.40546C165.237 7.65557 164.461 6.01941 163.21 4.78546C161.785 3.36263 159.853 2.56348 157.84 2.56348C155.826 2.56348 153.895 3.36263 152.47 4.78546C151.218 6.01941 150.443 7.65557 150.28 9.40546C149.96 9.429 149.647 9.51388 149.36 9.65546C148.993 9.83449 148.671 10.0943 148.42 10.4155C148.167 10.7359 147.989 11.1087 147.899 11.5067C147.81 11.9046 147.81 12.3176 147.9 12.7155L149.47 19.1455C149.74 20.1307 150.327 20.9995 151.14 21.6176C151.954 22.2358 152.948 22.5689 153.97 22.5655H161.68C162.705 22.5665 163.702 22.2303 164.517 21.6086C165.332 20.9869 165.92 20.1143 166.19 19.1255L167.75 12.7155C167.85 12.3195 167.86 11.9055 167.78 11.5055ZM154.68 17.9255C154.68 18.1244 154.601 18.3151 154.46 18.4558C154.319 18.5964 154.128 18.6755 153.93 18.6755C153.731 18.6755 153.54 18.5964 153.399 18.4558C153.259 18.3151 153.18 18.1244 153.18 17.9255V13.9855C153.18 13.7865 153.259 13.5958 153.399 13.4551C153.54 13.3145 153.731 13.2355 153.93 13.2355C154.128 13.2355 154.319 13.3145 154.46 13.4551C154.601 13.5958 154.68 13.7865 154.68 13.9855V17.9255ZM158.59 17.9255C158.59 18.0239 158.57 18.1215 158.532 18.2125C158.495 18.3035 158.44 18.3861 158.37 18.4558C158.3 18.5254 158.218 18.5807 158.127 18.6184C158.036 18.6561 157.938 18.6755 157.84 18.6755C157.741 18.6755 157.644 18.6561 157.553 18.6184C157.462 18.5807 157.379 18.5254 157.309 18.4558C157.24 18.3861 157.184 18.3035 157.147 18.2125C157.109 18.1215 157.09 18.0239 157.09 17.9255V13.9855C157.09 13.7865 157.169 13.5958 157.309 13.4551C157.45 13.3145 157.641 13.2355 157.84 13.2355C158.038 13.2355 158.229 13.3145 158.37 13.4551C158.511 13.5958 158.59 13.7865 158.59 13.9855V17.9255ZM162.5 17.9255C162.5 18.1244 162.421 18.3151 162.28 18.4558C162.139 18.5964 161.948 18.6755 161.75 18.6755C161.551 18.6755 161.36 18.5964 161.219 18.4558C161.079 18.3151 161 18.1244 161 17.9255V13.9855C161 13.7865 161.079 13.5958 161.219 13.4551C161.36 13.3145 161.551 13.2355 161.75 13.2355C161.948 13.2355 162.139 13.3145 162.28 13.4551C162.421 13.5958 162.5 13.7865 162.5 13.9855V17.9255ZM151.79 9.38546C151.954 8.04308 152.567 6.79563 153.53 5.84546C154.675 4.70597 156.224 4.06628 157.84 4.06628C159.455 4.06628 161.005 4.70597 162.15 5.84546C163.112 6.79563 163.725 8.04308 163.89 9.38546H151.79Z" fill="#757575"/>
                <path d="M198.647 12.5645H249.353" stroke="#E0E0E0" stroke-width="3.58974" stroke-linecap="round"/>
                <path d="M295.167 5.71484C295.658 5.71484 296.129 5.90892 296.476 6.25586C296.823 6.6028 297.017 7.0738 297.017 7.56445V10.8623L292.595 16.4141H288.017V16.5645C288.017 18.1416 286.744 19.4141 285.167 19.4141C283.59 19.4141 282.317 18.1416 282.317 16.5645V16.4141H280.317V13.5645C280.317 11.4373 282.04 9.71484 284.167 9.71484H288.017V14.7148H291.739L291.784 14.6582L295.284 10.3086L295.317 10.2676V7.41406H292.317V5.71484H295.167ZM297.167 13.7148C298.744 13.7148 300.017 14.9873 300.017 16.5645C300.017 18.1416 298.744 19.4141 297.167 19.4141C295.59 19.4141 294.317 18.1416 294.317 16.5645C294.317 14.9873 295.59 13.7148 297.167 13.7148ZM284.017 16.5645C284.017 17.1973 284.534 17.7148 285.167 17.7148C285.8 17.7148 286.317 17.1973 286.317 16.5645V16.4141H284.017V16.5645ZM297.167 15.4141C296.534 15.4141 296.017 15.9316 296.017 16.5645C296.017 17.1973 296.534 17.7148 297.167 17.7148C297.8 17.7148 298.317 17.1973 298.317 16.5645C298.317 15.9316 297.8 15.4141 297.167 15.4141ZM284.167 11.4141C282.984 11.4141 282.017 12.3816 282.017 13.5645V14.7148H286.317V11.4141H284.167ZM288.017 6.71484V8.41406H283.317V6.71484H288.017Z" fill="#757575" stroke="white" stroke-width="0.3"/>
                <path d="M330.981 12.5645H381.687" stroke="#E0E0E0" stroke-width="3.58974" stroke-linecap="round"/>
                <path d="M431.5 7.56445V12.5645M413.5 7.56445V17.7255C413.5 19.1085 415.446 19.9305 419.337 21.5735C420.9 22.2345 421.682 22.5645 422.5 22.5645V11.9195M425.5 19.5645C425.5 19.5645 426.375 19.5645 427.25 21.5645C427.25 21.5645 430.03 16.5645 432.5 15.5645" stroke="#757575" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M416.5 12.5645L418.5 13.5645M427.5 4.56445L417.5 9.56445M418.826 10.2555L415.905 8.84245C414.302 8.06645 413.5 7.67845 413.5 7.06445C413.5 6.45045 414.302 6.06245 415.905 5.28645L418.825 3.87345C420.63 3.00045 421.53 2.56445 422.5 2.56445C423.47 2.56445 424.371 3.00045 426.174 3.87345L429.095 5.28645C430.698 6.06245 431.5 6.45045 431.5 7.06445C431.5 7.67845 430.698 8.06645 429.095 8.84245L426.175 10.2555C424.37 11.1285 423.47 11.5645 422.5 11.5645C421.53 11.5645 420.629 11.1285 418.826 10.2555Z" stroke="#757575" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <defs>
                <clipPath id="clip0_785_12586">
                <rect width="25.1282" height="25.1282" fill="white" transform="translate(12.9355)"/>
                </clipPath>
                </defs>
              </svg>
            </div>
            <p className="text-[16px] text-[#1565C0]">{t("cancel")}</p>
            <div>
              <p className="text-[#757575] text-[16px]">{t("address")}</p>
              <p className="text-[16px]">{selectedOrder.delivery_address}</p>
            </div>
  
            <div className="">
              <p className="text-[#757575] text-[16px]">{t("orderStruct")}</p>
              <div className="grid gap-[20px]">
              {selectedOrder.order_items.map((item) => (
                <div key={item.id} className="px-[10px]  flex justify-between items-center group bg-gray-50/50 rounded-[12px] border border-transparent hover:border-blue-100 transition-all">
                  <ProductSidebarInfo productId={item.product_id} item={item} />
                  <div className="text-right ml-4">
                    <p className="text-[16px] text-[#212121] font-bold">{(parseFloat(item.price_at_time) * item.quantity).toLocaleString('ru-RU')} ₽</p>
                    <p className="text-[14px] text-[#757575]">{item.price_at_time} ₽/шт.</p>
                  </div>
                </div>
              ))}
              </div>
            </div>

            <div className="grid gap-[15px] ">
              <div className="h-[2px] bg-[#1565C0]/50"></div>
              <div className="flex justify-between">
                <p className="text-[#212121] text-[15px]">{t("products")}</p>
                <p className="text-[16px] font-bold">{parseFloat(selectedOrder.total_amount).toLocaleString('ru-RU')} ₽</p>
              </div>
              <div className="flex justify-between">
                <p className="text-[#212121] text-[15px]">{t("delivery")}</p>
                <p className="text-[16px] font-bold">{delivery.toLocaleString('ru-RU')} ₽</p>
              </div>
              <div className="h-[2px] bg-[#1565C0]/50"></div>
              <div className="flex justify-between text-[24px] font-bold">
                <p>{t("res")}</p>
                <p>{(parseFloat(selectedOrder.total_amount) + delivery).toLocaleString('ru-RU')} ₽</p>
              </div>
            </div>
          </div>            
        )}
      </aside>
    </div>
  );
};