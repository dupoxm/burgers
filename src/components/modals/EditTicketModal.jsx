import React from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { ScrollArea } from '@/components/ui/scroll-area';
    import { AlertTriangle, Info } from 'lucide-react';

    const EditTicketModal = ({ isOpen, onClose, ticket, onSaveChanges }) => {
      if (!ticket) return null;

      const handleSave = () => {
        onSaveChanges(ticket); 
      };

      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-lg md:max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-brand-blue">Editar Ticket #{ticket.id.toString().slice(-6)}</DialogTitle>
              <DialogDescription className="text-gray-600">
                Modifica los detalles del ticket. Actualmente, la edición completa está en desarrollo.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-grow overflow-y-auto p-1">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-3 rounded-md mb-4 flex items-start">
                <AlertTriangle size={20} className="mr-2 shrink-0 mt-0.5" />
                <p className="text-sm">
                  <strong>Funcionalidad en Desarrollo:</strong> La capacidad de modificar productos, cantidades y recalcular inventario y totales está en construcción. Por ahora, puedes ver los detalles y simular guardar cambios.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Información General</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <p><strong className="text-gray-600">ID Ticket:</strong> {ticket.id}</p>
                    <p><strong className="text-gray-600">Fecha:</strong> {new Date(ticket.order_timestamp || ticket.created_at).toLocaleString('es-ES')}</p>
                    <p><strong className="text-gray-600">Total:</strong> ${ticket.total_amount.toFixed(2)}</p>
                    <p><strong className="text-gray-600">Método de Pago:</strong> {ticket.payment_method}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Items del Pedido</h3>
                  {ticket.items && ticket.items.length > 0 ? (
                    <ScrollArea className="h-48 border rounded-md p-3 bg-gray-50">
                      <ul className="space-y-2">
                        {ticket.items.map((item, index) => (
                          <li key={`${item.id || item.productId}-${index}`} className="p-2 bg-white rounded shadow-sm">
                            <p className="font-medium text-gray-700">{item.quantity}x {item.name}</p>
                            <p className="text-xs text-gray-500">Precio unitario: ${item.priceAtPurchase.toFixed(2)}</p>
                            {item.extras && item.extras.length > 0 && (
                                <p className="text-xs text-blue-500">Extras: {item.extras.map(e => e.name).join(', ')}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  ) : (
                    <p className="text-gray-500">No hay ítems en este ticket.</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="ticketNotes" className="block text-lg font-semibold text-gray-800 mb-1">Notas / Observaciones</label>
                  <textarea
                    id="ticketNotes"
                    rows="3"
                    defaultValue={ticket.notes || ''} 
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-blue focus:border-transparent text-sm"
                    placeholder="Añade notas o comentarios sobre el pedido..."
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4 pt-4 border-t">
              <Button variant="outline" onClick={onClose} className="mr-2">Cancelar</Button>
              <Button onClick={handleSave} className="bg-brand-blue hover:bg-brand-blue/90 text-white">
                Guardar Cambios (Simulado)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default EditTicketModal;