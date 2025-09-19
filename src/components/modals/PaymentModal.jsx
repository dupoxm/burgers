import React, { useState, useEffect, useRef, useMemo } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
    import { CheckCircle, CreditCard, DollarSign, Landmark, Smartphone, ArrowLeft, X, Globe } from 'lucide-react';
    import { PAYMENT_METHODS } from '@/data';
    import { cn } from "@/lib/utils";
    import { ScrollArea } from '@/components/ui/scroll-area';

    const paymentIcons = {
      cash: <DollarSign className="mr-2 h-5 w-5" />,
      card: <CreditCard className="mr-2 h-5 w-5" />,
      transfer: <Landmark className="mr-2 h-5 w-5" />,
      mercadopago: <Smartphone className="mr-2 h-5 w-5" />,
      dollars: <Globe className="mr-2 h-5 w-5" />,
    };

    const modalVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeInOut" } },
      exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeInOut" } },
    };
    
    const PaymentModal = ({ orderTotal, isOpen, onClose, onConfirmPayment }) => {
      const [currentView, setCurrentView] = useState('selectMethod'); 
      const [paymentMethod, setPaymentMethod] = useState(null);
      const [amountPaid, setAmountPaid] = useState('');
      const [change, setChange] = useState(0);
      const [exchangeRate, setExchangeRate] = useState('');
      const amountInputRef = useRef(null);
      const exchangeRateInputRef = useRef(null);

      const totalInUSD = useMemo(() => {
        const rate = parseFloat(exchangeRate);
        if (rate > 0) {
          return (orderTotal / rate).toFixed(2);
        }
        return '0.00';
      }, [orderTotal, exchangeRate]);

      useEffect(() => {
        if (isOpen) {
          setCurrentView('selectMethod');
          setPaymentMethod(null); 
          setAmountPaid(''); 
          setChange(0);
          setExchangeRate('');
        }
      }, [isOpen]);

      useEffect(() => {
        if (paymentMethod && paymentMethod !== 'cash' && paymentMethod !== 'dollars' && currentView === 'selectMethod') {
            setAmountPaid(orderTotal.toFixed(2));
            setChange(0);
        } else if ((paymentMethod === 'cash' || paymentMethod === 'dollars') && currentView === 'selectMethod') {
             setAmountPaid('');
             setChange(0);
        }
      }, [paymentMethod, orderTotal, currentView]);
    
      const handleAmountPaidChange = (e) => {
        const value = e.target.value;
        setAmountPaid(value);
        const numericAmount = parseFloat(value);
        if (!isNaN(numericAmount) && numericAmount >= orderTotal) {
          setChange(numericAmount - orderTotal);
        } else {
          setChange(0);
        }
      };

      const handleExchangeRateChange = (e) => {
        setExchangeRate(e.target.value);
      };

      const handleConfirm = () => {
        if (!paymentMethod) {
          alert("Por favor, selecciona un método de pago.");
          return;
        }
        
        let paymentDetails = {
          method: paymentMethod,
          total: orderTotal
        };

        if (paymentMethod === 'cash') {
          const numericAmountPaid = parseFloat(amountPaid);
          if (isNaN(numericAmountPaid) || numericAmountPaid < orderTotal) {
            alert("El monto pagado debe ser mayor o igual al total para pagos en efectivo.");
            return;
          }
          paymentDetails.amountPaid = numericAmountPaid;
          paymentDetails.change = change;
        } else if (paymentMethod === 'dollars') {
          const rate = parseFloat(exchangeRate);
          if (isNaN(rate) || rate <= 0) {
            alert("Por favor, ingresa un tipo de cambio válido.");
            return;
          }
          paymentDetails.amountPaid = orderTotal;
          paymentDetails.change = 0;
          paymentDetails.exchangeRate = rate;
          paymentDetails.totalInUSD = parseFloat(totalInUSD);
        } else {
          paymentDetails.amountPaid = orderTotal;
          paymentDetails.change = 0;
        }

        onConfirmPayment(paymentDetails);
        onClose(); 
      };

      const handlePaymentMethodSelect = (selectedMethodId) => {
        setPaymentMethod(selectedMethodId);
        if (selectedMethodId === 'cash') {
          setCurrentView('enterCashAmount');
           setAmountPaid(''); 
           setChange(0);
        } else if (selectedMethodId === 'dollars') {
          setCurrentView('enterDollarExchangeRate');
          setExchangeRate('');
        } else {
          setAmountPaid(orderTotal.toFixed(2)); 
          setChange(0);
        }
      };
      
      useEffect(() => {
        if (currentView === 'enterCashAmount' && amountInputRef.current) {
          setTimeout(() => amountInputRef.current.focus(), 100); 
        }
        if (currentView === 'enterDollarExchangeRate' && exchangeRateInputRef.current) {
          setTimeout(() => exchangeRateInputRef.current.focus(), 100);
        }
      }, [currentView]);

      const isConfirmDisabled = () => {
        if (!paymentMethod) return true;
        if (paymentMethod === 'cash') {
          if (currentView === 'selectMethod') return true; 
          return parseFloat(amountPaid) < orderTotal || isNaN(parseFloat(amountPaid));
        }
        if (paymentMethod === 'dollars') {
          const rate = parseFloat(exchangeRate);
          return isNaN(rate) || rate <= 0;
        }
        return false;
      };

      const renderSelectMethodView = () => (
        <motion.div
          key="selectMethod"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalVariants}
          className="flex flex-col items-center justify-center p-4 sm:p-6 space-y-4 sm:space-y-6 w-full"
        >
          <Label className="text-md sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2 block self-start">Método de Pago</Label>
          <RadioGroup value={paymentMethod || ""} onValueChange={handlePaymentMethodSelect} className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full">
            {PAYMENT_METHODS.map((method) => (
              <Label 
                key={method.id}
                htmlFor={`payment-${method.id}`}
                className={cn(
                  "flex items-center justify-center p-3 sm:p-3.5 border rounded-lg cursor-pointer transition-all duration-200 ease-in-out",
                  "text-xs sm:text-sm font-medium",
                  paymentMethod === method.id 
                    ? "bg-brand-blue/10 border-brand-blue text-brand-blue ring-2 ring-brand-blue shadow-md" 
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-100"
                )}
              >
                <RadioGroupItem value={method.id} id={`payment-${method.id}`} className="sr-only" />
                {React.cloneElement(paymentIcons[method.id], { className: "mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" })}
                {method.name}
              </Label>
            ))}
          </RadioGroup>
        </motion.div>
      );

      const renderEnterCashAmountView = () => (
        <motion.div
          key="enterCashAmount"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalVariants}
          className="flex flex-col items-center justify-center p-4 sm:p-6 space-y-3 sm:space-y-4 w-full relative"
        >
          <Button 
            variant="ghost" 
            onClick={() => setCurrentView('selectMethod')} 
            className="absolute top-3 left-3 sm:top-4 sm:left-4 text-gray-600 hover:text-brand-blue px-1.5 py-0.5 sm:px-2 sm:py-1"
          >
            <ArrowLeft size={18} className="mr-0.5 sm:mr-1" /> Volver
          </Button>
          <Label htmlFor="amount-paid" className="text-md sm:text-lg font-semibold text-gray-700 mt-6 sm:mt-8">Monto Pagado (Efectivo)</Label>
          <Input 
            id="amount-paid"
            ref={amountInputRef} 
            type="number" 
            placeholder="Ej: 250.00" 
            value={amountPaid}
            onChange={handleAmountPaidChange}
            onFocus={(e) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            min={orderTotal.toString()}
            step="0.01"
            className="h-11 sm:h-12 text-sm sm:text-base px-3 py-2.5 sm:px-4 sm:py-3 border-gray-300 focus:border-brand-blue focus:ring-brand-blue rounded-lg w-full text-center"
          />
          {amountPaid && parseFloat(amountPaid) >= orderTotal && (
            <div className="text-lg sm:text-xl font-semibold text-center py-1.5 sm:py-2 bg-green-50 text-brand-green rounded-lg w-full">
              Cambio: ${change.toFixed(2)}
            </div>
          )}
        </motion.div>
      );

      const renderEnterDollarExchangeRateView = () => (
        <motion.div
          key="enterDollarExchangeRate"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalVariants}
          className="flex flex-col items-center justify-center p-4 sm:p-6 space-y-3 sm:space-y-4 w-full relative"
        >
          <Button 
            variant="ghost" 
            onClick={() => setCurrentView('selectMethod')} 
            className="absolute top-3 left-3 sm:top-4 sm:left-4 text-gray-600 hover:text-brand-blue px-1.5 py-0.5 sm:px-2 sm:py-1"
          >
            <ArrowLeft size={18} className="mr-0.5 sm:mr-1" /> Volver
          </Button>
          <Label htmlFor="exchange-rate" className="text-md sm:text-lg font-semibold text-gray-700 mt-6 sm:mt-8">Tipo de Cambio (USD)</Label>
          <Input 
            id="exchange-rate"
            ref={exchangeRateInputRef} 
            type="number" 
            placeholder="Ej: 17.50" 
            value={exchangeRate}
            onChange={handleExchangeRateChange}
            onFocus={(e) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            step="0.01"
            className="h-11 sm:h-12 text-sm sm:text-base px-3 py-2.5 sm:px-4 sm:py-3 border-gray-300 focus:border-brand-blue focus:ring-brand-blue rounded-lg w-full text-center"
          />
          {parseFloat(exchangeRate) > 0 && (
            <div className="text-lg sm:text-xl font-semibold text-center py-1.5 sm:py-2 bg-blue-50 text-brand-blue rounded-lg w-full">
              Total en Dólares: ${totalInUSD}
            </div>
          )}
        </motion.div>
      );

      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent 
            className={cn(
                "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-0 border bg-white shadow-lg duration-200",
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
                "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
                "max-w-[90vw] sm:max-w-lg p-0 rounded-xl flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
            )}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b text-center relative">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-brand-blue">Finalizar Pedido</DialogTitle>
              <DialogDescription className="text-sm sm:text-base text-gray-600">Total: <span className="font-bold text-brand-blue">${orderTotal.toFixed(2)}</span></DialogDescription>
              <button onClick={onClose} className="absolute right-3 top-3 sm:right-4 sm:top-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                 <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                 <span className="sr-only">Cerrar</span>
              </button>
            </DialogHeader>
            
            <ScrollArea className="flex-grow">
              <AnimatePresence mode="wait">
                {currentView === 'selectMethod' && renderSelectMethodView()}
                {currentView === 'enterCashAmount' && renderEnterCashAmountView()}
                {currentView === 'enterDollarExchangeRate' && renderEnterDollarExchangeRateView()}
              </AnimatePresence>
            </ScrollArea>

            <DialogFooter className="p-4 sm:p-6 pt-3 sm:pt-4 border-t mt-auto sm:justify-between gap-2 sm:gap-3 flex-col sm:flex-row">
              <Button 
                variant="outline" 
                onClick={currentView !== 'selectMethod' ? () => setCurrentView('selectMethod') : onClose}
                className="h-11 sm:h-12 text-sm sm:text-base px-4 sm:px-6 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg w-full sm:w-auto"
              >
                {currentView !== 'selectMethod' ? 'Cambiar Método' : 'Cancelar'}
              </Button>
              <Button 
                className="bg-brand-green hover:bg-brand-green/90 text-white h-11 sm:h-12 text-sm sm:text-base px-4 sm:px-6 font-semibold rounded-lg w-full sm:w-auto" 
                onClick={handleConfirm}
                disabled={isConfirmDisabled()}
              >
                <CheckCircle size={20} className="mr-1.5 sm:mr-2"/> Confirmar y Pagar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };
    export default PaymentModal;