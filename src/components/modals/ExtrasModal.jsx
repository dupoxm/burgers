import React, { useState, useEffect } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { ScrollArea } from '@/components/ui/scroll-area';
    import { PlusCircle, MinusCircle } from 'lucide-react';
    import { EXTRA_INGREDIENTS } from '@/data';

    const ExtrasModal = ({ item, isOpen, onClose, onAddExtra, onUpdateExtraQuantity }) => {
      const [currentExtras, setCurrentExtras] = useState([]);

      useEffect(() => {
        if (item && item.extras) {
          setCurrentExtras([...item.extras]);
        } else {
          setCurrentExtras([]);
        }
      }, [item]);
    
      if (!item) return null;
    
      const handleExtraQuantityChange = (extra, change) => {
        const existing = currentExtras.find(e => e.id === extra.id);
        let newQuantity = (existing ? existing.quantity : 0) + change;
        newQuantity = Math.max(0, newQuantity);
    
        if (newQuantity === 0) {
          setCurrentExtras(currentExtras.filter(e => e.id !== extra.id));
        } else if (existing) {
          setCurrentExtras(currentExtras.map(e => e.id === extra.id ? { ...e, quantity: newQuantity } : e));
        } else {
          setCurrentExtras([...currentExtras, { ...extra, quantity: 1 }]);
        }
      };
    
      const handleConfirmExtras = () => {
        const originalExtras = item.extras || [];
        
        originalExtras.forEach(originalExtra => {
          if (!currentExtras.find(ce => ce.id === originalExtra.id)) {
            onUpdateExtraQuantity(item.id, item.isCombo, originalExtra.id, 0); 
          }
        });
    
        currentExtras.forEach(extraInModal => {
          const originalExtra = originalExtras.find(oe => oe.id === extraInModal.id);
          if (originalExtra) {
            // If extra already existed, update its quantity
             if (originalExtra.quantity !== extraInModal.quantity) {
                onUpdateExtraQuantity(item.id, item.isCombo, extraInModal.id, extraInModal.quantity);
            }
          } else {
            // If it's a new extra, add it (the context function should handle adding it with its quantity)
            onAddExtra(item.id, item.isCombo, extraInModal);
          }
        });
        onClose();
      };

      const calculateTotalExtras = () => {
        return currentExtras.reduce((total, extra) => total + (extra.price * extra.quantity), 0);
      };
    
      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Agregar Extras a {item.name}</DialogTitle>
              <DialogDescription>Selecciona los ingredientes adicionales y sus cantidades.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[300px] my-4 pr-3">
              <div className="space-y-3">
                {EXTRA_INGREDIENTS.map(extra => {
                  const currentQuantity = currentExtras.find(e => e.id === extra.id)?.quantity || 0;
                  return (
                    <div key={extra.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div>
                        <span className="mr-2">{extra.emoji}</span>
                        <span>{extra.name}</span>
                        <span className="text-xs text-gray-500 ml-2">(${extra.price.toFixed(2)})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleExtraQuantityChange(extra, -1)} disabled={currentQuantity === 0}>
                          <MinusCircle size={16} />
                        </Button>
                        <span className="w-5 text-center">{currentQuantity}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleExtraQuantityChange(extra, 1)}>
                          <PlusCircle size={16} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <div className="mt-4 text-right font-semibold">
              Total Extras: ${calculateTotalExtras().toFixed(2)}
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button className="bg-brand-green hover:bg-brand-green/90" onClick={handleConfirmExtras}>Agregar Extras</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };
    export default ExtrasModal;