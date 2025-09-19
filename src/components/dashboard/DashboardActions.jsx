
import React from 'react';
import { Button } from '@/components/ui/button';
import { DollarSign, Scissors } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardActions = ({ onAddFund, onCashCut }) => {
  return (
    <motion.div
      className="flex flex-col sm:flex-row items-center gap-2"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Button
        onClick={onAddFund}
        className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white shadow-lg"
      >
        <DollarSign className="mr-2 h-4 w-4" />
        Agregar Fondo
      </Button>
      <Button
        onClick={onCashCut}
        className="w-full sm:w-auto bg-brand-red-medium hover:bg-brand-red-dark text-white shadow-lg"
      >
        <Scissors className="mr-2 h-4 w-4" />
        Corte de Caja
      </Button>
    </motion.div>
  );
};

export default DashboardActions;
