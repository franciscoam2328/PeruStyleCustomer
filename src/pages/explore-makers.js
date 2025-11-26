import { supabase } from '../js/supabase.js';
import { getCurrentUser, signOut } from '../js/auth.js';
import { getLogo } from '../components/logo.js';

export function ExploreMakersPage() {
    setTimeout(async () => {
        const user = await getCurrentUser();
        if (!user) {
            window.location.href = '/login';
            return;
        }

        // Fetch makers
        const { data: makers, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'maker');

        if (error) {
            console.error('Error fetching makers:', error);
        }

        renderClientView(user, makers || []);

        // Search functionality
        const searchInput = document.getElementById('maker-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = (makers || []).filter(m =>
                    (m.full_name || '').toLowerCase().includes(term) ||
                    (m.bio || '').toLowerCase().includes(term)
                );
                renderCards(filtered, document.getElementById('makers-grid'));
            });
        }

        // Logout handler
        document.getElementById('logout-btn')?.addEventListener('click', async () => {
            await signOut();
            window.location.href = '/login';
        });

    }, 0);

    return `<div id="explore-makers-content" class="min-h-screen bg-base"></div>`;
}

function renderClientView(user, makers) {
    const container = document.getElementById('explore-makers-content');
    if (!container) return;

    container.innerHTML = `
    <div class="flex min-h-screen bg-base text-on-surface">
        <!-- Sidebar -->
        <aside class="w-64 flex-shrink-0 bg-base border-r border-surface/50 p-4 flex flex-col justify-between hidden md:flex sticky top-0 h-screen z-20">
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
                    <a href="/orders" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">inventory_2</span>
                        <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Mis Pedidos</p>
                    </a>
                    <a href="/explore-makers" class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface hover:bg-primary/20 transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl group-hover:text-primary transition-colors">storefront</span>
                        <p class="text-on-surface text-sm font-medium">Explorar</p>
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
                <header class="flex justify-between items-center mb-8">
                    <div>
                        <h1 class="text-3xl font-bold text-on-surface mb-1">Explorar Confeccionistas</h1>
                        <p class="text-on-surface/60">Encuentra el talento perfecto para tu próximo diseño.</p>
                    </div>
                     <!-- Search Bar -->
                    <div class="relative w-full md:w-96">
                        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/40">search</span>
                        <input id="maker-search" type="text" placeholder="Buscar por nombre o especialidad..." class="w-full pl-10 pr-4 py-2 rounded-lg bg-surface border border-white/10 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors">
                    </div>
                </header>

                <!-- Grid -->
                <div id="makers-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <!-- Content injected here -->
                </div>
            </div>
        </main>
    </div>
    `;

    renderCards(makers, document.getElementById('makers-grid'));
}

function renderCards(items, container) {
    if (!container) return;

    if (!items || items.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-on-surface/60">No se encontraron confeccionistas.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = items.map(maker => `
        <div class="group bg-surface rounded-xl border border-white/10 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300">
            <div class="relative h-48 overflow-hidden">
                <img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="${maker.avatar_url || 'https://via.placeholder.com/400'}" alt="${maker.full_name}" />
                ${maker.badge ? `<span class="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">${maker.badge}</span>` : ''}
            </div>
            <div class="p-6 text-center">
                <h3 class="text-lg font-bold text-on-surface mb-1">${maker.full_name || 'Confeccionista'}</h3>
                <p class="text-sm text-on-surface/60 mb-3">${maker.bio ? maker.bio.split('.')[0] : 'General'}</p>
                <div class="flex items-center justify-center gap-1 mb-4">
                    <span class="text-primary font-bold">4.8</span>
                    <span class="material-symbols-outlined text-primary text-sm">star</span>
                </div>
                <div class="flex gap-2">
                    <a href="/maker-profile?id=${maker.id}" class="flex-1 py-2 px-4 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors">Ver Perfil</a>
                    <button class="flex-1 py-2 px-4 rounded-lg border border-white/10 text-on-surface text-sm font-bold hover:bg-white/5 transition-colors">Contactar</button>
                </div>
            </div>
        </div>
    `).join('');
}
