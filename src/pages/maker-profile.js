import { supabase } from '../js/supabase.js';
import { getCurrentUser, signOut } from '../js/auth.js';
import { getLogo } from '../components/logo.js';

export function MakerProfilePage() {
    setTimeout(async () => {
        const user = await getCurrentUser();

        // Get maker ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        let makerId = urlParams.get('id');
        let viewerRole = 'guest';
        let viewerProfile = null;

        if (user) {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            viewerProfile = profile;
            viewerRole = profile?.role;
        }

        // If no ID provided, and user is maker, show their own profile
        if (!makerId && viewerRole === 'maker') {
            makerId = user.id;
        }

        if (!makerId) {
            // If still no ID (and not a maker viewing own profile), redirect
            if (viewerRole === 'client') {
                window.location.href = '/explore-makers';
            } else if (viewerRole === 'maker') {
                window.location.href = '/maker-dashboard';
            } else {
                window.location.href = '/makers';
            }
            return;
        }

        // Fetch maker details
        const { data: maker, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', makerId)
            .single();

        if (error || !maker) {
            console.error('Maker not found');
            return;
        }

        // Fetch Portfolio
        const { data: portfolio } = await supabase
            .from('portfolio')
            .select('*')
            .eq('maker_id', maker.id);

        // Fetch Reviews
        const { data: reviews } = await supabase
            .from('reviews')
            .select('*, client:profiles!client_id(full_name)')
            .eq('maker_id', maker.id)
            .order('created_at', { ascending: false });

        renderMakerProfile(maker, portfolio || [], reviews || [], viewerRole, viewerProfile);

        // Setup logout listener
        document.getElementById('logout-btn')?.addEventListener('click', async () => {
            await signOut();
            window.location.href = '/login';
        });

    }, 0);

    function renderMakerProfile(maker, portfolio, reviews, viewerRole, viewerProfile) {
        const container = document.getElementById('maker-profile-container');
        const sidebarContainer = document.getElementById('sidebar-container');
        const headerContainer = document.getElementById('header-container');

        if (sidebarContainer) {
            sidebarContainer.innerHTML = renderSidebar(viewerRole, viewerProfile);
        }

        if (headerContainer && viewerProfile) {
            headerContainer.innerHTML = `
                <header class="flex justify-end items-center gap-6 mb-8 bg-surface p-4 rounded-xl border border-white/10 shadow-sm">
                    <button class="relative p-2 text-on-surface/80 hover:text-primary transition-colors">
                        <span class="material-symbols-outlined text-2xl">notifications</span>
                        <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <a href="/profile" class="flex items-center gap-3 hover:opacity-80 transition-opacity border-l border-white/10 pl-6">
                        <div class="bg-gradient-to-br from-primary to-secondary rounded-full w-10 h-10 flex items-center justify-center text-white font-bold shadow-md overflow-hidden">
                            ${viewerProfile.avatar_url ? `<img src="${viewerProfile.avatar_url}" class="w-full h-full object-cover">` : (viewerProfile.full_name || 'U')[0].toUpperCase()}
                        </div>
                        <div class="flex flex-col text-right hidden sm:flex">
                            <h2 class="text-base font-semibold text-on-surface leading-tight">${viewerProfile.full_name || 'Usuario'}</h2>
                            <p class="text-primary text-sm font-medium leading-tight uppercase">Plan ${viewerProfile.plan || 'Free'}</p>
                        </div>
                    </a>
                </header>
            `;
        }

        if (!container) return;

        // Calculate stats
        const reviewsCount = reviews.length;
        const rating = reviewsCount > 0
            ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviewsCount).toFixed(1)
            : 'N/A';

        const specialty = maker.bio ? maker.bio.split('.')[0] : 'General';
        const plan = maker.plan || 'free';
        const isOwnProfile = viewerProfile && viewerProfile.id === maker.id;

        // Render Portfolio HTML
        const portfolioHtml = portfolio.length > 0
            ? portfolio.map(item => `
                <div class="aspect-[3/4] rounded-lg bg-cover bg-center hover:opacity-90 transition-opacity cursor-pointer border border-white/10 shadow-lg" style='background-image: url("${item.image_url}");' title="${item.title || ''}"></div>
              `).join('')
            : '<p class="col-span-full text-on-surface/60 text-center py-8">Este confeccionista aún no ha subido trabajos a su portafolio.</p>';

        // Render Reviews HTML
        const reviewsHtml = reviews.length > 0
            ? reviews.map(r => `
                <div class="bg-surface rounded-xl p-4 border border-white/10 shadow-sm">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-bold text-on-surface">${r.client?.full_name || 'Cliente'}</p>
                            <p class="text-sm text-on-surface/60">${new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                        <div class="flex gap-0.5 text-primary">
                            ${renderStars(r.rating)}
                        </div>
                    </div>
                    <p class="mt-2 text-on-surface text-sm">"${r.comment || ''}"</p>
                </div>
              `).join('')
            : '<p class="text-on-surface/60 text-center py-4">Aún no hay opiniones.</p>';

        container.innerHTML = `
            <!-- ProfileHeader -->
            <section class="bg-surface rounded-xl p-6 @container border border-white/10 shadow-lg">
                <div class="flex w-full flex-col gap-6 @[520px]:flex-row @[520px]:items-center">
                    <div class="flex gap-6 flex-1">
                        <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 border-2 border-primary/20" style='background-image: url("${maker.avatar_url || 'https://via.placeholder.com/150'}");'></div>
                        <div class="flex flex-col justify-center gap-1.5">
                            <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
                                <p class="text-on-surface text-2xl font-bold leading-tight">${maker.full_name || 'Confeccionista'}</p>
                                <div class="flex items-center gap-1 text-primary">
                                    ${rating !== 'N/A' ? renderStars(parseFloat(rating)) : ''}
                                    <span class="text-sm text-on-surface/60 ml-1">${rating !== 'N/A' ? `(${rating})` : '(Nuevo)'}</span>
                                </div>
                            </div>
                            <p class="text-on-surface/60 text-base font-normal leading-normal">${maker.bio || 'Sin biografía.'}</p>
                            <p class="text-on-surface font-medium text-base">${specialty}</p>
                            <div class="flex gap-2 pt-2 flex-wrap">
                                <div class="flex h-7 shrink-0 items-center justify-center gap-x-2 rounded-full bg-primary/20 text-primary border border-primary/20 px-3">
                                    <p class="text-xs font-bold leading-normal uppercase tracking-wider">Plan ${plan}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    ${!isOwnProfile ? `
                    <div class="flex w-full shrink-0 gap-3 @[480px]:w-auto @[520px]:flex-col">
                        <button onclick="window.location.href='/chat?recipient_id=${maker.id}'" class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-wide flex-1 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                            <span class="truncate">Enviar mensaje</span>
                        </button>
                        <button onclick="window.location.href='/my-designs?maker_id=${maker.id}'" class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-surface border border-white/10 text-on-surface text-sm font-bold leading-normal tracking-wide flex-1 hover:bg-white/5 transition-colors">
                            <span class="truncate">Enviar diseño</span>
                        </button>
                    </div>
                    ` : `
                    <div class="flex w-full shrink-0 gap-3 @[480px]:w-auto @[520px]:flex-col">
                        <button onclick="window.location.href='/maker-profile-edit'" class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-surface border border-white/10 text-on-surface text-sm font-bold leading-normal tracking-wide flex-1 hover:bg-white/5 transition-colors">
                            <span class="material-symbols-outlined text-lg mr-2">edit</span>
                            <span class="truncate">Editar Perfil</span>
                        </button>
                    </div>
                    `}
                </div>
            </section>

            <!-- Portfolio Section -->
            <section>
                <h2 class="text-on-surface text-[22px] font-bold leading-tight tracking-tight px-4 pb-4 pt-2">Portafolio</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    ${portfolioHtml}
                </div>
            </section>

            <!-- Customer Reviews Section -->
            <section>
                <h2 class="text-on-surface text-[22px] font-bold leading-tight tracking-tight px-4 pb-4 pt-2">Opiniones (${reviewsCount})</h2>
                <div class="grid md:grid-cols-1 gap-6">
                    <div class="space-y-4">
                        ${reviewsHtml}
                    </div>
                </div>
            </section>
        `;
    }

    function renderStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<span class="material-symbols-outlined fill text-lg" style="font-variation-settings: \'FILL\' 1;">star</span>';
            } else if (i - 0.5 <= rating) {
                stars += '<span class="material-symbols-outlined fill text-lg" style="font-variation-settings: \'FILL\' 1;">star_half</span>';
            } else {
                stars += '<span class="material-symbols-outlined text-lg">star_border</span>';
            }
        }
        return stars;
    }

    function renderSidebar(role, profile) {
        if (role === 'maker') {
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
                        <a href="/maker-orders" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                            <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">inventory_2</span>
                            <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Pedidos</p>
                        </a>
                        <a href="/maker-profile" class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface hover:bg-primary/20 transition-colors duration-200 group">
                            <span class="material-symbols-outlined text-xl group-hover:text-primary transition-colors">person</span>
                            <p class="text-on-surface text-sm font-medium">Mi Perfil</p>
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
        } else {
            // Client Sidebar
            return `
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
            `;
        }
    }

    return `
    <div class="flex min-h-screen w-full bg-base font-display text-on-surface">
        <!-- Sidebar Container -->
        <div id="sidebar-container"></div>
        
        <!-- Main Content -->
        <main class="flex-1 p-8 overflow-y-auto">
            <div id="header-container"></div>
            <div class="max-w-5xl mx-auto space-y-8" id="maker-profile-container">
                <!-- Content injected here -->
                <div class="flex items-center justify-center h-64">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        </main>
    </div>
    `;
}
