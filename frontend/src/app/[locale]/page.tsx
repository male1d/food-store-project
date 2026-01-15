import Image from 'next/image';
import { Link } from '@/navigation'
import AddToCartButton from '@/components/AddToCartButton';

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  image_url: string | null;
  category_id?: number; 
}

interface Category {
  id: number;
  name: string;
}

async function getProducts(): Promise<Product[]> {
  const res = await fetch('http://localhost:3000/products', { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

async function getCategories(): Promise<Category[]> {
  const res = await fetch('http://localhost:3000/categories', { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

function getProductsWord(count: number) {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'товаров';
  }
  if (lastDigit === 1) {
    return 'товар';
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'товара';
  }
  return 'товаров';
}

export default async function Home({
  searchParams,
}: {
  searchParams: { page?: string; sort?: string; category?: string; minPrice?: string; maxPrice?: string; search?: string; }; 
}) {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories()
  ]);

  const currentSort = searchParams.sort || '';
  const currentCategory = searchParams.category || null;
  const minPrice = Number(searchParams.minPrice) || 0;
  const maxPrice = Number(searchParams.maxPrice) || Infinity;
  const currentSearch = searchParams.search?.toLowerCase() || '';

  // Находим название выбранной категории
  const activeCategoryName = categories.find(c => String(c.id) === currentCategory)?.name || "Все товары";

  // 1. Фильтрация
  let filteredProducts = [...products];
  
  // По категории
  if (currentCategory) {
    filteredProducts = filteredProducts.filter(p => p.category_id === Number(currentCategory));
  }
  
  // По цене
  filteredProducts = filteredProducts.filter(p => p.price >= minPrice && p.price <= maxPrice);

  const totalFilteredCount = filteredProducts.length;

  
  // По названию (Поиск)
  if (currentSearch) {
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(currentSearch)
    );
  }

  // 2. Сортировка
  if (currentSort === 'price_asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'price_desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (currentSort === 'popular') {
    filteredProducts.sort((a, b) => b.id - a.id);
  } else {
    filteredProducts.sort((a, b) => a.id - b.id);
  }
  

  const categoryFilter = currentCategory ? `&category=${currentCategory}` : '';
  const priceFilter = `${searchParams.minPrice ? `&minPrice=${searchParams.minPrice}` : ''}${searchParams.maxPrice ? `&maxPrice=${searchParams.maxPrice}` : ''}`;
  const searchFilter = currentSearch ? `&search=${currentSearch}` : '';
  const itemsPerPage = 8;
  const currentPage = Number(searchParams.page) || 1;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);



  return (
    <div className="px-[20px] flex gap-[10px]">
      <section className="w-[271px] flex flex-col pt-[20px] gap-[10px]">
        <Link href="/" className={!currentCategory ? "flex items-center gap-[10px]" : "flex items-center gap-[10px]"}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15.833L7.5 9.99967L12.5 4.16634" stroke="#212121" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <p>Главная / Все товары</p>
        </Link>
        
        <div>
            <h2 className="text-[20px] font-bold">{activeCategoryName}</h2>
            <p className="text-gray-400 text-sm">{totalFilteredCount} {getProductsWord(totalFilteredCount)}</p>
        </div>
        <h3 className="text-[18px] font-bold mt-[20px]">Фильтры</h3>
        <h3 className="text-[16px]">Цена</h3>
        <form action="/" method="get" className="flex flex-col gap-3">
          {currentCategory && <input type="hidden" name="category" value={currentCategory} />}
          {currentSort && <input type="hidden" name="sort" value={currentSort} />}
          
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              name="minPrice" 
              min="0"
              placeholder="от" 
              defaultValue={searchParams.minPrice}
              className="w-full h-[40px] px-3 rounded-xl border-none outline-none text-sm bg-[#F4F4F4]"
            />
            <input 
              type="number" 
              name="maxPrice"
              min="0" 
              placeholder="до" 
              defaultValue={searchParams.maxPrice}
              className="w-full h-[40px] px-3 rounded-xl border-none outline-none text-sm bg-[#F4F4F4]"
            />
          </div>
          
          <button 
            type="submit"
            className="w-full h-[40px] bg-[#1565C0] text-white rounded-xl font-medium hover:bg-[#0d47a1] transition-colors"
          >
            Применить
          </button>
          
          <Link 
            href={`/?${currentCategory ? `category=${currentCategory}` : ''}${currentSort ? `&sort=${currentSort}` : ''}`}
            className="w-full h-[40px] flex items-center justify-center bg-[#F4F4F4] rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Очистить фильтр
          </Link>
        </form>
      </section>

      <section className="flex-1 pt-[121px] pb-[75px]">
        <div className='flex gap-[35px] items-center'>
          <Link 
            href={`?sort=popular&page=1${categoryFilter}${priceFilter}`} 
            className={`cursor-pointer ${currentSort === 'popular' ? 'font-bold text-blue-600' : ''}`}
          >
            по популярности
          </Link>
          
          <Link 
            href={`?sort=${currentSort === 'price_asc' ? 'price_desc' : 'price_asc'}&page=1${categoryFilter}${priceFilter}`} 
            className={`flex items-center gap-1 cursor-pointer ${currentSort.includes('price') ? 'font-bold text-blue-600' : ''}`}
          >
            <svg 
              width="20" height="20" viewBox="0 0 20 20" fill="none" 
              className={`transition-transform ${currentSort === 'price_desc' ? 'rotate-180' : ''}`}
            >
              <path d="M13.3334 15L13.3334 5M13.3334 5L16.6667 8.4375M13.3334 5L10.0001 8.4375" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6.66667 5L6.66667 15M6.66667 15L10 11.5625M6.66667 15L3.33333 11.5625" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            по цене
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-y-[20px] gap-x-auto pt-[20px]">
          {currentProducts.length > 0 ? currentProducts.map((product) => (
            <div key={product.id} className="w-max-[260px] p-[10px] h-[412px] hover:shadow-lg transition-shadow border border-transparent hover:border-gray-100 rounded-3xl">
              <Link href={`/product/${product.id}`} className="flex flex-col gap-[5px] cursor-pointer group">
                <div className="h-[233px] bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 overflow-hidden">
                  {product.image_url ? (
                    <img 
                      src={`http://localhost:3000/uploads/${product.image_url}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      alt={product.name} 
                    />
                  ) : (
                    <span className="text-xs text-center px-4 italic">Фото скоро появится</span>
                  )}
                </div>
                <p className="text-xl font-bold">{product.price} ₽</p>
                <h3 className="leading-none font-bold text-lg group-hover:text-[#1565C0] transition-colors">{product.name}</h3>
                <p className="text-gray-500 text-sm">{product.unit || '1 шт.'}</p>
              </Link>
              <AddToCartButton product={JSON.parse(JSON.stringify(product))} />
            </div>
          )) : (
            <div className="col-span-4 text-center py-20 text-gray-400">Товары не найдены</div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-[40px]">
            <Link
              href={`?page=${currentPage > 1 ? currentPage - 1 : 1}${currentSort ? `&sort=${currentSort}` : ''}${categoryFilter}`}
              className={`w-10 h-10 flex items-center justify-center border-2 rounded-2xl transition-all hover:border-[#1565C0] hover:text-[#1565C0] ${currentPage === 1 ? 'opacity-20 pointer-events-none' : 'border-gray-200 text-gray-400'}`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>

            <div className="flex gap-2 items-center">
              {(() => {
                const pages = [];
                for (let i = 1; i <= totalPages; i++) {
                  if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                    pages.push(
                      <Link
                        key={i}
                        href={`?page=${i}${currentSort ? `&sort=${currentSort}` : ''}${categoryFilter}`}
                        className={`w-10 h-10 flex items-center justify-center border-2 rounded-2xl font-bold transition-all ${
                          currentPage === i 
                          ? 'border-[#1565C0] text-[#1565C0] bg-white' 
                          : 'border-gray-200 text-gray-400 hover:border-[#1565C0] hover:text-[#1565C0]'
                        }`}
                      >
                        {i}
                      </Link>
                    );
                  } else if (i === currentPage - 2 || i === currentPage + 2) {
                    pages.push(<span key={`dots-${i}`} className="px-2 text-gray-400">...</span>);
                  }
                }
                return pages;
              })()}
            </div>

            <Link
              href={`?page=${currentPage < totalPages ? currentPage + 1 : totalPages}${currentSort ? `&sort=${currentSort}` : ''}${categoryFilter}`}
              className={`w-10 h-10 flex items-center justify-center border-2 rounded-2xl transition-all hover:border-[#1565C0] hover:text-[#1565C0] ${currentPage === totalPages ? 'opacity-20 pointer-events-none' : 'border-gray-200 text-gray-400'}`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}