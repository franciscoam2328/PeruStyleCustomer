import { getCurrentUser, signOut } from '../js/auth.js';
import { supabase } from '../js/supabase.js';
import { getLogo } from '../components/logo.js';

export function PlansPage() {
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
            .select('plan')
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
                planNameSpan.textContent = newPlan === 'pro' ? 'Plan Pro ($59.99)' : 'Plan Premium ($29.99)';
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
                        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl transform transition-all scale-100">
                            <div class="mb-6 flex flex-col items-center justify-center border-b border-gray-200 pb-4">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" class="h-8 mb-2">
                                <span id="paypal-plan-name" class="text-sm text-gray-500 font-medium"></span>
                            </div>
                            <h3 class="mb-4 text-center text-lg font-bold text-gray-900">Pagar con PayPal</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="mb-1 block text-sm font-medium text-gray-700">Correo electrónico</label>
                                    <input type="email" id="paypal-email" class="w-full rounded-md border border-gray-300 p-3 text-black focus:border-[#0070BA] focus:ring-1 focus:ring-[#0070BA] focus:outline-none transition-colors" placeholder="nombre@ejemplo.com">
                                </div>
                                <div>
                                    <label class="mb-1 block text-sm font-medium text-gray-700">Contraseña</label>
                                    <input type="password" id="paypal-password" class="w-full rounded-md border border-gray-300 p-3 text-black focus:border-[#0070BA] focus:ring-1 focus:ring-[#0070BA] focus:outline-none transition-colors" placeholder="••••••••">
                                </div>
                                <div class="text-right">
                                    <a href="#" class="text-xs text-[#0070BA] hover:underline">¿Olvidó su contraseña?</a>
                                </div>
                                <button id="paypal-submit-btn" class="w-full rounded-full bg-[#0070BA] py-3 font-bold text-white hover:bg-[#005ea6] transition-colors shadow-md hover:shadow-lg">
                                    Iniciar sesión y Pagar
                                </button>
                                <button id="paypal-cancel-btn" class="w-full rounded-full py-3 font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                                    Cancelar
                                </button>
                            </div>
                            <div class="mt-4 text-center">
                                <p class="text-xs text-gray-400">Esta es una simulación. No ingrese credenciales reales.</p>
                            </div>
                        </div>
                    </div>

                    <!-- PageHeading -->
                    <div class="mb-10">
                        <h1 class="text-on-surface text-4xl font-black leading-tight tracking-tight">Elige tu Plan</h1>
                        <p class="text-on-surface/60 text-base font-normal leading-normal mt-2">Desbloquea más diseños y funciones avanzadas.</p>
                    </div>
                    <!-- PricingCards -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <!-- Plan Básico -->
                        <div class="flex flex-col gap-6 rounded-xl border ${currentPlan === 'free' ? 'border-primary bg-primary text-white shadow-2xl scale-105 z-10' : 'border-white/10 bg-surface text-on-surface hover:shadow-lg hover:-translate-y-1'} p-6 transition-all relative overflow-hidden">
                            ${currentPlan === 'free' ? '<div class="absolute top-0 right-0 bg-white text-black text-xs font-bold px-3 py-1 rounded-bl-lg">PLAN ACTUAL</div>' : ''}
                            <div class="flex flex-col gap-2">
                                <h2 class="${currentPlan === 'free' ? 'text-white' : 'text-on-surface'} text-lg font-bold leading-tight">Plan Básico</h2>
                                <span class="${currentPlan === 'free' ? 'text-white' : 'text-on-surface'} text-5xl font-black leading-tight tracking-tighter">GRATIS</span>
                            </div>
                            <button class="w-full flex cursor-not-allowed items-center justify-center rounded-lg h-12 px-4 ${currentPlan === 'free' ? 'bg-white text-black' : 'bg-base text-on-surface/40'} text-sm font-bold leading-normal tracking-wide" disabled>
                                <span class="truncate">${currentPlan === 'free' ? 'Plan Actual' : 'Básico'}</span>
                            </button>
                            <div class="flex flex-col gap-3">
                                <div class="flex gap-3 items-center ${currentPlan === 'free' ? 'text-white/80' : 'text-on-surface/80'} text-sm font-normal">
                                    <span class="material-symbols-outlined ${currentPlan === 'free' ? 'text-white' : 'text-green-500'}">check_circle</span>
                                    Hasta 2 diseños 3D activos
                                </div>
                                <div class="flex gap-3 items-center ${currentPlan === 'free' ? 'text-white/80' : 'text-on-surface/80'} text-sm font-normal">
                                    <span class="material-symbols-outlined ${currentPlan === 'free' ? 'text-white' : 'text-green-500'}">check_circle</span>
                                    Acceso al chat con confeccionistas
                                </div>
                                <div class="flex gap-3 items-center ${currentPlan === 'free' ? 'text-white/80' : 'text-on-surface/80'} text-sm font-normal">
                                    <span class="material-symbols-outlined ${currentPlan === 'free' ? 'text-white' : 'text-green-500'}">check_circle</span>
                                    Puede enviar pedidos
                                </div>
                                <div class="flex gap-3 items-center ${currentPlan === 'free' ? 'text-white/80' : 'text-on-surface/80'} text-sm font-normal">
                                    <span class="material-symbols-outlined ${currentPlan === 'free' ? 'text-white' : 'text-green-500'}">check_circle</span>
                                    Puede explorar confeccionistas
                                </div>
                                <div class="flex gap-3 items-center ${currentPlan === 'free' ? 'text-white/80' : 'text-on-surface/80'} text-sm font-normal">
                                    <span class="material-symbols-outlined ${currentPlan === 'free' ? 'text-white' : 'text-green-500'}">check_circle</span>
                                    Funciones básicas del creador 3D
                                </div>
                            </div>
                        </div>
                        <!-- Plan Premium -->
                        <div class="flex flex-col gap-6 rounded-xl border ${currentPlan === 'premium' ? 'border-primary bg-primary text-white shadow-2xl scale-105 z-10' : 'border-primary/20 bg-surface text-on-surface hover:shadow-lg hover:-translate-y-1'} p-6 transition-all relative overflow-hidden">
                            ${currentPlan === 'premium' ? '<div class="absolute top-0 right-0 bg-white text-black text-xs font-bold px-3 py-1 rounded-bl-lg">PLAN ACTUAL</div>' : ''}
                            <div class="flex flex-col gap-2">
                                <h2 class="${currentPlan === 'premium' ? 'text-white' : 'text-primary'} text-lg font-bold leading-tight">Plan Premium</h2>
                                <p class="flex items-baseline gap-1 ${currentPlan === 'premium' ? 'text-white' : 'text-on-surface'}">
                                    <span class="text-5xl font-black leading-tight tracking-tighter">$29.99</span>
                                    <span class="text-base font-bold leading-tight">/mes</span>
                                </p>
                            </div>
                            <button id="btn-premium" class="w-full flex cursor-pointer items-center justify-center rounded-lg h-12 px-4 ${currentPlan === 'premium' ? 'bg-white text-black cursor-default' : 'bg-primary text-white hover:bg-primary/90'} text-sm font-bold leading-normal tracking-wide transition-colors" ${currentPlan === 'premium' ? 'disabled' : ''}>
                                <span class="truncate">${currentPlan === 'premium' ? 'Plan Actual' : 'Actualizar a Premium'}</span>
                            </button>
                            <div class="flex flex-col gap-3">
                                <div class="flex gap-3 items-center ${currentPlan === 'premium' ? 'text-white/80' : 'text-on-surface/80'} text-sm font-normal">
                                    <span class="material-symbols-outlined ${currentPlan === 'premium' ? 'text-white' : 'text-primary'}">check_circle</span>
                                    Hasta 10 diseños 3D activos
                                </div>
                                <div class="flex gap-3 items-center ${currentPlan === 'premium' ? 'text-white/80' : 'text-on-surface/80'} text-sm font-normal">
                                    <span class="material-symbols-outlined ${currentPlan === 'premium' ? 'text-white' : 'text-primary'}">check_circle</span>
                                    Más opciones de personalización
                                </div>
                                <div class="flex gap-3 items-center ${currentPlan === 'premium' ? 'text-white/80' : 'text-on-surface/80'} text-sm font-normal">
                                    <span class="material-symbols-outlined ${currentPlan === 'premium' ? 'text-white' : 'text-primary'}">check_circle</span>
                                    Acceso prioritario a confeccionistas
                                </div>
                                <div class="flex gap-3 items-center ${currentPlan === 'premium' ? 'text-white/80' : 'text-on-surface/80'} text-sm font-normal">
                                    <span class="material-symbols-outlined ${currentPlan === 'premium' ? 'text-white' : 'text-primary'}">check_circle</span>
                                    Menor tiempo de respuesta en mensajería
                                </div>
                                <div class="flex gap-3 items-center ${currentPlan === 'premium' ? 'text-white/80' : 'text-on-surface/80'} text-sm font-normal">
                                    <span class="material-symbols-outlined ${currentPlan === 'premium' ? 'text-white' : 'text-primary'}">check_circle</span>
                                    Prioridad en asistencia
                                </div>
                            </div>
                            <p class="text-xs text-center ${currentPlan === 'premium' ? 'text-white/40' : 'text-on-surface/40'} mt-auto">Pago vía PayPal</p>
                        </div>
                        <!-- Plan Pro -->
                        <div class="flex flex-col gap-6 rounded-xl border ${currentPlan === 'pro' ? 'border-primary bg-primary text-white shadow-2xl scale-105 z-10' : 'border-white/10 bg-surface text-on-surface hover:shadow-lg hover:-translate-y-1'} p-6 transition-all relative overflow-hidden">
                            ${currentPlan === 'pro' ? '<div class="absolute top-0 right-0 bg-white text-black text-xs font-bold px-3 py-1 rounded-bl-lg">PLAN ACTUAL</div>' : ''}
                            <div class="flex flex-col gap-2">
                                <h2 class="${currentPlan === 'pro' ? 'text-white' : 'text-secondary'} text-lg font-bold leading-tight">Plan Pro</h2>
                                <p class="flex items-baseline gap-1 ${currentPlan === 'pro' ? 'text-white' : 'text-on-surface'}">
                                    <span class="text-5xl font-black leading-tight tracking-tighter">$59.99</span>
                                    <span class="text-base font-bold leading-tight">/mes</span>
                                </p>
                            </div>
                            <button id="btn-pro" class="w-full flex cursor-pointer items-center justify-center rounded-lg h-12 px-4 ${currentPlan === 'pro' ? 'bg-white text-black cursor-default' : 'bg-secondary text-white hover:bg-secondary/90'} text-sm font-bold leading-normal tracking-wide transition-colors" ${currentPlan === 'pro' ? 'disabled' : ''}>
                                <span class="truncate">${currentPlan === 'pro' ? 'Plan Actual' : 'Actualizar a Pro'}</span>
                            </button>
                            <div class="flex flex-col gap-3">
                                <div class="flex gap-3 items-center ${currentPlan === 'pro' ? 'text-white/80' : 'text-on-surface/80'} text-sm font-normal">
                                    <span class="material-symbols-outlined ${currentPlan === 'pro' ? 'text-white' : 'text-secondary'}">check_circle</span>
                                    Diseños 3D ilimitados
                                </div>
                                <div class="flex gap-3 items-center ${currentPlan === 'pro' ? 'text-white/80' : 'text-on-surface/80'} text-sm font-normal">
                                    <span class="material-symbols-outlined ${currentPlan === 'pro' ? 'text-white' : 'text-secondary'}">check_circle</span>
                                    Todas las herramientas avanzadas
                                </div>
                                <div class="flex gap-3 items-center ${currentPlan === 'pro' ? 'text-white/80' : 'text-on-surface/80'} text-sm font-normal">
                                    <span class="material-symbols-outlined ${currentPlan === 'pro' ? 'text-white' : 'text-secondary'}">check_circle</span>
                                    Acceso a confeccionistas Elite
                                </div>
                                <div class="flex gap-3 items-center ${currentPlan === 'pro' ? 'text-white/80' : 'text-on-surface/80'} text-sm font-normal">
                                    <span class="material-symbols-outlined ${currentPlan === 'pro' ? 'text-white' : 'text-secondary'}">check_circle</span>
                                    Soporte prioritario
                                </div>
                                <div class="flex gap-3 items-center ${currentPlan === 'pro' ? 'text-white/80' : 'text-on-surface/80'} text-sm font-normal">
                                    <span class="material-symbols-outlined ${currentPlan === 'pro' ? 'text-white' : 'text-secondary'}">check_circle</span>
                                    Mejor visibilidad para sus pedidos
                                </div>
                            </div>
                            <p class="text-xs text-center ${currentPlan === 'pro' ? 'text-white/40' : 'text-on-surface/40'} mt-auto">Pago vía PayPal</p>
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

                const btnPro = document.getElementById('btn-pro');
                if (btnPro && !btnPro.disabled) {
                    btnPro.addEventListener('click', () => handleUpgrade('pro'));
                }

            } else {
                // Current Subscription View
                container.innerHTML = `
                <div class="mx-auto max-w-5xl">
                    <div class="rounded-xl border border-white/10 bg-surface p-6 shadow-lg">
                        <div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                            <div>
                                <h1 class="text-2xl font-bold text-on-surface">Plan ${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</h1>
                                <p class="mt-1 text-on-surface/60">Activo hasta el 24 de Diciembre, 2024</p>
                            </div>
                            <div class="flex gap-2">
                                <button id="cancel-plan-btn" class="flex h-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-base px-4 text-sm font-bold leading-normal text-on-surface hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 border border-white/10 transition-all">
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
                                        <h3 class="font-semibold text-on-surface">100 Diseños 3D / Mes</h3>
                                        <p class="text-sm text-on-surface/60">Crea y guarda hasta 100 diseños detallados.</p>
                                    </div>
                                </div>
                                <div class="flex items-start gap-3">
                                    <span class="material-symbols-outlined mt-1 text-primary">check_circle</span>
                                    <div>
                                        <h3 class="font-semibold text-on-surface">Acceso a Materiales Premium</h3>
                                        <p class="text-sm text-on-surface/60">Texturas y tejidos exclusivos para tus creaciones.</p>
                                    </div>
                                </div>
                                <div class="flex items-start gap-3">
                                    <span class="material-symbols-outlined mt-1 text-primary">check_circle</span>
                                    <div>
                                        <h3 class="font-semibold text-on-surface">Soporte Prioritario</h3>
                                        <p class="text-sm text-on-surface/60">Asistencia técnica especializada 24/7.</p>
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
                                    <h3 class="font-medium text-on-surface">¿Cómo puedo cambiar mi plan de suscripción?</h3>
                                    <span class="material-symbols-outlined text-on-surface/40 transition-transform group-open:rotate-180">expand_more</span>
                                </summary>
                                <div class="border-t border-white/10 px-4 pb-5 pt-4 sm:px-5">
                                    <p class="text-on-surface/60">Puedes cambiar tu plan en cualquier momento desde la sección "Mis Suscripciones". Simplemente selecciona "Cambiar Plan" y elige la opción que mejor se adapte a tus necesidades. El cambio se aplicará al final de tu ciclo de facturación actual.</p>
                                </div>
                            </details>
                            <details class="group rounded-lg border border-white/10 bg-surface transition-all hover:bg-surface/80">
                                <summary class="flex cursor-pointer items-center justify-between p-4 sm:p-5">
                                    <h3 class="font-medium text-on-surface">¿Qué sucede si cancelo mi suscripción?</h3>
                                    <span class="material-symbols-outlined text-on-surface/40 transition-transform group-open:rotate-180">expand_more</span>
                                </summary>
                                <div class="border-t border-white/10 px-4 pb-5 pt-4 sm:px-5">
                                    <p class="text-on-surface/60">Si cancelas tu suscripción, seguirás teniendo acceso a todas las funciones de tu plan hasta el final de tu ciclo de facturación actual. Después de esa fecha, tu cuenta volverá al plan gratuito con funciones limitadas.</p>
                                </div>
                            </details>
                            <details class="group rounded-lg border border-white/10 bg-surface transition-all hover:bg-surface/80">
                                <summary class="flex cursor-pointer items-center justify-between p-4 sm:p-5">
                                    <h3 class="font-medium text-on-surface">¿Se renueva automáticamente mi suscripción?</h3>
                                    <span class="material-symbols-outlined text-on-surface/40 transition-transform group-open:rotate-180">expand_more</span>
                                </summary>
                                <div class="border-t border-white/10 px-4 pb-5 pt-4 sm:px-5">
                                    <p class="text-on-surface/60">Sí, todas nuestras suscripciones se renuevan automáticamente al final de cada ciclo de facturación (mensual o anual) para garantizar un servicio ininterrumpido. Puedes desactivar la renovación automática en cualquier momento desde la configuración de tu cuenta.</p>
                                </div>
                            </details>
                            <details class="group rounded-lg border border-white/10 bg-surface transition-all hover:bg-surface/80">
                                <summary class="flex cursor-pointer items-center justify-between p-4 sm:p-5">
                                    <h3 class="font-medium text-on-surface">¿Aceptan diferentes métodos de pago?</h3>
                                    <span class="material-symbols-outlined text-on-surface/40 transition-transform group-open:rotate-180">expand_more</span>
                                </summary>
                                <div class="border-t border-white/10 px-4 pb-5 pt-4 sm:px-5">
                                    <p class="text-on-surface/60">Aceptamos las principales tarjetas de crédito y débito (Visa, MasterCard, American Express) así como pagos a través de PayPal. Toda la información de pago se procesa de forma segura a través de nuestro proveedor de pagos.</p>
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

                    const confirmCancel = confirm('¿Estás seguro de que deseas cancelar tu suscripción? Perderás los beneficios Premium/Pro al finalizar el ciclo.');
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

        setupLogout();
        renderContent();

    }, 0);

    return `
    <div class="flex min-h-screen w-full bg-base font-display text-on-surface">
        <!-- SideNavBar -->
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
                    <a href="/plans" class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface hover:bg-primary/20 transition-colors duration-200 group">
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

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto bg-base p-6 lg:p-10" id="plans-content">
            <!-- Injected via JS -->
        </main>
    </div>
    `;
}
