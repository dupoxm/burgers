import { useState, useCallback } from 'react';
import { addCashTransactionToSupabase } from '../appContextActions';

export const useCashFundManagement = (toast, supabase) => {
  const [cashFund, setCashFund] = useState({ amount: 0, isSet: false });

  const loadCashFund = useCallback(() => {
    const savedFund = localStorage.getItem('cashFund');
    if (savedFund) {
      setCashFund(JSON.parse(savedFund));
    }
  }, []);

  const updateCashFundState = useCallback(async (amount, toastMessage) => {
    const numericAmount = parseFloat(amount);
    const newFund = { amount: numericAmount, isSet: true };
    setCashFund(newFund);
    localStorage.setItem('cashFund', JSON.stringify(newFund));
    localStorage.setItem('shiftStartTime', Date.now().toString());
    
    await addCashTransactionToSupabase(supabase, {
      transaction_type: 'initial_fund',
      amount: numericAmount,
      notes: 'Fondo inicial de caja'
    });
    
    toast({ title: "Turno Iniciado", description: toastMessage, duration: 7000 });
  }, [toast, supabase]);

  const addCashToFund = useCallback(async (amount, notes) => {
    const numericAmount = parseFloat(amount);
    
    await addCashTransactionToSupabase(supabase, {
      transaction_type: 'add_fund',
      amount: numericAmount,
      notes: notes
    });

    toast({ title: "Fondo Agregado", description: `Se agregaron ${numericAmount.toFixed(2)} a la caja.` });
  }, [toast, supabase]);

  const addExpense = useCallback(async (amount, category, notes) => {
    const numericAmount = parseFloat(amount);
    
    await addCashTransactionToSupabase(supabase, {
      transaction_type: 'expense',
      amount: numericAmount,
      category: category,
      notes: notes
    });

    toast({ title: "Gasto Registrado", description: `Se registró un gasto de ${numericAmount.toFixed(2)}.` });
  }, [toast, supabase]);

  const performCashCut = useCallback(() => {
    setCashFund({ amount: 0, isSet: false });
    localStorage.removeItem('cashFund');
    localStorage.removeItem('shiftStartTime');
    toast({ title: "Corte de Caja Realizado", description: "El turno ha finalizado. Ingresa el nuevo fondo para comenzar.", duration: 7000 });
    setTimeout(() => window.location.reload(), 1000);
  }, [toast]);

  return { 
    cashFund, 
    setCashFund, 
    updateCashFund: updateCashFundState, 
    loadCashFund,
    addCashToFund,
    addExpense,
    performCashCut
  };
};