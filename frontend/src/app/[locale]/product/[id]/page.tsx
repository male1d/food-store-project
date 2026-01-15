import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/AddToCartButton';
import { Link } from '@/navigation'

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  description?: string;
  image_url: string | null;
  category?: { name: string };
}

async function getProduct(id: string): Promise<Product | null> {
  const res = await fetch(`http://localhost:3000/products/${id}`, { 
    cache: 'no-store' 
  });
  
  if (!res.ok) return null;
  return res.json();
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="w-[1340px] mx-auto min-h-[600px]">
      <Link href="/" className="flex gap-[10px] items-center my-[20px]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15.8334L7.5 10L12.5 4.16671" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="text-[16px]">Главная</p>
      </Link>
      <div className="flex mb-[60px] text-[#757575] text-[13px] gap-[10px]">
        <p>Категория</p>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.77322 5.38943C8.52805 5.14645 8.13233 5.14821 7.88934 5.39338C7.64636 5.63854 7.64812 6.03427 7.89329 6.27725L9.36243 7.73334C9.95867 8.32429 10.3677 8.73099 10.6444 9.0756C10.9133 9.41034 11.0055 9.62536 11.03 9.81792C11.0454 9.93884 11.0454 10.0612 11.03 10.1821C11.0055 10.3747 10.9133 10.5897 10.6444 10.9244C10.3677 11.269 9.95867 11.6757 9.36243 12.2667L7.89329 13.7228C7.64812 13.9658 7.64636 14.3615 7.88934 14.6066C8.13233 14.8518 8.52805 14.8536 8.77322 14.6106L10.2688 13.1283C10.8321 12.57 11.2925 12.1137 11.619 11.7071C11.9586 11.2844 12.2043 10.8552 12.27 10.3401C12.2988 10.1143 12.2988 9.88573 12.27 9.65987C12.2043 9.14478 11.9586 8.71566 11.619 8.29289C11.2925 7.88633 10.8321 7.43004 10.2688 6.87176L8.77322 5.38943Z" fill="#757575"/>
        </svg>
        <p>{product.category?.name || 'Продукты'}</p>
      </div>
      <div className="flex gap-[50px]">
        {/* Фото товара */}
        <div className="w-[486px] bg-[#F8F9FA] rounded-[15px] overflow-hidden flex items-center justify-center border border-gray-200">
          {product.image_url ? (
            <img 
              src={`http://localhost:3000/uploads/${product.image_url}`} 
              className="w-full h-full object-contain p-6 transition-transform hover:scale-105 duration-500" 
              alt={product.name} 
            />
          ) : (
            <div className="text-gray-300 font-bold text-xl uppercase tracking-widest">Нет фото</div>
          )}
        </div>

        {/* Инфо часть */}
        <div className="w-fill flex flex-col gap-[20px] max-w-[864px]">
          <div>
            <h1 className="text-[24px] font-bold">
              {product.name}
            </h1>
            <p className="text-[20px] font-bold">{product.unit || 'шт.'}</p>
            <p className="text-[#1565C0] text-[30px] font-bold">{product.price} ₽</p>
            <div className="w-[190px]">
              <AddToCartButton className="bg-[#1565C0] text-white"
                product={JSON.parse(JSON.stringify(product))} 
              />
            </div>
          </div>
          <h3 className="text-[18px] font-bold">Пищевая ценность на 100 г</h3>
          <div>
            <h3 className="text-[18px] font-bold">Описание</h3>
            <p className="leading-relaxed text-[15px]">
              {product.description || "Описание этого товара скоро появится."}
            </p>
          </div>
          <h3 className="text-[18px] font-bold">Состав</h3>
          <h3 className="text-[18px] font-bold">Срок хранения</h3>
        </div>
      </div>
    </div>
  );
}