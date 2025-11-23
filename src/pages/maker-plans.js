import { getCurrentUser, signOut } from '../js/auth.js';
import { supabase } from '../js/supabase.js';

export function MakerPlansPage() {
    setTimeout(async () => {
        const user = await getCurrentUser();
        if (!user) {
            window.location.href = '/login';
            return;
        }

        // Fetch current plan
        let currentPlan = 'free';
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profile) {
            currentPlan = profile.plan || 'free';
        }

        // State management
        let isChangingPlan = false;
        let pendingPlan = null;

        const handleUpgrade = (newPlan) => {
            pendingPlan = newPlan;
            const modal = document.getElementById('paypal-modal');
            const planNameSpan = document.getElementById('paypal-plan-name');
            if (modal && planNameSpan) {
                planNameSpan.textContent = newPlan === 'elite' ? 'Plan Elite ($49.99)' : 'Plan Pro ($19.99)';
                modal.classList.remove('hidden');
            }
        };

        const closePayPalModal = () => {
            const modal = document.getElementById('paypal-modal');
            if (modal) {
                modal.classList.add('hidden');
            }
            pendingPlan = null;
        };

        const processPayPalPayment = async () => {
            const btn = document.getElementById('paypal-submit-btn');
            const originalText = btn.innerText;
            btn.innerText = 'Procesando...';
            btn.disabled = true;

            setTimeout(async () => {
                const { error } = await supabase
                    .from('profiles')
                    .update({ plan: pendingPlan })
                    .eq('id', user.id);

                if (error) {
                    alert('Error al actualizar el plan.');
                } else {
                    alert(`¡Pago exitoso! Bienvenido al plan ${pendingPlan.toUpperCase()}.`);
                    window.location.reload();
                }

                btn.innerText = originalText;
                btn.disabled = false;
                closePayPalModal();
            }, 2000);
        };

        const renderContent = () => {
            const container = document.getElementById('plans-content');
            if (!container) return;

            if (isChangingPlan) {
                // Pricing Table
                container.innerHTML = `
                <div class="max-w-7xl mx-auto relative">
                     <!-- Mock PayPal Modal -->
                    <div id="paypal-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 hidden backdrop-blur-sm">
                        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                            <div class="mb-6 flex flex-col items-center justify-center border-b border-gray-200 pb-4">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" class="h-8 mb-2">
                                <span id="paypal-plan-name" class="text-sm text-gray-500 font-medium"></span>
                            </div>
                            <h3 class="mb-4 text-center text-lg font-bold text-gray-900">Pagar Suscripción</h3>
                            <div class="space-y-4">
                                <input type="email" class="w-full rounded-md border border-gray-300 p-3 text-black" placeholder="Email de PayPal">
                                <input type="password" class="w-full rounded-md border border-gray-300 p-3 text-black" placeholder="Contraseña">
                                <button id="paypal-submit-btn" class="w-full rounded-full bg-[#0070BA] py-3 font-bold text-white hover:bg-[#005ea6]">
                                    Pagar Ahora
                                </button>
                                <button id="paypal-cancel-btn" class="w-full rounded-full py-3 font-medium text-gray-500 hover:bg-gray-50">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="mb-10 text-center">
                        <h1 class="text-white text-4xl font-black">Potencia tu Taller</h1>
                        <p class="text-gray-400 mt-2">Elige el plan ideal para crecer tu negocio de confección.</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <!-- Free -->
                        <div class="bg-card-dark border border-white/10 rounded-xl p-6 flex flex-col gap-4">
                            <h2 class="text-white text-xl font-bold">Básico</h2>
                            <p class="text-4xl font-black text-white">GRATIS</p>
                            <button class="w-full py-3 rounded-lg bg-white/5 text-gray-400 font-bold" disabled>Plan Actual</button>
                            <ul class="space-y-3 text-sm text-gray-400">
                                <li class="flex gap-2"><span class="material-symbols-outlined text-green-500">check</span> Perfil Básico</li>
                                <li class="flex gap-2"><span class="material-symbols-outlined text-green-500">check</span> Hasta 3 pedidos activos</li>
                                <li class="flex gap-2"><span class="material-symbols-outlined text-green-500">check</span> Comisión del 15%</li>
                            </ul>
                        </div>

                        <!-- Pro -->
                        <div class="bg-card-dark border border-accent-gold rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden">
                            <div class="absolute top-0 right-0 bg-accent-gold text-black text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
                            <h2 class="text-accent-gold text-xl font-bold">Pro</h2>
                            <p class="text-4xl font-black text-white">$19.99<span class="text-base font-normal text-gray-400">/mes</span></p>
                            <button id="btn-pro" class="w-full py-3 rounded-lg bg-accent-gold text-black font-bold hover:bg-accent-gold/90 transition-colors">Elegir Pro</button>
                            <ul class="space-y-3 text-sm text-gray-400">
                                <li class="flex gap-2"><span class="material-symbols-outlined text-accent-gold">check</span> Perfil Destacado</li>
                                <li class="flex gap-2"><span class="material-symbols-outlined text-accent-gold">check</span> Hasta 10 pedidos activos</li>
                                <li class="flex gap-2"><span class="material-symbols-outlined text-accent-gold">check</span> Comisión del 10%</li>
                                <li class="flex gap-2"><span class="material-symbols-outlined text-accent-gold">check</span> Portafolio Ilimitado</li>
                            </ul>
                        </div>

                        <!-- Elite -->
                        <div class="bg-card-dark border border-purple-500 rounded-xl p-6 flex flex-col gap-4">
                            <h2 class="text-purple-500 text-xl font-bold">Elite</h2>
                            <p class="text-4xl font-black text-white">$49.99<span class="text-base font-normal text-gray-400">/mes</span></p>
                            <button id="btn-elite" class="w-full py-3 rounded-lg bg-purple-500 text-white font-bold hover:bg-purple-600 transition-colors">Elegir Elite</button>
                            <ul class="space-y-3 text-sm text-gray-400">
                                <li class="flex gap-2"><span class="material-symbols-outlined text-purple-500">check</span> Máxima Visibilidad</li>
                                <li class="flex gap-2"><span class="material-symbols-outlined text-purple-500">check</span> Pedidos Ilimitados</li>
                                <li class="flex gap-2"><span class="material-symbols-outlined text-purple-500">check</span> Comisión del 5%</li>
                                <li class="flex gap-2"><span class="material-symbols-outlined text-purple-500">check</span> Soporte VIP</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="mt-8 text-center">
                        <button id="cancel-change-btn" class="text-gray-400 hover:text-white underline">Cancelar</button>
                    </div>
                </div>
                `;

                document.getElementById('paypal-cancel-btn').addEventListener('click', closePayPalModal);
                document.getElementById('paypal-submit-btn').addEventListener('click', processPayPalPayment);
                document.getElementById('cancel-change-btn').addEventListener('click', () => {
                    isChangingPlan = false;
                    renderContent();
                });
                document.getElementById('btn-pro')?.addEventListener('click', () => handleUpgrade('pro'));
                document.getElementById('btn-elite')?.addEventListener('click', () => handleUpgrade('elite'));

            } else {
                // Current Plan View
                container.innerHTML = `
                <div class="max-w-4xl mx-auto">
                    <h1 class="text-3xl font-black text-white mb-8">Mi Suscripción</h1>
                    
                    <div class="bg-card-dark border border-white/10 rounded-xl p-8 flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm uppercase tracking-wider font-bold mb-1">Plan Actual</p>
                            <h2 class="text-4xl font-black text-white mb-2 capitalize">${currentPlan}</h2>
                            <p class="text-green-500 text-sm flex items-center gap-1"><span class="material-symbols-outlined text-sm">check_circle</span> Activo</p>
                        </div>
                        <button id="change-plan-btn" class="px-6 py-3 rounded-lg bg-accent-gold text-black font-bold hover:bg-accent-gold/90 transition-colors">
                            Mejorar Plan
                        </button>
                    </div>

                    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-card-dark border border-white/10 rounded-xl p-6">
                            <h3 class="text-white font-bold mb-4">Beneficios Activos</h3>
                            <ul class="space-y-3 text-sm text-gray-400">
                                <li class="flex gap-2"><span class="material-symbols-outlined text-accent-gold">check</span> Acceso al Marketplace</li>
                                <li class="flex gap-2"><span class="material-symbols-outlined text-accent-gold">check</span> Recepción de Pedidos</li>
                                ${currentPlan !== 'free' ? `<li class="flex gap-2"><span class="material-symbols-outlined text-accent-gold">check</span> Visibilidad Mejorada</li>` : ''}
                            </ul>
                        </div>
                        <div class="bg-card-dark border border-white/10 rounded-xl p-6">
                            <h3 class="text-white font-bold mb-4">Facturación</h3>
                            <p class="text-gray-400 text-sm mb-4">Próximo cobro: <span class="text-white">24 Dic, 2024</span></p>
                            <button class="text-red-500 text-sm hover:underline">Cancelar Suscripción</button>
                        </div>
                    </div>
                </div>
                `;

                document.getElementById('change-plan-btn').addEventListener('click', () => {
                    isChangingPlan = true;
                    renderContent();
                });
            }
        };

        renderContent();

    }, 0);

    return `
    <div class="flex min-h-screen w-full bg-background-dark font-display text-text-beige">
        ${renderSidebar(profile)}
        <main class="flex-1 p-8 overflow-y-auto" id="plans-content">
            <!-- Content -->
        </main>
    </div>
    `;
}

// Helper to render sidebar (duplicated for now, should be shared)
function renderSidebar(profile) {
    if (!profile) return '';
    return `
    <nav class="w-64 flex-shrink-0 bg-sidebar-dark border-r border-white/5 p-4 flex flex-col justify-between hidden md:flex">
        <div class="flex flex-col gap-4">
            <div class="flex items-center gap-3 p-2">
                <div class="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center overflow-hidden border border-accent-gold/30">
                    ${profile.avatar_url ? `<img src="${profile.avatar_url}" class="w-full h-full object-cover">` : '<span class="material-symbols-outlined text-accent-gold">checkroom</span>'}
                </div>
                <div class="flex flex-col">
                    <h1 class="text-white text-sm font-bold leading-normal">${profile.full_name || 'Confeccionista'}</h1>
                    <p class="text-accent-gold text-xs font-medium uppercase tracking-wider">${profile.plan || 'Free'}</p>
                </div>
            </div>
            <div class="flex flex-col gap-1">
                <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-gold hover:bg-white/5" href="/maker-dashboard">
                    <span class="material-symbols-outlined text-xl">dashboard</span>
                    Dashboard
                </a>
                <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-gold hover:bg-white/5" href="/maker-orders">
                    <span class="material-symbols-outlined text-xl">inventory_2</span>
                    Pedidos
                </a>
                <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-gold hover:bg-white/5" href="/maker-profile-edit">
                    <span class="material-symbols-outlined text-xl">person_edit</span>
                    Mi Perfil
                </a>
                <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-gold hover:bg-white/5" href="/maker-portfolio">
                    <span class="material-symbols-outlined text-xl">photo_library</span>
                    Portafolio
                </a>
                <a class="relative flex items-center gap-4 rounded-lg bg-accent-gold/10 px-4 py-2.5 text-sm font-bold text-accent-gold shadow-gold-glow-soft" href="/maker-plans">
                    <span class="absolute left-0 h-6 w-1 rounded-r-full bg-accent-gold"></span>
                    <span class="material-symbols-outlined text-xl">credit_card</span>
                    Suscripción
                </a>
                <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-gold hover:bg-white/5" href="/chat">
                    <span class="material-symbols-outlined text-xl">chat</span>
                    Mensajes
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
    `;
}
