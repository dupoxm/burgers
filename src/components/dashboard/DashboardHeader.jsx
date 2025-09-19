
import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarPlus as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import DashboardActions from './DashboardActions';

const DashboardHeader = ({ dateRange, handleSetDateRange, handleCustomDateChange, activeDatePreset, onAddFund, onCashCut }) => {
  return (
    <header className="mb-6 md:mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-brand-red-medium">Dashboard</h1>
          <p className="text-lg text-gray-600">Un resumen de la actividad de tu negocio.</p>
        </div>
        <DashboardActions onAddFund={onAddFund} onCashCut={onCashCut} />
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            variant={activeDatePreset === 'today' ? "default" : "outline"}
            onClick={() => handleSetDateRange('today')}
            className="bg-sky-500 hover:bg-sky-600 text-white data-[variant=outline]:bg-white data-[variant=outline]:text-sky-700 data-[variant=outline]:border-sky-500"
          >
            Hoy
          </Button>
          <Button
            variant={activeDatePreset === 'week' ? "default" : "outline"}
            onClick={() => handleSetDateRange('week')}
            className="bg-sky-500 hover:bg-sky-600 text-white data-[variant=outline]:bg-white data-[variant=outline]:text-sky-700 data-[variant=outline]:border-sky-500"
          >
            Esta Semana
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[220px] justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground",
                  activeDatePreset === 'custom' ? "bg-sky-500 text-white hover:bg-sky-600 border-sky-500" : "bg-white text-sky-700 border-sky-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    `${format(dateRange.from, "LLL dd, y", { locale: es })} - ${format(dateRange.to, "LLL dd, y", { locale: es })}`
                  ) : (
                    format(dateRange.from, "LLL dd, y", { locale: es })
                  )
                ) : (
                  <span>Elige un rango</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={handleCustomDateChange}
                numberOfMonths={2}
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>
    </header>
  );
};

export default DashboardHeader;
