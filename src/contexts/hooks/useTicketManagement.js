import { useState, useCallback } from 'react';
    import { fetchCompletedTicketsFromSupabase, deleteTicketFromSupabase, deleteAllTicketsFromSupabase } from '../appContextActions';

    export const useTicketManagement = (toast, supabase) => {
      const [completedTickets, setCompletedTickets] = useState([]);
      const [activeTicketId, setActiveTicketId] = useState(null);

      const fetchCompletedTicketsState = useCallback(async (dateRange = null) => {
        const { data, error } = await fetchCompletedTicketsFromSupabase(supabase, dateRange);
        if (error) {
          toast({ title: "Error", description: "No se pudieron cargar los tickets completados.", variant: "destructive" });
          setCompletedTickets([]);
        } else {
          setCompletedTickets(data.map(ticket => ({
            ...ticket, 
            totalAmount: ticket.total_amount,
            id: ticket.id.toString() 
          })));
        }
        return {data, error};
      }, [supabase, toast]);

      const deleteTicketState = useCallback(async (ticketId) => {
        const { error } = await deleteTicketFromSupabase(supabase, ticketId);
        if (error) {
          toast({ title: "Error al Eliminar", description: "No se pudo eliminar el ticket.", variant: "destructive" });
          return false;
        } else {
          toast({ title: "Ticket Eliminado", description: "El ticket ha sido eliminado exitosamente." });
          setCompletedTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
          return true;
        }
      }, [supabase, toast]);

      const deleteAllTicketsState = useCallback(async () => {
        const { error } = await deleteAllTicketsFromSupabase(supabase);
        if (error) {
          toast({ title: "Error al Eliminar Todos los Tickets", description: "No se pudieron eliminar todos los tickets.", variant: "destructive" });
          return false;
        } else {
          toast({ title: "Todos los Tickets Eliminados", description: "Se han borrado todos los tickets de la base de datos." });
          setCompletedTickets([]);
          return true;
        }
      }, [supabase, toast]);
      
      return { 
        completedTickets, 
        setCompletedTickets, 
        fetchCompletedTicketsState, 
        activeTicketId, 
        setActiveTicketId,
        deleteTicketState,
        deleteAllTicketsState
      };
    };