import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { CATEGORIES } from '@/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';
import { Search, PlusSquare, Edit3, Loader2 } from 'lucide-react';
import CategoryTabs from '@/components/pos/CategoryTabs';
import ProductDisplay from '@/components/pos/ProductDisplay';
import OrderPanel from '@/components/pos/OrderPanel';
import ExtrasModal from '@/components/modals/ExtrasModal';
import PaymentModal from '@/components/modals/PaymentModal';
import AddProductModal from '@/components/modals/AddProductModal';
import EditProductModal from '@/components/modals/EditProductModal';
import MobileOrderSummaryModal from '@/components/modals/MobileOrderSummaryModal';
import DrinkSelectionModal from '@/components/modals/DrinkSelectionModal';
import ReceiptPromptModal from '@/components/modals/ReceiptPromptModal';
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { generateThermalReceiptPdf } from '@/lib/receiptGenerator';

const STORE_INFO = {
  name: 'Burgers&Dogs',
  address: 'Av. Sabor 123, Ciudad Gourmet, MX',
  phone: '55 1234 5678',
  rfc: 'BDS920101AB1',
};

const PAYMENT_METHOD_LABELS = {
  cash: 'EFECTIVO',
  card: 'TARJETA',
  transfer: 'TRANSFERENCIA',
  mercadopago: 'MERCADO_PAGO',
  dollars: 'DOLARES',
};

const normalizeNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const createReceiptOrder = (orderItems, paymentDetails, orderResponse) => {
  const currency = paymentDetails.method === 'dollars' ? 'USD' : 'MXN';

  const items = orderItems.map(item => {
    const extras = item.extras || [];
    const extrasPerUnit = extras.reduce((sum, extra) => sum + normalizeNumber(extra.price) * (extra.quantity || 0), 0);
    const baseUnitPrice = Math.max(normalizeNumber(item.price) - extrasPerUnit, 0);

    const addons = [];
    if (extras.length > 0) {
      extras.forEach(extra => {
        const extraQty = extra.quantity || 0;
        if (extraQty > 0) {
          addons.push({
            name: `Extra: ${extra.name}${extraQty > 1 ? ` x${extraQty}` : ''}`,
            price: normalizeNumber(extra.price) * extraQty * item.quantity,
          });
        }
      });
    }

    if (item.complements && item.complements.length > 0) {
      item.complements.forEach(complement => {
        addons.push({
          name: `Incluido: ${complement.name}`,
          price: 0,
        });
      });
    }

    return {
      id: item.isCombo ? item.comboId ?? item.id : item.id,
      name: item.name,
      qty: item.quantity,
      unitPrice: Number(baseUnitPrice.toFixed(2)),
      notes: item.notes,
      addons,
    };
  });

  const subtotal = items.reduce((sum, orderItem) => {
    const addonsTotal = (orderItem.addons || []).reduce((addonSum, addon) => addonSum + normalizeNumber(addon.price), 0);
    return sum + normalizeNumber(orderItem.unitPrice) * orderItem.qty + addonsTotal;
  }, 0);

  const responseTotal = orderResponse?.total_amount;
  const total = responseTotal != null && !Number.isNaN(Number(responseTotal)) ? Number(responseTotal) : subtotal;

  const paymentMethod = PAYMENT_METHOD_LABELS[paymentDetails.method] || 'EFECTIVO';
  const shouldIncludeCash = paymentDetails.method === 'cash' || paymentDetails.method === 'dollars';
  const cashGivenValue = shouldIncludeCash && paymentDetails.amountPaid != null ? normalizeNumber(paymentDetails.amountPaid) : undefined;
  const changeValue = paymentDetails.change != null ? normalizeNumber(paymentDetails.change) : undefined;

  const paymentInfo = {
    method: paymentMethod,
    currency,
  };

  if (shouldIncludeCash && paymentDetails.amountPaid != null) {
    paymentInfo.cashGiven = cashGivenValue;
  }

  if (changeValue != null && !Number.isNaN(changeValue)) {
    paymentInfo.change = changeValue;
  }

  const receiptOrder = {
    id: orderResponse?.id ? orderResponse.id.toString() : `TMP-${Date.now()}`,
    createdAt: orderResponse?.created_at || new Date().toISOString(),
    items,
    subtotal: Number(subtotal.toFixed(2)),
    discount: 0,
    taxes: 0,
    total: Number(total.toFixed(2)),
    payment: paymentInfo,
    customerName: orderResponse?.customer_name || undefined,
    store: STORE_INFO,
  };

  return receiptOrder;
};
const MobileOrderSummaryButton = ({
  orderTotal,
  orderItemCount,
  onOpenOrderSummary
}) => {
  if (orderItemCount === 0) return null;
  return <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-white dark:from-gray-900 via-white/95 dark:via-gray-900/95 to-white/0 dark:to-gray-900/0 z-30">
      <Button className="w-full bg-brand-green hover:bg-brand-green/90 text-white font-bold py-3.5 text-md shadow-xl rounded-lg" onClick={onOpenOrderSummary}>
        <div className="flex justify-between items-center w-full px-2">
          <span>Ver total ({orderItemCount})</span>
          <span>${orderTotal.toFixed(2)}</span>
        </div>
      </Button>
    </div>;
};
const POSPage = ({
  isSidebarCollapsed
}) => {
  const {
    products,
    currentOrder,
    addToOrder,
    updateOrderItemQuantity,
    addExtraToItem,
    updateExtraQuantity,
    removeFromOrder,
    clearOrder,
    confirmOrder,
    isLoading,
    fetchProducts
  } = useAppContext();
  const {
    toast
  } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const initialCategory = CATEGORIES.find(cat => cat.id !== 'combos');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory ? initialCategory.id : 'burgers');
  const [isExtrasModalOpen, setIsExtrasModalOpen] = useState(false);
  const [selectedItemForExtras, setSelectedItemForExtras] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [isMobileOrderSummaryOpen, setIsMobileOrderSummaryOpen] = useState(false);
  const [isClearOrderConfirmOpen, setIsClearOrderConfirmOpen] = useState(false);
  const [isDrinkSelectionOpen, setIsDrinkSelectionOpen] = useState(false);
  const [productForCombo, setProductForCombo] = useState(null);
  const [isReceiptPromptOpen, setIsReceiptPromptOpen] = useState(false);
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [lastGeneratedReceiptUrl, setLastGeneratedReceiptUrl] = useState(null);
  const [pendingReceiptOrder, setPendingReceiptOrder] = useState(null);
  const [receiptPaperWidth, setReceiptPaperWidth] = useState(58);
  useEffect(() => {
    if (!isLoading && products.length === 0) {
      fetchProducts();
    }
  }, [isLoading, products, fetchProducts]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedWidth = window.localStorage.getItem('receiptPaperWidth');
    if (storedWidth) {
      const parsed = parseInt(storedWidth, 10);
      if (parsed === 58 || parsed === 80) {
        setReceiptPaperWidth(parsed);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('receiptPaperWidth', receiptPaperWidth.toString());
    }
  }, [receiptPaperWidth]);

  useEffect(() => {
    return () => {
      if (lastGeneratedReceiptUrl) {
        URL.revokeObjectURL(lastGeneratedReceiptUrl);
      }
    };
  }, [lastGeneratedReceiptUrl]);
  const filteredProducts = useMemo(() => {
    if (isLoading) return [];
    const currentCatDbValue = CATEGORIES.find(cat => cat.id === selectedCategory)?.dbValue || selectedCategory;
    return products.filter(p => p.is_available && p.category === currentCatDbValue && (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())));
  }, [products, selectedCategory, searchTerm, isLoading]);
  const orderSubtotal = useMemo(() => {
    return currentOrder.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
  }, [currentOrder]);
  const orderTotal = orderSubtotal;
  const orderItemCount = currentOrder.reduce((sum, item) => sum + item.quantity, 0);
  const handleMakeCombo = product => {
    setProductForCombo(product);
    setIsDrinkSelectionOpen(true);
  };
  const handleSelectDrink = drink => {
    const friesProduct = products.find(p => p.name.toLowerCase() === 'papas fritas');
    if (!friesProduct) {
      toast({
        title: "Error de Configuración",
        description: "El producto 'Papas fritas' no se encuentra. No se puede crear el combo.",
        variant: "destructive"
      });
      return;
    }
    if (productForCombo) {
      addToOrder(productForCombo, {
        isCombo: true,
        complements: [drink, friesProduct]
      });
      setProductForCombo(null);
    }
  };
  const handleCloseDrinkSelection = () => {
    setIsDrinkSelectionOpen(false);
    setProductForCombo(null);
  };
  const handleOpenExtrasModal = item => {
    setSelectedItemForExtras(item);
    setIsExtrasModalOpen(true);
  };
  const handleCloseExtrasModal = () => {
    setIsExtrasModalOpen(false);
    setSelectedItemForExtras(null);
  };
  const handleReceiptPromptCancel = useCallback(() => {
    setIsReceiptPromptOpen(false);
    setPendingReceiptOrder(null);
  }, []);

  const handleGenerateReceipt = useCallback(async () => {
    if (!pendingReceiptOrder) {
      return;
    }

    setIsGeneratingReceipt(true);
    try {
      const { url } = generateThermalReceiptPdf(pendingReceiptOrder, { paperWidthMM: receiptPaperWidth });
      if (!url) {
        throw new Error('No se pudo generar el archivo del recibo.');
      }

      if (lastGeneratedReceiptUrl) {
        URL.revokeObjectURL(lastGeneratedReceiptUrl);
      }

      setLastGeneratedReceiptUrl(url);

      let openedWindow;
      if (typeof window !== 'undefined') {
        openedWindow = window.open(url, '_blank');
      }

      const action = <ToastAction altText="Abrir recibo" onClick={() => {
        if (typeof window !== 'undefined') {
          window.open(url, '_blank');
        }
      }}>Abrir</ToastAction>;

      if (openedWindow) {
        openedWindow.focus?.();
        toast({
          title: 'Recibo listo para imprimir',
          description: `Formato ${receiptPaperWidth} mm generado correctamente.`,
          action,
        });
      } else {
        toast({
          title: 'Recibo generado',
          description: 'Permite las ventanas emergentes para visualizarlo.',
          action,
        });
      }

      setIsReceiptPromptOpen(false);
      setPendingReceiptOrder(null);
    } catch (error) {
      console.error('Error generando el recibo:', error);
      toast({
        title: 'Error al generar recibo',
        description: error.message || 'Intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingReceipt(false);
    }
  }, [pendingReceiptOrder, receiptPaperWidth, lastGeneratedReceiptUrl, toast]);

  const handleOpenLastReceipt = useCallback(() => {
    if (!lastGeneratedReceiptUrl) {
      return;
    }
    if (typeof window === 'undefined') {
      return;
    }

    const popup = window.open(lastGeneratedReceiptUrl, '_blank');
    if (!popup) {
      toast({
        title: 'No se pudo abrir el recibo',
        description: 'Permite las ventanas emergentes para continuar.',
        variant: 'destructive',
      });
    } else {
      popup.focus?.();
    }
  }, [lastGeneratedReceiptUrl, toast]);
  const handleConfirmPayment = useCallback(async paymentDetails => {
    if (currentOrder.length === 0) {
      return false;
    }

    const orderSnapshot = currentOrder.map(item => ({
      ...item,
      extras: item.extras ? item.extras.map(extra => ({ ...extra })) : [],
      complements: item.complements ? item.complements.map(complement => ({ ...complement })) : [],
    }));

    try {
      const orderData = await confirmOrder(paymentDetails);
      if (orderData) {
        const receiptOrder = createReceiptOrder(orderSnapshot, paymentDetails, orderData);
        setPendingReceiptOrder(receiptOrder);
        setIsReceiptPromptOpen(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al confirmar el pago:', error);
      return false;
    }
  }, [confirmOrder, currentOrder]);
  const handleOpenAddProductModal = () => {
    setIsAddProductModalOpen(true);
  };
  const handleCloseAddProductModal = () => {
    setIsAddProductModalOpen(false);
  };
  const handleOpenEditProductModal = product => {
    setProductToEdit(product);
    setIsEditProductModalOpen(true);
  };
  const handleCloseEditProductModal = () => {
    setProductToEdit(null);
    setIsEditProductModalOpen(false);
  };
  const handleOpenClearConfirm = () => {
    setIsClearOrderConfirmOpen(true);
  };
  const mainContentAreaClasses = cn("flex-1 flex flex-col p-3 sm:p-4 bg-gray-50 dark:bg-gray-900 md:bg-gray-100 dark:md:bg-slate-800 overflow-y-auto", "md:mr-[384px]", "pb-24 md:pb-6");
  return <div className="flex flex-col md:flex-row h-full w-full">
      <div className={mainContentAreaClasses}>
        <header className="md:hidden mb-3 flex flex-col">
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 text-center mb-2.5">Ordenar</h1>
             <div className="relative flex-grow">
              <Input type="text" placeholder="Buscar productos..." className="pl-9 pr-3 py-2 w-full shadow-sm text-sm border-gray-300 dark:border-gray-600 rounded-lg focus:ring-brand-blue focus:border-brand-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            </div>
        </header>
        
        <header className="hidden md:block mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-brand-red-medium dark:text-brand-red-light">Punto de Venta</h1>
          <div className="mt-4 flex items-center space-x-2 md:space-x-3">
            <div className="relative flex-grow">
              <Input type="text" placeholder="Buscar productos..." className="pl-10 pr-4 py-2.5 md:py-3 w-full shadow-sm text-sm md:text-base border-gray-300 dark:border-gray-600 rounded-lg focus:ring-brand-blue focus:border-brand-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            </div>
            <Button onClick={handleOpenAddProductModal} variant="outline" className="px-3 py-2.5 md:px-4 md:py-3 bg-white dark:bg-gray-700 text-brand-blue dark:text-sky-400 border-brand-blue dark:border-sky-500 hover:bg-brand-blue/10 dark:hover:bg-sky-500/20 shadow-sm rounded-lg">
              <PlusSquare size={20} className="md:mr-2" />
              <span className="hidden md:inline">Agregar</span>
            </Button>
            <Button onClick={() => alert("La pantalla de edición de productos se implementará aquí.")} variant="outline" className="px-3 py-2.5 md:px-4 md:py-3 bg-white dark:bg-gray-700 text-brand-red-medium dark:text-brand-red-light border-brand-red-medium dark:border-brand-red-light hover:bg-brand-red-medium/10 dark:hover:bg-brand-red-light/20 shadow-sm rounded-lg">
              <Edit3 size={20} className="md:mr-2" />
              <span className="hidden md:inline">Editar Productos</span>
            </Button>
          </div>
        </header>

        {isLoading ? <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-brand-blue dark:text-sky-400" />
          </div> : <Tabs value={selectedCategory} onValueChange={value => setSelectedCategory(value)} className="w-full">
            <CategoryTabs selectedCategory={selectedCategory} onSelectCategory={catId => setSelectedCategory(catId)} categories={CATEGORIES.filter(cat => cat.id !== 'combos')} />
            <ProductDisplay products={filteredProducts} selectedCategory={selectedCategory} onAddToCart={addToOrder} onEditProduct={handleOpenEditProductModal} onMakeCombo={handleMakeCombo} />
          </Tabs>}
      </div>
      
      <div className="hidden md:block">
        <OrderPanel currentOrder={currentOrder} onUpdateQuantity={updateOrderItemQuantity} onRemove={removeFromOrder} onOpenExtrasModal={handleOpenExtrasModal} onOpenClearConfirm={handleOpenClearConfirm} onOpenPaymentModal={() => setIsPaymentModalOpen(true)} orderSubtotal={orderSubtotal} orderTotal={orderTotal} />
      </div>

      <MobileOrderSummaryButton orderTotal={orderTotal} orderItemCount={orderItemCount} onOpenOrderSummary={() => setIsMobileOrderSummaryOpen(true)} />
      
      <MobileOrderSummaryModal isOpen={isMobileOrderSummaryOpen} onClose={() => setIsMobileOrderSummaryOpen(false)} currentOrder={currentOrder} orderSubtotal={orderSubtotal} orderTotal={orderTotal} onUpdateQuantity={updateOrderItemQuantity} onRemove={removeFromOrder} onOpenExtrasModal={item => {
      handleOpenExtrasModal(item);
    }} onOpenClearConfirm={() => {
      setIsMobileOrderSummaryOpen(false);
      handleOpenClearConfirm();
    }} onOpenPaymentModal={() => {
      setIsMobileOrderSummaryOpen(false);
      setIsPaymentModalOpen(true);
    }} />

      <DrinkSelectionModal isOpen={isDrinkSelectionOpen} onClose={handleCloseDrinkSelection} onSelectDrink={handleSelectDrink} mainProduct={productForCombo} />

      {selectedItemForExtras && <ExtrasModal item={selectedItemForExtras} isOpen={isExtrasModalOpen} onClose={handleCloseExtrasModal} onAddExtra={addExtraToItem} onUpdateExtraQuantity={updateExtraQuantity} />}

      {isPaymentModalOpen && <PaymentModal orderTotal={orderTotal} isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} onConfirmPayment={handleConfirmPayment} />}

      <ReceiptPromptModal
        isOpen={isReceiptPromptOpen}
        isGenerating={isGeneratingReceipt}
        paperWidth={receiptPaperWidth}
        onPaperWidthChange={setReceiptPaperWidth}
        onConfirm={handleGenerateReceipt}
        onCancel={handleReceiptPromptCancel}
        hasPreviousReceipt={Boolean(lastGeneratedReceiptUrl)}
        onOpenPreviousReceipt={handleOpenLastReceipt}
      />
      
      <AddProductModal isOpen={isAddProductModalOpen} onClose={handleCloseAddProductModal} />
      
      {productToEdit && isEditProductModalOpen && <EditProductModal isOpen={isEditProductModalOpen} onClose={handleCloseEditProductModal} product={productToEdit} />}

      <AlertDialog open={isClearOrderConfirmOpen} onOpenChange={setIsClearOrderConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Vaciar Pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar todos los artículos de tu pedido actual? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
            clearOrder();
            setIsClearOrderConfirmOpen(false);
          }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sí, Vaciar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>;
};
export default POSPage;