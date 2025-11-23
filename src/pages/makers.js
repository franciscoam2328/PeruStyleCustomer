import { supabase } from '../js/supabase.js';
import { getCurrentUser, signOut } from '../js/auth.js';

export function MakersPage() {
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

        renderMakers(makers || []);

        // Search functionality
        const searchInput = document.querySelector('input[placeholder="Buscar por nombre o especialidad..."]');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = (makers || []).filter(m =>
                    (m.full_name || '').toLowerCase().includes(term) ||
                    (m.bio || '').toLowerCase().includes(term)
                );
                renderMakers(filtered);
            });
        }

        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', async () => {
            await signOut();
            window.location.href = '/login';
        });

    }, 0);

    function renderMakers(makers) {
        const container = document.getElementById('makers-grid');
        if (!container) return;

        if (!makers || makers.length === 0) {
            // Show mock data if no real makers found, for demonstration purposes as per the design
            const mockMakers = [
                {
                    full_name: 'Alejandro Vargas',
                    specialty: 'Alta Costura',
                    rating: 4.8,
                    badge: 'ELITE',
                    badgeColor: 'bg-accent-gold/20 text-accent-gold',
                    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4YnXNEDZrLkpADlS0RfpW7z3bHfIs4uyaITtWe6ty_mm4DLjz29lTPimNY9CPJiOgebhWcROuQmDjuv3OHwuv7ZhD5-415gCvR0R0_dODSBHQFShaeKBv1UGqydxoD-EUpuBsGuP7JeLQvH6CQyZyF0LMknf0aZyqBtCEzh5g88gQQSTAFRfJQAKewwd8Ouy_uM7mZbxGiZFFYwDc7TvcWyzeLgUGj3FNF8S5TL0V0UROU04ibHbl7yL9VCi64IGgSU45q_Y8JyE'
                },
                {
                    full_name: 'Sofía Reyes',
                    specialty: 'Ropa Urbana',
                    rating: 4.5,
                    badge: 'PRO',
                    badgeColor: 'bg-accent-copper/20 text-accent-copper',
                    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqR8SiWhJ7I4m5P3er_7tjE9gMcidqQgDJl-B43diCCP_RzY2rJotGcC1GWdd-8lVoGNIy8RwI-Pa1naTlJkqJPQuKLxgzoXG2DSI4jerXunlxPqVJlZNVhvTDP-aKFyVVykgxSWvpd-d3Ex_crqNngCfJEQ6_94Mk0Q9YN9Phv-R79h6kHx6c3RYzaKdjBOB7dvYVlArDjpPHYr4Jb7JmpoZyCMc7LT_qpJJWOYohp-xpLkQcOV8g7rPaQC2QZTIvRFOEqndlZro'
                },
                {
                    full_name: 'Marco Diaz',
                    specialty: 'Prendas Deportivas',
                    rating: 4.0,
                    badge: 'FREE',
                    badgeColor: 'bg-white/10 text-white',
                    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiOOe-T6jA-jyRDrS6vrNVIFcSTkWVTlVnaRfuB0Km5WqvgXHFrt2YtL7RHx3QE-jyrLZQPu-WL81MklJrJojar1QOw0VKXFJjytjVgu5dPkynQ9dGb31hzfXZcXFwf-wp9vW0hYWOhQ_XrnC77Co9weD4kXV72qGAlimf1gFLGb4rSoprf3ZTdxwU5MKO4v9xfYr2XmFPPftr9URfPMMffeUFl_bZFxjZCp-5IadT1jk5yeiGejR14H-I4I59NVfua3znsg_UbIM'
                },
                {
                    full_name: 'Luciana Gil',
                    specialty: 'Vestidos de Gala',
                    rating: 5.0,
                    badge: 'PRO',
                    badgeColor: 'bg-accent-copper/20 text-accent-copper',
                    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlHLMQpUZxOl-5B5egA4Sr6od73Bp3WWiQziA4wi_19c4MthEPKfSPw7Hp2ga_HPh-GrpHc5zmzRmDbyYh3pLaOdr-0VqrqvQ5tP1sNlRTkefYkQQbukaYvcjD1weHS5CJPx18wTvvalbythzxHyYyCmOk5Xw_aH2PWrAswbjQEAJi6bo3yv2v5a5lig2IPwI2GwObAdyozikVuqwvN7h4_LwMIiXPZnwFgD25UK9QsVZj8D9Vl_GVlSEi9VIzukrQ_TAH16D3mbU'
                }
            ];

            renderCards(mockMakers, container);
            return;
        }

        // Map real data to display format
        const mappedMakers = makers.map(m => ({
            full_name: m.full_name || 'Confeccionista',
            specialty: m.bio ? m.bio.split('.')[0] : 'General',
            rating: (Math.random() * 1.5 + 3.5).toFixed(1), // Mock rating
            badge: Math.random() > 0.7 ? 'ELITE' : (Math.random() > 0.4 ? 'PRO' : 'FREE'),
            badgeColor: '', // Set below
            avatar: m.avatar_url || null
        })).map(m => {
            if (m.badge === 'ELITE') m.badgeColor = 'bg-accent-gold/20 text-accent-gold';
            else if (m.badge === 'PRO') m.badgeColor = 'bg-accent-copper/20 text-accent-copper';
            else m.badgeColor = 'bg-white/10 text-white';
            return m;
        });

        renderCards(mappedMakers, container);
    }

    function renderCards(items, container) {
        container.innerHTML = items.map(maker => `
            <div class="relative group bg-surface-dark rounded-xl border border-white/10 p-4 flex flex-col items-center text-center backdrop-blur-sm bg-opacity-80 transition-all duration-300 hover:shadow-glow-gold hover:-translate-y-1 hover:border-accent-gold/50">
                ${maker.badge === 'ELITE' ? '<div class="absolute top-3 right-3 bg-accent-gold text-background-dark text-xs font-bold px-2 py-1 rounded-full">DESTACADO</div>' : ''}
                <img class="w-28 h-28 rounded-full object-cover mb-4 border-2 border-white/10 group-hover:border-accent-gold/30 transition-colors" src="${maker.avatar || 'https://via.placeholder.com/150'}" alt="${maker.full_name}" />
                <h3 class="text-lg font-bold text-white">${maker.full_name}</h3>
                <p class="text-sm text-text-muted mb-2">${maker.specialty}</p>
                <div class="flex items-center gap-1 mb-3">
                    ${renderStars(maker.rating)}
                    <span class="text-xs text-text-muted ml-1">(${maker.rating})</span>
                </div>
                <div class="${maker.badgeColor} text-xs font-bold px-3 py-1 rounded-full mb-4">${maker.badge}</div>
                <div class="w-full flex flex-col gap-2">
                    <a href="/maker-profile?id=${maker.id || 'mock-id'}" class="flex items-center justify-center w-full text-sm font-bold py-2 px-4 rounded-lg bg-accent-copper hover:bg-[#a56118] text-white transition-colors" data-link>Ver Perfil</a>
                    <button class="w-full text-sm font-bold py-2 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">Enviar Diseño</button>
                </div>
            </div>
        `).join('');
    }

    function renderStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<span class="material-symbols-outlined fill text-accent-gold text-base" style="font-variation-settings: \'FILL\' 1;">star</span>';
            } else if (i - 0.5 <= rating) {
                stars += '<span class="material-symbols-outlined fill text-accent-gold text-base" style="font-variation-settings: \'FILL\' 1;">star_half</span>';
            } else {
                stars += '<span class="material-symbols-outlined text-accent-gold text-base">star_border</span>';
            }
        }
        return stars;
    }

    return `
    <div class="flex min-h-screen w-full bg-background-dark font-display text-text-beige">
        <!-- Sidebar -->
        <aside class="flex flex-col w-64 p-4 bg-sidebar-dark border-r border-white/10 shrink-0">
            <div class="flex items-center gap-2 mb-10 px-2 h-10">
                <svg class="h-8 text-accent-gold" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
                <h1 class="text-white text-xl font-bold tracking-tight">PeruStyle</h1>
            </div>
            <nav class="flex flex-col gap-2 flex-grow">
                <a class="flex items-center gap-3 px-3 py-2 text-text-beige hover:bg-surface-dark hover:text-accent-gold rounded-lg transition-colors" href="/client-dashboard">
                    <span class="material-symbols-outlined text-2xl">dashboard</span>
                    <p class="text-sm font-medium">Dashboard / Inicio</p>
                </a>
                <a class="flex items-center gap-3 px-3 py-2 text-text-beige hover:bg-surface-dark hover:text-accent-gold rounded-lg transition-colors" href="/my-designs">
                    <span class="material-symbols-outlined text-2xl">design_services</span>
                    <p class="text-sm font-medium">Mis Diseños</p>
                </a>
                <a class="flex items-center gap-3 px-3 py-2 text-text-beige hover:bg-surface-dark hover:text-accent-gold rounded-lg transition-colors" href="/orders">
                    <span class="material-symbols-outlined text-2xl">shopping_bag</span>
                    <p class="text-sm font-medium">Mis Pedidos</p>
                </a>
                <a class="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-dark text-accent-gold shadow-glow-gold" href="/makers">
                    <span class="material-symbols-outlined text-2xl">person_search</span>
                    <p class="text-sm font-medium">Explorar</p>
                </a>
                <a class="flex items-center gap-3 px-3 py-2 text-text-beige hover:bg-surface-dark hover:text-accent-gold rounded-lg transition-colors" href="/chat">
                    <span class="material-symbols-outlined text-2xl">chat_bubble</span>
                    <p class="text-sm font-medium">Chat</p>
                </a>
                <a class="flex items-center gap-3 px-3 py-2 text-text-beige hover:bg-surface-dark hover:text-accent-gold rounded-lg transition-colors" href="/profile">
                    <span class="material-symbols-outlined text-2xl">person</span>
                    <p class="text-sm font-medium">Mi Perfil</p>
                </a>
                <a class="flex items-center gap-3 px-3 py-2 text-text-beige hover:bg-surface-dark hover:text-accent-gold rounded-lg transition-colors" href="/plans">
                    <span class="material-symbols-outlined text-2xl">workspace_premium</span>
                    <p class="text-sm font-medium">Mi Suscripción</p>
                </a>
            </nav>
            <div class="flex flex-col">
                <a class="flex items-center gap-3 px-3 py-2 text-text-beige hover:bg-surface-dark hover:text-accent-gold rounded-lg transition-colors" href="/logout" id="logout-btn">
                    <span class="material-symbols-outlined text-2xl">logout</span>
                    <p class="text-sm font-medium">Cerrar sesión</p>
                </a>
            </div>
        </aside>
        <main class="flex-1 p-8 overflow-y-auto">
            <div class="max-w-7xl mx-auto">
                <header class="mb-6">
                    <p class="text-white text-4xl font-black leading-tight tracking-[-0.033em]">Explorar Confeccionistas</p>
                </header>
                <div class="flex flex-col md:flex-row gap-4 mb-8">
                    <div class="flex-grow">
                        <label class="flex flex-col h-12 w-full">
                            <div class="flex w-full flex-1 items-stretch rounded-lg h-full">
                                <div class="text-text-muted flex bg-surface-dark items-center justify-center pl-4 rounded-l-lg border-r-0">
                                    <span class="material-symbols-outlined text-2xl">search</span>
                                </div>
                                <input class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-accent-copper border-none bg-surface-dark h-full placeholder:text-text-muted px-4 rounded-l-none border-l-0 pl-2 text-base font-normal" placeholder="Buscar por nombre o especialidad..." value=""/>
                            </div>
                        </label>
                    </div>
                    <div class="flex items-center gap-3">
                        <button class="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-surface-dark hover:bg-white/10 transition-colors px-4">
                            <p class="text-white text-sm font-medium">Tipo de prenda</p>
                            <span class="material-symbols-outlined text-xl">expand_more</span>
                        </button>
                        <button class="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-surface-dark hover:bg-white/10 transition-colors px-4">
                            <p class="text-white text-sm font-medium">Precio o plan</p>
                            <span class="material-symbols-outlined text-xl">expand_more</span>
                        </button>
                        <button class="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-surface-dark hover:bg-white/10 transition-colors px-4">
                            <p class="text-white text-sm font-medium">Rating</p>
                            <span class="material-symbols-outlined text-xl">expand_more</span>
                        </button>
                        <button class="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-surface-dark hover:bg-white/10 transition-colors px-4">
                            <p class="text-white text-sm font-medium">Disponibilidad</p>
                            <span class="material-symbols-outlined text-xl">expand_more</span>
                        </button>
                    </div>
                    <div>
                        <button class="flex w-full md:w-auto min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-accent-copper text-white gap-2 text-sm font-bold tracking-wider hover:bg-[#a56118] transition-colors">
                            <span class="material-symbols-outlined text-xl">filter_list</span>
                            <span class="truncate">FILTRAR</span>
                        </button>
                    </div>
                </div>
                <div id="makers-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <!-- Makers injected here -->
                </div>
                <div id="no-results" class="hidden flex-col items-center justify-center text-center py-20 mt-8 bg-surface-dark rounded-xl border border-white/10">
                    <span class="material-symbols-outlined text-6xl text-text-muted mb-4">search_off</span>
                    <h3 class="text-xl font-bold text-white mb-1">No se encontraron confeccionistas</h3>
                    <p class="text-text-muted mb-6 max-w-xs">Intenta ajustar o borrar los filtros para ampliar tu búsqueda.</p>
                    <button class="flex items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-accent-copper text-white gap-2 text-sm font-bold tracking-wider hover:bg-[#a56118] transition-colors">
                        <span class="truncate">Borrar Filtros</span>
                    </button>
                </div>
            </div>
        </main>
    </div>
    `;
}
