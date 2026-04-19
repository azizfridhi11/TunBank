import { LayoutShell } from "@/components/layout-shell";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Plus, Minus, Trash2, Star, CheckCircle2, Package, Loader2, ChevronRight, History } from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { STORES, PRODUCTS, getProductById, type Product, type Store } from "@shared/shopData";
import { CartItem, Account } from "@shared/schema";
import { api } from "@shared/routes";
import { format } from "date-fns";

// ─── Store Filter Bar ─────────────────────────────────────────────────────────
function StoreBar({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
      {STORES.map(store => (
        <button
          key={store.id}
          onClick={() => onSelect(store.id)}
          className={`snap-start flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all whitespace-nowrap
            ${active === store.id
              ? "text-white border-transparent shadow-md scale-105"
              : "bg-white dark:bg-card border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          style={active === store.id ? { backgroundColor: store.color, borderColor: store.color } : {}}
        >
          <span>{store.emoji}</span> {store.name}
        </button>
      ))}
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, cartItems, onAdd }: {
  product: Product;
  cartItems: CartItem[];
  onAdd: (productId: string) => void;
}) {
  const { t } = useTranslation();
  const store = STORES.find(s => s.id === product.storeId)!;
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;
  const inCart = cartItems.find(c => c.productId === product.id);

  return (
    <div className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Image area */}
      <div className={`relative h-40 flex items-center justify-center bg-gradient-to-br ${product.emojiGradient} flex-shrink-0`}>
        <span className="text-6xl drop-shadow-lg">{product.emoji}</span>
        {/* Store badge */}
        <div
          className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-xs font-bold"
          style={{ backgroundColor: store.color }}
        >
          {store.emoji} {store.name}
        </div>
        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
            -{discount}%
          </div>
        )}
        {/* Custom badge */}
        {product.badge && !discount && (
          <div className="absolute top-2 right-2 text-white text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: store.color }}>
            {product.badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="font-medium text-foreground">{product.rating}</span>
          <span>·</span>
          <span>{product.sold.toLocaleString()} sold</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-lg font-black text-primary">{formatCurrency(product.price, "TND")}</span>
          {product.originalPrice && (
            <span className="text-xs line-through text-muted-foreground">{formatCurrency(product.originalPrice, "TND")}</span>
          )}
        </div>

        {/* Add to cart */}
        <Button
          size="sm"
          className="w-full mt-1 rounded-xl font-semibold text-xs"
          style={inCart ? { backgroundColor: "#22c55e" } : {}}
          onClick={() => onAdd(product.id)}
        >
          {inCart ? (
            <><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {t("In Cart")} ({inCart.quantity})</>
          ) : (
            <><ShoppingCart className="w-3.5 h-3.5 mr-1" /> {t("Add to Cart")}</>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Cart Sheet ───────────────────────────────────────────────────────────────
function CartSheet({ cartItems, onCheckout }: {
  cartItems: CartItem[];
  onCheckout: () => void;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const res = await fetch(`/api/shop/cart/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/shop/cart"] }),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/shop/cart/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/shop/cart"] }),
  });

  const enriched = cartItems.map(c => ({ ...c, product: getProductById(c.productId) })).filter(c => c.product);
  const total = enriched.reduce((s, c) => s + c.product!.price * c.quantity, 0);

  // Group by store
  const byStore = enriched.reduce((acc, c) => {
    const sid = c.product!.storeId;
    if (!acc[sid]) acc[sid] = { store: STORES.find(s => s.id === sid)!, items: [] };
    acc[sid].items.push(c);
    return acc;
  }, {} as Record<string, { store: Store; items: typeof enriched }>);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {enriched.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="text-5xl">🛒</div>
            <p className="text-muted-foreground">{t("Your cart is empty")}</p>
          </div>
        ) : Object.values(byStore).map(group => (
          <div key={group.store.id}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold" style={{ color: group.store.color }}>{group.store.emoji} {group.store.name}</span>
            </div>
            {group.items.map(c => (
              <div key={c.id} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.product!.emojiGradient} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {c.product!.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{c.product!.name}</p>
                  <p className="text-primary font-bold text-sm">{formatCurrency(c.product!.price, "TND")}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => c.quantity > 1 ? updateMutation.mutate({ id: c.id, quantity: c.quantity - 1 }) : removeMutation.mutate(c.id)}
                    className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    {c.quantity === 1 ? <Trash2 className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  </button>
                  <span className="w-6 text-center text-sm font-bold">{c.quantity}</span>
                  <button
                    onClick={() => updateMutation.mutate({ id: c.id, quantity: c.quantity + 1 })}
                    className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {enriched.length > 0 && (
        <div className="border-t border-border pt-4 space-y-4 mt-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{enriched.reduce((s, c) => s + c.quantity, 0)} {t("items")}</span>
            <span className="font-black text-lg text-primary">{formatCurrency(total, "TND")}</span>
          </div>
          <Button className="w-full gap-2 h-12 text-base font-bold rounded-xl" onClick={onCheckout}>
            <CheckCircle2 className="w-5 h-5" /> {t("Checkout")} — {formatCurrency(total, "TND")}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Checkout Dialog ──────────────────────────────────────────────────────────
function CheckoutDialog({ open, onClose, cartItems, onSuccess }: {
  open: boolean; onClose: () => void; cartItems: CartItem[];
  onSuccess: (order: any) => void;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [accountId, setAccountId] = useState<string>("");
  const { data: accounts } = useQuery<Account[]>({ queryKey: [api.accounts.list.path] });

  const enriched = cartItems.map(c => ({ ...c, product: getProductById(c.productId) })).filter(c => c.product);
  const total = enriched.reduce((s, c) => s + c.product!.price * c.quantity, 0);

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: Number(accountId),
          total: total.toFixed(3),
          items: enriched.map(c => ({
            productId: c.productId,
            productName: c.product!.name,
            storeId: c.product!.storeId,
            storeName: STORES.find(s => s.id === c.product!.storeId)?.name || "",
            price: c.product!.price,
            quantity: c.quantity,
          })),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Checkout failed");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/shop/cart"] });
      queryClient.invalidateQueries({ queryKey: [api.accounts.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
      queryClient.invalidateQueries({ queryKey: ["/api/shop/orders"] });
      onSuccess(data.order);
      onClose();
    },
    onError: (e: Error) => toast({ title: t("Error"), description: e.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">🛍️ {t("Confirm Purchase")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Items summary */}
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {enriched.map(c => (
              <div key={c.id} className="flex items-center gap-3 p-2 rounded-xl bg-muted/40">
                <span className="text-xl">{c.product!.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{c.product!.name}</p>
                  <p className="text-xs text-muted-foreground">×{c.quantity}</p>
                </div>
                <span className="text-sm font-bold">{formatCurrency(c.product!.price * c.quantity, "TND")}</span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex justify-between font-black text-lg">
            <span>{t("Total")}</span>
            <span className="text-primary">{formatCurrency(total, "TND")}</span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("Pay from account")}</label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger><SelectValue placeholder={t("Select account")} /></SelectTrigger>
              <SelectContent>
                {accounts?.map(a => (
                  <SelectItem key={a.id} value={String(a.id)}>
                    {a.accountNumber} — {formatCurrency(Number(a.balance), "TND")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full h-12 font-bold text-base rounded-xl"
            disabled={!accountId || checkoutMutation.isPending}
            onClick={() => checkoutMutation.mutate()}
          >
            {checkoutMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            💳 {t("Pay")} {formatCurrency(total, "TND")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Receipt Modal ────────────────────────────────────────────────────────────
function ReceiptModal({ order, onClose }: { order: any; onClose: () => void }) {
  const { t } = useTranslation();
  if (!order) return null;
  return (
    <Dialog open={!!order} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-xl">{t("Order Confirmed!")} 🎉</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <div>
            <p className="text-3xl font-black text-primary">{formatCurrency(Number(order.total), "TND")}</p>
            <p className="text-muted-foreground text-sm mt-1">{t("Paid from account")} #{order.accountId}</p>
          </div>
          <div className="bg-muted/40 rounded-xl p-4 text-left space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("Order ID")}</span>
              <span className="font-mono font-bold">#{String(order.id).padStart(6, "0")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("Status")}</span>
              <Badge className="bg-green-500 text-white text-xs">{t("Completed")}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("Date")}</span>
              <span>{format(new Date(), "dd MMM yyyy HH:mm")}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">🏆 {t("You earned reward points for this purchase!")}</p>
          <Button className="w-full" onClick={onClose}>{t("Continue Shopping")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Order History ────────────────────────────────────────────────────────────
function OrderHistory() {
  const { t } = useTranslation();
  const { data: orders, isLoading } = useQuery<any[]>({ queryKey: ["/api/shop/orders"] });

  if (isLoading) return <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>;
  if (!orders?.length) return (
    <div className="text-center py-12 text-muted-foreground">
      <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
      <p className="text-sm">{t("No orders yet")}</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {orders.map(order => (
        <div key={order.id} className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold text-sm">#{String(order.id).padStart(6, "0")}</p>
              <p className="text-xs text-muted-foreground">{format(new Date(order.createdAt), "dd MMM yyyy HH:mm")}</p>
            </div>
            <div className="text-right">
              <p className="font-black text-primary">{formatCurrency(Number(order.total), "TND")}</p>
              <Badge className="bg-green-500 text-white text-xs mt-1">{t("Completed")}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex items-center gap-1 bg-muted/50 rounded-lg px-2 py-1 text-xs">
                <span>{getProductById(item.productId)?.emoji || "📦"}</span>
                <span className="truncate max-w-24">{item.productName}</span>
                <span className="text-muted-foreground">×{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Shop Page ───────────────────────────────────────────────────────────
export default function Shop() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeStore, setActiveStore] = useState("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<any>(null);
  const [view, setView] = useState<"shop" | "orders">("shop");

  const { data: cartData = [], isLoading: cartLoading } = useQuery<CartItem[]>({ queryKey: ["/api/shop/cart"] });

  const addMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await fetch("/api/shop/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (_, productId) => {
      const product = getProductById(productId);
      toast({ title: `${product?.emoji} ${t("Added to cart")}`, description: product?.name });
      queryClient.invalidateQueries({ queryKey: ["/api/shop/cart"] });
    },
    onError: () => toast({ title: t("Error"), variant: "destructive" }),
  });

  const products = useMemo(() =>
    activeStore === "all" ? PRODUCTS : PRODUCTS.filter(p => p.storeId === activeStore),
    [activeStore]
  );

  const cartCount = cartData.reduce((s, c) => s + c.quantity, 0);

  return (
    <LayoutShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
              🛍️ {t("TunBank Shop")}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">{t("Shop from top stores and pay instantly from your balance")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={view === "orders" ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
              onClick={() => setView(view === "orders" ? "shop" : "orders")}
            >
              <History className="w-4 h-4" />
              {view === "orders" ? t("Back to Shop") : t("My Orders")}
            </Button>

            {/* Cart button */}
            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
              <SheetTrigger asChild>
                <Button className="relative gap-2 h-10">
                  <ShoppingCart className="w-4 h-4" />
                  {t("Cart")}
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 p-0">
                <SheetHeader className="px-6 py-4 border-b border-border">
                  <SheetTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" /> {t("Your Cart")} ({cartCount})
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-hidden px-6 py-4 flex flex-col">
                  <CartSheet
                    cartItems={cartData}
                    onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {view === "orders" ? (
          <OrderHistory />
        ) : (
          <>
            {/* Store filter */}
            <StoreBar active={activeStore} onSelect={setActiveStore} />

            {/* Active store tagline */}
            {activeStore !== "all" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {STORES.find(s => s.id === activeStore)?.emoji}
                <span className="font-medium text-foreground">{STORES.find(s => s.id === activeStore)?.name}</span>
                <ChevronRight className="w-3 h-3" />
                <span>{STORES.find(s => s.id === activeStore)?.tagline}</span>
              </div>
            )}

            {/* Product grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  cartItems={cartData}
                  onAdd={(id) => addMutation.mutate(id)}
                />
              ))}
            </div>

            {/* Floating cart FAB (mobile) */}
            {cartCount > 0 && (
              <div className="fixed bottom-6 right-6 z-50 md:hidden">
                <button
                  onClick={() => setCartOpen(true)}
                  className="relative flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-full shadow-2xl font-bold text-sm"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount} {t("items")} — {formatCurrency(cartData.reduce((s, c) => {
                    const p = getProductById(c.productId);
                    return s + (p ? p.price * c.quantity : 0);
                  }, 0), "TND")}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <CheckoutDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cartItems={cartData}
        onSuccess={(order) => { setReceiptOrder(order); }}
      />
      <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />
    </LayoutShell>
  );
}
