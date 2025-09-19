import React, { useState, useEffect, useMemo } from 'react';
    import { useAppContext } from '@/contexts/AppContext';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { ScrollArea } from '@/components/ui/scroll-area';
    import { Button } from '@/components/ui/button';
    import { FileText, CalendarDays, CreditCard, ShoppingBag, Tag, TrendingUp, AlertCircle, Hash, Clock, DollarSign, ListOrdered, CheckCircle, Coffee, Loader2, Trash2, Edit3, Filter, Calendar as CalendarIcon } from 'lucide-react';
    import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
    import { Calendar } from '@/components/ui/calendar';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
    import EditTicketModal from '@/components/modals/EditTicketModal';
    import { useToast } from '@/components/ui/use-toast';
    import { format, startOfWeek, endOfWeek, startOfDay, endOfDay, parseISO, isSameDay } from 'date-fns';
    import { es } from 'date-fns/locale';
    import { cn } from "@/lib/utils";

    const getPaymentMethodIcon = (method) => {
      switch (method?.toLowerCase()) {
        case 'efectivo':
          return <DollarSign size={16} className="mr-1.5 text-green-500" />;
        case 'tarjeta':
          return <CreditCard size={16} className="mr-1.5 text-blue-500" />;
        default:
          return <ShoppingBag size={16} className="mr-1.5 text-gray-500" />;
      }
    };

    const TicketCardModern = ({ ticket, onDelete, onEdit }) => {
      const date = new Date(ticket.order_timestamp || ticket.timestamp || ticket.created_at);
      const formattedDate = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const formattedTime = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      
      const paymentMethod = ticket.payment_method || (ticket.paymentDetails ? ticket.paymentDetails.method : 'No especificado');
      const totalAmount = ticket.total_amount !== undefined ? ticket.total_amount : (ticket.totalAmount || 0);

      return (
        <Card className="mb-4 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out border-l-4 border-brand-blue rounded-r-lg rounded-l-md overflow-hidden bg-white relative group">
          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600 hover:bg-blue-100" onClick={() => onEdit(ticket)}>
              <Edit3 size={16} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:bg-red-100" onClick={() => onDelete(ticket.id)}>
              <Trash2 size={16} />
            </Button>
          </div>
          <CardHeader className="p-4 bg-gradient-to-r from-slate-50 to-gray-100">
            <div className="flex justify-between items-center mb-1">
              <CardTitle className="text-lg font-bold text-brand-blue flex items-center">
                <Hash size={18} className="mr-2 opacity-80" /> Ticket #...{ticket.id.toString().slice(-6)}
              </CardTitle>
              <div className="text-xs text-gray-500 flex flex-col items-end">
                <div className="flex items-center">
                  <CalendarDays size={14} className="mr-1 opacity-70" /> {formattedDate}
                </div>
                <div className="flex items-center">
                  <Clock size={14} className="mr-1 opacity-70" /> {formattedTime}
                </div>
              </div>
            </div>
            <CardDescription className="text-sm flex items-center justify-between text-gray-600 pt-1">
              <span className="flex items-center">{getPaymentMethodIcon(paymentMethod)} {paymentMethod}</span>
              <span className="font-bold text-brand-green text-base">${totalAmount.toFixed(2)}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 text-sm">
            <h4 className="font-semibold mb-2 text-gray-700 flex items-center">
              <ListOrdered size={16} className="mr-2 opacity-80" /> Items del Pedido:
            </h4>
            {ticket.items && ticket.items.length > 0 ? (
              <ul className="space-y-1.5 pl-1">
                {ticket.items.map((item, index) => (
                  <li key={`${item.id || item.productId}-${item.isCombo}-${index}`} className="flex justify-between items-center text-gray-600 hover:bg-slate-50 p-1 rounded-md">
                    <span>{item.quantity}x {item.name} {item.emoji || ''}</span>
                    <span className="font-medium text-gray-700">${(item.priceAtPurchase !== undefined ? item.priceAtPurchase : (item.price * item.quantity)).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
                 <p className="text-gray-500 italic">No hay ítems en este ticket.</p>
            )}
             {ticket.items && ticket.items.some(item => item.extras && item.extras.length > 0) && (
              <div className="mt-3 pt-2 border-t border-gray-200">
                <h5 className="text-xs font-semibold text-gray-500 mb-1 flex items-center"><Coffee size={14} className="mr-1.5 opacity-70"/>Detalles de Extras:</h5>
                {ticket.items.map((item, index) => (
                  item.extras && item.extras.length > 0 && (
                    <div key={`extras-${item.id || item.productId}-${index}`} className="text-xs text-gray-500 pl-2 mb-0.5">
                      <span className="font-medium">{item.name}:</span> {item.extras.map(ex => `${ex.name} (x${ex.quantity || 1})`).join(', ')}
                    </div>
                  )
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      );
    };

    const TicketsPage = () => {
      const { completedTickets, isLoading, fetchCompletedTickets, deleteTicket } = useAppContext();
      const { toast } = useToast();
      const [dateRange, setDateRange] = useState(null); // null for all tickets, or { from, to }
      const [activeDatePreset, setActiveDatePreset] = useState('all');
      const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
      const [ticketToDeleteId, setTicketToDeleteId] = useState(null);
      const [isEditModalOpen, setIsEditModalOpen] = useState(false);
      const [ticketToEdit, setTicketToEdit] = useState(null);
      const [localLoading, setLocalLoading] = useState(false);

      useEffect(() => {
        setLocalLoading(true);
        fetchCompletedTickets(dateRange).finally(() => setLocalLoading(false));
      }, [dateRange, fetchCompletedTickets]);

      const handleSetDateRangePreset = (preset) => {
        setActiveDatePreset(preset);
        let newRange = null;
        const today = new Date();
        switch(preset) {
          case 'today':
            newRange = { from: startOfDay(today), to: endOfDay(today) };
            break;
          case 'week':
            newRange = { from: startOfWeek(today, { locale: es }), to: endOfWeek(today, { locale: es }) };
            break;
          case 'all':
          default:
            newRange = null; // fetch all
            break;
        }
        setDateRange(newRange);
      };
      
      const handleCustomDateChange = (range) => {
        if (range?.from && range?.to) {
            setDateRange({ 
                from: startOfDay(range.from), 
                to: endOfDay(range.to) 
            });
            setActiveDatePreset('custom');
        } else if (range?.from) { 
            setDateRange({ 
                from: startOfDay(range.from), 
                to: endOfDay(range.from) 
            });
            setActiveDatePreset('custom');
        } else { // If range is cleared or invalid
            setDateRange(null);
            setActiveDatePreset('all');
        }
      };

      const handleDeleteTicket = (id) => {
        setTicketToDeleteId(id);
        setIsConfirmDeleteDialogOpen(true);
      };

      const confirmDelete = async () => {
        if (ticketToDeleteId) {
          const success = await deleteTicket(ticketToDeleteId);
          if (success) {
            toast({ title: "Ticket Eliminado", description: "El ticket ha sido borrado de la base de datos."});
          } else {
            toast({ title: "Error", description: "No se pudo eliminar el ticket.", variant: "destructive"});
          }
          setTicketToDeleteId(null);
        }
        setIsConfirmDeleteDialogOpen(false);
      };

      const handleEditTicket = (ticket) => {
        setTicketToEdit(ticket);
        setIsEditModalOpen(true);
      };
      
      const handleSaveChangesFromModal = (editedTicket) => {
        toast({
          title: "Cambios Guardados (Simulado)",
          description: `Los cambios para el ticket #${editedTicket.id.toString().slice(-6)} han sido guardados (simulación). La edición completa está en desarrollo.`,
          variant: "info",
          duration: 5000,
        });
        setIsEditModalOpen(false);
      };


      const sortedTickets = useMemo(() => {
        if (!completedTickets) return [];
        return [...completedTickets].sort((a, b) => 
          new Date(b.order_timestamp || b.timestamp || b.created_at) - new Date(a.order_timestamp || a.timestamp || a.created_at)
        );
      }, [completedTickets]);

      const currentLoadingState = isLoading || localLoading;

      return (
        <div className="p-4 sm:p-6 md:p-8 flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-100 to-gray-200 h-full">
          <header className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-red-dark flex items-center">
                        <FileText size={32} className="mr-3 text-brand-blue" /> Historial de Tickets 
                        {!currentLoadingState && (
                             <span className="ml-2 text-brand-blue bg-blue-100 px-3 py-1 rounded-full text-lg md:text-xl">
                                {sortedTickets.length}
                            </span>
                        )}
                    </h1>
                    <p className="text-sm text-gray-600 mt-1 ml-12">Consulta todos los pedidos completados y sus detalles.</p>
                </div>
                <div className="mt-4 sm:mt-0 flex flex-wrap gap-2 items-center">
                    <Button variant={activeDatePreset === 'all' ? "default" : "outline"} onClick={() => handleSetDateRangePreset('all')} className="bg-sky-500 hover:bg-sky-600 text-white data-[variant=outline]:bg-white data-[variant=outline]:text-sky-700 data-[variant=outline]:border-sky-500">Todos</Button>
                    <Button variant={activeDatePreset === 'today' ? "default" : "outline"} onClick={() => handleSetDateRangePreset('today')} className="bg-sky-500 hover:bg-sky-600 text-white data-[variant=outline]:bg-white data-[variant=outline]:text-sky-700 data-[variant=outline]:border-sky-500">Hoy</Button>
                    <Button variant={activeDatePreset === 'week' ? "default" : "outline"} onClick={() => handleSetDateRangePreset('week')} className="bg-sky-500 hover:bg-sky-600 text-white data-[variant=outline]:bg-white data-[variant=outline]:text-sky-700 data-[variant=outline]:border-sky-500">Esta Semana</Button>
                    <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-auto sm:w-[220px] justify-start text-left font-normal",
                            !dateRange?.from && activeDatePreset !== 'all' && "text-muted-foreground",
                            activeDatePreset === 'custom' ? "bg-sky-500 text-white hover:bg-sky-600 border-sky-500" : "bg-white text-sky-700 border-sky-500"
                        )}
                        >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                            dateRange.to ? (
                            `${format(dateRange.from, "LLL dd, y", { locale: es })} - ${format(dateRange.to, "LLL dd, y", { locale: es })}`
                            ) : (
                            format(dateRange.from, "LLL dd, y", { locale: es })
                            )
                        ) : (
                            <span>Elegir Fecha</span>
                        )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={handleCustomDateChange}
                        numberOfMonths={1} 
                        locale={es}
                        />
                    </PopoverContent>
                    </Popover>
                </div>
            </div>
          </header>

          {currentLoadingState ? (
             <div className="flex-grow flex flex-col items-center justify-center text-center p-6 bg-white rounded-xl shadow-md">
              <Loader2 className="h-16 w-16 animate-spin text-brand-blue mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-700">Cargando historial...</p>
              <p className="text-sm text-gray-500">Filtrando tickets, un momento por favor.</p>
            </div>
          ) : sortedTickets.length === 0 ? (
             <div className="flex-grow flex flex-col items-center justify-center text-center p-6 bg-white rounded-xl shadow-md">
              <AlertCircle size={64} className="text-yellow-500 mb-6" />
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">No hay tickets para el filtro seleccionado</h2>
              <p className="text-gray-500 max-w-md">Prueba con otro rango de fechas o revisa si hay órdenes completadas.</p>
              {activeDatePreset !== 'all' && (
                <Button className="mt-6" variant="outline" onClick={() => handleSetDateRangePreset('all')}>Ver Todos los Tickets</Button>
              )}
            </div>
          ) : (
            <ScrollArea className="flex-grow pr-1 md:pr-2 -mr-1 md:-mr-2 h-0 min-h-0"> 
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {sortedTickets.map(ticket => (
                  <TicketCardModern key={ticket.id} ticket={ticket} onDelete={handleDeleteTicket} onEdit={handleEditTicket} />
                ))}
              </div>
            </ScrollArea>
          )}

          <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro de eliminar este ticket?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. El ticket será eliminado permanentemente de la base de datos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Sí, Eliminar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {ticketToEdit && (
            <EditTicketModal 
              isOpen={isEditModalOpen} 
              onClose={() => setIsEditModalOpen(false)} 
              ticket={ticketToEdit}
              onSaveChanges={handleSaveChangesFromModal}
            />
          )}

        </div>
      );
    };

    export default TicketsPage;