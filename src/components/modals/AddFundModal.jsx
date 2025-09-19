
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/contexts/AppContext';

const AddFundModal = ({ isOpen, onClose }) => {
  const { addCashToFund } = useAppContext();
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      // Basic validation feedback needed
      return;
    }
    
    setIsSubmitting(true);
    await addCashToFund(numericAmount, notes || 'Fondo agregado');
    setIsSubmitting(false);
    setAmount('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Fondo a Caja</DialogTitle>
          <DialogDescription>
            Registra una entrada de dinero a la caja. Se sumará al fondo actual.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="fund-amount" className="text-right">
                Monto a Agregar
              </Label>
              <Input
                id="fund-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ej: 100.00"
                required
                min="0.01"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="fund-notes">
                Notas (Opcional)
              </Label>
              <Textarea
                id="fund-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Reposición para cambio"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-500 hover:bg-green-600" disabled={isSubmitting}>
              {isSubmitting ? 'Agregando...' : 'Agregar Fondo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFundModal;
