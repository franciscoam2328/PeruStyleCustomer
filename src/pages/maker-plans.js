import { getCurrentUser, signOut } from '../js/auth.js';
import { supabase } from '../js/supabase.js';
import { getLogo } from '../components/logo.js';

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

            // Header HTML
            const headerHtml = `
                <header class="flex justify-end items-center gap-6 mb-8 bg-surface p-4 rounded-xl border border-white/10 shadow-sm">
                    <button class="relative p-2 text-on-surface/80 hover:text-primary transition-colors">
                        <span class="material-symbols-outlined text-2xl">notifications</span>
                        <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <a href="/maker-profile" class="flex items-center gap-3 hover:opacity-80 transition-opacity border-l border-white/10 pl-6">
                        <div class="bg-gradient-to-br from-primary to-secondary rounded-full w-10 h-10 flex items-center justify-center text-white font-bold shadow-md overflow-hidden">
                            ${profile.avatar_url ? `<img src="${profile.avatar_url}" class="w-full h-full object-cover">` : (profile.full_name || 'M')[0].toUpperCase()}
                        </div>
                        <div class="flex flex-col text-right hidden sm:flex">
                            <h2 class="text-base font-semibold text-on-surface leading-tight">${profile.full_name || 'Confeccionista'}</h2>
                            <p class="text-primary text-sm font-medium leading-tight uppercase">Plan ${profile.plan || 'Free'}</p>
                        </div>
                    </a>
                </header>
            `;

            if (isChangingPlan) {
                // Pricing Table View
                container.innerHTML = `
                <div class="max-w-7xl mx-auto relative">
                    ${headerHtml}
                    <!-- Mock PayPal Modal -->
                    <div id="paypal-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 hidden backdrop-blur-sm">
                        <div class="w-full max-w-md rounded-lg bg-surface border border-white/10 p-6 shadow-xl transform transition-all scale-100">
                            <div class="mb-6 flex flex-col items-center justify-center border-b border-white/10 pb-4">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" class="h-8 mb-2">
                                <span id="paypal-plan-name" class="text-sm text-on-surface/60 font-medium"></span>
                            </div>
                            <h3 class="mb-4 text-center text-lg font-bold text-on-surface">Pagar con PayPal</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="mb-1 block text-sm font-medium text-on-surface/60">Correo electrónico</label>
                                    <input type="email" id="paypal-email" class="w-full rounded-md border border-white/10 bg-base p-3 text-on-surface focus:border-[#0070BA] focus:ring-1 focus:ring-[#0070BA] focus:outline-none transition-colors" placeholder="nombre@ejemplo.com">
                                </div>
                                <div>
                                    <label class="mb-1 block text-sm font-medium text-on-surface/60">Contraseña</label>
                                    <input type="password" id="paypal-password" class="w-full rounded-md border border-white/10 bg-base p-3 text-on-surface focus:border-[#0070BA] focus:ring-1 focus:ring-[#0070BA] focus:outline-none transition-colors" placeholder="••••••••">
                                </div>
                                <div class="text-right">
                                    <a href="#" class="text-xs text-[#0070BA] hover:underline">¿Olvidó su contraseña?</a>
                                </div>
                                <button id="paypal-submit-btn" class="w-full rounded-full bg-[#0070BA] py-3 font-bold text-white hover:bg-[#005ea6] transition-colors shadow-md hover:shadow-lg">
                                    Iniciar sesión y Pagar
                                </button>
                                <button id="paypal-cancel-btn" class="w-full rounded-full py-3 font-medium text-on-surface/60 hover:text-on-surface hover:bg-white/5 transition-colors">
                                    Cancelar
                                </button>
                            </div>
                            <div class="mt-4 text-center">
                                <p class="text-xs text-on-surface/40">Esta es una simulación. No ingrese credenciales reales.</p>
                            </div>
                        </div>
                    </div>

                    <!-- PageHeading -->
                    <div class="mb-10">
                        <h1 class="text-on-surface text-4xl font-black leading-tight tracking-tight">Potencia tu Taller</h1>
                        <p class="text-on-surface/60 text-base font-normal leading-normal mt-2">Elige el plan perfecto para crecer tu negocio de confección.</p>
                    </div>
                    <!-- PricingCards -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <!-- Plan Básico -->
                        <div class="flex flex-col gap-6 rounded-xl border ${currentPlan === 'free' ? 'border-primary bg-primary text-white shadow-2xl scale-105 z-10' : 'border-white/10 bg-surface text-on-surface hover:shadow-lg hover:-translate-y-1'} p-6 transition-all relative overflow-hidden">
                            ${currentPlan === 'free' ? '<div class="absolute top-0 right-0 bg-white text-black text-xs font-bold px-3 py-1 rounded-bl-lg">PLAN ACTUAL</div>' : ''}
                            <div class="flex flex-col gap-2">
                                <h2 class="text-lg font-bold leading-tight">Plan Básico</h2>
                                <span class="text-5xl font-black leading-tight tracking-tighter">GRATIS</span>
                            </div>
                            <button class="w-full flex cursor-not-allowed items-center justify-center rounded-lg h-12 px-4 bg-white/20 text-white/60 text-sm font-bold leading-normal tracking-wide" disabled>
                                <span class="truncate">${currentPlan === 'free' ? 'Plan Actual' : 'Básico'}</span>
                            </button>
                            <div class="flex flex-col gap-3">
                                <div class="flex gap-3 items-center text-sm font-normal">
                                    <span class="material-symbols-outlined">check_circle</span>
                                    Comisión del 15% por pedido
                                </div>
                                <div class="flex gap-3 items-center text-sm font-normal">
                                    <span class="material-symbols-outlined">check_circle</span>
                                    Hasta 3 fotos en portafolio
                                </div>
                                <div class="flex gap-3 items-center text-sm font-normal">
                                    <span class="material-symbols-outlined">check_circle</span>
                                    Perfil básico
                                </div>
                                <div class="flex gap-3 items-center text-sm font-normal">
                                    <span class="material-symbols-outlined">check_circle</span>
                                    Chat con clientes
                                </div>
                            </div>
                        </div>
                        <!-- Plan Premium -->
                        <div class="flex flex-col gap-6 rounded-xl border ${currentPlan === 'premium' ? 'border-primary bg-primary text-white shadow-2xl scale-105 z-10' : 'border-primary/20 bg-surface text-on-surface hover:shadow-lg hover:-translate-y-1'} p-6 transition-all relative overflow-hidden">
                            ${currentPlan === 'premium' ? '<div class="absolute top-0 right-0 bg-white text-black text-xs font-bold px-3 py-1 rounded-bl-lg">PLAN ACTUAL</div>' : ''}
                            <div class="flex flex-col gap-2">
                                <h2 class="text-lg font-bold leading-tight ${currentPlan === 'premium' ? 'text-white' : 'text-primary'}">Plan Premium</h2>
                                <p class="flex items-baseline gap-1">
                                    <span class="text-5xl font-black leading-tight tracking-tighter">$19.99</span>
                                    <span class="text-base font-bold leading-tight">/mes</span>
                                </p>
                            </div>
                            <button id="btn-premium" class="w-full flex cursor-pointer items-center justify-center rounded-lg h-12 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-wide hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20" ${currentPlan === 'premium' ? 'disabled style="opacity:0.5; cursor:default;"' : ''}>
                                <span class="truncate">${currentPlan === 'premium' ? 'Plan Actual' : 'Actualizar a Premium'}</span>
                            </button>
                            <div class="flex flex-col gap-3">
                                <div class="flex gap-3 items-center text-sm font-normal">
                                    <span class="material-symbols-outlined ${currentPlan === 'premium' ? 'text-white' : 'text-primary'}">check_circle</span>
                                    Comisión reducida del 10%
                                </div>
                                <div class="flex gap-3 items-center text-sm font-normal">
                                    <span class="material-symbols-outlined ${currentPlan === 'premium' ? 'text-white' : 'text-primary'}">check_circle</span>
                                    Hasta 20 fotos en portafolio
                                </div>
                                <div class="flex gap-3 items-center text-sm font-normal">
                                    <span class="material-symbols-outlined ${currentPlan === 'premium' ? 'text-white' : 'text-primary'}">check_circle</span>
                                    Insignia "Verificado"
                                </div>
                                <div class="flex gap-3 items-center text-sm font-normal">
                                    <span class="material-symbols-outlined ${currentPlan === 'premium' ? 'text-white' : 'text-primary'}">check_circle</span>
                                    Posicionamiento medio en búsquedas
                                </div>
                                <div class="flex gap-3 items-center text-sm font-normal">
                                    <span class="material-symbols-outlined ${currentPlan === 'premium' ? 'text-white' : 'text-primary'}">check_circle</span>
                                    Soporte prioritario
                                </div>
                            </div>
                            <p class="text-xs text-center mt-auto opacity-60">Pago vía PayPal</p>
                        </div>
                        <!-- Plan Elite -->
                        <div class="flex flex-col gap-6 rounded-xl border ${currentPlan === 'elite' ? 'border-primary bg-primary text-white shadow-2xl scale-105 z-10' : 'border-primary/20 bg-surface text-on-surface hover:shadow-lg hover:-translate-y-1'} p-6 transition-all relative overflow-hidden">
                            ${currentPlan === 'elite' ? '<div class="absolute top-0 right-0 bg-white text-black text-xs font-bold px-3 py-1 rounded-bl-lg">PLAN ACTUAL</div>' : ''}
                            <div class="flex flex-col gap-2">
                                <h2 class="text-lg font-bold leading-tight ${currentPlan === 'elite' ? 'text-white' : 'text-primary'}">Plan Elite</h2>
                                <p class="flex items-baseline gap-1">
                                    <span class="text-5xl font-black leading-tight tracking-tighter">$49.99</span>
                                    <span class="text-base font-bold leading-tight">/mes</span>
                                </p>
                            </div>
                            <button id="btn-elite" class="w-full flex cursor-pointer items-center justify-center rounded-lg h-12 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-wide hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20" ${currentPlan === 'elite' ? 'disabled style="opacity:0.5; cursor:default;"' : ''}>
                                <span class="truncate">${currentPlan === 'elite' ? 'Plan Actual' : 'Actualizar a Elite'}</span>
                            </button>
                            <div class="flex flex-col gap-3">
                                <div class="flex gap-3 items-center text-sm font-normal">
                                    <span class="material-symbols-outlined ${currentPlan === 'elite' ? 'text-white' : 'text-primary'}">check_circle</span>
                                    Comisión mínima del 5%
                                </div>
                                <div class="flex gap-3 items-center text-sm font-normal">
                                    <span class="material-symbols-outlined ${currentPlan === 'elite' ? 'text-white' : 'text-primary'}">check_circle</span>
                                    Portafolio ILIMITADO
                                </div>
                                <div class="flex gap-3 items-center text-sm font-normal">
                                    <span class="material-symbols-outlined ${currentPlan === 'elite' ? 'text-white' : 'text-primary'}">check_circle</span>
                                    Insignia "Elite" y Borde Dorado
                                </div>
                                <div class="flex gap-3 items-center text-sm font-normal">
                                    <span class="material-symbols-outlined ${currentPlan === 'elite' ? 'text-white' : 'text-primary'}">check_circle</span>
                                    Máxima visibilidad en búsquedas
                                </div>
                                <div class="flex gap-3 items-center text-sm font-normal">
                                    <span class="material-symbols-outlined ${currentPlan === 'elite' ? 'text-white' : 'text-primary'}">check_circle</span>
                                    Acceso a pedidos exclusivos
                                </div>
                                <div class="flex gap-3 items-center text-sm font-normal">
                                    <span class="material-symbols-outlined ${currentPlan === 'elite' ? 'text-white' : 'text-primary'}">check_circle</span>
                                    Soporte VIP 24/7
                                </div>
                            </div>
                            <p class="text-xs text-center mt-auto opacity-60">Pago vía PayPal</p>
                        </div>
                    </div>
                    <div class="mt-8 flex justify-center">
                         <button id="cancel-change-btn" class="text-on-surface/60 hover:text-on-surface underline transition-colors">Cancelar y volver</button>
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
                    ${headerHtml}
                    <div class="rounded-xl border border-white/10 bg-surface p-6 shadow-lg">
                        <div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                            <div>
                                <h1 class="text-2xl font-bold text-on-surface">Plan ${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</h1>
                                <p class="mt-1 text-on-surface/60">Tu suscripción está activa.</p>
                            </div>
                            <div class="flex gap-2">
                                <button id="cancel-plan-btn" class="flex h-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-white/5 px-4 text-sm font-bold leading-normal text-on-surface hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/50 border border-transparent transition-all">
                                    <span class="truncate">Cancelar Plan</span>
                                </button>
                                <button id="change-plan-btn" class="flex h-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-4 text-sm font-bold leading-normal text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                                    <span class="truncate">Cambiar Plan</span>
                                </button>
                            </div>
                        </div>
                        <div class="mt-6 border-t border-white/10 pt-6">
                            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <div class="flex items-start gap-3">
                                    <span class="material-symbols-outlined mt-1 text-primary">check_circle</span>
                                    <div>
                                        <h3 class="font-semibold text-on-surface">Comisión Preferencial</h3>
                                        <p class="text-sm text-on-surface/60">Aumenta tus ganancias con menores comisiones.</p>
                                    </div>
                                </div>
                                <div class="flex items-start gap-3">
                                    <span class="material-symbols-outlined mt-1 text-primary">check_circle</span>
                                    <div>
                                        <h3 class="font-semibold text-on-surface">Visibilidad Mejorada</h3>
                                        <p class="text-sm text-on-surface/60">Aparece primero en las búsquedas de clientes.</p>
                                    </div>
                                </div>
                                <div class="flex items-start gap-3">
                                    <span class="material-symbols-outlined mt-1 text-primary">check_circle</span>
                                    <div>
                                        <h3 class="font-semibold text-on-surface">Soporte Especializado</h3>
                                        <p class="text-sm text-on-surface/60">Ayuda directa para resolver cualquier inconveniente.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <section class="mt-12">
                        <h2 class="mb-6 text-center text-3xl font-bold text-on-surface">Preguntas Frecuentes</h2>
                        <div class="mx-auto flex max-w-3xl flex-col gap-3">
                            <details class="group rounded-lg border border-white/10 bg-surface transition-all hover:bg-surface/80">
                                <summary class="flex cursor-pointer items-center justify-between p-4 sm:p-5">
                                    <h3 class="font-medium text-on-surface">¿Cómo funcionan las comisiones?</h3>
                                    <span class="material-symbols-outlined text-on-surface/60 transition-transform group-open:rotate-180">expand_more</span>
                                </summary>
                                <div class="border-t border-white/10 px-4 pb-5 pt-4 sm:px-5">
                                    <p class="text-on-surface/60">La comisión se descuenta automáticamente del pago total de cada pedido completado. Con el plan Elite, esta comisión se reduce al mínimo del 5%, permitiéndote ganar más por tu trabajo.</p>
                                </div>
                            </details>
                            <details class="group rounded-lg border border-white/10 bg-surface transition-all hover:bg-surface/80">
                                <summary class="flex cursor-pointer items-center justify-between p-4 sm:p-5">
                                    <h3 class="font-medium text-on-surface">¿Qué beneficios tiene la insignia de Verificado?</h3>
                                    <span class="material-symbols-outlined text-on-surface/60 transition-transform group-open:rotate-180">expand_more</span>
                                </summary>
                                <div class="border-t border-white/10 px-4 pb-5 pt-4 sm:px-5">
                                    <p class="text-on-surface/60">La insignia genera mayor confianza en los clientes, lo que se traduce en más pedidos. Además, los perfiles verificados tienen prioridad en los resultados de búsqueda.</p>
                                </div>
                            </details>
                            <details class="group rounded-lg border border-white/10 bg-surface transition-all hover:bg-surface/80">
                                <summary class="flex cursor-pointer items-center justify-between p-4 sm:p-5">
                                    <h3 class="font-medium text-on-surface">¿Puedo cancelar en cualquier momento?</h3>
                                    <span class="material-symbols-outlined text-on-surface/60 transition-transform group-open:rotate-180">expand_more</span>
                                </summary>
                                <div class="border-t border-white/10 px-4 pb-5 pt-4 sm:px-5">
                                    <p class="text-on-surface/60">Sí, puedes cancelar o cambiar tu plan cuando desees. Los cambios de plan superior son inmediatos, mientras que la cancelación se hace efectiva al finalizar el periodo facturado.</p>
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
    <div class="flex min-h-screen w-full bg-base font-display text-on-surface">
        <!-- Sidebar -->
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
                    <a href="/maker-profile" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">person</span>
                        <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Mi Perfil</p>
                    </a>
                    <a href="/maker-portfolio" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">photo_library</span>
                        <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Portafolio</p>
                    </a>
                    <a href="/chat" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">chat_bubble_outline</span>
                        <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Chat</p>
                    </a>
                    <a href="/maker-plans" class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface hover:bg-primary/20 transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl group-hover:text-primary transition-colors">workspace_premium</span>
                        <p class="text-on-surface text-sm font-medium">Mi Suscripción</p>
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

        <main class="flex-1 p-8 overflow-y-auto" id="plans-content">
            <!-- Content injected via JS -->
        </main>
    </div>
    `;
}
