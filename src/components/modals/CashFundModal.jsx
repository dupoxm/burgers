import React, { useState } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { useAppContext } from '@/contexts/AppContext';
    import { format } from 'date-fns';
    import { es } from 'date-fns/locale';

    const CashFundModal = () => {
      const { updateCashFund } = useAppContext();
      const [amount, setAmount] = useState('');

      const handleSubmit = (e) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (!isNaN(numericAmount) && numericAmount >= 0) {
          const startTime = new Date();
          const toastMessage = `Inicio de turno: ${format(startTime, 'PPP p', { locale: es })}. Se añadieron $${numericAmount.toFixed(2)} a fondo de caja.`;
          updateCashFund(numericAmount, toastMessage);
        }
      };

      return (
        <Dialog open={true} onOpenChange={() => { /* Prevent closing by overlay click */ }}>
          <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()} showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>Fondo de Caja Inicial</DialogTitle>
              <DialogDescription>
                Ingresa la cantidad de dinero con la que inicia el fondo de caja para comenzar a operar.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cash-amount" className="text-right col-span-1">
                    Monto
                  </Label>
                  <Input
                    id="cash-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="col-span-3"
                    placeholder="Ej: 500.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-brand-blue hover:bg-brand-blue/90 text-white">Iniciar Turno</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );
    };

    export default CashFundModal;