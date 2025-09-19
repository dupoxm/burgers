import React from 'react';
import StatCard from './StatCard';
import { DollarSign, ShoppingBag, Wallet, Activity, CreditCard, PackageCheck } from 'lucide-react';
import { isSameDay } from 'date-fns';

const KeyMetrics = ({ data, activeDatePreset, dateRange }) => {
  const stats = [
    {
      title: 'Ventas (Rango)',
      value: `$${data.totalSalesInRange.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pedidos (Rango)',
      value: data.totalOrdersInRange,
      icon: ShoppingBag,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Dinero Real en Caja (Hoy)',
      value: `$${data.netCashAfterFund.toFixed(2)}`,
      icon: Wallet,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      condition: activeDatePreset === 'today' || (dateRange.from && dateRange.to && isSameDay(dateRange.from, new Date()) && isSameDay(dateRange.to, new Date()))
    },
    {
      title: 'Ticket Promedio (Rango)',
      value: `$${data.averageOrderValueInRange.toFixed(2)}`,
      icon: Activity,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50'
    },
    {
      title: 'Ingresos Efectivo (Rango)',
      value: `$${data.salesByCashInRange.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-teal-500',
      bgColor: 'bg-teal-50'
    },
    {
      title: 'Ingresos Tarjeta (Rango)',
      value: `$${data.salesByCardInRange.toFixed(2)}`,
      icon: CreditCard,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Productos Activos',
      value: data.totalProducts,
      icon: PackageCheck,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50'
    }
  ].filter(stat => stat.condition === undefined || stat.condition);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default KeyMetrics;