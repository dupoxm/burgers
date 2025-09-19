import React from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { ScrollArea } from "@/components/ui/scroll-area";
    import { PlusCircle, MinusCircle, Trash2, FileText, PlusSquare, CheckCircle2, CornerDownRight } from 'lucide-react';
    import { cn } from "@/lib/utils";

    const OrderItem = ({ item, onUpdateQuantity, onRemove, onOpenExtrasModal }) => {
      const extrasCount = item.extras ? item.extras.reduce((sum, ex) => sum + ex.quantity, 0) : 0;
      const itemIdentifier = item.isCombo ? item.comboId : item.id;

      return (
        <motion.div 
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="py-3.5 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
        >
          <div className="flex items-center justify-between">
            <div className="flex-grow mr-2">
              <p className="font-semibold text-base md:text-lg text-gray-800 dark:text-gray-100">{item.name} {item.emoji}</p>
              <p className="text-sm md:text-base text-brand-blue dark:text-sky-400 font-medium">${item.price.toFixed(2)} c/u</p>
              {extrasCount > 0 && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+{extrasCount} Extra(s)</p>}
            </div>
            <div className="flex items-center space-x-1.5 md:space-x-2 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 text-gray-600 dark:text-gray-300 hover:text-brand-red-medium dark:hover:text-brand-red-light" onClick={() => onUpdateQuantity(itemIdentifier, item.isCombo, item.quantity - 1)}>
                <MinusCircle size={20} />
              </Button>
              <span className="text-base md:text-lg font-medium w-6 text-center text-gray-800 dark:text-gray-100">{item.quantity}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 text-gray-600 dark:text-gray-300 hover:text-brand-green dark:hover:text-green-400" onClick={() => onUpdateQuantity(itemIdentifier, item.isCombo, item.quantity + 1)}>
                <PlusCircle size={20} />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 md:h-9 md:w-9 bg-brand-yellow/30 text-brand-yellow-dark border-brand-yellow/50 hover:bg-brand-yellow/50 hover:text-brand-yellow-darker dark:bg-yellow-700/30 dark:text-yellow-300 dark:border-yellow-600/50 dark:hover:bg-yellow-700/50" 
                onClick={() => onOpenExtrasModal(item)}
              >
                <PlusSquare size={18} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 text-brand-red-dark dark:text-red-400 hover:text-brand-red-dark/80 dark:hover:text-red-300" onClick={() => onRemove(itemIdentifier, item.isCombo)}>
                <Trash2 size={18} />
              </Button>
            </div>
          </div>
          {item.isCombo && item.complements && item.complements.length > 0 && (
            <div className="pl-5 mt-2 space-y-1">
              {item.complements.map((complement, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <CornerDownRight size={14} className="mr-2 text-gray-400" />
                  <span>{complement.emoji} {complement.name}</span>
                  <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300">Incluido</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      );
    };

    const OrderPanel = ({ 
        currentOrder, 
        onUpdateQuantity, 
        onRemove, 
        onOpenExtrasModal, 
        onOpenClearConfirm, 
        onOpenPaymentModal, 
        orderSubtotal, 
        orderTotal,
        className 
    }) => {
      return (
        <div className={cn(
          "bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col shadow-xl",
          "fixed right-0 top-0 h-full md:h-screen z-20",
          "w-full md:w-96",
          className
        )}>
          <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center h-[68px] shrink-0">
            <h2 className="text-xl md:text-2xl font-semibold text-brand-blue dark:text-sky-400 flex items-center">
              <FileText size={24} className="mr-2.5 text-brand-red-light dark:text-brand-red"/> Tu Pedido ({currentOrder.reduce((sum, item) => sum + item.quantity, 0)})
            </h2>
          </header>
          
          <ScrollArea className="flex-grow p-4 overflow-y-auto min-h-0">
            {currentOrder.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-center text-gray-500 dark:text-gray-400 py-20 text-base md:text-lg">Tu pedido está vacío.</p>
              </div>
            ) : (
              <AnimatePresence>
                {currentOrder.map(item => (
                  <OrderItem 
                    key={item.isCombo ? item.comboId : item.id} 
                    item={item} 
                    onUpdateQuantity={onUpdateQuantity} 
                    onRemove={onRemove}
                    onOpenExtrasModal={onOpenExtrasModal}
                  />
                ))}
              </AnimatePresence>
            )}
          </ScrollArea>

          {currentOrder.length > 0 && (
            <footer className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shrink-0">
              <div className="flex justify-between text-base md:text-lg mb-1.5 text-gray-700 dark:text-gray-300">
                <span>Subtotal:</span>
                <span className="font-medium">${orderSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl md:text-2xl font-bold text-brand-blue dark:text-sky-400 mb-5">
                <span>Total:</span>
                <span>${orderTotal.toFixed(2)}</span>
              </div>
              <Button 
                className="w-full bg-brand-blue hover:bg-brand-blue/90 dark:bg-sky-500 dark:hover:bg-sky-600 text-white font-bold py-4 md:py-5 text-lg md:text-xl mb-2.5" 
                onClick={onOpenPaymentModal}
              >
                <CheckCircle2 size={24} className="mr-2.5"/>
                Confirmar Pedido
              </Button>
              <Button 
                variant="outline" 
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 md:py-3.5 text-sm md:text-base border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600"
                onClick={onOpenClearConfirm}
              >
                <Trash2 size={18} className="mr-2 text-brand-red-dark dark:text-red-400" />
                Vaciar Pedido
              </Button>
            </footer>
          )}
        </div>
      );
    };

    export default OrderPanel;