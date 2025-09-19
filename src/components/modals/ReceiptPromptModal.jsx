import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';

const PAPER_OPTIONS = [
  { label: '58 mm', value: 58 },
  { label: '80 mm', value: 80 },
];

const ReceiptPromptModal = ({
  isOpen,
  isGenerating,
  paperWidth,
  onPaperWidthChange,
  onConfirm,
  onCancel,
  hasPreviousReceipt,
  onOpenPreviousReceipt,
}) => {
  const handleOpenChange = (open) => {
    if (!open && !isGenerating) {
      onCancel();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          'max-w-[90vw] sm:max-w-md rounded-xl shadow-xl border bg-white p-0',
          'data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in-0',
          'data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out-0'
        )}
      >
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold text-brand-blue flex items-center gap-2">
            <Printer className="h-5 w-5 text-brand-green" />
            Finalizar Pedido
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            ¿Deseas generar recibo?
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-2">
          <div className="mb-4">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Formato de papel</Label>
            <RadioGroup
              value={String(paperWidth)}
              onValueChange={(value) => onPaperWidthChange(Number(value))}
              className="grid grid-cols-2 gap-2"
              disabled={isGenerating}
            >
              {PAPER_OPTIONS.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`receipt-paper-${option.value}`}
                  className={cn(
                    'flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                    valueIsSelected(paperWidth, option.value)
                      ? 'border-brand-green bg-brand-green/10 text-brand-green shadow-sm'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-brand-green/40 hover:bg-brand-green/5'
                  )}
                >
                  <RadioGroupItem
                    id={`receipt-paper-${option.value}`}
                    value={String(option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </Label>
              ))}
            </RadioGroup>
          </div>

          {hasPreviousReceipt && (
            <Button
              type="button"
              variant="outline"
              onClick={onOpenPreviousReceipt}
              disabled={isGenerating}
              className="w-full justify-center text-sm mb-4"
            >
              Volver a abrir último recibo
            </Button>
          )}
        </div>

        <DialogFooter className="px-6 pb-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isGenerating}
            className="w-full sm:w-auto border-gray-300 text-gray-700"
          >
            No
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isGenerating}
            className="w-full sm:w-auto bg-brand-green text-white hover:bg-brand-green/90"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generando...
              </span>
            ) : (
              'Sí, generar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const valueIsSelected = (currentValue, optionValue) => Number(currentValue) === Number(optionValue);

export default ReceiptPromptModal;
