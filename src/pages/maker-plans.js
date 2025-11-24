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
            .select('plan, full_name, avatar_url')
            .eq('id', user.id)
            .single();

        if (profile) {
            currentPlan = profile.plan || 'free';
        }

        // Logout logic
        const setupLogout = () => {
            document.getElementById('logout-btn')?.addEventListener('click', async () => {
                await signOut();
                window.location.href = '/login';
            });
        };

        // State management
        let isChangingPlan = false;
        let pendingPlan = null;

        const handleUpgrade = (newPlan) => {
            pendingPlan = newPlan;
            const modal = document.getElementById('paypal-modal');
            const planNameSpan = document.getElementById('paypal-plan-name');
            if (modal && planNameSpan) {
                planNameSpan.textContent = newPlan === 'elite' ? 'Plan Elite ($49.99)' : 'Plan Premium ($19.99)';
                modal.classList.remove('hidden');
            }
        };

        const closePayPalModal = () => {
            const modal = document.getElementById('paypal-modal');
            if (modal) {
                modal.classList.add('hidden');
                // Reset inputs
                const emailInput = document.getElementById('paypal-email');
                const passInput = document.getElementById('paypal-password');
                if (emailInput) emailInput.value = '';
                if (passInput) passInput.value = '';
            }
            pendingPlan = null;
        };

        const processPayPalPayment = async () => {
            const email = document.getElementById('paypal-email').value;
            const password = document.getElementById('paypal-password').value;

            if (!email || !password) {
                alert('Por favor ingrese su correo y contraseña de PayPal (simulados).');
                return;
            }

            const btn = document.getElementById('paypal-submit-btn');
            const originalText = btn.innerText;
            btn.innerText = 'Procesando...';
            btn.disabled = true;

            // Simulate network delay
            setTimeout(async () => {
                // Update in Supabase
                const { error } = await supabase
                    .from('profiles')
                    .update({ plan: pendingPlan })
                    .eq('id', user.id);

                if (error) {
                    alert('Error al actualizar el plan. Por favor intenta de nuevo.');
                } else {
                    alert(`¡Pago exitoso! Tu plan ha sido actualizado a ${pendingPlan.toUpperCase()}.`);
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
                // Pricing Table View
                container.innerHTML = `
                <div class="max-w-7xl mx-auto relative">
                    <!-- Mock PayPal Modal -->
                    <div id="paypal-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 hidden backdrop-blur-sm">
                        <div class="w-full max-w-md rounded-lg bg-card-dark border border-white/10 p-6 shadow-xl transform transition-all scale-100">
                            <div class="mb-6 flex flex-col items-center justify-center border-b border-white/10 pb-4">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" class="h-8 mb-2">
                                <span id="paypal-plan-name" class="text-sm text-gray-400 font-medium"></span>
                            </div>
                            <h3 class="mb-4 text-center text-lg font-bold text-white">Pagar con PayPal</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="mb-1 block text-sm font-medium text-gray-400">Correo electrónico</label>
                                    <input type="email" id="paypal-email" class="w-full rounded-md border border-white/10 bg-black/20 p-3 text-white focus:border-[#0070BA] focus:ring-1 focus:ring-[#0070BA] focus:outline-none transition-colors" placeholder="nombre@ejemplo.com">
                                </div>
                                <div>
                                    <label class="mb-1 block text-sm font-medium text-gray-400">Contraseña</label>
                                    <input type="password" id="paypal-password" class="w-full rounded-md border border-white/10 bg-black/20 p-3 text-white focus:border-[#0070BA] focus:ring-1 focus:ring-[#0070BA] focus:outline-none transition-colors" placeholder="••••••••">
                                </div>
                                <div class="text-right">
                                    <a href="#" class="text-xs text-[#0070BA] hover:underline">¿Olvidó su contraseña?</a>
                                </div>
                                <button id="paypal-submit-btn" class="w-full rounded-full bg-[#0070BA] py-3 font-bold text-white hover:bg-[#005ea6] transition-colors shadow-md hover:shadow-lg">
                                    Iniciar sesión y Pagar
                                </button>
                                <button id="paypal-cancel-btn" class="w-full rounded-full py-3 font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                                    Cancelar
                                </button>
                            </div>
                            <div class="mt-4 text-center">
                                <p class="text-xs text-gray-500">Esta es una simulación. No ingrese credenciales reales.</p>
                            </div>
                        </div>
                    </div>

                    <!-- PageHeading -->
                    <div class="mb-10">
                        <h1 class="text-white text-4xl font-black leading-tight tracking-tight">Potencia tu Taller</h1>
                        <p class="text-gray-400 text-base font-normal leading-normal mt-2">Elige el plan perfecto para crecer tu negocio de confección.</p>
                    </div>
                    <!-- PricingCards -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <!-- Plan Básico -->
                        <div class="flex flex-col gap-6 rounded-xl border border-white/10 bg-[#1A1A1A] p-6 transition-all hover:shadow-lg hover:-translate-y-1">
                            <div class="flex flex-col gap-2">
                                <h2 class="text-gray-200 text-lg font-bold leading-tight">Plan Básico</h2>
                                <span class="text-white text-5xl font-black leading-tight tracking-tighter">GRATIS</span>
                            </div>
                            <button class="w-full flex cursor-not-allowed items-center justify-center rounded-lg h-12 px-4 bg-white/5 text-gray-500 text-sm font-bold leading-normal tracking-wide" disabled>
                                <span class="truncate">${currentPlan === 'free' ? 'Plan Actual' : 'Básico'}</span>
                            </button>
                            <div class="flex flex-col gap-3">
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-green-500">check_circle</span>
                                    Comisión del 15% por pedido
                                </div>
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-green-500">check_circle</span>
                                    Hasta 3 fotos en portafolio
                                </div>
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-green-500">check_circle</span>
                                    Perfil básico
                                </div>
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-green-500">check_circle</span>
                                    Chat con clientes
                                </div>
                            </div>
                        </div>
                        <!-- Plan Premium -->
                        <div class="flex flex-col gap-6 rounded-xl border border-accent-copper bg-[#1A1A1A] p-6 transition-all hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden" style="box-shadow: 0 0 30px rgba(184, 115, 51, 0.15);">
                            ${currentPlan === 'premium' ? '<div class="absolute top-0 right-0 bg-accent-copper text-white text-xs font-bold px-3 py-1 rounded-bl-lg">PLAN ACTUAL</div>' : ''}
                            <div class="flex flex-col gap-2">
                                <h2 class="text-accent-copper text-lg font-bold leading-tight">Plan Premium</h2>
                                <p class="flex items-baseline gap-1 text-white">
                                    <span class="text-5xl font-black leading-tight tracking-tighter">$19.99</span>
                                    <span class="text-base font-bold leading-tight">/mes</span>
                                </p>
                            </div>
                            <button id="btn-premium" class="w-full flex cursor-pointer items-center justify-center rounded-lg h-12 px-4 bg-accent-copper text-white text-sm font-bold leading-normal tracking-wide hover:bg-[#a56118] transition-colors" ${currentPlan === 'premium' ? 'disabled style="opacity:0.5; cursor:default;"' : ''}>
                                <span class="truncate">${currentPlan === 'premium' ? 'Plan Actual' : 'Actualizar a Premium'}</span>
                            </button>
                            <div class="flex flex-col gap-3">
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-accent-copper">check_circle</span>
                                    Comisión reducida del 10%
                                </div>
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-accent-copper">check_circle</span>
                                    Hasta 20 fotos en portafolio
                                </div>
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-accent-copper">check_circle</span>
                                    Insignia "Verificado"
                                </div>
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-accent-copper">check_circle</span>
                                    Posicionamiento medio en búsquedas
                                </div>
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-accent-copper">check_circle</span>
                                    Soporte prioritario
                                </div>
                            </div>
                            <p class="text-xs text-center text-gray-500 mt-auto">Pago vía PayPal</p>
                        </div>
                        <!-- Plan Elite -->
                        <div class="flex flex-col gap-6 rounded-xl border border-accent-gold bg-[#1A1A1A] p-6 transition-all hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden" style="box-shadow: 0 0 30px rgba(212, 175, 53, 0.15);">
                            ${currentPlan === 'elite' ? '<div class="absolute top-0 right-0 bg-accent-gold text-black text-xs font-bold px-3 py-1 rounded-bl-lg">PLAN ACTUAL</div>' : ''}
                            <div class="flex flex-col gap-2">
                                <h2 class="text-accent-gold text-lg font-bold leading-tight">Plan Elite</h2>
                                <p class="flex items-baseline gap-1 text-white">
                                    <span class="text-5xl font-black leading-tight tracking-tighter">$49.99</span>
                                    <span class="text-base font-bold leading-tight">/mes</span>
                                </p>
                            </div>
                            <button id="btn-elite" class="w-full flex cursor-pointer items-center justify-center rounded-lg h-12 px-4 bg-accent-gold text-background-dark text-sm font-bold leading-normal tracking-wide hover:bg-[#b8962e] transition-colors" ${currentPlan === 'elite' ? 'disabled style="opacity:0.5; cursor:default;"' : ''}>
                                <span class="truncate">${currentPlan === 'elite' ? 'Plan Actual' : 'Actualizar a Elite'}</span>
                            </button>
                            <div class="flex flex-col gap-3">
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-accent-gold">check_circle</span>
                                    Comisión mínima del 5%
                                </div>
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-accent-gold">check_circle</span>
                                    Portafolio ILIMITADO
                                </div>
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-accent-gold">check_circle</span>
                                    Insignia "Elite" y Borde Dorado
                                </div>
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-accent-gold">check_circle</span>
                                    Máxima visibilidad en búsquedas
                                </div>
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-accent-gold">check_circle</span>
                                    Acceso a pedidos exclusivos
                                </div>
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-accent-gold">check_circle</span>
                                    Soporte VIP 24/7
                                </div>
                            </div>
                            <p class="text-xs text-center text-gray-500 mt-auto">Pago vía PayPal</p>
                        </div>
                    </div>
                    <div class="mt-8 flex justify-center">
                         <button id="cancel-change-btn" class="text-gray-400 hover:text-white underline transition-colors">Cancelar y volver</button>
                    </div>
                </div>
                `;

                // Attach listeners
                document.getElementById('cancel-change-btn').addEventListener('click', () => {
                    isChangingPlan = false;
                    renderContent();
                });

                document.getElementById('paypal-cancel-btn').addEventListener('click', closePayPalModal);
                document.getElementById('paypal-submit-btn').addEventListener('click', processPayPalPayment);

                const btnPremium = document.getElementById('btn-premium');
                if (btnPremium && !btnPremium.disabled) {
                    btnPremium.addEventListener('click', () => handleUpgrade('premium'));
                }

                const btnElite = document.getElementById('btn-elite');
                if (btnElite && !btnElite.disabled) {
                    btnElite.addEventListener('click', () => handleUpgrade('elite'));
                }

            } else {
                // Current Subscription View
                container.innerHTML = `
                <div class="mx-auto max-w-5xl">
                    <div class="rounded-xl border border-white/10 bg-[#1A1A1A] p-6 shadow-lg">
                        <div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                            <div>
                                <h1 class="text-2xl font-bold text-white">Plan ${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</h1>
                                <p class="mt-1 text-gray-400">Tu suscripción está activa.</p>
                            </div>
                            <div class="flex gap-2">
                                <button id="cancel-plan-btn" class="flex h-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-white/5 px-4 text-sm font-bold leading-normal text-white hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/50 border border-transparent transition-all">
                                    <span class="truncate">Cancelar Plan</span>
                                </button>
                                <button id="change-plan-btn" class="flex h-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-accent-gold px-4 text-sm font-bold leading-normal text-background-dark hover:brightness-110 transition-all">
                                    <span class="truncate">Cambiar Plan</span>
                                </button>
                            </div>
                        </div>
                        <div class="mt-6 border-t border-white/10 pt-6">
                            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <div class="flex items-start gap-3">
                                    <span class="material-symbols-outlined mt-1 text-accent-gold">check_circle</span>
                                    <div>
                                        <h3 class="font-semibold text-white">Comisión Preferencial</h3>
                                        <p class="text-sm text-gray-400">Aumenta tus ganancias con menores comisiones.</p>
                                    </div>
                                </div>
                                <div class="flex items-start gap-3">
                                    <span class="material-symbols-outlined mt-1 text-accent-gold">check_circle</span>
                                    <div>
                                        <h3 class="font-semibold text-white">Visibilidad Mejorada</h3>
                                        <p class="text-sm text-gray-400">Aparece primero en las búsquedas de clientes.</p>
                                    </div>
                                </div>
                                <div class="flex items-start gap-3">
                                    <span class="material-symbols-outlined mt-1 text-accent-gold">check_circle</span>
                                    <div>
                                        <h3 class="font-semibold text-white">Soporte Especializado</h3>
                                        <p class="text-sm text-gray-400">Ayuda directa para resolver cualquier inconveniente.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <section class="mt-12">
                        <h2 class="mb-6 text-center text-3xl font-bold text-white">Preguntas Frecuentes</h2>
                        <div class="mx-auto flex max-w-3xl flex-col gap-3">
                            <details class="group rounded-lg border border-white/10 bg-[#1A1A1A]/50 transition-all hover:bg-[#1A1A1A]">
                                <summary class="flex cursor-pointer items-center justify-between p-4 sm:p-5">
                                    <h3 class="font-medium text-white">¿Cómo funcionan las comisiones?</h3>
                                    <span class="material-symbols-outlined text-gray-400 transition-transform group-open:rotate-180">expand_more</span>
                                </summary>
                                <div class="border-t border-white/10 px-4 pb-5 pt-4 sm:px-5">
                                    <p class="text-gray-400">La comisión se descuenta automáticamente del pago total de cada pedido completado. Con el plan Elite, esta comisión se reduce al mínimo del 5%, permitiéndote ganar más por tu trabajo.</p>
                                </div>
                            </details>
                            <details class="group rounded-lg border border-white/10 bg-[#1A1A1A]/50 transition-all hover:bg-[#1A1A1A]">
                                <summary class="flex cursor-pointer items-center justify-between p-4 sm:p-5">
                                    <h3 class="font-medium text-white">¿Qué beneficios tiene la insignia de Verificado?</h3>
                                    <span class="material-symbols-outlined text-gray-400 transition-transform group-open:rotate-180">expand_more</span>
                                </summary>
                                <div class="border-t border-white/10 px-4 pb-5 pt-4 sm:px-5">
                                    <p class="text-gray-400">La insignia genera mayor confianza en los clientes, lo que se traduce en más pedidos. Además, los perfiles verificados tienen prioridad en los resultados de búsqueda.</p>
                                </div>
                            </details>
                            <details class="group rounded-lg border border-white/10 bg-[#1A1A1A]/50 transition-all hover:bg-[#1A1A1A]">
                                <summary class="flex cursor-pointer items-center justify-between p-4 sm:p-5">
                                    <h3 class="font-medium text-white">¿Puedo cancelar en cualquier momento?</h3>
                                    <span class="material-symbols-outlined text-gray-400 transition-transform group-open:rotate-180">expand_more</span>
                                </summary>
                                <div class="border-t border-white/10 px-4 pb-5 pt-4 sm:px-5">
                                    <p class="text-gray-400">Sí, puedes cancelar o cambiar tu plan cuando desees. Los cambios de plan superior son inmediatos, mientras que la cancelación se hace efectiva al finalizar el periodo facturado.</p>
                                </div>
                            </details>
                        </div>
                    </section>
                </div>
                `;
                document.getElementById('change-plan-btn').addEventListener('click', () => {
                    isChangingPlan = true;
                    renderContent();
                });

                document.getElementById('cancel-plan-btn').addEventListener('click', async () => {
                    if (currentPlan === 'free') {
                        alert('Ya tienes el plan básico (gratuito).');
                        return;
                    }

                    const confirmCancel = confirm('¿Estás seguro de que deseas cancelar tu suscripción? Perderás los beneficios Elite/Premium al finalizar el ciclo.');
                    if (confirmCancel) {
                        const { error } = await supabase
                            .from('profiles')
                            .update({ plan: 'free' })
                            .eq('id', user.id);

                        if (error) {
                            alert('Error al cancelar el plan.');
                        } else {
                            alert('Tu plan ha sido cancelado exitosamente. Volverás al plan Básico.');
                            window.location.reload();
                        }
                    }
                });
            }
        };

        renderContent();
        setupLogout();

    }, 0);

    return `
    <div class="flex min-h-screen w-full bg-background-dark font-display text-text-beige">
        <!-- Sidebar -->
        <nav class="w-64 flex-shrink-0 bg-sidebar-dark border-r border-white/5 p-4 flex flex-col justify-between hidden md:flex">
            <div class="flex flex-col gap-4">
                <div class="flex items-center gap-3 p-2">
                    <div class="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center overflow-hidden border border-accent-gold/30">
                        <span class="material-symbols-outlined text-accent-gold">checkroom</span>
                    </div>
                    <div class="flex flex-col">
                        <h1 class="text-white text-sm font-bold leading-normal">Mi Taller</h1>
                        <p class="text-accent-gold text-xs font-medium uppercase tracking-wider">CONFECCIONISTA</p>
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
                    <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-gold hover:bg-white/5" href="/chat">
                        <span class="material-symbols-outlined text-xl">chat</span>
                        Mensajes
                    </a>
                    <a class="relative flex items-center gap-4 rounded-lg bg-accent-gold/10 px-4 py-2.5 text-sm font-bold text-accent-gold shadow-gold-glow-soft" href="/maker-plans">
                        <span class="absolute left-0 h-6 w-1 rounded-r-full bg-accent-gold"></span>
                        <span class="material-symbols-outlined text-xl">credit_card</span>
                        Suscripción
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

        <main class="flex-1 p-8 overflow-y-auto" id="plans-content">
            <!-- Content injected via JS -->
        </main>
    </div>
    `;
}
