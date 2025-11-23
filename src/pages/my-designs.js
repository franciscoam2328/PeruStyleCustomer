import { getCurrentUser, signOut } from '../js/auth.js';
import { supabase } from '../js/supabase.js';

export function MyDesignsPage() {
    // Initialize page after user is loaded
    setTimeout(async () => {
        const user = await getCurrentUser();
        if (!user) {
            window.location.href = '/login';
            return;
        }

        // Fetch all designs for the user (no limit)
        const { data: designs, error } = await supabase
            .from('designs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching designs:', error);
        }

        renderDesigns(designs || []);

        // Search input handling
        const searchInput = document.getElementById('search-designs');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = (designs || []).filter(d => d.name.toLowerCase().includes(term));
                renderDesigns(filtered);
            });
        }

        // Logout button
        document.getElementById('logout-btn')?.addEventListener('click', async () => {
            await signOut();
            window.location.href = '/login';
        });

        // Modal Logic
        setupModals(user);

    }, 0);

    // Helper: emoji fallback when no preview image
    function getGarmentEmoji(type) {
        const map = {
            polo: '👕',
            polera: '🧥',
            casaca: '🧥',
            camisa: '👔',
            hoodie: '🧥'
        };
        return map[type?.toLowerCase()] || '👕';
    }

    function renderDesigns(designs) {
        const container = document.getElementById('designs-container');
        if (!container) return;

        if (!designs || designs.length === 0) {
            container.innerHTML = `
                <div class="col-span-full flex flex-col items-center justify-center py-16">
                    <span class="text-6xl mb-4">📦</span>
                    <p class="text-xl font-bold text-text-beige mb-2">No tienes diseños aún</p>
                    <p class="text-text-beige-muted mb-6">Crea tu primer diseño personalizado</p>
                    <a href="/designer" class="flex items-center justify-center h-10 px-6 rounded-lg bg-accent-copper text-white text-sm font-bold shadow-lg transition-all hover:bg-opacity-90">
                        <span class="material-symbols-outlined mr-2 text-base">add_circle</span>
                        Crear diseño
                    </a>
                </div>
            `;
            return;
        }

        container.innerHTML = designs.map(design => {
            const cfg = design.config || {};
            const color = cfg.color || '#ffffff';
            const type = cfg.type || 'polo';
            const previewStyle = design.preview_url
                ? `background-image: url('${design.preview_url}'); background-color: ${color};`
                : `background: linear-gradient(135deg, ${color}, ${color}dd);`;

            // Encode design data for the modal
            const designData = encodeURIComponent(JSON.stringify({
                id: design.id,
                name: design.name,
                type: type,
                preview_url: design.preview_url,
                color: color
            }));

            return `
                <div class="flex flex-col gap-4 rounded-xl border border-accent-gold/20 bg-panel-dark/50 p-4 backdrop-blur-sm transition-all duration-300 hover:border-accent-gold/40 hover:shadow-gold-glow">
                    <div class="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-lg flex items-center justify-center" style="${previewStyle}">
                        ${!design.preview_url ? `<div class="text-8xl opacity-70">${getGarmentEmoji(type)}</div>` : ''}
                    </div>
                    <div class="flex flex-col gap-1">
                        <p class="text-base font-bold text-text-beige">${design.name}</p>
                        <p class="text-sm text-text-beige-muted">Creado: ${new Date(design.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div class="mt-2 flex flex-col gap-2">
                        <button class="flex w-full items-center justify-center rounded-md bg-accent-gold/10 px-3 py-2 text-xs font-semibold text-accent-gold transition-colors hover:bg-accent-gold/20">
                            <span class="material-symbols-outlined mr-2 text-sm">edit</span> Editar diseño
                        </button>
                        <button class="send-design-btn flex w-full items-center justify-center rounded-md bg-accent-copper/20 px-3 py-2 text-xs font-semibold text-accent-copper transition-colors hover:bg-accent-copper/30" data-design="${designData}">
                            <span class="material-symbols-outlined mr-2 text-sm">send</span> Enviar a confeccionista
                        </button>
                        <button class="delete-design-btn flex w-full items-center justify-center rounded-md bg-red-500/20 px-3 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/30" data-design-id="${design.id}">
                            <span class="material-symbols-outlined mr-2 text-sm">delete</span> Eliminar
                        </button>
                    </div>
                    <div class="flex justify-end pt-1">
                        <button class="text-text-beige-muted hover:text-text-beige">
                            <span class="material-symbols-outlined">more_horiz</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Attach delete handlers
        document.querySelectorAll('.delete-design-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.designId;
                if (confirm('¿Estás seguro de eliminar este diseño?')) {
                    const { error } = await supabase.from('designs').delete().eq('id', id);
                    if (error) {
                        alert('Error al eliminar: ' + error.message);
                    } else {
                        window.location.reload();
                    }
                }
            });
        });

        // Attach send handlers
        document.querySelectorAll('.send-design-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const designData = JSON.parse(decodeURIComponent(btn.dataset.design));
                openSendModal(designData);
            });
        });
    }

    // --- MODAL LOGIC ---

    let selectedDesign = null;

    async function setupModals(user) {
        // Fetch makers for the dropdown
        const { data: makers } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('role', 'maker'); // Assuming 'maker' role exists

        const makerSelect = document.getElementById('maker-select');
        if (makerSelect && makers) {
            makerSelect.innerHTML = '<option value="" disabled selected>Selecciona un confeccionista</option>' +
                makers.map(m => `<option value="${m.id}">${m.full_name || 'Confeccionista'}</option>`).join('');
        }

        // Close buttons
        document.querySelectorAll('.close-modal-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('send-request-modal').classList.add('hidden');
                document.getElementById('send-success-modal').classList.add('hidden');
            });
        });

        // Send Request Submit
        document.getElementById('submit-request-btn')?.addEventListener('click', async () => {
            const makerId = document.getElementById('maker-select').value;
            const message = document.getElementById('request-message').value;

            if (!makerId) {
                alert('Por favor selecciona un confeccionista.');
                return;
            }

            const btn = document.getElementById('submit-request-btn');
            const originalText = btn.innerText;
            btn.innerText = 'Enviando...';
            btn.disabled = true;

            // 1. Create Order
            const { data: order, error } = await supabase
                .from('orders')
                .insert({
                    client_id: user.id,
                    maker_id: makerId,
                    design_id: selectedDesign.id,
                    status: 'pending',
                    message: message
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating order:', error);
                alert('Error al crear el pedido. Por favor verifica tu conexión.');
                btn.innerText = originalText;
                btn.disabled = false;
                return;
            }

            // Success
            document.getElementById('send-request-modal').classList.add('hidden');
            document.getElementById('send-success-modal').classList.remove('hidden');

            btn.innerText = originalText;
            btn.disabled = false;
        });
    }

    function openSendModal(design) {
        selectedDesign = design;
        const modal = document.getElementById('send-request-modal');
        const previewImg = document.getElementById('modal-design-preview');
        const designName = document.getElementById('modal-design-name');
        const designType = document.getElementById('modal-design-type');

        if (modal) {
            designName.textContent = design.name;
            designType.textContent = design.type.charAt(0).toUpperCase() + design.type.slice(1);

            if (design.preview_url) {
                previewImg.style.backgroundImage = `url('${design.preview_url}')`;
                previewImg.style.backgroundColor = design.color;
                previewImg.innerHTML = '';
            } else {
                previewImg.style.backgroundImage = 'none';
                previewImg.style.backgroundColor = design.color;
                previewImg.innerHTML = `<span class="text-4xl">${getGarmentEmoji(design.type)}</span>`;
            }

            modal.classList.remove('hidden');
        }
    }

    // Render the full page markup (matches the HTML prototype you provided)
    return `
    <div class="flex min-h-screen w-full bg-background-light dark:bg-background-dark font-display text-text-beige">
        
        <!-- SEND REQUEST MODAL -->
        <div id="send-request-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 hidden backdrop-blur-sm">
            <div class="w-full max-w-2xl rounded-xl bg-[#1A1A1A] border border-white/10 shadow-2xl overflow-hidden transform transition-all">
                <div class="flex items-center justify-between border-b border-white/10 p-4">
                    <h3 class="text-lg font-bold text-white">Enviar Solicitud de Confección</h3>
                    <button class="close-modal-btn text-gray-400 hover:text-white">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="flex flex-col md:flex-row">
                    <!-- Left: Design Summary -->
                    <div class="w-full md:w-1/3 bg-white/5 p-6 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-white/10">
                        <div id="modal-design-preview" class="w-32 h-32 rounded-lg bg-center bg-cover bg-no-repeat flex items-center justify-center mb-4 shadow-lg"></div>
                        <h4 id="modal-design-name" class="text-white font-bold text-lg mb-1">Diseño</h4>
                        <p id="modal-design-type" class="text-accent-gold text-sm font-medium">Tipo</p>
                    </div>
                    <!-- Right: Form -->
                    <div class="w-full md:w-2/3 p-6 space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-400 mb-1">Seleccionar Confeccionista</label>
                            <select id="maker-select" class="w-full rounded-lg bg-black/20 border border-white/10 p-3 text-white focus:border-accent-gold focus:ring-1 focus:ring-accent-gold outline-none">
                                <option>Cargando confeccionistas...</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-400 mb-1">Mensaje Inicial / Instrucciones</label>
                            <textarea id="request-message" rows="4" class="w-full rounded-lg bg-black/20 border border-white/10 p-3 text-white focus:border-accent-gold focus:ring-1 focus:ring-accent-gold outline-none resize-none" placeholder="Hola, me gustaría cotizar la confección de este diseño con tela impermeable..."></textarea>
                        </div>
                    </div>
                </div>
                <div class="flex items-center justify-end gap-3 border-t border-white/10 p-4 bg-white/5">
                    <button class="close-modal-btn px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">Cancelar</button>
                    <button id="submit-request-btn" class="px-6 py-2 rounded-lg bg-accent-gold text-black text-sm font-bold hover:bg-accent-gold/90 transition-colors shadow-lg shadow-accent-gold/20">
                        Enviar Solicitud
                    </button>
                </div>
            </div>
        </div>

        <!-- SUCCESS MODAL -->
        <div id="send-success-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 hidden backdrop-blur-sm">
            <div class="w-full max-w-md rounded-xl bg-[#1A1A1A] border border-accent-gold/30 shadow-2xl p-8 text-center transform transition-all">
                <div class="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <span class="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
                </div>
                <h3 class="text-2xl font-bold text-white mb-2">¡Solicitud Enviada!</h3>
                <p class="text-gray-400 mb-6">Tu pedido ha sido creado exitosamente y está <span class="text-yellow-500 font-bold">Pendiente</span> de aceptación por el confeccionista.</p>
                <div class="flex flex-col gap-3">
                    <a href="/orders" class="w-full py-3 rounded-lg bg-accent-gold text-black font-bold hover:bg-accent-gold/90 transition-colors">
                        Ir a Mis Pedidos
                    </a>
                    <button class="close-modal-btn text-gray-500 hover:text-white text-sm font-medium">
                        Cerrar y seguir diseñando
                    </button>
                </div>
            </div>
        </div>

        <!-- Sidebar -->
        <aside class="flex w-64 flex-col bg-sidebar-dark border-r border-white/5">
            <div class="flex h-20 items-center justify-center border-b border-white/5">
                <h2 class="text-2xl font-bold tracking-wider text-accent-gold">PeruStyle</h2>
            </div>
            <nav class="flex flex-1 flex-col justify-between p-4">
                <ul class="space-y-2">
                    <li>
                        <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-gold hover:bg-white/5" href="/client-dashboard">
                            <span class="material-symbols-outlined text-xl">dashboard</span>
                            Dashboard / Inicio
                        </a>
                    </li>
                    <li>
                        <a class="relative flex items-center gap-4 rounded-lg bg-accent-gold/10 px-4 py-2.5 text-sm font-bold text-accent-gold shadow-gold-glow-soft" href="/my-designs">
                            <span class="absolute left-0 h-6 w-1 rounded-r-full bg-accent-gold"></span>
                            <span class="material-symbols-outlined text-xl">design_services</span>
                            Mis Diseños
                        </a>
                    </li>
                    <li>
                        <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-gold hover:bg-white/5" href="/orders">
                            <span class="material-symbols-outlined text-xl">inventory_2</span>
                            Mis Pedidos
                        </a>
                    </li>
                    <li>
                        <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-gold hover:bg-white/5" href="/makers">
                            <span class="material-symbols-outlined text-xl">storefront</span>
                            Explorar
                        </a>
                    </li>
                    <li>
                        <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-gold hover:bg-white/5" href="/chat">
                            <span class="material-symbols-outlined text-xl">chat_bubble</span>
                            Chat
                        </a>
                    </li>
                    <li>
                        <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-gold hover:bg-white/5" href="/profile">
                            <span class="material-symbols-outlined text-xl">person</span>
                            Mi Perfil
                        </a>
                    </li>
                    <li>
                        <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-gold hover:bg-white/5" href="/plans">
                            <span class="material-symbols-outlined text-xl">workspace_premium</span>
                            Mi Suscripción
                        </a>
                    </li>
                </ul>
                <ul>
                    <li>
                        <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-copper hover:bg-white/5" href="/logout" id="logout-btn">
                            <span class="material-symbols-outlined text-xl">logout</span>
                            Cerrar sesión
                        </a>
                    </li>
                </ul>
            </nav>
        </aside>
        <!-- Main Content -->
        <main class="flex-1">
            <div class="relative flex min-h-screen w-full flex-col">
                <div class="layout-container flex h-full grow flex-col">
                    <div class="px-4 py-5 sm:px-8 md:px-12 lg:px-16 xl:px-24 flex flex-1 justify-center">
                        <div class="layout-content-container flex flex-col w-full max-w-[1280px] flex-1">
                            <!-- Header -->
                            <div class="flex flex-wrap items-center justify-between gap-4 p-4">
                                <h1 class="text-4xl font-black tracking-tighter text-text-beige">Mis Diseños</h1>
                                <a href="/designer" class="flex items-center justify-center h-10 px-6 rounded-lg bg-accent-copper text-white text-sm font-bold shadow-lg transition-all hover:bg-opacity-90 hover:shadow-accent-copper/20">
                                    <span class="material-symbols-outlined mr-2 text-base">add_circle</span>
                                    <span>Crear nuevo diseño</span>
                                </a>
                            </div>
                            <!-- Search Bar -->
                            <div class="px-4 py-3">
                                <label class="flex flex-col h-12 w-full max-w-md">
                                    <div class="flex w-full flex-1 items-stretch rounded-lg h-full">
                                        <div class="text-text-beige-muted flex items-center justify-center pl-4 bg-panel-dark rounded-l-lg">
                                            <span class="material-symbols-outlined">search</span>
                                        </div>
                                        <input id="search-designs" class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg border-none bg-panel-dark text-base font-normal text-text-beige placeholder:text-text-beige-muted focus:outline-none focus:ring-2 focus:ring-accent-gold/50" placeholder="Buscar diseño..." />
                                    </div>
                                </label>
                            </div>
                            <!-- Designs Grid -->
                            <div id="designs-container" class="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                                <!-- Designs will be injected here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
    `;
}
