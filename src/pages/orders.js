import { supabase } from '../js/supabase.js';
import { getCurrentUser, signOut } from '../js/auth.js';
import { getLogo } from '../components/logo.js';

export function OrdersPage() {
    setTimeout(async () => {
        const user = await getCurrentUser();
        if (!user) {
            window.location.href = '/login';
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('id');

        if (orderId) {
            await renderOrderDetail(orderId, user);
        } else {
            await renderOrdersList(user);
        }

        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', async () => {
            await signOut();
            window.location.href = '/login';
        });

    }, 0);

    // --- RENDER LIST ---
    async function renderOrdersList(user) {
        const container = document.getElementById('orders-content');
        if (!container) return;

        // Fetch orders
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                *,
                maker:profiles!maker_id(full_name, avatar_url),
                design:designs(name, preview_url, config)
            `)
            .eq('client_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            container.innerHTML = '<p class="text-red-500">Error al cargar pedidos.</p>';
            return;
        }

        // Render Markup
        container.innerHTML = `
        <div class="max-w-7xl mx-auto">
            <div class="flex justify-between items-center mb-8">
                <h1 class="text-3xl font-bold text-on-surface">Mis Pedidos</h1>
                <div class="flex gap-2">
                    <button class="px-4 py-2 rounded-lg bg-surface border border-white/10 text-on-surface text-sm font-medium hover:bg-primary/10 transition-colors active">Todos</button>
                    <button class="px-4 py-2 rounded-lg bg-surface border border-white/10 text-on-surface/60 text-sm font-medium hover:bg-primary/10 hover:text-on-surface transition-colors">Activos</button>
                    <button class="px-4 py-2 rounded-lg bg-surface border border-white/10 text-on-surface/60 text-sm font-medium hover:bg-primary/10 hover:text-on-surface transition-colors">Completados</button>
                </div>
            </div>

            ${orders.length === 0 ? `
                <div class="flex flex-col items-center justify-center py-20 text-on-surface/40">
                    <span class="material-symbols-outlined text-6xl mb-4">inventory_2</span>
                    <p class="text-xl font-medium">No tienes pedidos aún</p>
                    <a href="/my-designs" class="mt-4 text-primary hover:underline">Ir a Mis Diseños para crear uno</a>
                </div>
            ` : `
                <div class="grid grid-cols-1 gap-4">
                    ${orders.map(order => createOrderCard(order)).join('')}
                </div>
            `}
        </div>
        `;
    }

    function createOrderCard(order) {
        const statusColors = {
            pending: 'bg-yellow-500/20 text-yellow-500',
            accepted: 'bg-blue-500/20 text-blue-500',
            in_progress: 'bg-purple-500/20 text-purple-500',
            completed: 'bg-green-500/20 text-green-500',
            cancelled: 'bg-red-500/20 text-red-500'
        };
        const statusLabels = {
            pending: 'Pendiente',
            accepted: 'Aceptado',
            in_progress: 'En Progreso',
            completed: 'Completado',
            cancelled: 'Cancelado'
        };

        const date = new Date(order.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
        const makerName = order.maker?.full_name || 'Confeccionista';
        const designName = order.design?.name || 'Diseño sin nombre';
        const previewUrl = order.design?.preview_url;
        const designColor = order.design?.config?.color || '#333';

        return `
        <div class="bg-surface rounded-xl border border-white/10 p-4 flex flex-col md:flex-row gap-6 hover:border-primary/50 transition-all duration-300 cursor-pointer group" onclick="window.location.href='/orders?id=${order.id}'">
            <!-- Image -->
            <div class="w-full md:w-32 h-32 rounded-lg bg-base bg-center bg-cover flex-shrink-0 border border-white/5" style="${previewUrl ? `background-image: url('${previewUrl}'); background-color: ${designColor};` : `background-color: ${designColor};`}">
                ${!previewUrl ? '<div class="w-full h-full flex items-center justify-center text-3xl">👕</div>' : ''}
            </div>
            
            <!-- Info -->
            <div class="flex-1 flex flex-col justify-center">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h3 class="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">${designName}</h3>
                        <p class="text-sm text-on-surface/60">Pedido #${order.id.slice(0, 8)} • ${date}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || 'bg-gray-500/20 text-gray-500'}">
                        ${statusLabels[order.status] || order.status}
                    </span>
                </div>
                
                <div class="flex items-center gap-3 mt-2">
                    <div class="flex items-center gap-2 bg-base/50 px-3 py-1.5 rounded-lg border border-white/5">
                        <span class="material-symbols-outlined text-primary text-sm">person</span>
                        <span class="text-sm text-on-surface/80">${makerName}</span>
                    </div>
                    <div class="flex items-center gap-2 bg-base/50 px-3 py-1.5 rounded-lg border border-white/5">
                        <span class="material-symbols-outlined text-primary text-sm">payments</span>
                        <span class="text-sm text-on-surface/80">${order.price ? `S/ ${order.price}` : 'Por cotizar'}</span>
                    </div>
                </div>
            </div>

            <!-- Action Arrow -->
            <div class="flex items-center justify-center px-2 text-on-surface/40 group-hover:text-primary transition-colors">
                <span class="material-symbols-outlined text-3xl">chevron_right</span>
            </div>
        </div>
        `;
    }

    // --- RENDER DETAIL ---
    async function renderOrderDetail(orderId, user) {
        const container = document.getElementById('orders-content');
        if (!container) return;

        const { data: order, error } = await supabase
            .from('orders')
            .select(`
                *,
                maker:profiles!maker_id(*),
                design:designs(*)
            `)
            .eq('id', orderId)
            .single();

        // Fetch updates
        const { data: updates } = await supabase
            .from('order_updates')
            .select('*')
            .eq('order_id', orderId)
            .order('created_at', { ascending: false });

        if (error || !order) {
            container.innerHTML = '<p class="text-red-500">Pedido no encontrado.</p>';
            return;
        }

        // Logic for steps
        const steps = ['pending', 'accepted', 'in_progress', 'completed'];
        const currentStepIdx = steps.indexOf(order.status);
        const progressWidth = Math.max(5, (currentStepIdx / (steps.length - 1)) * 100);

        container.innerHTML = `
        <div class="max-w-5xl mx-auto">
            <!-- Back Button -->
            <a href="/orders" class="inline-flex items-center gap-2 text-on-surface/60 hover:text-primary mb-6 transition-colors">
                <span class="material-symbols-outlined text-sm">arrow_back</span>
                Volver a mis pedidos
            </a>

            <!-- Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-on-surface mb-1">Detalle del Pedido</h1>
                    <p class="text-on-surface/60">ID: ${order.id}</p>
                </div>
                ${order.status === 'completed' ? `
                    <button id="btn-rate-service" class="px-6 py-2 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
                        Calificar Servicio
                    </button>
                ` : ''}
            </div>

            <!-- Status Tracker -->
            <div class="bg-surface rounded-xl border border-white/10 p-8 mb-8">
                <div class="relative">
                    <div class="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full"></div>
                    <div class="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-1000" style="width: ${progressWidth}%"></div>
                    
                    <div class="relative flex justify-between">
                        ${['Solicitado', 'Aceptado', 'En Confección', 'Entregado'].map((label, idx) => {
            const active = idx <= currentStepIdx;
            return `
                                <div class="flex flex-col items-center gap-2">
                                    <div class="w-8 h-8 rounded-full flex items-center justify-center z-10 ${active ? 'bg-primary text-white shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-base border border-white/20 text-on-surface/40'} transition-all duration-500">
                                        <span class="material-symbols-outlined text-sm">${idx === 3 ? 'check_circle' : (idx === 2 ? 'precision_manufacturing' : (idx === 1 ? 'handshake' : 'inventory_2'))}</span>
                                    </div>
                                    <span class="text-xs font-medium ${active ? 'text-primary' : 'text-on-surface/40'}">${label}</span>
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Left Column: Details -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- Design Card -->
                    <div class="bg-surface rounded-xl border border-white/10 p-6">
                        <h3 class="text-lg font-bold text-on-surface mb-4">Diseño Solicitado</h3>
                        <div class="flex gap-4">
                            <div class="w-24 h-32 rounded-lg bg-base bg-center bg-cover border border-white/5" style="${order.design?.preview_url ? `background-image: url('${order.design.preview_url}'); background-color: ${order.design.config?.color};` : `background-color: ${order.design?.config?.color};`}"></div>
                            <div>
                                <h4 class="font-bold text-on-surface text-lg">${order.design?.name}</h4>
                                <p class="text-on-surface/60 text-sm mb-2">Tipo: ${order.design?.config?.type}</p>
                                <div class="flex gap-2">
                                    <span class="px-2 py-1 rounded bg-base border border-white/10 text-xs text-on-surface/80">Talla M</span>
                                    <span class="px-2 py-1 rounded bg-base border border-white/10 text-xs text-on-surface/80">Algodón</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Timeline/Activity -->
                    <div class="bg-surface rounded-xl border border-white/10 p-6">
                        <h3 class="text-lg font-bold text-on-surface mb-4">Actividad</h3>
                        <div class="space-y-6 relative border-l-2 border-white/10 ml-3 pl-6">
                            <div class="relative">
                                <div class="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-surface"></div>
                                <p class="text-sm text-on-surface/40 mb-1">${new Date(order.created_at).toLocaleString()}</p>
                                <p class="text-on-surface">Solicitud enviada al confeccionista.</p>
                            </div>
                            ${order.status !== 'pending' ? `
                                <div class="relative">
                                    <div class="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-surface"></div>
                                    <p class="text-sm text-on-surface/40 mb-1">Hace 2 días</p>
                                    <p class="text-on-surface">El confeccionista aceptó el pedido.</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <!-- Right Column: Maker & Actions -->
                <div class="space-y-6">
                    <!-- Maker Profile -->
                    <div class="bg-surface rounded-xl border border-white/10 p-6 text-center">
                        <div class="w-20 h-20 rounded-full bg-base mx-auto mb-3 overflow-hidden border-2 border-primary/20">
                            <img src="${order.maker?.avatar_url || 'https://via.placeholder.com/150'}" class="w-full h-full object-cover">
                        </div>
                        <h3 class="font-bold text-on-surface text-lg">${order.maker?.full_name}</h3>
                        <p class="text-primary text-sm font-medium mb-4">Confeccionista</p>
                        <button class="w-full py-2 rounded-lg bg-base border border-white/10 text-on-surface hover:bg-white/5 transition-colors flex items-center justify-center gap-2" onclick="window.location.href='/chat?recipient_id=${order.maker_id}'">
                            <span class="material-symbols-outlined text-sm">chat</span>
                            Enviar Mensaje
                        </button>
                    </div>

                    <!-- Summary -->
                    <div class="bg-surface rounded-xl border border-white/10 p-6">
                        <h3 class="text-lg font-bold text-on-surface mb-4">Resumen</h3>
                        <div class="space-y-3 mb-6">
                            <div class="flex justify-between text-sm">
                                <span class="text-on-surface/60">Subtotal</span>
                                <span class="text-on-surface">S/ ${order.price || '---'}</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-on-surface/60">Envío</span>
                                <span class="text-on-surface">S/ 15.00</span>
                            </div>
                            <div class="h-px bg-white/10 my-2"></div>
                            <div class="flex justify-between font-bold text-lg">
                                <span class="text-on-surface">Total</span>
                                <span class="text-primary">S/ ${order.price ? (order.price + 15) : '---'}</span>
                            </div>
                        </div>
                        ${order.status === 'pending' ? `
                            <div class="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs text-center">
                                Esperando cotización del confeccionista
                            </div>
                        ` : ''}

                        ${order.status === 'accepted' && order.payment_status === 'unpaid' ? `
                            <div class="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4">
                                <p class="text-blue-400 text-sm font-bold mb-1">Cotización Recibida</p>
                                <p class="text-on-surface/80 text-xs mb-3">El confeccionista ha fijado el precio. Paga el 50% de adelanto para iniciar.</p>
                                <div class="flex justify-between text-sm mb-3 font-bold">
                                    <span class="text-on-surface">Adelanto (50%)</span>
                                    <span class="text-primary">S/ ${(order.price / 2).toFixed(2)}</span>
                                </div>
                                <button id="btn-pay-advance" class="w-full py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                                    Pagar Adelanto
                                </button>
                            </div>
                        ` : ''}

                        ${order.status === 'shipped' ? `
                            <div class="p-4 bg-green-500/10 border border-green-500/20 rounded-lg mb-4">
                                <p class="text-green-500 text-sm font-bold mb-1">Entrega Final Lista</p>
                                <p class="text-on-surface/80 text-xs mb-3">El confeccionista ha enviado el pedido final. Paga el 50% restante para completar la orden.</p>
                                <div class="flex justify-between text-sm mb-3 font-bold">
                                    <span class="text-on-surface">Restante (50%)</span>
                                    <span class="text-primary">S/ ${(order.price / 2).toFixed(2)}</span>
                                </div>
                                <button id="btn-pay-final" class="w-full py-2 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20">
                                    Pagar y Finalizar
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>

            <!-- Updates Section -->
            <div class="mt-8">
                <h2 class="text-2xl font-bold text-on-surface mb-6">Avances del Proyecto</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    ${updates && updates.length > 0 ? updates.map(u => `
                        <div class="bg-surface border border-white/10 rounded-xl p-6 shadow-lg hover:border-primary/30 transition-colors">
                            <div class="flex items-start gap-4">
                                <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                                    <span class="material-symbols-outlined">history_edu</span>
                                </div>
                                <div class="flex-1">
                                    <div class="flex justify-between items-start mb-2">
                                        <h4 class="font-bold text-on-surface">Avance del Confeccionista</h4>
                                        <span class="text-xs text-on-surface/40 bg-base px-2 py-1 rounded-full border border-white/5">${new Date(u.created_at).toLocaleString()}</span>
                                    </div>
                                    <p class="text-on-surface/80 text-sm mb-4 leading-relaxed">${u.content}</p>
                                    ${u.image_url ? `
                                        <div class="rounded-lg overflow-hidden border border-white/10 bg-base">
                                            <img src="${u.image_url}" class="w-full h-48 object-cover hover:scale-105 transition-transform duration-500">
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('') : `
                        <div class="col-span-2 flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/10 rounded-xl bg-surface/50">
                            <span class="material-symbols-outlined text-4xl text-on-surface/40 mb-2">image_not_supported</span>
                            <p class="text-on-surface/60">El confeccionista aún no ha subido avances.</p>
                        </div>
                    `}
                </div>
            </div>

            <!-- PayPal Modal (Simulated) -->
            <div id="paypal-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 hidden backdrop-blur-sm">
                <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl transform transition-all scale-100">
                    <div class="mb-6 flex flex-col items-center justify-center border-b border-gray-200 pb-4">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" class="h-8 mb-2">
                        <span class="text-sm text-gray-500 font-medium">Pago Seguro</span>
                    </div>
                    <h3 class="mb-4 text-center text-lg font-bold text-gray-900">S/ <span id="modal-amount">0.00</span></h3>
                    <div class="space-y-4">
                        <div>
                            <label class="mb-1 block text-sm font-medium text-gray-700">Correo electrónico</label>
                            <input type="email" id="paypal-email" class="w-full rounded-md border border-gray-300 p-3 text-black focus:border-[#0070BA] focus:ring-1 focus:ring-[#0070BA] focus:outline-none transition-colors" placeholder="nombre@ejemplo.com">
                        </div>
                        <div>
                            <label class="mb-1 block text-sm font-medium text-gray-700">Contraseña</label>
                            <input type="password" id="paypal-password" class="w-full rounded-md border border-gray-300 p-3 text-black focus:border-[#0070BA] focus:ring-1 focus:ring-[#0070BA] focus:outline-none transition-colors" placeholder="••••••••">
                        </div>
                        <button id="paypal-submit-btn" class="w-full rounded-full bg-[#0070BA] py-3 font-bold text-white hover:bg-[#005ea6] transition-colors shadow-md hover:shadow-lg">
                            Pagar Ahora
                        </button>
                        <button id="paypal-cancel-btn" class="w-full rounded-full py-3 font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                            Cancelar
                        </button>
                    </div>
                    <div class="mt-4 text-center">
                        <p class="text-xs text-gray-400">Esta es una simulación. No ingrese credenciales reales.</p>
                    </div>
                </div>
            </div>

            <!-- Rating Modal -->
            <div id="rating-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 hidden backdrop-blur-sm">
                <div class="bg-surface p-6 rounded-xl border border-white/10 max-w-md w-full text-center shadow-2xl">
                    <h3 class="text-xl font-bold text-on-surface mb-2">Calificar Servicio</h3>
                    <p class="text-on-surface/60 text-sm mb-6">¿Qué te pareció el trabajo del confeccionista?</p>
                    
                    <div class="flex justify-center gap-2 mb-6">
                        <button class="star-btn text-3xl text-on-surface/20 hover:text-yellow-500 transition-colors" data-value="1">★</button>
                        <button class="star-btn text-3xl text-on-surface/20 hover:text-yellow-500 transition-colors" data-value="2">★</button>
                        <button class="star-btn text-3xl text-on-surface/20 hover:text-yellow-500 transition-colors" data-value="3">★</button>
                        <button class="star-btn text-3xl text-on-surface/20 hover:text-yellow-500 transition-colors" data-value="4">★</button>
                        <button class="star-btn text-3xl text-on-surface/20 hover:text-yellow-500 transition-colors" data-value="5">★</button>
                    </div>

                    <textarea id="rating-comment" rows="3" class="w-full bg-base border border-white/10 rounded-lg p-3 text-on-surface mb-6 focus:border-primary outline-none" placeholder="Escribe un comentario..."></textarea>

                    <div class="flex gap-3">
                        <button id="close-rating-modal" class="flex-1 py-2 text-on-surface/60 hover:text-on-surface">Cancelar</button>
                        <button id="submit-rating" class="flex-1 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 shadow-lg shadow-primary/20">Enviar Calificación</button>
                    </div>
                </div>
            </div>
        </div>
        `;

        // Attach Payment Listeners immediately after rendering
        setTimeout(() => {
            const modal = document.getElementById('paypal-modal');
            const ratingModal = document.getElementById('rating-modal');
            const btnRate = document.getElementById('btn-rate-service');
            const btnCloseRating = document.getElementById('close-rating-modal');
            const btnSubmitRating = document.getElementById('submit-rating');
            const starBtns = document.querySelectorAll('.star-btn');
            let currentRating = 0;

            // Rating Logic
            if (btnRate) {
                btnRate.onclick = () => ratingModal.classList.remove('hidden');
            }

            if (btnCloseRating) {
                btnCloseRating.onclick = () => ratingModal.classList.add('hidden');
            }

            if (starBtns) {
                starBtns.forEach(btn => {
                    btn.onclick = () => {
                        currentRating = btn.dataset.value;
                        updateStars(currentRating);
                    };
                });
            }

            function updateStars(rating) {
                starBtns.forEach(btn => {
                    if (btn.dataset.value <= rating) {
                        btn.classList.remove('text-on-surface/20');
                        btn.classList.add('text-yellow-500');
                    } else {
                        btn.classList.add('text-on-surface/20');
                        btn.classList.remove('text-yellow-500');
                    }
                });
            }

            if (btnSubmitRating) {
                btnSubmitRating.onclick = async () => {
                    if (currentRating === 0) return alert('Por favor selecciona una calificación');

                    const comment = document.getElementById('rating-comment').value;

                    btnSubmitRating.innerText = 'Enviando...';
                    btnSubmitRating.disabled = true;

                    // Save rating to database
                    const { error } = await supabase
                        .from('ratings')
                        .insert({
                            order_id: order.id,
                            maker_id: order.maker_id,
                            client_id: order.client_id,
                            rating: parseInt(currentRating),
                            comment: comment || null
                        });

                    if (!error) {
                        alert('¡Gracias por tu calificación!');
                        ratingModal.classList.add('hidden');
                        btnSubmitRating.innerText = 'Enviar Calificación';
                        btnSubmitRating.disabled = false;
                    } else {
                        console.error('Error saving rating:', error);
                        alert('Error al guardar la calificación. Por favor intenta de nuevo.');
                        btnSubmitRating.innerText = 'Enviar Calificación';
                        btnSubmitRating.disabled = false;
                    }
                };
            }

            const btnPayAdvance = document.getElementById('btn-pay-advance');
            const btnPayFinal = document.getElementById('btn-pay-final');
            const btnCancel = document.getElementById('paypal-cancel-btn');
            const btnSubmit = document.getElementById('paypal-submit-btn');

            // Payment Logic
            let isFinalPayment = false;

            if (btnPayAdvance) {
                btnPayAdvance.onclick = () => {
                    isFinalPayment = false;
                    document.getElementById('modal-amount').textContent = (order.price / 2).toFixed(2);
                    modal.classList.remove('hidden');
                };
            }

            if (btnPayFinal) {
                btnPayFinal.onclick = () => {
                    isFinalPayment = true;
                    document.getElementById('modal-amount').textContent = (order.price / 2).toFixed(2);
                    modal.classList.remove('hidden');
                };
            }

            if (btnCancel) {
                btnCancel.onclick = () => modal.classList.add('hidden');
            }

            if (btnSubmit) {
                btnSubmit.onclick = async () => {
                    const email = document.getElementById('paypal-email').value;
                    const pass = document.getElementById('paypal-password').value;

                    if (!email || !pass) return alert('Ingrese credenciales simuladas');

                    btnSubmit.innerText = 'Procesando...';
                    btnSubmit.disabled = true;

                    setTimeout(async () => {
                        const updateData = isFinalPayment ? {
                            status: 'completed',
                            payment_status: 'paid'
                        } : {
                            status: 'in_progress',
                            payment_status: 'paid',
                            paypal_order_id: 'MOCK-' + Date.now()
                        };

                        const { error } = await supabase
                            .from('orders')
                            .update(updateData)
                            .eq('id', order.id);

                        if (!error) {
                            alert(isFinalPayment ? '¡Pedido completado! Gracias por tu compra.' : '¡Pago exitoso! El confeccionista iniciará el trabajo.');
                            window.location.reload();
                        } else {
                            alert('Error al procesar pago');
                            btnSubmit.innerText = 'Pagar Ahora';
                            btnSubmit.disabled = false;
                        }
                    }, 2000);
                };
            }
        }, 100);
    }

    return `
    <div class="flex min-h-screen w-full bg-base font-display text-on-surface">
        <!-- Sidebar -->
        <aside class="w-64 flex-shrink-0 bg-base border-r border-surface/50 p-4 flex flex-col justify-between hidden md:flex">
            <div class="flex flex-col gap-8">
                <div class="px-3 flex justify-center">
                    <a href="/client-dashboard">
                        ${getLogo({ width: "160", height: "45" })}
                    </a>
                </div>
                <nav class="flex flex-col gap-2">
                    <a href="/client-dashboard" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">grid_view</span>
                        <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Dashboard</p>
                    </a>
                    <a href="/my-designs" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">design_services</span>
                        <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Mis Diseños</p>
                    </a>
                    <a href="/orders" class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface hover:bg-primary/20 transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl group-hover:text-primary transition-colors">inventory_2</span>
                        <p class="text-on-surface text-sm font-medium">Mis Pedidos</p>
                    </a>
                    <a href="/explore-makers" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">storefront</span>
                        <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Explorar</p>
                    </a>
                    <a href="/chat" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">chat_bubble_outline</span>
                        <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Chat</p>
                    </a>
                    <a href="/profile" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">person</span>
                        <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Mi Perfil</p>
                    </a>
                    <a href="/plans" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
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
        <main class="flex-1 p-8 overflow-y-auto" id="orders-content">
            <!-- Injected via JS -->
        </main>
    </div>
    `;
}
