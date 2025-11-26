import { supabase } from '../js/supabase.js';
import { getCurrentUser, signOut } from '../js/auth.js';
import { getLogo } from '../components/logo.js';

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
        <div class="flex min-h-screen items-center justify-center bg-base text-on-surface">
            <div class="text-center">
                <h2 class="text-2xl font-bold text-red-500 mb-4">Acceso Restringido</h2>
                <p class="text-on-surface/60 mb-6">Esta página es solo para confeccionistas registrados.</p>
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
    <div class="flex min-h-screen w-full bg-base font-display text-on-surface">
        <!-- Sidebar -->
        <aside class="w-64 flex-shrink-0 bg-base border-r border-surface/50 p-4 flex flex-col justify-between hidden md:flex sticky top-0 h-screen z-20">
            <div class="flex flex-col gap-8">
                <div class="px-3 flex justify-center">
                    <a href="/maker-dashboard">
                        ${getLogo({ width: "160", height: "45" })}
                    </a>
                </div>
                
                <nav class="flex flex-col gap-2">
                    <a href="/maker-dashboard" class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface hover:bg-primary/20 transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl group-hover:text-primary transition-colors">dashboard</span>
                        <p class="text-on-surface text-sm font-medium">Dashboard</p>
                    </a>
                    <a href="/maker-orders" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">inventory_2</span>
                        <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Pedidos</p>
                        ${pendingOrders > 0 ? `<span class="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">${pendingOrders}</span>` : ''}
                    </a>
                    <a href="/maker-profile" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">person</span>
                        <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Mi Perfil</p>
                    </a>
                    <a href="/chat" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">chat_bubble_outline</span>
                        <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Chat</p>
                    </a>
                    <a href="/maker-plans" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">workspace_premium</span>
                        <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Mi Suscripción</p>
                    </a>
                </nav>
            </div>
            <div class="flex flex-col gap-1">
                <button id="logout-btn" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group text-left w-full">
                    <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-red-500 transition-colors">logout</span>
                    <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Cerrar sesión</p>
                </button>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 p-8 overflow-y-auto">
            <div class="max-w-7xl mx-auto">
                <!-- Header -->
                <header class="flex justify-between items-center mb-8 bg-surface p-4 rounded-xl border border-white/10 shadow-sm">
                    <div>
                        <h1 class="text-3xl font-black text-on-surface mb-1">Panel Principal</h1>
                        <p class="text-on-surface/60">Bienvenido de nuevo, ${profile.full_name?.split(' ')[0] || 'Maker'}.</p>
                    </div>
                    <div class="flex items-center gap-6">
                        <button class="relative p-2 text-on-surface/80 hover:text-primary transition-colors">
                            <span class="material-symbols-outlined text-2xl">notifications</span>
                            <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <a href="/maker-profile" class="flex items-center gap-3 hover:opacity-80 transition-opacity border-l border-white/10 pl-6">
                            <div class="bg-gradient-to-br from-primary to-secondary rounded-full w-10 h-10 flex items-center justify-center text-white font-bold shadow-md overflow-hidden">
                                ${profile.avatar_url ? `<img src="${profile.avatar_url}" class="w-full h-full object-cover">` : (profile.full_name || 'M')[0].toUpperCase()}
                            </div>
                            <div class="flex flex-col text-right">
                                <h2 class="text-base font-semibold text-on-surface leading-tight">${profile.full_name || 'Confeccionista'}</h2>
                                <p class="text-primary text-sm font-medium leading-tight uppercase">Plan ${profile.plan || 'Free'}</p>
                            </div>
                        </a>
                    </div>
                </header>

                <!-- Stats Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <!-- Card 1: Pending -->
                    <div class="bg-surface p-6 rounded-xl border border-white/10 relative overflow-hidden group hover:border-primary/50 transition-all shadow-lg">
                        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span class="material-symbols-outlined text-6xl text-primary">pending_actions</span>
                        </div>
                        <p class="text-on-surface/60 text-sm font-medium mb-1">Solicitudes Pendientes</p>
                        <h3 class="text-3xl font-bold text-on-surface mb-2">${pendingOrders || 0}</h3>
                        <a href="/maker-orders?status=pending" class="text-xs text-primary hover:underline flex items-center gap-1">
                            Ver solicitudes <span class="material-symbols-outlined text-sm">arrow_forward</span>
                        </a>
                    </div>

                    <!-- Card 2: Active -->
                    <div class="bg-surface p-6 rounded-xl border border-white/10 relative overflow-hidden group hover:border-blue-500/50 transition-all shadow-lg">
                        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span class="material-symbols-outlined text-6xl text-blue-500">precision_manufacturing</span>
                        </div>
                        <p class="text-on-surface/60 text-sm font-medium mb-1">Pedidos en Curso</p>
                        <h3 class="text-3xl font-bold text-on-surface mb-2">${activeOrders || 0}</h3>
                        <a href="/maker-orders?status=active" class="text-xs text-blue-400 hover:underline flex items-center gap-1">
                            Gestionar activos <span class="material-symbols-outlined text-sm">arrow_forward</span>
                        </a>
                    </div>

                    <!-- Card 3: Total -->
                    <div class="bg-surface p-6 rounded-xl border border-white/10 relative overflow-hidden group hover:border-green-500/50 transition-all shadow-lg">
                        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span class="material-symbols-outlined text-6xl text-green-500">check_circle</span>
                        </div>
                        <p class="text-on-surface/60 text-sm font-medium mb-1">Total Atendidos</p>
                        <h3 class="text-3xl font-bold text-on-surface mb-2">${totalOrders || 0}</h3>
                        <span class="text-xs text-green-500 font-medium">+2 esta semana</span>
                    </div>

                    <!-- Card 4: Rating -->
                    <div class="bg-surface p-6 rounded-xl border border-white/10 relative overflow-hidden group hover:border-yellow-500/50 transition-all shadow-lg">
                        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span class="material-symbols-outlined text-6xl text-yellow-500">star</span>
                        </div>
                        <p class="text-on-surface/60 text-sm font-medium mb-1">Calificación Promedio</p>
                        <div class="flex items-center gap-2 mb-2">
                            <h3 class="text-3xl font-bold text-on-surface">4.8</h3>
                            <div class="flex text-yellow-500">
                                <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1">star</span>
                                <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1">star</span>
                                <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1">star</span>
                                <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1">star</span>
                                <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1">star_half</span>
                            </div>
                        </div>
                        <a href="/maker-profile" class="text-xs text-on-surface/60 hover:text-on-surface hover:underline">Ver reseñas</a>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Recent Orders List -->
                    <div class="lg:col-span-2 bg-surface rounded-xl border border-white/10 overflow-hidden shadow-lg">
                        <div class="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 class="text-lg font-bold text-on-surface">Pedidos Recientes</h3>
                            <a href="/maker-orders" class="text-sm text-primary hover:underline">Ver todos</a>
                        </div>
                        <div class="divide-y divide-white/10">
                            ${recentOrders && recentOrders.length > 0 ? recentOrders.map(order => `
                                <div class="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                                    <div class="w-12 h-12 rounded-lg bg-center bg-cover bg-no-repeat bg-gray-800" style="background-image: url('${order.designs?.preview_url || ''}')"></div>
                                    <div class="flex-1">
                                        <h4 class="text-on-surface font-bold text-sm">${order.designs?.name || 'Diseño'}</h4>
                                        <p class="text-on-surface/60 text-xs">Cliente: ${order.profiles?.full_name || 'Usuario'}</p>
                                    </div>
                                    <div class="text-right">
                                        <span class="px-2 py-1 rounded text-xs font-bold ${getStatusColor(order.status)}">
                                            ${getStatusLabel(order.status)}
                                        </span>
                                        <p class="text-on-surface/60 text-xs mt-1">${new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <a href="/maker-orders?id=${order.id}" class="p-2 text-on-surface/60 hover:text-on-surface">
                                        <span class="material-symbols-outlined">chevron_right</span>
                                    </a>
                                </div>
                            `).join('') : `
                                <div class="p-8 text-center text-on-surface/60">
                                    <span class="material-symbols-outlined text-4xl mb-2 opacity-50">inbox</span>
                                    <p>No hay pedidos recientes.</p>
                                </div>
                            `}
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="space-y-6">
                        <div class="bg-gradient-to-br from-primary/20 to-secondary/10 rounded-xl p-6 border border-primary/20 shadow-lg">
                            <h3 class="text-on-surface font-bold mb-2">Mejora tu Plan</h3>
                            <p class="text-sm text-on-surface/60 mb-4">Accede a herramientas avanzadas y destaca en el directorio.</p>
                            <button class="w-full py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-colors text-sm shadow-lg shadow-primary/20" onclick="window.location.href='/maker-plans'">
                                Ver Planes
                            </button>
                        </div>

                        <div class="bg-surface rounded-xl border border-white/10 p-6 shadow-lg">
                            <h3 class="text-on-surface font-bold mb-4">Accesos Rápidos</h3>
                            <div class="grid grid-cols-2 gap-3">
                                <a href="/maker-profile" class="p-3 rounded-lg bg-base hover:bg-white/5 transition-colors text-center group border border-white/5">
                                    <span class="material-symbols-outlined text-2xl text-primary mb-1 group-hover:scale-110 transition-transform">person</span>
                                    <p class="text-xs text-on-surface">Editar Perfil</p>
                                </a>
                                <a href="/maker-portfolio" class="p-3 rounded-lg bg-base hover:bg-white/5 transition-colors text-center group border border-white/5">
                                    <span class="material-symbols-outlined text-2xl text-blue-400 mb-1 group-hover:scale-110 transition-transform">add_a_photo</span>
                                    <p class="text-xs text-on-surface">Subir Foto</p>
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
