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

        if (error || !maker) {
            console.error('Error fetching maker:', error);
            // Fallback to mock data for demonstration if ID doesn't exist in DB (e.g. if clicked from mock list)
            renderMakerProfile({
                full_name: 'Alejandro Vargas',
                bio: 'Especialista en alta costura con un toque moderno y sostenible.',
                specialty: 'Alta Costura',
                avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjclGtRHnTNmYgVEnx7DV57QMNrmPomWfzBPtF5_I9qCTaZWHFrVr7TW-26eVsMCF4JopQ25bnw9bF0nWM6XKwFQgJtJwWung5nuvFH_6RfDjufIjwvhOX9Ax7Bh5JmUjspTIBYG-IWvkh8357nDNRCWsjrYKDAHoeHNhL5PGvb4XpgyWhvHYMggB3UpjBvI4XoX5-BKQYboX1c5AY-R8JeeupV4PQz5adA36nFgWcTpqbdfCT2oDsAjXEzTwSr6TIX17C5EK6BMU',
                plan: 'elite',
                rating: 4.8,
                reviews_count: 124
            });
        } else {
            renderMakerProfile(maker);
        }

        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', async () => {
            await signOut();
            window.location.href = '/login';
        });

    }, 0);

    function renderMakerProfile(maker) {
        const container = document.getElementById('maker-profile-container');
        if (!container) return;

        // Mock portfolio images
        const portfolioImages = [
            'https://lh3.googleusercontent.com/aida-public/AB6AXuDiN0Wxit1olXstX_329WPgL1Sq51g-qZIOChA71Gg6w7U5a3U-hPtkbEg2TswqsObRn2IiJVYekRJ3YWhptHRSU_nLGNlmA-4H6hzWyLe6QwvKNW37EtO1mYEcChfYFD7FlT3zieHyVk6LSM6RkFw22uE-JkdYgWlzvRJH7DjlIpQ-D_xDXHgrYd-nkLpUky2gfEA4VCa3KG4K80dPFWetINQyRcoQmjvUjgcFuGkeToyds3HEIyXGY2o4iHUrBjG5B39UsOOqxjE',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuAhYFHL7OxzMRqap-dJay-ulV6PPwx73TDXKBS9ShgrpM4inBdF7sjIiQjVxWbFyQAZ-KSaSHPTcvvJ9UaG-B343ZYdM5P3T8J4jAHFdpH2_jeu0RhN-fDe2TjLr1wjQUcZZFpO9Jcwhbo25lWdvDliRszAMfxxxwSXR7r48JRSSkcxROSBmtrd1gqIaeoV4W2Z23BMxal2yFMHFI2P90pdT-Z5QS4c6AO_YrSpgqJT77Yw5YApAh_aYxunRoTpob-djoCxMJH2QHw',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuB4Zanlme4OVqgXL172V1WUkc7my2MIdL2I9u84hSHpWpVQ0jijXIwK2dKXv6c-ZhSK1MJ130Qvm5BA4N58mpgWXKngEfg6-NzGhfCbfMlFpPvWApZDzJ43v9rDPrzKYePI6T_CTwjBSHWJYNvOQfd3saFBq7ia18vGhuk4HDOBCfeCJ4nxF_443FKYU1CyDy2-J1D8By9_R4YuLT4C0XItfs3euPdYIdJlS9mm3a0RLt6aYGgF0weXcyMKXJLl9GEhJx2a0bRE2eg',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuDsA6I0DeUWUMi9KcBVyNysEVMVORy31t3fJe2w78lNSGw8FWSAzayYVhkiNTXHLrVsgI5a_ISX6unBKGdj8-TszeNBZyUO8v5taVWXBFzMxoy7xOgwHkYvWkZoCToI_M4UnDxYKq_2s0H_0zF3T-ekqFR3dEYwipXJ9cfeYT20OVl6VwEdxNH1Am7X56REYewSAwuW2PMDBsofEZTc6AKpx5Cr8AMhyAWX8ceZHp_LY_tHr4pHmu0BfgJu_iwumniYRXUbgfK09rU'
        ];

        const rating = maker.rating || 4.8;
        const reviewsCount = maker.reviews_count || 124;
        const specialty = maker.specialty || (maker.bio ? maker.bio.split('.')[0] : 'Alta Costura');
        const plan = maker.plan || 'elite';

        container.innerHTML = `
            <!-- ProfileHeader -->
            <section class="bg-card-dark rounded-xl p-6 @container">
                <div class="flex w-full flex-col gap-6 @[520px]:flex-row @[520px]:items-center">
                    <div class="flex gap-6 flex-1">
                        <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0" style='background-image: url("${maker.avatar_url || 'https://via.placeholder.com/150'}");'></div>
                        <div class="flex flex-col justify-center gap-1.5">
                            <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
                                <p class="text-white text-2xl font-bold leading-tight">${maker.full_name || 'Confeccionista'}</p>
                                <div class="flex items-center gap-1 text-primary">
                                    ${renderStars(rating)}
                                </div>
                            </div>
                            <p class="text-text-beige-muted text-base font-normal leading-normal">${maker.bio || 'Especialista en confección.'}</p>
                            <p class="text-white font-medium text-base">${specialty}</p>
                            <div class="flex gap-2 pt-2 flex-wrap">
                                <div class="flex h-7 shrink-0 items-center justify-center gap-x-2 rounded-full bg-primary text-background-dark px-3">
                                    <p class="text-xs font-bold leading-normal uppercase tracking-wider">Plan ${plan}</p>
                                </div>
                                <div class="flex h-7 shrink-0 items-center justify-center gap-x-2 rounded-full bg-accent-copper/20 text-accent-copper px-3">
                                    <p class="text-xs font-bold leading-normal uppercase tracking-wider">Destacado</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex w-full shrink-0 gap-3 @[480px]:w-auto @[520px]:flex-col">
                        <button onclick="window.location.href='/chat?recipient_id=${maker.id || 'mock-id'}'" class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-accent-copper text-white text-sm font-bold leading-normal tracking-wide flex-1 hover:bg-accent-copper/90 transition-colors">
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
                    ${portfolioImages.map(img => `
                        <div class="aspect-[3/4] rounded-lg bg-cover bg-center hover:opacity-90 transition-opacity cursor-pointer" style='background-image: url("${img}");'></div>
                    `).join('')}
                </div>
            </section>

            <!-- Experience & Specialties Section -->
            <section class="bg-card-dark rounded-xl p-6">
                <h2 class="text-white text-[22px] font-bold leading-tight tracking-tight mb-4">Experiencia y Especialidades</h2>
                <div class="flex flex-wrap gap-3">
                    <span class="bg-white/10 text-text-beige rounded-lg px-4 py-2 text-sm font-medium">15+ Años de Experiencia</span>
                    <span class="bg-white/10 text-text-beige rounded-lg px-4 py-2 text-sm font-medium">Vestidos de Gala</span>
                    <span class="bg-white/10 text-text-beige rounded-lg px-4 py-2 text-sm font-medium">Sastrería a Medida</span>
                    <span class="bg-white/10 text-text-beige rounded-lg px-4 py-2 text-sm font-medium">Moda Sostenible</span>
                    <span class="bg-white/10 text-text-beige rounded-lg px-4 py-2 text-sm font-medium">Ropa Urbana Premium</span>
                    <span class="bg-white/10 text-text-beige rounded-lg px-4 py-2 text-sm font-medium">Telas Orgánicas</span>
                    <span class="bg-white/10 text-text-beige rounded-lg px-4 py-2 text-sm font-medium">Bordado Artesanal</span>
                </div>
            </section>

            <!-- Customer Reviews Section -->
            <section>
                <h2 class="text-white text-[22px] font-bold leading-tight tracking-tight px-4 pb-4 pt-2">Opiniones</h2>
                <div class="grid md:grid-cols-2 gap-6">
                    <!-- RatingSummary -->
                    <div class="bg-card-dark rounded-xl p-6 flex flex-col justify-center">
                        <div class="flex flex-wrap gap-x-8 gap-y-6">
                            <div class="flex flex-col gap-2">
                                <p class="text-white text-4xl font-black leading-tight tracking-tighter">${rating}</p>
                                <div class="flex gap-0.5 text-primary">
                                    ${renderStars(rating)}
                                </div>
                                <p class="text-text-beige-muted text-base font-normal leading-normal">Basado en ${reviewsCount} opiniones</p>
                            </div>
                            <div class="grid min-w-[200px] max-w-[400px] flex-1 grid-cols-[20px_1fr_40px] items-center gap-y-3">
                                <p class="text-white text-sm font-normal leading-normal">5</p>
                                <div class="flex h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"><div class="rounded-full bg-primary" style="width: 85%;"></div></div>
                                <p class="text-text-beige-muted text-sm font-normal leading-normal text-right">85%</p>
                                <p class="text-white text-sm font-normal leading-normal">4</p>
                                <div class="flex h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"><div class="rounded-full bg-primary" style="width: 10%;"></div></div>
                                <p class="text-text-beige-muted text-sm font-normal leading-normal text-right">10%</p>
                                <p class="text-white text-sm font-normal leading-normal">3</p>
                                <div class="flex h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"><div class="rounded-full bg-primary" style="width: 3%;"></div></div>
                                <p class="text-text-beige-muted text-sm font-normal leading-normal text-right">3%</p>
                                <p class="text-white text-sm font-normal leading-normal">2</p>
                                <div class="flex h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"><div class="rounded-full bg-primary" style="width: 2%;"></div></div>
                                <p class="text-text-beige-muted text-sm font-normal leading-normal text-right">2%</p>
                                <p class="text-white text-sm font-normal leading-normal">1</p>
                                <div class="flex h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"><div class="rounded-full bg-primary" style="width: 0%;"></div></div>
                                <p class="text-text-beige-muted text-sm font-normal leading-normal text-right">0%</p>
                            </div>
                        </div>
                    </div>
                    <!-- Reviews List -->
                    <div class="space-y-4">
                        <div class="bg-card-dark rounded-xl p-4">
                            <div class="flex justify-between items-start">
                                <div>
                                    <p class="font-bold text-white">Lucía Mendoza</p>
                                    <p class="text-sm text-text-beige-muted">Hace 2 semanas</p>
                                </div>
                                <div class="flex gap-0.5 text-primary">
                                    ${renderStars(5)}
                                </div>
                            </div>
                            <p class="mt-2 text-text-beige text-sm">"¡Un trabajo impecable! Alejandro entendió mi visión a la perfección y el resultado superó mis expectativas. Profesionalismo y talento puro."</p>
                        </div>
                        <div class="bg-card-dark rounded-xl p-4">
                            <div class="flex justify-between items-start">
                                <div>
                                    <p class="font-bold text-white">Carlos Fernández</p>
                                    <p class="text-sm text-text-beige-muted">Hace 1 mes</p>
                                </div>
                                <div class="flex gap-0.5 text-primary">
                                    ${renderStars(5)}
                                </div>
                            </div>
                            <p class="mt-2 text-text-beige text-sm">"La comunicación fue excelente durante todo el proceso. La calidad de los materiales y la confección del traje son de otro nivel."</p>
                        </div>
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
