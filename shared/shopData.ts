export interface Store {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bg: string;
  tagline: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  nameFr: string;
  nameAr: string;
  price: number;
  originalPrice?: number;
  emoji: string;
  emojiGradient: string;
  image: string;
  category: string;
  rating: number;
  sold: number;
  badge?: string;
}

export const STORES: Store[] = [
  { id: "all",        name: "All",         emoji: "🛍️", color: "#6366f1", bg: "#eef2ff", tagline: "All stores" },
  { id: "amazon",     name: "Amazon",      emoji: "📦", color: "#FF9900", bg: "#fff7ed", tagline: "Shipped from Amazon" },
  { id: "aliexpress", name: "AliExpress",  emoji: "🛒", color: "#E53935", bg: "#fff1f2", tagline: "Direct from suppliers" },
  { id: "alibaba",    name: "Alibaba",     emoji: "🏭", color: "#FF6600", bg: "#fff7ed", tagline: "Bulk & wholesale" },
  { id: "carrefour",  name: "Carrefour",   emoji: "🏬", color: "#0070AD", bg: "#eff6ff", tagline: "Daily essentials" },
  { id: "mytek",      name: "MyTek",       emoji: "💻", color: "#C62828", bg: "#fff1f2", tagline: "Tech & electronics — Tunisia" },
  { id: "jumia",      name: "Jumia",       emoji: "🟧", color: "#F68B1E", bg: "#fff7ed", tagline: "Fashion & lifestyle — Tunisia" },
  { id: "aziza",      name: "Aziza",       emoji: "🏪", color: "#2E7D32", bg: "#f0fdf4", tagline: "Tunisian supermarket" },
];

export const PRODUCTS: Product[] = [
  // ─── Amazon ────────────────────────────────────────────────────────────────
  { id: "amz-1", storeId: "amazon", name: "iPhone 15 Pro 128GB", nameFr: "iPhone 15 Pro 128Go", nameAr: "آيفون 15 برو 128 جيجا", price: 3499, originalPrice: 3899, emoji: "📱", emojiGradient: "from-slate-800 to-slate-600", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=300&fit=crop&auto=format&q=80", category: "Electronics", rating: 4.9, sold: 1240, badge: "Top Seller" },
  { id: "amz-2", storeId: "amazon", name: "Samsung Galaxy Tab S9", nameFr: "Samsung Galaxy Tab S9", nameAr: "سامسونج جالاكسي تاب S9", price: 2199, originalPrice: 2499, emoji: "📟", emojiGradient: "from-blue-800 to-blue-600", image: "https://images.unsplash.com/photo-1632519083961-8fad23e80560?w=400&h=300&fit=crop&auto=format&q=80", category: "Electronics", rating: 4.7, sold: 832 },
  { id: "amz-3", storeId: "amazon", name: "Kindle Paperwhite 16GB", nameFr: "Kindle Paperwhite 16Go", nameAr: "كيندل بيبروايت 16 جيجا", price: 399, originalPrice: 450, emoji: "📚", emojiGradient: "from-amber-700 to-amber-500", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop&auto=format&q=80", category: "Books", rating: 4.8, sold: 3410 },
  { id: "amz-4", storeId: "amazon", name: "Amazon Echo Dot 5th Gen", nameFr: "Amazon Echo Dot 5ème Gén.", nameAr: "أمازون إيكو دوت الجيل الخامس", price: 179, emoji: "🔊", emojiGradient: "from-gray-700 to-gray-500", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop&auto=format&q=80", category: "Smart Home", rating: 4.6, sold: 5621 },
  { id: "amz-5", storeId: "amazon", name: "Apple Watch Series 9 GPS", nameFr: "Apple Watch Series 9 GPS", nameAr: "ساعة أبل واتش سيريز 9", price: 1299, originalPrice: 1499, emoji: "⌚", emojiGradient: "from-slate-700 to-slate-500", image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400&h=300&fit=crop&auto=format&q=80", category: "Wearables", rating: 4.8, sold: 980, badge: "New" },

  // ─── AliExpress ────────────────────────────────────────────────────────────
  { id: "ali-1", storeId: "aliexpress", name: "JBL Bluetooth Speaker Portable", nameFr: "Enceinte Bluetooth JBL Portable", nameAr: "سماعة JBL بلوتوث محمولة", price: 89, originalPrice: 149, emoji: "🎵", emojiGradient: "from-orange-700 to-orange-500", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop&auto=format&q=80", category: "Audio", rating: 4.4, sold: 8902 },
  { id: "ali-2", storeId: "aliexpress", name: "Smart Fitness Band", nameFr: "Bracelet Connecté Sport", nameAr: "سوار اللياقة الذكي", price: 45, originalPrice: 99, emoji: "📿", emojiGradient: "from-teal-700 to-teal-500", image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&h=300&fit=crop&auto=format&q=80", category: "Wearables", rating: 4.2, sold: 15300 },
  { id: "ali-3", storeId: "aliexpress", name: "TWS Wireless Earbuds Pro", nameFr: "Écouteurs Sans Fil TWS Pro", nameAr: "سماعات لاسلكية TWS برو", price: 35, originalPrice: 79, emoji: "🎧", emojiGradient: "from-purple-700 to-purple-500", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=300&fit=crop&auto=format&q=80", category: "Audio", rating: 4.1, sold: 22100, badge: "-56%" },
  { id: "ali-4", storeId: "aliexpress", name: "RGB LED Strip 5m", nameFr: "Ruban LED RGB 5m", nameAr: "شريط LED RGB 5 متر", price: 22, originalPrice: 38, emoji: "💡", emojiGradient: "from-pink-700 to-pink-500", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format&q=80", category: "Lighting", rating: 4.3, sold: 31000 },
  { id: "ali-5", storeId: "aliexpress", name: "iPhone 15 Silicone Case", nameFr: "Coque Silicone iPhone 15", nameAr: "غطاء سيليكون آيفون 15", price: 12, originalPrice: 25, emoji: "🛡️", emojiGradient: "from-rose-700 to-rose-500", image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=300&fit=crop&auto=format&q=80", category: "Accessories", rating: 4.0, sold: 47800 },

  // ─── Alibaba ───────────────────────────────────────────────────────────────
  { id: "alb-1", storeId: "alibaba", name: "Gaming Chair RGB Pro", nameFr: "Chaise Gaming RGB Pro", nameAr: "كرسي جيمينج RGB برو", price: 699, originalPrice: 899, emoji: "🪑", emojiGradient: "from-red-800 to-red-600", image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop&auto=format&q=80", category: "Furniture", rating: 4.5, sold: 654 },
  { id: "alb-2", storeId: "alibaba", name: "L-Shape Standing Desk 160cm", nameFr: "Bureau Debout en L 160cm", nameAr: "مكتب L متعدد المراحل 160 سم", price: 1199, originalPrice: 1499, emoji: "🖥️", emojiGradient: "from-slate-700 to-slate-500", image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=300&fit=crop&auto=format&q=80", category: "Furniture", rating: 4.6, sold: 420 },
  { id: "alb-3", storeId: "alibaba", name: "27\" 4K IPS Gaming Monitor", nameFr: "Moniteur 27\" 4K IPS Gaming", nameAr: "شاشة جيمينج 27 بوصة 4K IPS", price: 1299, emoji: "🖱️", emojiGradient: "from-blue-800 to-blue-600", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop&auto=format&q=80", category: "Monitors", rating: 4.7, sold: 310, badge: "4K" },
  { id: "alb-4", storeId: "alibaba", name: "Mechanical Keyboard RGB TKL", nameFr: "Clavier Mécanique RGB TKL", nameAr: "كيبورد ميكانيكي RGB TKL", price: 299, originalPrice: 399, emoji: "⌨️", emojiGradient: "from-indigo-700 to-indigo-500", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop&auto=format&q=80", category: "Peripherals", rating: 4.5, sold: 1892 },

  // ─── Carrefour ─────────────────────────────────────────────────────────────
  { id: "car-1", storeId: "carrefour", name: "Nescafé Dolce Gusto Coffee Machine", nameFr: "Machine à Café Nescafé Dolce Gusto", nameAr: "مكينة قهوة نسكافيه دولتشي غوستو", price: 329, originalPrice: 399, emoji: "☕", emojiGradient: "from-amber-800 to-amber-600", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop&auto=format&q=80", category: "Appliances", rating: 4.6, sold: 2103 },
  { id: "car-2", storeId: "carrefour", name: "Philips Air Fryer 4.1L", nameFr: "Friteuse à Air Philips 4.1L", nameAr: "قلاية هوائية فيليبس 4.1 لتر", price: 289, originalPrice: 349, emoji: "🍳", emojiGradient: "from-orange-700 to-orange-500", image: "https://images.unsplash.com/photo-1648209539015-2bc4cef6fa1f?w=400&h=300&fit=crop&auto=format&q=80", category: "Appliances", rating: 4.7, sold: 3892 },
  { id: "car-3", storeId: "carrefour", name: "Bosch Cordless Vacuum Cleaner", nameFr: "Aspirateur Sans Fil Bosch", nameAr: "مكنسة لاسلكية بوش", price: 499, emoji: "🧹", emojiGradient: "from-cyan-700 to-cyan-500", image: "https://images.unsplash.com/photo-1558618047-f4e1c13e6688?w=400&h=300&fit=crop&auto=format&q=80", category: "Appliances", rating: 4.4, sold: 1204 },
  { id: "car-4", storeId: "carrefour", name: "Lay's Chips Variety Pack x5", nameFr: "Pack Chips Lay's Variétés x5", nameAr: "عبوة شيبس ليز متنوع 5 قطع", price: 8.5, emoji: "🍟", emojiGradient: "from-yellow-600 to-yellow-400", image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=300&fit=crop&auto=format&q=80", category: "Food", rating: 4.8, sold: 18420 },
  { id: "car-5", storeId: "carrefour", name: "Evian Water 6 x 1.5L", nameFr: "Evian Eau 6 x 1.5L", nameAr: "مياه إيفيان 6 × 1.5 لتر", price: 12.9, emoji: "💧", emojiGradient: "from-blue-600 to-blue-400", image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=300&fit=crop&auto=format&q=80", category: "Beverages", rating: 4.9, sold: 29300 },
  { id: "car-6", storeId: "carrefour", name: "Ariel Liquid Detergent 2.5L", nameFr: "Lessive Liquide Ariel 2.5L", nameAr: "منظف سائل أريال 2.5 لتر", price: 24.9, originalPrice: 31, emoji: "🫧", emojiGradient: "from-violet-700 to-violet-500", image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=300&fit=crop&auto=format&q=80", category: "Household", rating: 4.7, sold: 14200 },

  // ─── MyTek ─────────────────────────────────────────────────────────────────
  { id: "myt-1", storeId: "mytek", name: "HP Laptop 15.6\" Core i7", nameFr: "HP Laptop 15.6\" Core i7", nameAr: "لابتوب HP 15.6 إنش Core i7", price: 2199, originalPrice: 2499, emoji: "💻", emojiGradient: "from-slate-700 to-slate-500", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop&auto=format&q=80", category: "Laptops", rating: 4.5, sold: 782, badge: "Best Value" },
  { id: "myt-2", storeId: "mytek", name: "Canon PIXMA Color Printer", nameFr: "Imprimante Couleur Canon PIXMA", nameAr: "طابعة ألوان كانون بيكسما", price: 349, emoji: "🖨️", emojiGradient: "from-red-700 to-red-500", image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&h=300&fit=crop&auto=format&q=80", category: "Printers", rating: 4.3, sold: 1043 },
  { id: "myt-3", storeId: "mytek", name: "7-in-1 USB-C Hub", nameFr: "Hub USB-C 7-en-1", nameAr: "هاب USB-C 7 في 1", price: 89, originalPrice: 129, emoji: "🔌", emojiGradient: "from-gray-700 to-gray-500", image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop&auto=format&q=80", category: "Accessories", rating: 4.4, sold: 3420 },
  { id: "myt-4", storeId: "mytek", name: "Samsung SSD 1TB NVMe", nameFr: "SSD Samsung 1To NVMe", nameAr: "ذاكرة SSD سامسونج 1 تيرابايت", price: 299, originalPrice: 349, emoji: "💾", emojiGradient: "from-blue-800 to-blue-600", image: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=400&h=300&fit=crop&auto=format&q=80", category: "Storage", rating: 4.8, sold: 5231 },
  { id: "myt-5", storeId: "mytek", name: "TP-Link WiFi 6 Router AX3000", nameFr: "Routeur TP-Link WiFi 6 AX3000", nameAr: "راوتر TP-Link واي فاي 6 AX3000", price: 299, emoji: "📡", emojiGradient: "from-green-700 to-green-500", image: "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=400&h=300&fit=crop&auto=format&q=80", category: "Networking", rating: 4.6, sold: 2108 },

  // ─── Jumia ─────────────────────────────────────────────────────────────────
  { id: "jum-1", storeId: "jumia", name: "Nike Air Max 270 Running", nameFr: "Nike Air Max 270 Running", nameAr: "نايك إير ماكس 270", price: 349, originalPrice: 449, emoji: "👟", emojiGradient: "from-red-700 to-orange-500", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&auto=format&q=80", category: "Footwear", rating: 4.7, sold: 3109 },
  { id: "jum-2", storeId: "jumia", name: "Adidas Ultraboost 23", nameFr: "Adidas Ultraboost 23", nameAr: "أديداس ألترابوست 23", price: 399, originalPrice: 499, emoji: "👟", emojiGradient: "from-slate-700 to-slate-400", image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=300&fit=crop&auto=format&q=80", category: "Footwear", rating: 4.8, sold: 2890 },
  { id: "jum-3", storeId: "jumia", name: "Calvin Klein Eternity Perfume", nameFr: "Parfum Calvin Klein Eternity", nameAr: "عطر كالفن كلاين إيترنيتي", price: 189, originalPrice: 249, emoji: "🌸", emojiGradient: "from-pink-600 to-rose-400", image: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&h=300&fit=crop&auto=format&q=80", category: "Beauty", rating: 4.5, sold: 1820, badge: "Authentic" },
  { id: "jum-4", storeId: "jumia", name: "Ray-Ban Wayfarer Sunglasses", nameFr: "Lunettes de Soleil Ray-Ban Wayfarer", nameAr: "نظارات شمسية راي بان وايفيرر", price: 299, originalPrice: 399, emoji: "🕶️", emojiGradient: "from-amber-700 to-amber-500", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=300&fit=crop&auto=format&q=80", category: "Fashion", rating: 4.6, sold: 923 },
  { id: "jum-5", storeId: "jumia", name: "Leather Crossbody Handbag", nameFr: "Sac à Main Cuir Bandoulière", nameAr: "حقيبة يد جلدية كروس بودي", price: 149, originalPrice: 199, emoji: "👜", emojiGradient: "from-amber-800 to-amber-600", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=300&fit=crop&auto=format&q=80", category: "Fashion", rating: 4.4, sold: 2340 },

  // ─── Aziza (Tunisian) ──────────────────────────────────────────────────────
  { id: "azi-1", storeId: "aziza", name: "Huile d'Olive Extra Vierge Tunisienne 1L", nameFr: "Huile d'Olive Extra Vierge 1L", nameAr: "زيت زيتون تونسي بكر 1 لتر", price: 18.5, emoji: "🫒", emojiGradient: "from-green-700 to-lime-500", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop&auto=format&q=80", category: "Food", rating: 4.9, sold: 8700, badge: "🇹🇳 Local" },
  { id: "azi-2", storeId: "aziza", name: "Couscous Tunisien Fine 1kg", nameFr: "Couscous Tunisien Fin 1kg", nameAr: "كسكسي تونسي ناعم 1 كيلو", price: 4.9, emoji: "🍚", emojiGradient: "from-amber-600 to-yellow-400", image: "https://images.unsplash.com/photo-1512058556646-c4da40fba323?w=400&h=300&fit=crop&auto=format&q=80", category: "Food", rating: 4.8, sold: 12300, badge: "🇹🇳 Local" },
  { id: "azi-3", storeId: "aziza", name: "Harissa Tunisienne 380g", nameFr: "Harissa Tunisienne 380g", nameAr: "هريسة تونسية 380 جرام", price: 3.2, emoji: "🌶️", emojiGradient: "from-red-700 to-red-500", image: "https://images.unsplash.com/photo-1574483847053-7bd91c3f94a1?w=400&h=300&fit=crop&auto=format&q=80", category: "Spices", rating: 4.9, sold: 21400, badge: "🇹🇳 Local" },
  { id: "azi-4", storeId: "aziza", name: "Dattes Deglet Nour 1kg", nameFr: "Dattes Deglet Nour 1kg", nameAr: "تمور دقلة النور 1 كيلو", price: 22, emoji: "🌴", emojiGradient: "from-yellow-800 to-amber-600", image: "https://images.unsplash.com/photo-1605197855709-8c024c9e720a?w=400&h=300&fit=crop&auto=format&q=80", category: "Food", rating: 4.9, sold: 9800, badge: "🇹🇳 Local" },
  { id: "azi-5", storeId: "aziza", name: "Boîte Makroudh Artisanal", nameFr: "Boîte Makroudh Artisanal", nameAr: "علبة مقروض تقليدي", price: 12.5, emoji: "🍯", emojiGradient: "from-amber-700 to-yellow-500", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&auto=format&q=80", category: "Pastry", rating: 4.8, sold: 6540, badge: "🇹🇳 Local" },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id);
}

export function getProductsByStore(storeId: string): Product[] {
  if (storeId === "all") return PRODUCTS;
  return PRODUCTS.filter(p => p.storeId === storeId);
}

export function getStoreById(id: string): Store | undefined {
  return STORES.find(s => s.id === id);
}
