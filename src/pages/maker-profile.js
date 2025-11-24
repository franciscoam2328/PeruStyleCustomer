import { supabase } from '../js/supabase.js';
import { getCurrentUser, signOut } from '../js/auth.js';

export function MakerProfilePage() {
    setTimeout(async () => {
        const user = await getCurrentUser();
        if (!user) {
            window.location.href = '/login';
            return;
        }

        // Get maker ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const makerId = urlParams.get('id');

        if (!makerId) {
            // If no ID, redirect back to makers list
            window.location.href = '/makers';
            return;
        }

        // Fetch maker details
        // In a real app, we would fetch from 'profiles' and potentially related tables for portfolio/reviews
        // For now, we'll fetch the profile and use mock data for the rest if not available
        const { data: maker, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', makerId)
            .single();

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

        renderMakerProfile(maker, portfolio || [], reviews || []);
    }, 0);

    function renderMakerProfile(maker, portfolio, reviews) {
        const container = document.getElementById('maker-profile-container');
        if (!container) return;

        // Calculate stats
        const reviewsCount = reviews.length;
        const rating = reviewsCount > 0
            ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviewsCount).toFixed(1)
            : 'N/A';

        const specialty = maker.bio ? maker.bio.split('.')[0] : 'General';
        const plan = maker.plan || 'free';

        // Render Portfolio HTML
        const portfolioHtml = portfolio.length > 0
            ? portfolio.map(item => `
                <div class="aspect-[3/4] rounded-lg bg-cover bg-center hover:opacity-90 transition-opacity cursor-pointer border border-white/10" style='background-image: url("${item.image_url}");' title="${item.title || ''}"></div>
              `).join('')
            : '<p class="col-span-full text-gray-500 text-center py-8">Este confeccionista aún no ha subido trabajos a su portafolio.</p>';

        // Render Reviews HTML
        const reviewsHtml = reviews.length > 0
            ? reviews.map(r => `
                <div class="bg-card-dark rounded-xl p-4 border border-white/5">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-bold text-white">${r.client?.full_name || 'Cliente'}</p>
                            <p class="text-sm text-text-beige-muted">${new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                        <div class="flex gap-0.5 text-primary">
                            ${renderStars(r.rating)}
                        </div>
                    </div>
                    <p class="mt-2 text-text-beige text-sm">"${r.comment || ''}"</p>
                </div>
              `).join('')
            : '<p class="text-gray-500 text-center py-4">Aún no hay opiniones.</p>';

        container.innerHTML = `
            <!-- ProfileHeader -->
            <section class="bg-card-dark rounded-xl p-6 @container border border-white/5">
                <div class="flex w-full flex-col gap-6 @[520px]:flex-row @[520px]:items-center">
                    <div class="flex gap-6 flex-1">
                        <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 border-2 border-white/10" style='background-image: url("${maker.avatar_url || 'https://via.placeholder.com/150'}");'></div>
                        <div class="flex flex-col justify-center gap-1.5">
                            <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
                                <p class="text-white text-2xl font-bold leading-tight">${maker.full_name || 'Confeccionista'}</p>
                                <div class="flex items-center gap-1 text-primary">
                                    ${rating !== 'N/A' ? renderStars(parseFloat(rating)) : ''}
                                    <span class="text-sm text-gray-400 ml-1">${rating !== 'N/A' ? `(${rating})` : '(Nuevo)'}</span>
                                </div>
                            </div>
                            <p class="text-text-beige-muted text-base font-normal leading-normal">${maker.bio || 'Sin biografía.'}</p>
                            <p class="text-white font-medium text-base">${specialty}</p>
                            <div class="flex gap-2 pt-2 flex-wrap">
                                <div class="flex h-7 shrink-0 items-center justify-center gap-x-2 rounded-full bg-primary/20 text-primary border border-primary/20 px-3">
                                    <p class="text-xs font-bold leading-normal uppercase tracking-wider">Plan ${plan}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex w-full shrink-0 gap-3 @[480px]:w-auto @[520px]:flex-col">
                        <button onclick="window.location.href='/chat?recipient_id=${maker.id}'" class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-accent-copper text-white text-sm font-bold leading-normal tracking-wide flex-1 hover:bg-accent-copper/90 transition-colors">
                            <span class="truncate">Enviar mensaje</span>
                        </button>
                        <button class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-background-dark text-sm font-bold leading-normal tracking-wide flex-1 hover:bg-primary/90 transition-colors">
                            <span class="truncate">Enviar diseño</span>
                        </button>
                    </div>
                </div>
            </section>

            <!-- Portfolio Section -->
            <section>
                <h2 class="text-white text-[22px] font-bold leading-tight tracking-tight px-4 pb-4 pt-2">Portafolio</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    ${portfolioHtml}
                </div>
            </section>

            <!-- Customer Reviews Section -->
            <section>
                <h2 class="text-white text-[22px] font-bold leading-tight tracking-tight px-4 pb-4 pt-2">Opiniones (${reviewsCount})</h2>
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
                <a class="flex items-center gap-3 px-3 py-2 text-text-beige hover:bg-surface-dark hover:text-accent-gold rounded-lg transition-colors" href="/makers">
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
        
        <!-- Main Content -->
        <main class="flex-1 p-8 overflow-y-auto">
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
