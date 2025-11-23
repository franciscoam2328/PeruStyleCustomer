import { supabase } from '../js/supabase.js';
import { getCurrentUser, signOut } from '../js/auth.js';

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
    const activeOrders = orders.filter(o => ['accepted', 'in_progress', 'review'].includes(o.status));
    const finishedOrders = orders.filter(o => ['finished', 'cancelled'].includes(o.status));

    // Tab Logic (Client-side simple toggle)
    window.switchTab = (tabName) => {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
        document.getElementById(`tab-${tabName}`).classList.remove('hidden');

        document.querySelectorAll('.tab-btn').forEach(el => {
            el.classList.remove('text-accent-gold', 'border-accent-gold');
            el.classList.add('text-text-beige-muted', 'border-transparent');
        });
        document.getElementById(`btn-tab-${tabName}`).classList.add('text-accent-gold', 'border-accent-gold');
        document.getElementById(`btn-tab-${tabName}`).classList.remove('text-text-beige-muted', 'border-transparent');
    };

    return `
    <div class="flex min-h-screen w-full bg-background-dark font-display text-text-beige">
        ${renderSidebar(profile)}
        <main class="flex-1 p-8 overflow-y-auto">
            <div class="max-w-6xl mx-auto">
                <h1 class="text-3xl font-black text-white mb-8">Gestión de Pedidos</h1>

                <!-- Tabs -->
                <div class="flex border-b border-white/10 mb-8">
                    <button id="btn-tab-pending" onclick="switchTab('pending')" class="tab-btn px-6 py-3 text-accent-gold border-b-2 border-accent-gold font-bold transition-colors flex items-center gap-2">
                        Solicitudes <span class="bg-accent-gold text-black text-xs px-2 py-0.5 rounded-full">${pendingOrders.length}</span>
                    </button>
                    <button id="btn-tab-active" onclick="switchTab('active')" class="tab-btn px-6 py-3 text-text-beige-muted border-b-2 border-transparent hover:text-white transition-colors flex items-center gap-2">
                        En Curso <span class="bg-white/10 text-white text-xs px-2 py-0.5 rounded-full">${activeOrders.length}</span>
                    </button>
                    <button id="btn-tab-finished" onclick="switchTab('finished')" class="tab-btn px-6 py-3 text-text-beige-muted border-b-2 border-transparent hover:text-white transition-colors">
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
                    ${renderOrderCards(finishedOrders, 'finished')}
                </div>
            </div>
        </main>
    </div>
    `;
}

function renderOrderCards(orders, type) {
    if (orders.length === 0) {
        return `
            <div class="text-center py-12 border-2 border-dashed border-white/5 rounded-xl bg-white/5">
                <span class="material-symbols-outlined text-4xl text-gray-600 mb-2">inbox</span>
                <p class="text-gray-400">No hay pedidos en esta sección.</p>
            </div>
        `;
    }

    return orders.map(order => `
        <div class="bg-card-dark rounded-xl border border-white/5 p-4 flex flex-col md:flex-row gap-6 hover:border-accent-gold/30 transition-colors group">
            <!-- Image -->
            <div class="w-full md:w-48 h-32 bg-gray-800 rounded-lg bg-center bg-cover" style="background-image: url('${order.designs?.preview_url || ''}'); background-color: ${order.designs?.config?.color || '#333'}"></div>
            
            <!-- Info -->
            <div class="flex-1">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h3 class="text-white font-bold text-lg">${order.designs?.name || 'Diseño Personalizado'}</h3>
                        <p class="text-sm text-text-beige-muted">Cliente: ${order.profiles?.full_name || 'Usuario'}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}">
                        ${getStatusLabel(order.status)}
                    </span>
                </div>
                
                <div class="flex gap-4 text-sm text-gray-400 mb-4">
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
                    <a href="/maker-orders?id=${order.id}" class="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-colors border border-white/10">
                        Ver Detalles
                    </a>
                    ${type === 'pending' ? `
                        <button class="px-4 py-2 rounded-lg bg-accent-gold text-black text-sm font-bold hover:bg-accent-gold/90 transition-colors">
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

    if (!order) return '<div class="text-white p-8">Pedido no encontrado.</div>';

    // Fetch updates
    const { data: updates } = await supabase
        .from('order_updates')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

    // Setup Modals Logic
    setTimeout(() => {
        setupMakerModals(order);
    }, 0);

    return `
    <div class="flex min-h-screen w-full bg-background-dark font-display text-text-beige">
        ${renderSidebar(profile)}
        <main class="flex-1 p-8 overflow-y-auto relative">
            <div class="max-w-5xl mx-auto pb-20">
                <!-- Header -->
                <div class="flex items-center gap-4 mb-6">
                    <a href="/maker-orders" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white transition-colors">
                        <span class="material-symbols-outlined">arrow_back</span>
                    </a>
                    <div>
                        <h1 class="text-2xl font-bold text-white">Pedido #${order.id.slice(0, 8)}</h1>
                        <p class="text-text-beige-muted text-sm">Cliente: ${order.profiles?.full_name}</p>
                    </div>
                    <div class="ml-auto">
                        <span class="px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(order.status)}">
                            ${getStatusLabel(order.status)}
                        </span>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Left: Design Specs -->
                    <div class="space-y-6">
                        <div class="bg-card-dark rounded-xl border border-white/5 overflow-hidden">
                            <div class="aspect-square bg-center bg-cover" style="background-image: url('${order.designs?.preview_url || ''}'); background-color: ${order.designs?.config?.color || '#333'}"></div>
                            <div class="p-4">
                                <h3 class="text-white font-bold mb-2">Ficha Técnica</h3>
                                <div class="space-y-2 text-sm text-gray-400">
                                    <div class="flex justify-between border-b border-white/5 pb-2">
                                        <span>Prenda</span>
                                        <span class="text-white">${order.designs?.config?.type || 'Standard'}</span>
                                    </div>
                                    <div class="flex justify-between border-b border-white/5 pb-2">
                                        <span>Color</span>
                                        <span class="flex items-center gap-2">
                                            <span class="w-3 h-3 rounded-full" style="background-color: ${order.designs?.config?.color}"></span>
                                            ${order.designs?.config?.color}
                                        </span>
                                    </div>
                                    <div class="flex justify-between border-b border-white/5 pb-2">
                                        <span>Talla</span>
                                        <span class="text-white">M (Estándar)</span>
                                    </div>
                                </div>
                                <div class="mt-4 bg-white/5 p-3 rounded-lg">
                                    <p class="text-xs text-accent-gold font-bold uppercase mb-1">Mensaje del Cliente</p>
                                    <p class="text-sm italic text-white">"${order.message || 'Sin mensaje'}"</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Actions Card -->
                        <div class="bg-card-dark rounded-xl border border-white/5 p-4 sticky top-4">
                            <h3 class="text-white font-bold mb-4">Acciones</h3>
                            ${renderMakerActions(order)}
                        </div>
                    </div>

                    <!-- Right: Workspace & Timeline -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Timeline -->
                        <div class="bg-card-dark rounded-xl border border-white/5 p-6">
                            <h3 class="text-white font-bold mb-4">Línea de Tiempo</h3>
                            ${renderTimeline(order.status)}
                        </div>

                        <!-- Updates Feed -->
                        <div>
                            <h3 class="text-white font-bold mb-4 flex justify-between items-center">
                                Avances del Proyecto
                                ${['accepted', 'in_progress', 'corrections'].includes(order.status) ? `
                                    <button id="btn-add-update" class="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg text-white transition-colors">
                                        + Nuevo Avance
                                    </button>
                                ` : ''}
                            </h3>
                            <div class="space-y-4">
                                ${updates && updates.length > 0 ? updates.map(u => `
                                    <div class="bg-card-dark border border-white/5 rounded-xl p-4 flex gap-4">
                                        <div class="flex flex-col items-center">
                                            <div class="w-8 h-8 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold">
                                                <span class="material-symbols-outlined text-sm">history_edu</span>
                                            </div>
                                            <div class="w-px h-full bg-white/10 my-2"></div>
                                        </div>
                                        <div class="flex-1">
                                            <div class="flex justify-between mb-2">
                                                <span class="text-white font-bold text-sm">Avance Subido</span>
                                                <span class="text-xs text-gray-500">${new Date(u.created_at).toLocaleString()}</span>
                                            </div>
                                            <p class="text-gray-400 text-sm mb-3">${u.content}</p>
                                            ${u.image_url ? `<img src="${u.image_url}" class="rounded-lg max-h-48 border border-white/10">` : ''}
                                        </div>
                                    </div>
                                `).join('') : '<p class="text-gray-500 text-center py-8">Aún no has subido avances.</p>'}
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

// --- HELPERS & COMPONENTS ---

function renderSidebar(profile) {
    return `
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
                <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-gold hover:bg-white/5" href="/maker-dashboard">
                    <span class="material-symbols-outlined text-xl">dashboard</span>
                    Dashboard
                </a>
                <a class="relative flex items-center gap-4 rounded-lg bg-accent-gold/10 px-4 py-2.5 text-sm font-bold text-accent-gold shadow-gold-glow-soft" href="/maker-orders">
                    <span class="absolute left-0 h-6 w-1 rounded-r-full bg-accent-gold"></span>
                    <span class="material-symbols-outlined text-xl">inventory_2</span>
                    Pedidos
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
            </div>
        </div>
        <div class="flex flex-col gap-1">
            <a class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-text-beige-muted hover:text-accent-copper" href="/logout" id="logout-btn">
                <span class="material-symbols-outlined">logout</span>
                <p class="text-sm font-medium leading-normal">Cerrar sesión</p>
            </a>
        </div>
    </nav>
    `;
}

function renderMakerActions(order) {
    if (order.status === 'pending') {
        return `
            <div class="flex flex-col gap-3">
                <button id="btn-accept" class="w-full py-3 rounded-lg bg-accent-gold text-black font-bold hover:bg-accent-gold/90 transition-colors">
                    Aceptar Pedido
                </button>
                <button id="btn-reject" class="w-full py-3 rounded-lg bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-colors border border-red-500/20">
                    Rechazar
                </button>
            </div>
        `;
    } else if (['accepted', 'in_progress', 'corrections'].includes(order.status)) {
        return `
            <div class="flex flex-col gap-3">
                <button id="btn-upload-update" class="w-full py-3 rounded-lg bg-white/10 text-white font-bold hover:bg-white/20 transition-colors border border-white/10 flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined">cloud_upload</span>
                    Subir Avance
                </button>
                <button id="btn-send-review" class="w-full py-3 rounded-lg bg-accent-gold text-black font-bold hover:bg-accent-gold/90 transition-colors flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined">send</span>
                    Enviar a Revisión Final
                </button>
                <a href="/chat?recipient=${order.client_id}" class="w-full py-3 rounded-lg bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors border border-primary/20 flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined">chat</span>
                    Chat con Cliente
                </a>
            </div>
        `;
    } else if (order.status === 'review') {
        return `
            <div class="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
                <p class="text-yellow-500 font-bold mb-2">Esperando al Cliente</p>
                <p class="text-xs text-gray-400">El cliente está revisando tu entrega final.</p>
            </div>
            <a href="/chat?recipient=${order.client_id}" class="mt-3 w-full py-3 rounded-lg bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors border border-primary/20 flex items-center justify-center gap-2">
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
    const steps = ['pending', 'accepted', 'in_progress', 'review', 'finished'];
    const currentIdx = steps.indexOf(status);
    const progress = Math.max(5, (currentIdx / (steps.length - 1)) * 100);

    return `
        <div class="relative pt-4 pb-2">
            <div class="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full"></div>
            <div class="absolute top-1/2 left-0 h-1 bg-accent-gold -translate-y-1/2 rounded-full transition-all duration-1000" style="width: ${progress}%"></div>
            <div class="relative flex justify-between">
                ${steps.map((s, i) => `
                    <div class="flex flex-col items-center gap-2 z-10">
                        <div class="w-3 h-3 rounded-full ${i <= currentIdx ? 'bg-accent-gold' : 'bg-gray-700'}"></div>
                        <span class="text-[10px] uppercase font-bold ${i <= currentIdx ? 'text-white' : 'text-gray-600'}">${getStatusLabel(s)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderMakerModals() {
    return `
        <!-- Accept Modal -->
        <div id="modal-accept" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 hidden backdrop-blur-sm">
            <div class="bg-card-dark p-6 rounded-xl border border-white/10 max-w-md w-full text-center">
                <span class="material-symbols-outlined text-4xl text-green-500 mb-4">check_circle</span>
                <h3 class="text-xl font-bold text-white mb-2">¿Aceptar este pedido?</h3>
                <p class="text-gray-400 text-sm mb-6">Al aceptar, te comprometes a iniciar el trabajo. El cliente será notificado.</p>
                <div class="flex gap-3">
                    <button class="close-modal flex-1 py-2 text-gray-400 hover:text-white">Cancelar</button>
                    <button id="confirm-accept" class="flex-1 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600">Sí, Aceptar</button>
                </div>
            </div>
        </div>

        <!-- Upload Update Modal -->
        <div id="modal-update" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 hidden backdrop-blur-sm">
            <div class="bg-card-dark p-6 rounded-xl border border-white/10 max-w-lg w-full">
                <h3 class="text-xl font-bold text-white mb-4">Subir Avance</h3>
                <textarea id="update-content" rows="3" class="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white mb-4 focus:border-accent-gold outline-none" placeholder="Describe el avance..."></textarea>
                <div class="mb-4">
                    <label class="block text-xs text-gray-400 mb-2">URL de la Imagen (Temporal)</label>
                    <input type="text" id="update-image" class="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:border-accent-gold outline-none" placeholder="https://...">
                </div>
                <div class="flex justify-end gap-3">
                    <button class="close-modal px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
                    <button id="submit-update" class="px-6 py-2 bg-white/10 text-white rounded-lg font-bold hover:bg-white/20">Subir Avance</button>
                </div>
            </div>
        </div>

        <!-- Final Review Modal -->
        <div id="modal-final" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 hidden backdrop-blur-sm">
            <div class="bg-card-dark p-6 rounded-xl border border-white/10 max-w-md w-full text-center">
                <span class="material-symbols-outlined text-4xl text-accent-gold mb-4">verified</span>
                <h3 class="text-xl font-bold text-white mb-2">¿Enviar para Revisión Final?</h3>
                <p class="text-gray-400 text-sm mb-6">Asegúrate de haber subido las fotos finales en el último avance. El cliente deberá aprobar el diseño para finalizar el pedido.</p>
                <div class="flex gap-3">
                    <button class="close-modal flex-1 py-2 text-gray-400 hover:text-white">Cancelar</button>
                    <button id="confirm-final" class="flex-1 py-2 bg-accent-gold text-black rounded-lg font-bold hover:bg-accent-gold/90">Enviar</button>
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
        const { error } = await supabase.from('orders').update({ status: 'accepted' }).eq('id', order.id);
        if (!error) window.location.reload();
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
        const { error } = await supabase.from('orders').update({ status: 'review' }).eq('id', order.id);
        if (!error) window.location.reload();
    });
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
