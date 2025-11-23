import { supabase } from '../js/supabase.js';
import { getCurrentUser, signOut } from '../js/auth.js';

export async function MakerDashboardPage() {
    const user = await getCurrentUser();

    if (!user) {
        window.location.href = '/login';
        return '';
    }

    // Verify role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, plan, full_name, avatar_url')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'maker') {
        return `
        <div class="flex min-h-screen items-center justify-center bg-background-dark text-white">
            <div class="text-center">
                <h2 class="text-2xl font-bold text-red-500 mb-4">Acceso Restringido</h2>
                <p class="text-gray-400 mb-6">Esta página es solo para confeccionistas registrados.</p>
                <a href="/" class="px-6 py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-colors">Volver al Inicio</a>
            </div>
        </div>
        `;
    }

    // Fetch Stats Data
    const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('maker_id', user.id);

    const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('maker_id', user.id)
        .eq('status', 'pending');

    const { count: activeOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('maker_id', user.id)
        .in('status', ['accepted', 'in_progress', 'review']);

    // Fetch recent orders for preview
    const { data: recentOrders } = await supabase
        .from('orders')
        .select(`
            *,
            designs (name, preview_url),
            profiles:client_id (full_name)
        `)
        .eq('maker_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

    // Logout handler
    setTimeout(() => {
        document.getElementById('logout-btn')?.addEventListener('click', async () => {
            await signOut();
            window.location.href = '/login';
        });
    }, 0);

    return `
    <div class="flex min-h-screen w-full bg-background-dark font-display text-text-beige">
        <!-- Sidebar -->
        <nav class="w-64 flex-shrink-0 bg-sidebar-dark border-r border-white/5 p-4 flex flex-col justify-between hidden md:flex">
            <div class="flex flex-col gap-4">
                <div class="flex items-center gap-3 p-2">
                    <div class="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center overflow-hidden border border-accent-gold/30">
                        ${profile.avatar_url ? `<img src="${profile.avatar_url}" class="w-full h-full object-cover">` : '<span class="material-symbols-outlined text-accent-gold">checkroom</span>'}
                    </div>
                    <div class="flex flex-col">
                        <h1 class="text-white text-sm font-bold leading-normal">${profile.full_name || 'Confeccionista'}</h1>
                        <p class="text-accent-gold text-xs font-medium uppercase tracking-wider">${profile.plan || 'Free'}</p>
                    </div>
                </div>
                
                <div class="flex flex-col gap-1">
                    <a class="relative flex items-center gap-4 rounded-lg bg-accent-gold/10 px-4 py-2.5 text-sm font-bold text-accent-gold shadow-gold-glow-soft" href="/maker-dashboard">
                        <span class="absolute left-0 h-6 w-1 rounded-r-full bg-accent-gold"></span>
                        <span class="material-symbols-outlined text-xl">dashboard</span>
                        Dashboard
                    </a>
                    <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-gold hover:bg-white/5" href="/maker-orders">
                        <span class="material-symbols-outlined text-xl">inventory_2</span>
                        Pedidos
                        ${pendingOrders > 0 ? `<span class="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">${pendingOrders}</span>` : ''}
                    </a>
                    <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-gold hover:bg-white/5" href="/maker-profile-edit">
                        <span class="material-symbols-outlined text-xl">person_edit</span>
                        Mi Perfil
                    </a>
                    <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-gold hover:bg-white/5" href="/maker-portfolio">
                        <span class="material-symbols-outlined text-xl">photo_library</span>
                        Portafolio
                    </a>
                    <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-gold hover:bg-white/5" href="/chat">
                        <span class="material-symbols-outlined text-xl">chat</span>
                        Mensajes
                    </a>
                    <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-gold hover:bg-white/5" href="/maker-plans">
                        <span class="material-symbols-outlined text-xl">workspace_premium</span>
                        Suscripción
                    </a>
                </div>
            </div>
            <div class="flex flex-col gap-1">
                <a class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-text-beige-muted hover:text-accent-copper" href="/logout" id="logout-btn">
                    <span class="material-symbols-outlined">logout</span>
                    <p class="text-sm font-medium leading-normal">Cerrar sesión</p>
                </a>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="flex-1 p-8 overflow-y-auto">
            <div class="max-w-7xl mx-auto">
                <!-- Header -->
                <header class="flex justify-between items-center mb-8">
                    <div>
                        <h1 class="text-3xl font-black text-white mb-1">Panel Principal</h1>
                        <p class="text-text-beige-muted">Bienvenido de nuevo, ${profile.full_name?.split(' ')[0] || 'Maker'}.</p>
                    </div>
                    <div class="flex gap-3">
                        <button class="flex items-center gap-2 px-4 py-2 rounded-lg bg-card-dark border border-white/10 text-text-beige hover:bg-white/5 transition-colors">
                            <span class="material-symbols-outlined text-xl">notifications</span>
                        </button>
                    </div>
                </header>

                <!-- Stats Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <!-- Card 1: Pending -->
                    <div class="bg-card-dark p-6 rounded-xl border border-white/5 relative overflow-hidden group hover:border-accent-gold/30 transition-all">
                        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span class="material-symbols-outlined text-6xl text-accent-gold">pending_actions</span>
                        </div>
                        <p class="text-text-beige-muted text-sm font-medium mb-1">Solicitudes Pendientes</p>
                        <h3 class="text-3xl font-bold text-white mb-2">${pendingOrders || 0}</h3>
                        <a href="/maker-orders?status=pending" class="text-xs text-accent-gold hover:underline flex items-center gap-1">
                            Ver solicitudes <span class="material-symbols-outlined text-sm">arrow_forward</span>
                        </a>
                    </div>

                    <!-- Card 2: Active -->
                    <div class="bg-card-dark p-6 rounded-xl border border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span class="material-symbols-outlined text-6xl text-blue-500">precision_manufacturing</span>
                        </div>
                        <p class="text-text-beige-muted text-sm font-medium mb-1">Pedidos en Curso</p>
                        <h3 class="text-3xl font-bold text-white mb-2">${activeOrders || 0}</h3>
                        <a href="/maker-orders?status=active" class="text-xs text-blue-400 hover:underline flex items-center gap-1">
                            Gestionar activos <span class="material-symbols-outlined text-sm">arrow_forward</span>
                        </a>
                    </div>

                    <!-- Card 3: Total -->
                    <div class="bg-card-dark p-6 rounded-xl border border-white/5 relative overflow-hidden group hover:border-green-500/30 transition-all">
                        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span class="material-symbols-outlined text-6xl text-green-500">check_circle</span>
                        </div>
                        <p class="text-text-beige-muted text-sm font-medium mb-1">Total Atendidos</p>
                        <h3 class="text-3xl font-bold text-white mb-2">${totalOrders || 0}</h3>
                        <span class="text-xs text-green-500 font-medium">+2 esta semana</span>
                    </div>

                    <!-- Card 4: Rating -->
                    <div class="bg-card-dark p-6 rounded-xl border border-white/5 relative overflow-hidden group hover:border-yellow-500/30 transition-all">
                        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span class="material-symbols-outlined text-6xl text-yellow-500">star</span>
                        </div>
                        <p class="text-text-beige-muted text-sm font-medium mb-1">Calificación Promedio</p>
                        <div class="flex items-center gap-2 mb-2">
                            <h3 class="text-3xl font-bold text-white">4.8</h3>
                            <div class="flex text-yellow-500">
                                <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1">star</span>
                                <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1">star</span>
                                <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1">star</span>
                                <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1">star</span>
                                <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1">star_half</span>
                            </div>
                        </div>
                        <a href="/maker-profile-edit" class="text-xs text-text-beige-muted hover:text-white hover:underline">Ver reseñas</a>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Recent Orders List -->
                    <div class="lg:col-span-2 bg-card-dark rounded-xl border border-white/5 overflow-hidden">
                        <div class="p-6 border-b border-white/5 flex justify-between items-center">
                            <h3 class="text-lg font-bold text-white">Pedidos Recientes</h3>
                            <a href="/maker-orders" class="text-sm text-accent-gold hover:underline">Ver todos</a>
                        </div>
                        <div class="divide-y divide-white/5">
                            ${recentOrders && recentOrders.length > 0 ? recentOrders.map(order => `
                                <div class="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                                    <div class="w-12 h-12 rounded-lg bg-center bg-cover bg-no-repeat bg-gray-800" style="background-image: url('${order.designs?.preview_url || ''}')"></div>
                                    <div class="flex-1">
                                        <h4 class="text-white font-bold text-sm">${order.designs?.name || 'Diseño'}</h4>
                                        <p class="text-text-beige-muted text-xs">Cliente: ${order.profiles?.full_name || 'Usuario'}</p>
                                    </div>
                                    <div class="text-right">
                                        <span class="px-2 py-1 rounded text-xs font-bold ${getStatusColor(order.status)}">
                                            ${getStatusLabel(order.status)}
                                        </span>
                                        <p class="text-text-beige-muted text-xs mt-1">${new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <a href="/maker-orders?id=${order.id}" class="p-2 text-text-beige-muted hover:text-white">
                                        <span class="material-symbols-outlined">chevron_right</span>
                                    </a>
                                </div>
                            `).join('') : `
                                <div class="p-8 text-center text-text-beige-muted">
                                    <span class="material-symbols-outlined text-4xl mb-2 opacity-50">inbox</span>
                                    <p>No hay pedidos recientes.</p>
                                </div>
                            `}
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="space-y-6">
                        <div class="bg-gradient-to-br from-accent-gold/20 to-accent-copper/10 rounded-xl p-6 border border-accent-gold/20">
                            <h3 class="text-white font-bold mb-2">Mejora tu Plan</h3>
                            <p class="text-sm text-text-beige-muted mb-4">Accede a herramientas avanzadas y destaca en el directorio.</p>
                            <button class="w-full py-2 rounded-lg bg-accent-gold text-black font-bold hover:bg-accent-gold/90 transition-colors text-sm">
                                Ver Planes
                            </button>
                        </div>

                        <div class="bg-card-dark rounded-xl border border-white/5 p-6">
                            <h3 class="text-white font-bold mb-4">Accesos Rápidos</h3>
                            <div class="grid grid-cols-2 gap-3">
                                <a href="/maker-profile-edit" class="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center group">
                                    <span class="material-symbols-outlined text-2xl text-accent-gold mb-1 group-hover:scale-110 transition-transform">person</span>
                                    <p class="text-xs text-text-beige">Editar Perfil</p>
                                </a>
                                <a href="/maker-portfolio" class="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center group">
                                    <span class="material-symbols-outlined text-2xl text-blue-400 mb-1 group-hover:scale-110 transition-transform">add_a_photo</span>
                                    <p class="text-xs text-text-beige">Subir Foto</p>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
    `;
}

function getStatusColor(status) {
    const map = {
        'pending': 'bg-yellow-500/20 text-yellow-500',
        'accepted': 'bg-blue-500/20 text-blue-500',
        'in_progress': 'bg-purple-500/20 text-purple-500',
        'review': 'bg-orange-500/20 text-orange-500',
        'finished': 'bg-green-500/20 text-green-500',
        'cancelled': 'bg-red-500/20 text-red-500'
    };
    return map[status] || 'bg-gray-500/20 text-gray-500';
}

function getStatusLabel(status) {
    const map = {
        'pending': 'Pendiente',
        'accepted': 'Aceptado',
        'in_progress': 'En Proceso',
        'review': 'Revisión',
        'finished': 'Finalizado',
        'cancelled': 'Cancelado'
    };
    return map[status] || status;
}
