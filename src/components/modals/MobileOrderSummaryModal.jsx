import React from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { ScrollArea } from '@/components/ui/scroll-area';
    import { X, Trash2, ShoppingCart, FileText, MinusCircle, PlusCircle as PlusCircleIcon, PlusSquare } from 'lucide-react';
    import { cn } from "@/lib/utils";

    const MobileOrderSummaryModal = ({ 
      isOpen, 
      onClose, 
      currentOrder, 
      orderTotal, 
      orderSubtotal, 
      onUpdateQuantity, 
      onRemove, 
      onOpenClearConfirm, 
      onOpenPaymentModal,
      onOpenExtrasModal
    }) => {
      if (!isOpen) return null;

      const orderItemCount = currentOrder.reduce((sum, item) => sum + item.quantity, 0);

      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent 
            className={cn(
              "p-0 flex flex-col fixed top-0 right-0 m-0 h-full max-h-full", 
              "w-full", // Ocupa todo el ancho de la pantalla
              "shadow-lg bg-white dark:bg-gray-800", // Sin bordes redondeados ni borde lateral ya que es full-width
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
              "md:hidden" 
            )}
          >
            <DialogHeader className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10 flex items-center justify-between space-x-3 shrink-0">
              <DialogTitle className="text-lg font-semibold text-brand-blue dark:text-sky-400 flex items-center">
                <FileText size={22} className="mr-2 text-brand-red-light dark:text-brand-red"/> Tu Pedido ({orderItemCount})
              </DialogTitle>
              <DialogClose className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-1">
                <X size={22} className="text-gray-600 dark:text-gray-300" />
              </DialogClose>
            </DialogHeader>
            
            <ScrollArea className="flex-grow p-4 space-y-3">
              {currentOrder.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                  <ShoppingCart size={48} className="text-gray-400 dark:text-gray-500 mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">Tu pedido está vacío.</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Agrega productos para continuar.</p>
                </div>
              ) : (
                currentOrder.map(item => {
                  const extrasCount = item.extras ? item.extras.reduce((sum, ex) => sum + ex.quantity, 0) : 0;
                  return (
                    <div key={`${item.id}-${item.isCombo}`} className="py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 flex flex-col space-y-2.5">
                      <div className="flex justify-between items-start space-x-2">
                        <div className="flex-grow min-w-0">
                          <p className="font-semibold text-gray-800 dark:text-gray-100 text-base leading-tight">{item.name} {item.emoji}</p>
                          <p className="text-sm text-brand-blue dark:text-sky-400 font-medium">${item.price.toFixed(2)} c/u</p>
                          {extrasCount > 0 && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+{extrasCount} Extra(s)</p>}
                        </div>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-full shrink-0 p-0" onClick={() => onRemove(item.id, item.isCombo)}>
                          <Trash2 size={18} />
                        </Button>
                      </div>
                      <div className="flex items-center justify-start space-x-2.5">
                        <Button variant="outline" size="icon" className="h-9 w-9 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full border-gray-300 dark:border-gray-600 p-0" onClick={() => onUpdateQuantity(item.id, item.isCombo, item.quantity - 1)}>
                          <MinusCircle size={20} />
                        </Button>
                        <span className="text-base w-7 text-center font-medium text-gray-800 dark:text-gray-100">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-9 w-9 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full border-gray-300 dark:border-gray-600 p-0" onClick={() => onUpdateQuantity(item.id, item.isCombo, item.quantity + 1)}>
                          <PlusCircleIcon size={20} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-9 px-3 bg-yellow-100/70 text-yellow-700 border-yellow-300/70 hover:bg-yellow-100 dark:bg-yellow-700/30 dark:text-yellow-300 dark:border-yellow-600/50 dark:hover:bg-yellow-700/50 text-xs" 
                          onClick={() => onOpenExtrasModal(item)}
                        >
                          <PlusSquare size={16} className="mr-1.5" /> Extras
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </ScrollArea>
            
            {currentOrder.length > 0 && (
              <DialogFooter className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 sticky bottom-0 z-10 flex-col space-y-3 shrink-0">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 px-1">
                  <span>Subtotal:</span>
                  <span className="font-medium">${orderSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-brand-blue dark:text-sky-400 px-1 mb-1">
                  <span>Total:</span>
                  <span>${orderTotal.toFixed(2)}</span>
                </div>
                <Button 
                  className="w-full bg-brand-blue hover:bg-brand-blue/90 dark:bg-sky-500 dark:hover:bg-sky-600 text-white font-semibold py-3.5 text-base rounded-lg shadow-md" 
                  onClick={() => { onClose(); onOpenPaymentModal(); }}
                >
                  Confirmar Pedido
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full py-3 text-sm border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg shadow-sm" 
                  onClick={() => {onClose(); onOpenClearConfirm();}}
                >
                  <Trash2 size={16} className="mr-2 text-brand-red-dark dark:text-red-400" />
                  Vaciar Pedido
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      );
    };

    export default MobileOrderSummaryModal;