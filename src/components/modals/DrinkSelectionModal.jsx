import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { cn } from "@/lib/utils";

const DrinkSelectionModal = ({ 
  isOpen, 
  onClose, 
  onSelectDrink, 
  mainProduct 
}) => {
  const { products } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const availableDrinks = useMemo(() => {
    return products.filter(product => 
      product.category === 'drinks' && 
      product.is_available &&
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleSelectDrink = (drink) => {
    onSelectDrink(drink);
    onClose();
    setSearchTerm('');
  };

  const handleClose = () => {
    onClose();
    setSearchTerm('');
  };

  if (!isOpen || !mainProduct) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full mx-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold text-brand-blue dark:text-sky-400 flex items-center">
            🥤 Selecciona tu Bebida
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Completa tu combo de <span className="font-semibold">{mainProduct.name}</span> eligiendo una bebida.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar bebidas..."
              className="pl-9 pr-3 py-2 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>

          <ScrollArea className="h-80 w-full">
            <div className="space-y-2">
              {availableDrinks.length > 0 ? (
                availableDrinks.map(drink => (
                  <div
                    key={drink.id}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all duration-200",
                      "hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 dark:hover:border-blue-600",
                      "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    )}
                    onClick={() => handleSelectDrink(drink)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{drink.emoji}</span>
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                            {drink.name}
                          </h3>
                          {drink.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {drink.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                         <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300">
                          Incluida
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No se encontraron bebidas' : 'No hay bebidas disponibles'}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full"
          >
            <X size={16} className="mr-2" />
            Cancelar Combo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DrinkSelectionModal;