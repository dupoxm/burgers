import React, { useState, useEffect } from 'react';
    import { Settings as SettingsIcon, UserCircle2, Palette, Database, AlertTriangle, Save, Cloud, RefreshCw, LogOut, Lock, Trash2 as TrashIcon } from 'lucide-react';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Label } from '@/components/ui/label';
    import { Switch } from '@/components/ui/switch';
    import { Input } from '@/components/ui/input';
    import { useToast } from '@/components/ui/use-toast';
    import { useAppContext } from '@/contexts/AppContext';
    import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
    import { cn } from '@/lib/utils';

    const SettingsPage = () => {
      const { toast } = useToast();
      const { supabase, fetchProducts, fetchIngredients, fetchCompletedTickets, cashFund, currentOrder, deleteAllTickets } = useAppContext();
      const [currentUser, setCurrentUser] = useState(null);
      const [userProfile, setUserProfile] = useState({
        avatarUrl: '',
        username: '',
        fullName: '',
        contactEmail: '',
        phone: '',
      });
      const [isDarkMode, setIsDarkMode] = useState(false);
      const [passwordInput, setPasswordInput] = useState('');
      const [isDeleteAllTicketsModalOpen, setIsDeleteAllTicketsModalOpen] = useState(false);
      const ADMIN_PASSWORD = "Admin"; // Hardcoded password

      useEffect(() => {
        const fetchUser = async () => {
          if (supabase) {
            setCurrentUser({ id: 'SupabaseConnected', email: supabase.auth.session()?.user?.email || 'Anon Key User' });
            setUserProfile(prev => ({ ...prev, contactEmail: supabase.auth.session()?.user?.email || 'anon@example.com' }));
          }
        };
        fetchUser();
        
        const storedDarkMode = localStorage.getItem('darkMode') === 'true';
        setIsDarkMode(storedDarkMode);
        if (storedDarkMode) {
          document.documentElement.classList.add('dark');
        }

      }, [supabase]);

      const handleProfileInputChange = (e) => {
        const { name, value } = e.target;
        setUserProfile(prev => ({ ...prev, [name]: value }));
      };

      const handleSaveProfile = () => {
        toast({
          title: "Perfil Guardado (Simulado)",
          description: "La información de tu perfil ha sido guardada (simulación).",
        });
      };
      
      const toggleDarkMode = (checked) => {
        setIsDarkMode(checked);
        localStorage.setItem('darkMode', checked.toString());
        if (checked) {
          document.documentElement.classList.add('dark');
          toast({ title: "Modo Oscuro Activado" });
        } else {
          document.documentElement.classList.remove('dark');
          toast({ title: "Modo Oscuro Desactivado" });
        }
      };

      const handleClearLocalStorage = () => {
        const cashFundAmount = cashFund.amount;
        localStorage.clear();
        localStorage.setItem('darkMode', isDarkMode.toString()); 
        if (cashFundAmount > 0) localStorage.setItem('cashFund', JSON.stringify({ amount: cashFundAmount, isSet: false })); 
        toast({
          title: "Datos Locales Esenciales Eliminados",
          description: "El pedido actual y el historial de tickets han sido borrados. El fondo de caja necesita ser reconfirmado. Por favor, recarga la aplicación.",
          variant: "destructive",
          duration: 7000,
        });
        setTimeout(() => window.location.reload(), 3000);
      };
      
      const handleForceSync = async () => {
        toast({ title: "Sincronizando Datos", description: "Recargando productos, ingredientes y tickets desde Supabase..." });
        try {
          await Promise.all([
            fetchProducts(),
            fetchIngredients(),
            fetchCompletedTickets()
          ]);
          toast({ title: "Sincronización Completa", description: "Los datos han sido actualizados.", variant: "default" });
        } catch (error) {
          toast({ title: "Error de Sincronización", description: "No se pudieron recargar los datos.", variant: "destructive"});
        }
      };

      const handleDeleteAllTicketsAttempt = () => {
        if (passwordInput === ADMIN_PASSWORD) {
          deleteAllTickets().then(success => {
            if (success) {
              toast({ title: "Éxito", description: "Todos los tickets han sido eliminados de Supabase." });
            } else {
              toast({ title: "Error", description: "No se pudieron eliminar todos los tickets de Supabase.", variant: "destructive" });
            }
          });
          setIsDeleteAllTicketsModalOpen(false);
          setPasswordInput('');
        } else {
          toast({ title: "Contraseña Incorrecta", description: "La contraseña ingresada no es válida.", variant: "destructive" });
          setPasswordInput('');
        }
      };


      return (
        <div className={cn(
            "p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900",
          )}>
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-brand-red-medium dark:text-brand-red-light flex items-center">
              <SettingsIcon size={30} className="mr-3 text-brand-blue dark:text-sky-400" /> Configuración
            </h1>
          </header>

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            
            <Card className="lg:col-span-2 xl:col-span-2 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center dark:text-white"><UserCircle2 className="mr-2 text-brand-blue dark:text-sky-400" /> Perfil de Usuario</CardTitle>
                <CardDescription className="dark:text-gray-400">Gestiona la información de tu perfil.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <Avatar className="w-24 h-24 ring-2 ring-brand-blue dark:ring-sky-400 ring-offset-2 dark:ring-offset-gray-800">
                        <AvatarImage src={userProfile.avatarUrl || `https://avatar.vercel.sh/${userProfile.username || 'user'}.png`} alt="User Avatar" />
                        <AvatarFallback className="text-2xl bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            {userProfile.fullName ? userProfile.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                        </AvatarFallback>
                    </Avatar>
                  <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <div>
                      <Label htmlFor="avatarUrl" className="dark:text-gray-300">URL de Foto de Perfil</Label>
                      <Input id="avatarUrl" name="avatarUrl" value={userProfile.avatarUrl} onChange={handleProfileInputChange} placeholder="https://ejemplo.com/imagen.png" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-500" />
                    </div>
                    <div>
                      <Label htmlFor="username" className="dark:text-gray-300">Nombre de Usuario</Label>
                      <Input id="username" name="username" value={userProfile.username} onChange={handleProfileInputChange} placeholder="Tu nombre de usuario" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-500" />
                    </div>
                  </div>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName" className="dark:text-gray-300">Nombre Completo</Label>
                      <Input id="fullName" name="fullName" value={userProfile.fullName} onChange={handleProfileInputChange} placeholder="Tu nombre completo" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-500"/>
                    </div>
                    <div>
                      <Label htmlFor="contactEmail" className="dark:text-gray-300">Correo de Contacto</Label>
                      <Input id="contactEmail" name="contactEmail" type="email" value={userProfile.contactEmail} onChange={handleProfileInputChange} placeholder="tu@correo.com" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-500" />
                    </div>
                </div>
                <div>
                  <Label htmlFor="phone" className="dark:text-gray-300">Teléfono</Label>
                  <Input id="phone" name="phone" type="tel" value={userProfile.phone} onChange={handleProfileInputChange} placeholder="+52 555 123 4567" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-500" />
                </div>
                {currentUser && (
                  <div className="text-xs text-muted-foreground dark:text-gray-400 border-t pt-3 mt-3 border-gray-200 dark:border-gray-700">
                    <p><strong>ID de Usuario (Supabase):</strong> {currentUser.id}</p>
                    <p><strong>Email de Autenticación (Supabase):</strong> {currentUser.email}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="dark:border-gray-700">
                <Button onClick={handleSaveProfile} className="bg-brand-blue hover:bg-brand-blue/90 dark:bg-sky-500 dark:hover:bg-sky-600">
                  <Save size={18} className="mr-2" />Guardar Cambios de Perfil
                </Button>
              </CardFooter>
            </Card>

            <div className="space-y-6">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center dark:text-white"><Palette className="mr-2 text-brand-yellow-dark dark:text-yellow-400" /> Preferencias de Tema</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dark-mode" className="flex flex-col space-y-1 dark:text-gray-300">
                        <span>Modo Oscuro</span>
                        <span className="font-normal leading-snug text-muted-foreground dark:text-gray-400">
                          Habilita el tema oscuro para la aplicación.
                        </span>
                      </Label>
                      <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={toggleDarkMode} className="data-[state=checked]:bg-sky-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center dark:text-white"><Database className="mr-2 text-brand-green dark:text-green-400" /> Gestión de Datos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-green-50 dark:bg-green-800/30 border border-green-200 dark:border-green-700 rounded-md">
                        <p className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center">
                            <Cloud size={18} className="mr-2"/> Conectado a Supabase para persistencia de datos en la nube.
                        </p>
                    </div>
                    <Button variant="outline" onClick={handleForceSync} className="w-full dark:text-sky-400 dark:border-sky-600 dark:hover:bg-sky-700/20">
                      <RefreshCw size={16} className="mr-2"/> Forzar Sincronización con Supabase
                    </Button>
                    <Button variant="destructive" onClick={handleClearLocalStorage} className="w-full">
                      <AlertTriangle size={16} className="mr-2"/> Borrar Datos Locales
                    </Button>
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                      Borrar datos locales eliminará el pedido actual no confirmado y el historial de tickets en este dispositivo. El fondo de caja deberá reconfirmarse.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="dark:bg-gray-800 dark:border-gray-700 border-red-500/50 dark:border-red-500/70">
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-600 dark:text-red-400"><AlertTriangle className="mr-2" /> Operaciones Peligrosas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive" className="w-full" onClick={() => setIsDeleteAllTicketsModalOpen(true)}>
                      <TrashIcon size={16} className="mr-2"/> Eliminar Todos los Tickets de Supabase
                    </Button>
                    <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                      Esta acción es irreversible y eliminará permanentemente todos los registros de tickets de la base de datos.
                    </p>
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center dark:text-white"><Lock className="mr-2 text-gray-500 dark:text-gray-400" /> Cuenta y Seguridad</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                     <p className="text-sm text-muted-foreground dark:text-gray-400">
                        Actualmente, la gestión de usuarios y roles es simplificada. Para una gestión completa de usuarios, se requeriría una integración más profunda con Supabase Auth.
                     </p>
                     <Button variant="outline" disabled className="w-full dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700/20">
                        <LogOut size={16} className="mr-2"/> Cerrar Sesión (No implementado)
                     </Button>
                  </CardContent>
                </Card>
            </div>
          </div>
          
          <AlertDialog open={isDeleteAllTicketsModalOpen} onOpenChange={setIsDeleteAllTicketsModalOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-600">¡Acción Irreversible!</AlertDialogTitle>
                <AlertDialogDescription>
                  Estás a punto de eliminar <strong>TODOS</strong> los tickets de la base de datos. Esta acción no se puede deshacer.
                  <br />
                  Para confirmar, por favor ingresa la contraseña de administrador: <strong className="text-gray-700 dark:text-gray-300">"{ADMIN_PASSWORD}"</strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="my-4">
                <Label htmlFor="admin-password">Contraseña de Administrador</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Ingresa la contraseña"
                  className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setPasswordInput('')}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAllTicketsAttempt}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={passwordInput !== ADMIN_PASSWORD}
                >
                  Sí, Eliminar TODO
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </div>
      );
    };

    export default SettingsPage;