import { supabase } from '../js/supabase.js';
import { getCurrentUser, signOut } from '../js/auth.js';

export function OrdersPage() {
    let currentOrder = null;
    let currentUser = null;

    setTimeout(async () => {
        currentUser = await getCurrentUser();
        if (!currentUser) {
            window.location.href = '/login';
            return;
        }

        // Check if URL has order ID (e.g. ?id=123)
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('id');

        if (orderId) {
            loadOrderDetails(orderId);
        } else {
            loadOrdersList();
        }

        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', async () => {
            await signOut();
            window.location.href = '/login';
        });

    }, 0);

    // --- LIST VIEW ---
    async function loadOrdersList() {
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                *,
                designs (name, preview_url, config),
                profiles:maker_id (full_name, avatar_url)
            `)
            .eq('client_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching orders:', error);

        renderOrdersList(orders || []);
    }

    function renderOrdersList(orders) {
        const container = document.getElementById('main-content');
        if (!container) return;

        // Status Map
        const statusMap = {
            'pending': { label: 'Pendiente', color: 'status-pending', bg: 'bg-status-pending' },
            'accepted': { label: 'Aceptado', color: 'status-accepted', bg: 'bg-status-accepted' },
            'in_progress': { label: 'En proceso', color: 'status-processing', bg: 'bg-status-processing' },
            'review': { label: 'En Revisión', color: 'status-processing', bg: 'bg-purple-500' },
            'completed': { label: 'Finalizado', color: 'status-finished', bg: 'bg-status-finished' },
            'cancelled': { label: 'Cancelado', color: 'red-500', bg: 'bg-red-500' }
        };

        const listHtml = `
            <div class="max-w-7xl mx-auto">
                <header class="flex flex-wrap justify-between items-center gap-4 mb-6">
                    <h1 class="text-white text-4xl font-black leading-tight tracking-[-0.033em]">Mis Pedidos</h1>
                    <div class="w-full sm:w-auto">
                        <label class="flex flex-col h-11 w-full max-w-sm">
                            <div class="flex w-full flex-1 items-stretch rounded-lg h-full bg-card-dark">
                                <div class="text-text-beige-muted flex items-center justify-center pl-3">
                                    <span class="material-symbols-outlined">search</span>
                                </div>
                                <input id="search-orders" class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-text-beige focus:outline-0 focus:ring-0 border-none bg-card-dark h-full placeholder:text-text-beige-muted pl-2 text-base font-normal leading-normal" placeholder="Buscar en mis pedidos..." />
                            </div>
                        </label>
                    </div>
                </header>

                <!-- Chips -->
                <div class="flex gap-3 mb-8 overflow-x-auto pb-2">
                    <button class="filter-chip flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-primary px-4 text-white text-sm font-semibold leading-normal transition-colors" data-status="all">Todos</button>
                    <button class="filter-chip flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-card-dark px-4 text-text-beige hover:bg-primary/20 text-sm font-medium leading-normal transition-colors" data-status="pending">Pendiente</button>
                    <button class="filter-chip flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-card-dark px-4 text-text-beige hover:bg-primary/20 text-sm font-medium leading-normal transition-colors" data-status="in_progress">En proceso</button>
                    <button class="filter-chip flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-card-dark px-4 text-text-beige hover:bg-primary/20 text-sm font-medium leading-normal transition-colors" data-status="completed">Finalizado</button>
                </div>

                <!-- Grid -->
                <div id="orders-grid" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    ${orders.length === 0 ? `
                        <div class="col-span-full flex flex-col items-center justify-center py-16 text-center">
                            <span class="material-symbols-outlined text-primary text-5xl mb-4">inventory</span>
                            <h2 class="text-2xl font-bold text-white mb-2">Aún no tienes pedidos activos.</h2>
                            <a href="/my-designs" class="text-accent-gold hover:underline">Envía un diseño a confección</a>
                        </div>
                    ` : orders.map(order => {
            const st = statusMap[order.status] || statusMap['pending'];
            const designName = order.designs?.name || 'Diseño';
            const makerName = order.profiles?.full_name || 'Esperando asignación...';
            const createdDate = new Date(order.created_at).toLocaleDateString('es-ES');

            const cfg = order.designs?.config || {};
            const color = cfg.color || '#ffffff';
            const previewStyle = order.designs?.preview_url
                ? `background-image: url('${order.designs.preview_url}'); background-color: ${color};`
                : `background: linear-gradient(135deg, ${color}, ${color}dd);`;

            return `
                            <div class="bg-card-dark rounded-xl border border-white/10 p-4 flex flex-col gap-4 hover:border-primary/50 hover:shadow-glow transition-all duration-300 cursor-pointer" onclick="window.location.href='/orders?id=${order.id}'">
                                <div class="relative w-full aspect-[4/3] bg-center bg-no-repeat bg-cover rounded-lg flex items-center justify-center" style="${previewStyle}">
                                    ${!order.designs?.preview_url ? '<span class="text-4xl">👕</span>' : ''}
                                    <div class="absolute top-3 right-3 flex items-center gap-x-1.5 rounded-full ${st.bg}/20 px-2.5 py-1 backdrop-blur-md border border-white/10">
                                        <span class="size-2 rounded-full ${st.bg}"></span>
                                        <p class="text-white text-xs font-bold shadow-black drop-shadow-md">${st.label}</p>
                                    </div>
                                </div>
                                <div class="flex flex-col gap-1 flex-grow">
                                    <p class="text-text-beige-muted text-sm font-normal">${makerName}</p>
                                    <p class="text-white text-lg font-bold">${designName}</p>
                                    <p class="text-text-beige-muted text-xs">Creado: ${createdDate}</p>
                                </div>
                                <button class="w-full rounded-lg h-10 bg-primary/10 text-primary font-bold hover:bg-primary hover:text-white transition-all">
                                    Ver detalles
                                </button>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;

        container.innerHTML = listHtml;

        // Re-attach search/filter listeners if needed (simplified for now)
    }

    // --- DETAILS VIEW ---
    async function loadOrderDetails(orderId) {
        const { data: order, error } = await supabase
            .from('orders')
            .select(`
                *,
                designs (*),
                profiles:maker_id (*)
            `)
            .eq('id', orderId)
            .single();

        if (error || !order) {
            console.error('Error loading order:', error);
            window.location.href = '/orders';
            return;
        }

        currentOrder = order;
        renderOrderDetails(order);
        loadOrderUpdates(orderId);
    }

    async function loadOrderUpdates(orderId) {
        const { data: updates } = await supabase
            .from('order_updates')
            .select('*')
            .eq('order_id', orderId)
            .order('created_at', { ascending: false });

        renderUpdatesFeed(updates || []);
    }

    // --- MODALS & ACTIONS ---

    function setupModals(order) {
        // Close buttons
        document.querySelectorAll('.close-modal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.fixed');
                if (modal) modal.classList.add('hidden');
            });
        });

        // 1. Request Corrections
        const requestBtn = document.getElementById('btn-request-corrections');
        if (requestBtn) {
            requestBtn.addEventListener('click', () => {
                document.getElementById('modal-corrections').classList.remove('hidden');
            });
        }

        document.getElementById('submit-corrections')?.addEventListener('click', async () => {
            const feedback = document.getElementById('corrections-feedback').value;
            if (!feedback) return alert('Por favor describe las correcciones necesarias.');

            const btn = document.getElementById('submit-corrections');
            btn.innerText = 'Enviando...';
            btn.disabled = true;

            // Update order status back to 'in_progress'
            const { error } = await supabase
                .from('orders')
                .update({ status: 'in_progress' })
                .eq('id', order.id);

            if (error) {
                console.error(error);
                alert('Error al enviar correcciones.');
                btn.innerText = 'Enviar Correcciones';
                btn.disabled = false;
                return;
            }

            // Add feedback as a message or update (optional, but good for context)
            await supabase.from('messages').insert({
                sender_id: currentUser.id,
                receiver_id: order.maker_id,
                content: `[Correcciones Solicitadas]: ${feedback}`
            });

            window.location.reload();
        });

        // 2. Accept Final Design
        const acceptBtn = document.getElementById('btn-accept-design');
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                document.getElementById('modal-accept').classList.remove('hidden');
            });
        }

        document.getElementById('confirm-accept')?.addEventListener('click', async () => {
            const btn = document.getElementById('confirm-accept');
            btn.innerText = 'Procesando...';
            btn.disabled = true;

            // Update order status to 'finished'
            const { error } = await supabase
                .from('orders')
                .update({ status: 'completed' })
                .eq('id', order.id);

            if (error) {
                console.error(error);
                alert('Error al finalizar el pedido.');
                btn.innerText = 'Sí, Aprobar Diseño';
                btn.disabled = false;
                return;
            }

            // Show Success/Rate Modal (or reload to show finished state)
            window.location.reload();
        });

        // 3. Rate Maker
        const rateBtn = document.getElementById('btn-rate-maker');
        if (rateBtn) {
            rateBtn.addEventListener('click', () => {
                document.getElementById('modal-rate').classList.remove('hidden');
            });
        }

        // Star Rating Logic
        let currentRating = 0;
        document.querySelectorAll('.star-btn').forEach(star => {
            star.addEventListener('click', () => {
                currentRating = parseInt(star.dataset.value);
                updateStars(currentRating);
            });
        });

        function updateStars(rating) {
            document.querySelectorAll('.star-btn').forEach(star => {
                const val = parseInt(star.dataset.value);
                star.style.fontVariationSettings = val <= rating ? "'FILL' 1" : "'FILL' 0";
                star.classList.toggle('text-yellow-500', val <= rating);
                star.classList.toggle('text-gray-600', val > rating);
            });
        }

        document.getElementById('submit-rating')?.addEventListener('click', async () => {
            if (currentRating === 0) return alert('Por favor selecciona una calificación.');
            const comment = document.getElementById('rating-comment').value;

            const btn = document.getElementById('submit-rating');
            btn.innerText = 'Enviando...';
            btn.disabled = true;

            // Insert review
            const { error } = await supabase
                .from('reviews')
                .insert({
                    order_id: order.id,
                    client_id: currentUser.id,
                    maker_id: order.maker_id,
                    rating: currentRating,
                    comment: comment
                });

            if (error) {
                console.error(error);
                alert('Error al enviar calificación.');
                btn.innerText = 'Enviar Calificación';
                btn.disabled = false;
                return;
            }

            alert('¡Gracias por tu calificación!');
            window.location.reload();
        });
    }

    function renderOrderDetails(order) {
        const container = document.getElementById('main-content');
        if (!container) return;

        const statusSteps = ['pending', 'accepted', 'in_progress', 'shipped', 'completed'];
        const currentStepIndex = statusSteps.indexOf(order.status);
        const progressWidth = Math.max(5, (currentStepIndex / (statusSteps.length - 1)) * 100);

        const maker = order.profiles || { full_name: 'Pendiente de asignación', avatar_url: null };
        const design = order.designs || {};

        const detailsHtml = `
            <div class="max-w-6xl mx-auto pb-12 relative">
                <!-- Back Button -->
                <button onclick="window.location.href='/orders'" class="flex items-center text-text-beige-muted hover:text-white mb-6 transition-colors">
                    <span class="material-symbols-outlined mr-2">arrow_back</span>
                    Volver a mis pedidos
                </button>

                <!-- Header Info -->
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <div class="flex items-center gap-3 mb-1">
                            <h1 class="text-3xl font-bold text-white">Pedido #${order.id.slice(0, 8)}</h1>
                            <span class="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-bold border border-primary/20">
                                ${getStatusLabel(order.status)}
                            </span>
                        </div>
                        <p class="text-text-beige-muted">Iniciado el ${new Date(order.created_at).toLocaleDateString('es-ES', { dateStyle: 'long' })}</p>
                    </div>
                    ${order.maker_id ? `
                        <div class="flex items-center gap-4 bg-card-dark p-3 rounded-xl border border-white/5">
                            <div class="w-10 h-10 rounded-full bg-white/10 overflow-hidden">
                                ${maker.avatar_url ? `<img src="${maker.avatar_url}" class="w-full h-full object-cover">` : '<span class="material-symbols-outlined p-2">person</span>'}
                            </div>
                            <div>
                                <p class="text-sm text-text-beige-muted">Confeccionista</p>
                                <p class="text-white font-bold text-sm">${maker.full_name}</p>
                            </div>
                            <a href="/chat?recipient_id=${order.maker_id}" class="ml-2 w-8 h-8 rounded-full bg-accent-gold text-black flex items-center justify-center hover:scale-110 transition-transform">
                                <span class="material-symbols-outlined text-lg">chat</span>
                            </a>
                        </div>
                    ` : ''}
                </div>

                <!-- Timeline -->
                <div class="bg-card-dark rounded-xl p-6 border border-white/5 mb-8">
                    <h3 class="text-white font-bold mb-6">Progreso del Pedido</h3>
                    <div class="relative">
                        <div class="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full"></div>
                        <div class="absolute top-1/2 left-0 h-1 bg-accent-gold -translate-y-1/2 rounded-full transition-all duration-1000" style="width: ${progressWidth}%"></div>
                        <div class="relative flex justify-between">
                            ${renderTimelineStep('Solicitado', 0, currentStepIndex)}
                            ${renderTimelineStep('Aceptado', 1, currentStepIndex)}
                            ${renderTimelineStep('En Proceso', 2, currentStepIndex)}
                            ${renderTimelineStep('Revisión', 3, currentStepIndex)}
                            ${renderTimelineStep('Finalizado', 4, currentStepIndex)}
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Left Column: Feed & Updates -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Tabs -->
                        <div class="flex border-b border-white/10 mb-4">
                            <button class="px-6 py-3 text-accent-gold border-b-2 border-accent-gold font-bold">Avances</button>
                            <button class="px-6 py-3 text-text-beige-muted hover:text-white transition-colors">Archivos</button>
                        </div>

                        <!-- Feed Container -->
                        <div id="updates-feed" class="space-y-6">
                            <div class="text-center py-8 text-text-beige-muted">Cargando actualizaciones...</div>
                        </div>
                    </div>

                    <!-- Right Column: Design Info & Actions -->
                    <div class="space-y-6">
                        <!-- Design Card -->
                        <div class="bg-card-dark rounded-xl border border-white/5 overflow-hidden">
                            <div class="aspect-video bg-center bg-cover" style="background-image: url('${design.preview_url || ''}'); background-color: ${design.config?.color || '#333'}"></div>
                            <div class="p-4">
                                <h3 class="text-white font-bold text-lg mb-1">${design.name}</h3>
                                <p class="text-sm text-text-beige-muted mb-4">Tipo: ${design.config?.type || 'Prenda'}</p>
                                <div class="bg-black/20 p-3 rounded-lg">
                                    <p class="text-xs text-gray-400 uppercase font-bold mb-1">Instrucciones Iniciales</p>
                                    <p class="text-sm text-text-beige italic">"${order.message || 'Sin instrucciones adicionales.'}"</p>
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons (Dynamic based on status) -->
                        <div class="bg-card-dark rounded-xl border border-white/5 p-4 sticky top-4">
                            <h4 class="text-white font-bold mb-4">Acciones</h4>
                            ${renderActionButtons(order)}
                        </div>
                    </div>
                </div>

                <!-- MODALS -->
                
                <!-- 1. Request Corrections Modal -->
                <div id="modal-corrections" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 hidden backdrop-blur-sm">
                    <div class="w-full max-w-lg rounded-xl bg-[#1A1A1A] border border-white/10 shadow-2xl p-6">
                        <h3 class="text-xl font-bold text-white mb-4">Solicitar Correcciones</h3>
                        <p class="text-gray-400 text-sm mb-4">Describe los cambios que necesitas. El pedido volverá al estado <span class="text-yellow-500">En Proceso</span>.</p>
                        <textarea id="corrections-feedback" rows="4" class="w-full rounded-lg bg-black/20 border border-white/10 p-3 text-white mb-4 focus:border-accent-gold outline-none" placeholder="Ej: El cuello está muy ancho, por favor ajustarlo..."></textarea>
                        <div class="flex justify-end gap-3">
                            <button class="close-modal-btn px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
                            <button id="submit-corrections" class="px-6 py-2 rounded-lg bg-white text-black font-bold hover:bg-gray-200">Enviar Correcciones</button>
                        </div>
                    </div>
                </div>

                <!-- 2. Accept Final Design Modal -->
                <div id="modal-accept" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 hidden backdrop-blur-sm">
                    <div class="w-full max-w-md rounded-xl bg-[#1A1A1A] border border-green-500/30 shadow-2xl p-6 text-center">
                        <div class="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                            <span class="material-symbols-outlined text-green-500 text-3xl">verified</span>
                        </div>
                        <h3 class="text-xl font-bold text-white mb-2">¿Aprobar Diseño Final?</h3>
                        <p class="text-gray-400 text-sm mb-6">Al aceptar, confirmas que el trabajo está completo. El pedido pasará a <span class="text-green-500 font-bold">Finalizado</span> y no podrás solicitar más cambios.</p>
                        <div class="flex flex-col gap-3">
                            <button id="confirm-accept" class="w-full py-3 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600">Sí, Aprobar Diseño</button>
                            <button class="close-modal-btn text-gray-500 hover:text-white text-sm">Cancelar</button>
                        </div>
                    </div>
                </div>

                <!-- 3. Rate Maker Modal -->
                <div id="modal-rate" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 hidden backdrop-blur-sm">
                    <div class="w-full max-w-md rounded-xl bg-[#1A1A1A] border border-accent-gold/30 shadow-2xl p-6 text-center">
                        <h3 class="text-xl font-bold text-white mb-2">Calificar Confeccionista</h3>
                        <p class="text-gray-400 text-sm mb-6">¿Qué tal fue tu experiencia con ${maker.full_name}?</p>
                        
                        <div class="flex justify-center gap-2 mb-6">
                            <button class="star-btn material-symbols-outlined text-4xl text-gray-600 hover:scale-110 transition-transform" data-value="1">star</button>
                            <button class="star-btn material-symbols-outlined text-4xl text-gray-600 hover:scale-110 transition-transform" data-value="2">star</button>
                            <button class="star-btn material-symbols-outlined text-4xl text-gray-600 hover:scale-110 transition-transform" data-value="3">star</button>
                            <button class="star-btn material-symbols-outlined text-4xl text-gray-600 hover:scale-110 transition-transform" data-value="4">star</button>
                            <button class="star-btn material-symbols-outlined text-4xl text-gray-600 hover:scale-110 transition-transform" data-value="5">star</button>
                        </div>

                        <textarea id="rating-comment" rows="3" class="w-full rounded-lg bg-black/20 border border-white/10 p-3 text-white mb-4 focus:border-accent-gold outline-none" placeholder="Escribe una reseña (opcional)..."></textarea>
                        
                        <div class="flex justify-end gap-3">
                            <button class="close-modal-btn px-4 py-2 text-gray-400 hover:text-white">Omitir</button>
                            <button id="submit-rating" class="px-6 py-2 rounded-lg bg-accent-gold text-black font-bold hover:bg-accent-gold/90">Enviar Calificación</button>
                        </div>
                    </div>
                </div>

            </div>
        `;

        container.innerHTML = detailsHtml;

        // Initialize modals logic
        setupModals(order);
    }

    function renderTimelineStep(label, index, currentIndex) {
        const active = index <= currentIndex;
        const current = index === currentIndex;
        return `
            <div class="flex flex-col items-center gap-2 z-10">
                <div class="w-4 h-4 rounded-full border-2 ${active ? 'bg-accent-gold border-accent-gold' : 'bg-card-dark border-gray-600'} ${current ? 'ring-4 ring-accent-gold/20' : ''} transition-all"></div>
                <span class="text-xs font-medium ${active ? 'text-white' : 'text-gray-500'}">${label}</span>
            </div>
        `;
    }

    function renderUpdatesFeed(updates) {
        const container = document.getElementById('updates-feed');
        if (!container) return;

        if (updates.length === 0) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/5 rounded-xl bg-white/5">
                    <span class="material-symbols-outlined text-4xl text-gray-600 mb-2">history_edu</span>
                    <p class="text-gray-400">No hay avances registrados aún.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = updates.map(update => `
            <div class="flex gap-4">
                <div class="flex flex-col items-center">
                    <div class="w-2 h-2 rounded-full bg-accent-gold mt-2"></div>
                    <div class="w-px h-full bg-white/10 my-1"></div>
                </div>
                <div class="flex-1 bg-card-dark border border-white/5 rounded-xl p-4 mb-2">
                    <div class="flex justify-between items-start mb-2">
                        <p class="text-white font-bold text-sm">Actualización del Confeccionista</p>
                        <span class="text-xs text-gray-500">${new Date(update.created_at).toLocaleDateString()} ${new Date(update.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p class="text-text-beige mb-3 text-sm">${update.content || ''}</p>
                    ${update.image_url ? `
                        <div class="rounded-lg overflow-hidden border border-white/10 cursor-pointer hover:opacity-90 transition-opacity" onclick="window.open('${update.image_url}', '_blank')">
                            <img src="${update.image_url}" class="w-full h-full object-cover">
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    function renderActionButtons(order) {
        if (order.status === 'shipped') {
            return `
                <div class="flex flex-col gap-3">
                    <button id="btn-accept-design" class="w-full py-3 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20 flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined">check_circle</span>
                        Aprobar Diseño Final
                    </button>
                    <button id="btn-request-corrections" class="w-full py-3 rounded-lg bg-white/5 text-white font-medium hover:bg-white/10 transition-colors border border-white/10 flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined">edit_note</span>
                        Solicitar Correcciones
                    </button>
                </div>
            `;
        } else if (order.status === 'completed') {
            return `
                <div class="flex flex-col gap-3">
                    <div class="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                        <p class="text-green-400 text-sm font-bold">¡Pedido Completado!</p>
                    </div>
                    <button id="btn-rate-maker" class="w-full py-3 rounded-lg bg-accent-gold text-black font-bold hover:bg-accent-gold/90 transition-colors">
                        Calificar Confeccionista
                    </button>
                </div>
            `;
        } else {
            return `
                <div class="p-4 bg-white/5 rounded-lg text-center">
                    <p class="text-gray-400 text-sm">Esperando acciones del confeccionista.</p>
                </div>
                <a href="/chat?recipient_id=${order.maker_id}" class="mt-3 w-full py-2 rounded-lg bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors flex items-center justify-center gap-2 text-sm">
                    <span class="material-symbols-outlined text-lg">chat</span>
                    Enviar Mensaje
                </a>
            `;
        }
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

    // Main Layout Wrapper
    return `
    <div class="flex min-h-screen w-full bg-background-dark font-display text-text-beige">
        <!-- SideNavBar (Reused) -->
        <nav class="w-64 flex-shrink-0 bg-sidebar-dark border-r border-white/5 p-4 flex flex-col justify-between hidden md:flex">
            <div class="flex flex-col gap-4">
                <div class="flex items-center gap-3 p-2">
                    <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-primary/20 flex items-center justify-center text-primary font-bold">
                        U
                    </div>
                    <div class="flex flex-col">
                        <h1 class="text-white text-base font-medium leading-normal">Usuario</h1>
                        <p class="text-text-beige-muted text-sm font-normal leading-normal">cliente@email.com</p>
                    </div>
                </div>
                <div class="flex flex-col gap-1">
                    <a class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-text-beige-muted hover:text-accent-gold" href="/client-dashboard">
                        <span class="material-symbols-outlined">dashboard</span>
                        <p class="text-sm font-medium leading-normal">Dashboard</p>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-text-beige-muted hover:text-accent-gold" href="/my-designs">
                        <span class="material-symbols-outlined">design_services</span>
                        <p class="text-sm font-medium leading-normal">Mis Diseños</p>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/20 shadow-glow ring-1 ring-primary/50 transition-all text-primary" href="/orders">
                        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">list_alt</span>
                        <p class="text-sm font-bold leading-normal">Mis Pedidos</p>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-text-beige-muted hover:text-accent-gold" href="/makers">
                        <span class="material-symbols-outlined">storefront</span>
                        <p class="text-sm font-medium leading-normal">Explorar</p>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-text-beige-muted hover:text-accent-gold" href="/chat">
                        <span class="material-symbols-outlined">chat_bubble</span>
                        <p class="text-sm font-medium leading-normal">Chat</p>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-text-beige-muted hover:text-accent-gold" href="/profile">
                        <span class="material-symbols-outlined">person</span>
                        <p class="text-sm font-medium leading-normal">Mi Perfil</p>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-text-beige-muted hover:text-accent-gold" href="/plans">
                        <span class="material-symbols-outlined">workspace_premium</span>
                        <p class="text-sm font-medium leading-normal">Mi Suscripción</p>
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
        <main class="flex-1 p-4 md:p-8 overflow-y-auto" id="main-content">
            <!-- Content injected by JS -->
            <div class="flex items-center justify-center h-full">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-gold"></div>
            </div>
        </main>
    </div>
    `;
}
