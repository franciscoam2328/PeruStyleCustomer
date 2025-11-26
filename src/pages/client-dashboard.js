import { getCurrentUser, signOut } from '../js/auth.js';
import { supabase } from '../js/supabase.js';
import { getLogo } from '../components/logo.js';

export function ClientDashboardPage() {
    setTimeout(async () => {
        const user = await getCurrentUser();
        if (!user) {
            window.location.href = '/login';
            return;
        }

        // Fetch user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        // Fetch designs count
        const { count: designsCount } = await supabase
            .from('designs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        // Fetch active orders
        const { count: ordersCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', user.id)
            .in('status', ['pending', 'accepted', 'in_progress']);

        // Fetch recent designs (only 2 for dashboard)
        const { data: designs } = await supabase
            .from('designs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(2);

        // Update UI with data
        const designsCountEl = document.getElementById('designs-count');
        if (designsCountEl) designsCountEl.textContent = designsCount || 0;

        const ordersCountEl = document.getElementById('orders-count');
        if (ordersCountEl) ordersCountEl.textContent = ordersCount || 0;

        const userNameEl = document.getElementById('user-name');
        if (userNameEl) userNameEl.textContent = profile?.full_name || user.email.split('@')[0];

        const userPlanEl = document.getElementById('user-plan');
        if (userPlanEl) userPlanEl.textContent = `Plan ${profile?.plan || 'Free'}`;

        // Update avatar
        const avatarEl = document.getElementById('user-avatar');
        if (avatarEl) {
            if (profile?.avatar_url) {
                avatarEl.innerHTML = `<img src="${profile.avatar_url}" class="w-full h-full object-cover rounded-full" alt="Avatar">`;
            } else {
                const initial = (profile?.full_name || user.email)[0].toUpperCase();
                avatarEl.textContent = initial;
            }
        }

        // Helper function to get emoji based on garment type
        function getGarmentEmoji(type) {
            const emojis = {
                'polo': '👕',
                'polera': '🧥',
                'casaca': '🧥',
                'camisa': '👔',
                'hoodie': '🧥'
            };
            return emojis[type?.toLowerCase()] || '👕';
        }

        // Render designs
        const designsContainer = document.getElementById('designs-grid');
        if (designsContainer && designs && designs.length > 0) {
            designs.forEach(design => {
                const card = document.createElement('div');
                card.className = 'group bg-surface rounded-xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10';

                // Get design config
                const config = design.config || {};
                const color = config.color || '#ffffff';
                const type = config.type || 'polo';

                // Preview content: use real image if available, otherwise show emoji
                let previewContent = '';
                if (design.preview_url) {
                    previewContent = `
                        <img src="${design.preview_url}" alt="${design.name}" class="w-full h-full object-contain" style="background: ${color};">
                    `;
                } else {
                    previewContent = `
                        <div class="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
                        <div class="text-8xl opacity-70 relative z-10">${getGarmentEmoji(type)}</div>
                    `;
                }

                card.innerHTML = `
                    <div class="aspect-square flex items-center justify-center relative overflow-hidden" style="background: ${color};">
                        ${previewContent}
                    </div>
                    <div class="p-4">
                        <h4 class="font-semibold text-on-surface truncate mb-1">${design.name}</h4>
                        <p class="text-sm text-on-surface/60 mb-1">Creado: ${new Date(design.created_at).toLocaleDateString('es-ES')}</p>
                        <p class="text-xs text-on-surface/40 mb-4">Color: ${color} | Tipo: ${type}</p>
                        <div class="flex flex-col gap-2">
                            <button class="w-full text-sm bg-white/10 text-on-surface/80 h-10 px-4 rounded-md hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                                <span>✏️</span> Editar
                            </button>
                            <button class="delete-design-btn w-full text-sm bg-red-500/80 hover:bg-red-600 text-white h-10 px-4 rounded-md transition-colors flex items-center justify-center gap-2" data-design-id="${design.id}">
                                <span>🗑️</span> Eliminar
                            </button>
                            <button class="w-full text-sm bg-primary text-black h-10 px-4 rounded-md font-semibold hover:bg-opacity-80 transition-opacity flex items-center justify-center gap-2">
                                <span>📤</span> Enviar
                            </button>
                        </div>
                    </div>
                `;
                designsContainer.insertBefore(card, designsContainer.lastElementChild);
            });

            // Add delete handlers
            document.querySelectorAll('.delete-design-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const designId = btn.dataset.designId;

                    if (confirm('¿Estás seguro de eliminar este diseño?')) {
                        const { error } = await supabase
                            .from('designs')
                            .delete()
                            .eq('id', designId);

                        if (error) {
                            alert('Error al eliminar: ' + error.message);
                        } else {
                            window.location.reload();
                        }
                    }
                });
            });
        }

        // Logout handler
        document.getElementById('logout-btn')?.addEventListener('click', async () => {
            await signOut();
            window.location.href = '/login';
        });
    }, 0);

    return `
    <div class="flex min-h-screen bg-base text-on-surface">
        <!-- Sidebar -->
        <aside class="w-64 flex-shrink-0 bg-base border-r border-surface/50 p-4 flex flex-col justify-between hidden md:flex sticky top-0 h-screen">
            <div class="flex flex-col gap-8">
                <div class="px-3 flex justify-center">
                    <a href="/client-dashboard">
                        ${getLogo({ width: "160", height: "45" })}
                    </a>
                </div>
                <nav class="flex flex-col gap-2">
                    <a href="/client-dashboard" class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface hover:bg-primary/20 transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl group-hover:text-primary transition-colors">grid_view</span>
                        <p class="text-on-surface text-sm font-medium">Dashboard</p>
                    </a>
                    <a href="/my-designs" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">design_services</span>
                        <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Mis Diseños</p>
                    </a>
                    <a href="/orders" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">inventory_2</span>
                        <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Mis Pedidos</p>
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
        <main class="flex-1 p-8 overflow-y-auto">
            <div class="max-w-7xl mx-auto">
                <!-- Header -->
                <header class="flex justify-end items-center gap-6 mb-8 bg-surface p-4 rounded-xl border border-white/10 shadow-sm">
                    <button class="relative p-2 text-on-surface/80 hover:text-primary transition-colors">
                        <span class="material-symbols-outlined text-2xl">notifications</span>
                        <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <a href="/profile" class="flex items-center gap-3 hover:opacity-80 transition-opacity border-l border-white/10 pl-6">
                        <div id="user-avatar" class="bg-gradient-to-br from-primary to-secondary rounded-full w-10 h-10 flex items-center justify-center text-white font-bold shadow-md">
                            U
                        </div>
                        <div class="flex flex-col text-right">
                            <h2 id="user-name" class="text-base font-semibold text-on-surface leading-tight">Usuario</h2>
                            <p id="user-plan" class="text-secondary text-sm font-medium leading-tight">Plan Free</p>
                        </div>
                    </a>
                </header>

                <!-- Dashboard Section -->
                <section>
                    <h2 class="text-3xl font-bold text-on-surface mb-6">Dashboard</h2>

                    <!-- Stats Cards -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <div class="flex flex-col gap-2 rounded-xl p-6 bg-surface border border-white/10">
                            <p class="text-on-surface/80 text-base font-medium">Diseños guardados</p>
                            <p id="designs-count" class="text-on-surface tracking-tight text-4xl font-bold">0</p>
                        </div>
                        <div class="flex flex-col gap-2 rounded-xl p-6 bg-surface border border-white/10">
                            <p class="text-on-surface/80 text-base font-medium">Pedidos activos</p>
                            <p id="orders-count" class="text-on-surface tracking-tight text-4xl font-bold">0</p>
                        </div>
                        <div class="flex flex-col gap-2 rounded-xl p-6 bg-surface border border-white/10">
                            <p class="text-on-surface/80 text-base font-medium">Mensajes nuevos</p>
                            <p class="text-on-surface tracking-tight text-4xl font-bold">0</p>
                        </div>
                        <div class="flex flex-col gap-2 rounded-xl p-6 bg-surface border border-white/10">
                            <p class="text-on-surface/80 text-base font-medium">Estado del plan</p>
                            <p class="text-secondary tracking-tight text-2xl font-bold">Free</p>
                        </div>
                    </div>
                </section>

                <!-- Mis Diseños Section -->
                <section>
                    <h3 class="text-2xl font-bold text-on-surface mb-5">Mis Diseños</h3>
                    <div id="designs-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <!-- Add New Design Card -->
                        <a href="/designer" class="group flex flex-col items-center justify-center bg-surface/50 rounded-xl border-2 border-dashed border-white/10 transition-all duration-300 hover:border-primary/50 hover:bg-surface cursor-pointer min-h-[300px]">
                            <span class="text-6xl text-on-surface/40 group-hover:text-primary transition-colors">➕</span>
                            <p class="mt-2 text-sm font-medium text-on-surface/60">Nuevo Diseño</p>
                        </a>
                    </div>
                </section>
            </div>
        </main>
    </div>
    `;
}
