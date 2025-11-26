import { supabase } from '../js/supabase.js';
import { getCurrentUser, signOut } from '../js/auth.js';
import { getLogo } from '../components/logo.js';

export async function MakerOrdersPage() {
    const user = await getCurrentUser();
    if (!user) { window.location.href = '/login'; return ''; }

    // Check for Order ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');

    if (orderId) {
        return await renderMakerOrderDetails(orderId, user);
    }

    return await renderMakerOrderList(user);
}

// --- LIST VIEW ---
async function renderMakerOrderList(user) {
    // Fetch profile for sidebar info
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    // Fetch all orders
    const { data: orders } = await supabase
        .from('orders')
        .select(`*, designs(*), profiles:client_id(full_name)`)
        .eq('maker_id', user.id)
        .order('created_at', { ascending: false });

    const pendingOrders = orders.filter(o => o.status === 'pending');
    const activeOrders = orders.filter(o => ['accepted', 'in_progress', 'review', 'shipped'].includes(o.status));
    const finishedOrders = orders.filter(o => ['completed', 'cancelled'].includes(o.status));

    // Tab Logic (Client-side simple toggle)
    window.switchTab = (tabName) => {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
        document.getElementById(`tab-${tabName}`).classList.remove('hidden');

        document.querySelectorAll('.tab-btn').forEach(el => {
            el.classList.remove('text-primary', 'border-primary');
            el.classList.add('text-on-surface/60', 'border-transparent');
        });
        document.getElementById(`btn-tab-${tabName}`).classList.add('text-primary', 'border-primary');
        document.getElementById(`btn-tab-${tabName}`).classList.remove('text-on-surface/60', 'border-transparent');
    };

    // Logout handler
    setTimeout(() => {
        document.getElementById('logout-btn')?.addEventListener('click', async () => {
            await signOut();
            window.location.href = '/login';
        });
    }, 0);

    return `
    <div class="flex min-h-screen w-full bg-base font-display text-on-surface">
        ${renderSidebar(profile, pendingOrders.length)}
        <main class="flex-1 p-8 overflow-y-auto">
            <div class="max-w-6xl mx-auto">
                <!-- Header -->
                <header class="flex justify-between items-center mb-8 bg-surface p-4 rounded-xl border border-white/10 shadow-sm">
                    <div>
                        <h1 class="text-3xl font-black text-on-surface mb-1">Gestión de Pedidos</h1>
                         <p class="text-on-surface/60">Administra tus solicitudes y proyectos en curso.</p>
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

                <!-- Tabs -->
                <div class="flex border-b border-white/10 mb-8">
                    <button id="btn-tab-pending" onclick="switchTab('pending')" class="tab-btn px-6 py-3 text-primary border-b-2 border-primary font-bold transition-colors flex items-center gap-2">
                        Solicitudes <span class="bg-primary text-white text-xs px-2 py-0.5 rounded-full">${pendingOrders.length}</span>
                    </button>
                    <button id="btn-tab-active" onclick="switchTab('active')" class="tab-btn px-6 py-3 text-on-surface/60 border-b-2 border-transparent hover:text-on-surface transition-colors flex items-center gap-2">
                        En Curso <span class="bg-white/10 text-on-surface text-xs px-2 py-0.5 rounded-full">${activeOrders.length}</span>
                    </button>
                    <button id="btn-tab-finished" onclick="switchTab('finished')" class="tab-btn px-6 py-3 text-on-surface/60 border-b-2 border-transparent hover:text-on-surface transition-colors">
                        Finalizados
                    </button>
                </div>

                <!-- Content -->
                <div id="tab-pending" class="tab-content space-y-4">
                    ${renderOrderCards(pendingOrders, 'pending')}
                </div>
                <div id="tab-active" class="tab-content hidden space-y-4">
                    ${renderOrderCards(activeOrders, 'active')}
                </div>
                <div id="tab-finished" class="tab-content hidden space-y-4">
                    ${renderOrderCards(finishedOrders, 'completed')}
                </div>
            </div>
        </main>
    </div>
    `;
}

function renderOrderCards(orders, type) {
    if (orders.length === 0) {
        return `
            <div class="text-center py-12 border-2 border-dashed border-white/10 rounded-xl bg-surface">
                <span class="material-symbols-outlined text-4xl text-on-surface/40 mb-2">inbox</span>
                <p class="text-on-surface/60">No hay pedidos en esta sección.</p>
            </div>
        `;
    }

    return orders.map(order => `
        <div class="bg-surface rounded-xl border border-white/10 p-4 flex flex-col md:flex-row gap-6 hover:border-primary/30 transition-colors group shadow-lg">
            <!-- Image -->
            <div class="w-full md:w-48 h-32 bg-gray-800 rounded-lg bg-center bg-cover" style="background-image: url('${order.designs?.preview_url || ''}'); background-color: ${order.designs?.config?.color || '#333'}"></div>
            
            <!-- Info -->
            <div class="flex-1">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h3 class="text-on-surface font-bold text-lg">${order.designs?.name || 'Diseño Personalizado'}</h3>
                        <p class="text-sm text-on-surface/60">Cliente: ${order.profiles?.full_name || 'Usuario'}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}">
                        ${getStatusLabel(order.status)}
                    </span>
                </div>
                
                <div class="flex gap-4 text-sm text-on-surface/60 mb-4">
                    <div class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-base">calendar_today</span>
                        ${new Date(order.created_at).toLocaleDateString()}
                    </div>
                    <div class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-base">checkroom</span>
                        ${order.designs?.config?.type || 'Prenda'}
                    </div>
                </div>

                <div class="flex gap-3">
                    <a href="/maker-orders?id=${order.id}" class="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-on-surface text-sm font-bold transition-colors border border-white/10">
                        Ver Detalles
                    </a>
                    ${type === 'pending' ? `
                        <button class="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                            Aceptar Pedido
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// --- DETAIL VIEW ---
async function renderMakerOrderDetails(orderId, user) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    const { data: order } = await supabase
        .from('orders')
        .select(`*, designs(*), profiles:client_id(*)`)
        .eq('id', orderId)
        .single();

    if (!order) return '<div class="text-on-surface p-8">Pedido no encontrado.</div>';

    // Fetch updates
    const { data: updates } = await supabase
        .from('order_updates')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

    // Setup Modals Logic
    setTimeout(() => {
        setupMakerModals(order);

        // Logout handler
        document.getElementById('logout-btn')?.addEventListener('click', async () => {
            await signOut();
            window.location.href = '/login';
        });
    }, 0);

    return `
    <div class="flex min-h-screen w-full bg-base font-display text-on-surface">
        ${renderSidebar(profile)}
        <main class="flex-1 p-8 overflow-y-auto relative">
            <div class="max-w-5xl mx-auto pb-20">
                <!-- Header -->
                <header class="flex justify-between items-center mb-8 bg-surface p-4 rounded-xl border border-white/10 shadow-sm">
                    <div class="flex items-center gap-4">
                        <a href="/maker-orders" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-on-surface transition-colors">
                            <span class="material-symbols-outlined">arrow_back</span>
                        </a>
                        <div>
                            <h1 class="text-2xl font-bold text-on-surface">Pedido #${order.id.slice(0, 8)}</h1>
                            <p class="text-on-surface/60 text-sm">Cliente: ${order.profiles?.full_name}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-6">
                        <span class="px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(order.status)}">
                            ${getStatusLabel(order.status)}
                        </span>
                        <div class="h-8 w-px bg-white/10"></div>
                        <a href="/maker-profile" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div class="bg-gradient-to-br from-primary to-secondary rounded-full w-10 h-10 flex items-center justify-center text-white font-bold shadow-md overflow-hidden">
                                ${profile.avatar_url ? `<img src="${profile.avatar_url}" class="w-full h-full object-cover">` : (profile.full_name || 'M')[0].toUpperCase()}
                            </div>
                            <div class="flex flex-col text-right hidden sm:flex">
                                <h2 class="text-base font-semibold text-on-surface leading-tight">${profile.full_name || 'Confeccionista'}</h2>
                                <p class="text-primary text-sm font-medium leading-tight uppercase">Plan ${profile.plan || 'Free'}</p>
                            </div>
                        </a>
                    </div>
                </header>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Left: Design Specs -->
                    <div class="space-y-6">
                        <div class="bg-surface rounded-xl border border-white/10 overflow-hidden shadow-lg">
                            <div class="aspect-square bg-center bg-cover" style="background-image: url('${order.designs?.preview_url || ''}'); background-color: ${order.designs?.config?.color || '#333'}"></div>
                            <div class="p-4">
                                <h3 class="text-on-surface font-bold mb-2">Ficha Técnica</h3>
                                <div class="space-y-2 text-sm text-on-surface/60">
                                    <div class="flex justify-between border-b border-white/10 pb-2">
                                        <span>Prenda</span>
                                        <span class="text-on-surface">${order.designs?.config?.type || 'Standard'}</span>
                                    </div>
                                    <div class="flex justify-between border-b border-white/10 pb-2">
                                        <span>Color</span>
                                        <span class="flex items-center gap-2">
                                            <span class="w-3 h-3 rounded-full" style="background-color: ${order.designs?.config?.color}"></span>
                                            ${order.designs?.config?.color}
                                        </span>
                                    </div>
                                    <div class="flex justify-between border-b border-white/10 pb-2">
                                        <span>Talla</span>
                                        <span class="text-on-surface">M (Estándar)</span>
                                    </div>
                                </div>
                                <div class="mt-4 bg-white/5 p-3 rounded-lg">
                                    <p class="text-xs text-primary font-bold uppercase mb-1">Mensaje del Cliente</p>
                                    <p class="text-sm italic text-on-surface">"${order.message || 'Sin mensaje'}"</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Actions Card -->
                        <div class="bg-surface rounded-xl border border-white/10 p-4 sticky top-4 shadow-lg">
                            <h3 class="text-on-surface font-bold mb-4">Acciones</h3>
                            ${renderMakerActions(order)}
                        </div>
                    </div>

                    <!-- Right: Workspace & Timeline -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Timeline -->
                        <div class="bg-surface rounded-xl border border-white/10 p-6 shadow-lg">
                            <h3 class="text-on-surface font-bold mb-4">Línea de Tiempo</h3>
                            ${renderTimeline(order.status)}
                        </div>

                        <!-- Updates Feed -->
                        <div>
                            <h3 class="text-on-surface font-bold mb-4 flex justify-between items-center">
                                Avances del Proyecto
                                ${['accepted', 'in_progress', 'corrections'].includes(order.status) ? `
                                    <button id="btn-add-update" class="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg text-on-surface transition-colors">
                                        + Nuevo Avance
                                    </button>
                                ` : ''}
                            </h3>
                            <div class="space-y-4">
                                ${updates && updates.length > 0 ? updates.map(u => `
                                    <div class="bg-surface border border-white/10 rounded-xl p-4 flex gap-4 shadow-sm">
                                        <div class="flex flex-col items-center">
                                            <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                                <span class="material-symbols-outlined text-sm">history_edu</span>
                                            </div>
                                            <div class="w-px h-full bg-white/10 my-2"></div>
                                        </div>
                                        <div class="flex-1">
                                            <div class="flex justify-between mb-2">
                                                <span class="text-on-surface font-bold text-sm">Avance Subido</span>
                                                <span class="text-xs text-on-surface/60">${new Date(u.created_at).toLocaleString()}</span>
                                            </div>
                                            <p class="text-on-surface/60 text-sm mb-3">${u.content}</p>
                                            ${u.image_url ? `<img src="${u.image_url}" class="rounded-lg max-h-48 border border-white/10">` : ''}
                                        </div>
                                    </div>
                                `).join('') : '<p class="text-on-surface/60 text-center py-8">Aún no has subido avances.</p>'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- MODALS -->
            ${renderMakerModals()}
        </main>
    </div>
    `;
}

function renderSidebar(profile, pendingCount = 0) {
    return `
    <aside class="w-64 flex-shrink-0 bg-base border-r border-surface/50 p-4 flex flex-col justify-between hidden md:flex sticky top-0 h-screen z-20">
        <div class="flex flex-col gap-8">
            <div class="px-3 flex justify-center">
                <a href="/maker-dashboard">
                    ${getLogo({ width: "160", height: "45" })}
                </a>
            </div>
            
            <nav class="flex flex-col gap-2">
                <a href="/maker-dashboard" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                    <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">dashboard</span>
                    <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Dashboard</p>
                </a>
                <a href="/maker-orders" class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface hover:bg-primary/20 transition-colors duration-200 group">
                    <span class="material-symbols-outlined text-xl group-hover:text-primary transition-colors">inventory_2</span>
                    <p class="text-on-surface text-sm font-medium">Pedidos</p>
                    ${pendingCount > 0 ? `<span class="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">${pendingCount}</span>` : ''}
                </a>
                <a href="/maker-profile" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                    <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">person</span>
                    <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Mi Perfil</p>
                </a>
                <a href="/maker-portfolio" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                    <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">photo_library</span>
                    <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Portafolio</p>
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
    `;
}

function renderMakerActions(order) {
    if (order.status === 'pending') {
        return `
            <div class="flex flex-col gap-3">
                <button id="btn-accept" class="w-full py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                    Aceptar Pedido
                </button>
                <button id="btn-reject" class="w-full py-3 rounded-lg bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-colors border border-red-500/20">
                    Rechazar
                </button>
            </div>
    `;
    } else if (order.status === 'accepted') {
        return `
            <div class="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
                <p class="text-blue-400 font-bold mb-2">Cotización Enviada</p>
                <p class="text-xs text-on-surface/60">Esperando el pago del adelanto por parte del cliente.</p>
                <div class="mt-2 text-sm font-bold text-on-surface">
                    Total: S/ ${order.price}
                </div>
            </div>
            <a href="/chat?recipient_id=${order.client_id}" class="mt-3 w-full py-3 rounded-lg bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors border border-primary/20 flex items-center justify-center gap-2">
                <span class="material-symbols-outlined">chat</span>
                Chat con Cliente
            </a>
        `;
    } else if (['in_progress', 'corrections'].includes(order.status)) {
        return `
            <div class="flex flex-col gap-3">
                <button id="btn-upload-update" class="w-full py-3 rounded-lg bg-white/10 text-on-surface font-bold hover:bg-white/20 transition-colors border border-white/10 flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined">cloud_upload</span>
                    Subir Avance
                </button>
                <button id="btn-send-review" class="w-full py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                    <span class="material-symbols-outlined">send</span>
                    Enviar a Revisión Final
                </button>
                <a href="/chat?recipient_id=${order.client_id}" class="w-full py-3 rounded-lg bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors border border-primary/20 flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined">chat</span>
                    Chat con Cliente
                </a>
            </div>
        `;
    } else if (order.status === 'shipped') {
        return `
            <div class="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
                <p class="text-yellow-500 font-bold mb-2">Esperando al Cliente</p>
                <p class="text-xs text-on-surface/60">El cliente está revisando tu entrega final.</p>
            </div>
    <a href="/chat?recipient_id=${order.client_id}" class="mt-3 w-full py-3 rounded-lg bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors border border-primary/20 flex items-center justify-center gap-2">
        <span class="material-symbols-outlined">chat</span>
        Chat con Cliente
    </a>
`;
    } else {
        return `
            <div class="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                <p class="text-green-500 font-bold">Pedido Finalizado</p>
            </div>
    `;
    }
}

function renderTimeline(status) {
    const steps = ['pending', 'accepted', 'in_progress', 'shipped', 'completed'];
    const currentIdx = steps.indexOf(status);
    const progress = Math.max(5, (currentIdx / (steps.length - 1)) * 100);

    return `
        <div class="relative pt-4 pb-2">
            <div class="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full"></div>
            <div class="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-1000" style="width: ${progress}%"></div>
            <div class="relative flex justify-between">
                ${steps.map((s, i) => `
                    <div class="flex flex-col items-center gap-2 z-10">
                        <div class="w-3 h-3 rounded-full ${i <= currentIdx ? 'bg-primary' : 'bg-gray-700'}"></div>
                        <span class="text-[10px] uppercase font-bold ${i <= currentIdx ? 'text-on-surface' : 'text-on-surface/40'}">${getStatusLabel(s)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderMakerModals() {
    return `
        <!--Quote Modal (Accept)-->
        <div id="modal-accept" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 hidden backdrop-blur-sm">
            <div class="bg-surface p-6 rounded-xl border border-white/10 max-w-md w-full text-center shadow-2xl">
                <span class="material-symbols-outlined text-4xl text-green-500 mb-4">payments</span>
                <h3 class="text-xl font-bold text-on-surface mb-2">Cotizar y Aceptar Pedido</h3>
                <p class="text-on-surface/60 text-sm mb-6">Ingresa el costo total del servicio. El cliente deberá pagar el 50% de adelanto para iniciar.</p>
                
                <div class="mb-6 text-left">
                    <label class="block text-xs text-on-surface/60 mb-2 font-bold uppercase">Precio Total (S/.)</label>
                    <div class="relative">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/60">S/.</span>
                        <input type="number" id="quote-price" class="w-full bg-base border border-white/10 rounded-lg p-3 pl-10 text-on-surface focus:border-primary outline-none font-bold text-lg" placeholder="0.00">
                    </div>
                </div>

                <div class="flex gap-3">
                    <button class="close-modal flex-1 py-2 text-on-surface/60 hover:text-on-surface">Cancelar</button>
                    <button id="confirm-accept" class="flex-1 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 shadow-lg shadow-green-500/20">Enviar Cotización</button>
                </div>
            </div>
        </div>

        <!--Upload Update Modal-->
        <div id="modal-update" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 hidden backdrop-blur-sm">
            <div class="bg-surface p-6 rounded-xl border border-white/10 max-w-lg w-full shadow-2xl">
                <h3 class="text-xl font-bold text-on-surface mb-4">Subir Avance</h3>
                <textarea id="update-content" rows="3" class="w-full bg-base border border-white/10 rounded-lg p-3 text-on-surface mb-4 focus:border-primary outline-none" placeholder="Describe el avance..."></textarea>
                <div class="mb-4">
                    <label class="block text-xs text-on-surface/60 mb-2">URL de la Imagen (Temporal)</label>
                    <input type="text" id="update-image" class="w-full bg-base border border-white/10 rounded-lg p-2 text-on-surface focus:border-primary outline-none" placeholder="https://...">
                </div>
                <div class="flex justify-end gap-3">
                    <button class="close-modal px-4 py-2 text-on-surface/60 hover:text-on-surface">Cancelar</button>
                    <button id="submit-update" class="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 shadow-lg shadow-primary/20">Subir Avance</button>
                </div>
            </div>
        </div>

        <!--Final Review Modal-->
        <div id="modal-final" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 hidden backdrop-blur-sm">
            <div class="bg-surface p-6 rounded-xl border border-white/10 max-w-md w-full text-center shadow-2xl">
                <span class="material-symbols-outlined text-4xl text-primary mb-4">verified</span>
                <h3 class="text-xl font-bold text-on-surface mb-2">¿Enviar para Revisión Final?</h3>
                <p class="text-on-surface/60 text-sm mb-6">Asegúrate de haber subido las fotos finales en el último avance. El cliente deberá aprobar el diseño para finalizar el pedido.</p>
                <div class="flex gap-3">
                    <button class="close-modal flex-1 py-2 text-on-surface/60 hover:text-on-surface">Cancelar</button>
                    <button id="confirm-final" class="flex-1 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 shadow-lg shadow-primary/20">Enviar</button>
                </div>
            </div>
        </div>
    `;
}

function setupMakerModals(order) {
    // Close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.fixed').classList.add('hidden');
        });
    });

    // Accept Logic
    document.getElementById('btn-accept')?.addEventListener('click', () => {
        document.getElementById('modal-accept').classList.remove('hidden');
    });

    document.getElementById('confirm-accept')?.addEventListener('click', async () => {
        const price = document.getElementById('quote-price').value;
        if (!price || price <= 0) {
            alert('Por favor ingresa un precio válido.');
            return;
        }

        const btn = document.getElementById('confirm-accept');
        btn.innerText = 'Enviando...';
        btn.disabled = true;

        const { error } = await supabase
            .from('orders')
            .update({
                status: 'accepted',
                price: parseFloat(price),
                payment_status: 'unpaid' // Ensure it starts unpaid
            })
            .eq('id', order.id);

        if (!error) {
            window.location.reload();
        } else {
            alert('Error al enviar cotización');
            btn.innerText = 'Enviar Cotización';
            btn.disabled = false;
        }
    });

    // Update Logic
    document.getElementById('btn-upload-update')?.addEventListener('click', () => {
        document.getElementById('modal-update').classList.remove('hidden');
    });
    document.getElementById('btn-add-update')?.addEventListener('click', () => {
        document.getElementById('modal-update').classList.remove('hidden');
    });

    document.getElementById('submit-update')?.addEventListener('click', async () => {
        const content = document.getElementById('update-content').value;
        const imageUrl = document.getElementById('update-image').value; // In real app, use storage upload

        if (!content) return alert('Escribe una descripción');

        const { error } = await supabase.from('order_updates').insert({
            order_id: order.id,
            maker_id: order.maker_id,
            content,
            image_url: imageUrl
        });

        if (!error) window.location.reload();
    });

    // Final Review Logic
    document.getElementById('btn-send-review')?.addEventListener('click', () => {
        document.getElementById('modal-final').classList.remove('hidden');
    });

    document.getElementById('confirm-final')?.addEventListener('click', async () => {
        const { error } = await supabase.from('orders').update({ status: 'shipped' }).eq('id', order.id);
        if (!error) window.location.reload();
    });
}

function getStatusColor(status) {
    const map = {
        'pending': 'bg-yellow-500/20 text-yellow-500',
        'accepted': 'bg-blue-500/20 text-blue-500',
        'in_progress': 'bg-purple-500/20 text-purple-500',
        'shipped': 'bg-orange-500/20 text-orange-500',
        'completed': 'bg-green-500/20 text-green-500',
        'cancelled': 'bg-red-500/20 text-red-500'
    };
    return map[status] || 'bg-gray-500/20 text-gray-500';
}

function getStatusLabel(status) {
    const map = {
        'pending': 'Pendiente',
        'accepted': 'Aceptado',
        'in_progress': 'En Proceso',
        'shipped': 'En Revisión',
        'completed': 'Finalizado',
        'cancelled': 'Cancelado'
    };
    return map[status] || status;
}
