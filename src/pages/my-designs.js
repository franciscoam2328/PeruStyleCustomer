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

            return `
                <div class="flex flex-col gap-4 rounded-xl border border-accent-gold/20 bg-panel-dark/50 p-4 backdrop-blur-sm transition-all duration-300 hover:border-accent-gold/40 hover:shadow-gold-glow">
                    <div class="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-lg flex items-center justify-center" style="${previewStyle}">
                        ${!design.preview_url ? `<div class="text-8xl opacity-70">${getGarmentEmoji(type)}</div>` : ''}
                    </div>
                    <div class="flex flex-col gap-1">
                        <p class="text-base font-bold text-text-beige">${design.name}</p>
                        <p class="text-sm text-text-beige-muted">Creado: ${new Date(design.created_at).toLocaleDateString('es-ES')}</p>
                    </div>
                    <div class="mt-2 flex flex-col gap-2">
                        <button class="flex w-full items-center justify-center rounded-md bg-accent-gold/10 px-3 py-2 text-xs font-semibold text-accent-gold transition-colors hover:bg-accent-gold/20">
                            <span class="material-symbols-outlined mr-2 text-sm">edit</span> Editar diseño
                        </button>
                        <button class="flex w-full items-center justify-center rounded-md bg-accent-copper/20 px-3 py-2 text-xs font-semibold text-accent-copper transition-colors hover:bg-accent-copper/30">
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
    }

    // Render the full page markup (matches the HTML prototype you provided)
    return `
    <div class="flex min-h-screen w-full bg-background-light dark:bg-background-dark font-display text-text-beige">
        <!-- Sidebar -->
        <aside class="flex w-64 flex-col bg-sidebar-dark border-r border-white/5">
            <div class="flex h-20 items-center justify-center border-b border-white/5">
                <h2 class="text-2xl font-bold tracking-wider text-accent-gold">PeruStyle</h2>
            </div>
            <nav class="flex flex-1 flex-col justify-between p-4">
                <ul class="space-y-2">
                    <li>
                        <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-gold hover:bg-white/5" href="/client-dashboard">
                            <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-gold hover:bg-white/5" href="/client-dashboard">
                                <span class="material-symbols-outlined text-xl">dashboard</span>
                                Dashboard
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
                        <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-copper hover:bg-white/5" href="/logout">
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
