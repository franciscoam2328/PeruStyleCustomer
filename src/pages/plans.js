import { getCurrentUser, signOut } from '../js/auth.js';
import { supabase } from '../js/supabase.js';

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
                        <h1 class="text-white text-4xl font-black leading-tight tracking-tight">Elige tu Plan</h1>
                        <p class="text-gray-400 text-base font-normal leading-normal mt-2">Desbloquea más diseños y funciones avanzadas.</p>
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
                                    Hasta 2 diseños 3D activos
                                </div>
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-green-500">check_circle</span>
                                    Acceso al chat con confeccionistas
                                </div>
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-green-500">check_circle</span>
                                    Puede enviar pedidos
                                </div>
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-green-500">check_circle</span>
                                    Puede explorar confeccionistas
                                </div>
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-green-500">check_circle</span>
                                    Funciones básicas del creador 3D
                                </div>
                            </div>
                        </div>
                        <!-- Plan Premium -->
                        <div class="flex flex-col gap-6 rounded-xl border border-accent-copper bg-[#1A1A1A] p-6 transition-all hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden" style="box-shadow: 0 0 30px rgba(184, 115, 51, 0.15);">
                            ${currentPlan === 'premium' ? '<div class="absolute top-0 right-0 bg-accent-copper text-white text-xs font-bold px-3 py-1 rounded-bl-lg">PLAN ACTUAL</div>' : ''}
                            <div class="flex flex-col gap-2">
                                <h2 class="text-accent-copper text-lg font-bold leading-tight">Plan Premium</h2>
                                <p class="flex items-baseline gap-1 text-white">
                                    <span class="text-5xl font-black leading-tight tracking-tighter">$29.99</span>
                                    <span class="text-base font-bold leading-tight">/mes</span>
                                </p>
                            </div>
                            <button id="btn-premium" class="w-full flex cursor-pointer items-center justify-center rounded-lg h-12 px-4 bg-accent-copper text-white text-sm font-bold leading-normal tracking-wide hover:bg-[#a56118] transition-colors" ${currentPlan === 'premium' ? 'disabled style="opacity:0.5; cursor:default;"' : ''}>
                                <span class="truncate">${currentPlan === 'premium' ? 'Plan Actual' : 'Actualizar a Premium'}</span>
                            </button>
                            <div class="flex flex-col gap-3">
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-accent-copper">check_circle</span>
                                    Hasta 10 diseños 3D activos
                                </div>
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-accent-copper">check_circle</span>
                                    Más opciones de personalización
                                </div>
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-accent-copper">check_circle</span>
                                    Acceso prioritario a confeccionistas
                                </div>
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-accent-copper">check_circle</span>
                                    Menor tiempo de respuesta en mensajería
                                </div>
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-accent-copper">check_circle</span>
                                    Prioridad en asistencia
                                </div>
                            </div>
                            <p class="text-xs text-center text-gray-500 mt-auto">Pago vía PayPal</p>
                        </div>
                        <!-- Plan Pro -->
                        <div class="flex flex-col gap-6 rounded-xl border border-primary bg-[#1A1A1A] p-6 transition-all hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden" style="box-shadow: 0 0 30px rgba(212, 175, 53, 0.15);">
                            ${currentPlan === 'pro' ? '<div class="absolute top-0 right-0 bg-primary text-black text-xs font-bold px-3 py-1 rounded-bl-lg">PLAN ACTUAL</div>' : ''}
                            <div class="flex flex-col gap-2">
                                <h2 class="text-primary text-lg font-bold leading-tight">Plan Pro</h2>
                                <p class="flex items-baseline gap-1 text-white">
                                    <span class="text-5xl font-black leading-tight tracking-tighter">$59.99</span>
                                    <span class="text-base font-bold leading-tight">/mes</span>
                                </p>
                            </div>
                            <button id="btn-pro" class="w-full flex cursor-pointer items-center justify-center rounded-lg h-12 px-4 bg-primary text-background-dark text-sm font-bold leading-normal tracking-wide hover:bg-[#b8962e] transition-colors" ${currentPlan === 'pro' ? 'disabled style="opacity:0.5; cursor:default;"' : ''}>
                                <span class="truncate">${currentPlan === 'pro' ? 'Plan Actual' : 'Actualizar a Pro'}</span>
                            </button>
                            <div class="flex flex-col gap-3">
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-primary">check_circle</span>
                                    Diseños 3D ilimitados
                                </div>
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-primary">check_circle</span>
                                    Todas las herramientas avanzadas
                                </div>
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-primary">check_circle</span>
                                    Acceso a confeccionistas Elite
                                </div>
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-primary">check_circle</span>
                                    Soporte prioritario
                                </div>
                                <div class="flex gap-3 items-center text-gray-300 text-sm font-normal">
                                    <span class="material-symbols-outlined text-primary">check_circle</span>
                                    Mejor visibilidad para sus pedidos
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

                const btnPro = document.getElementById('btn-pro');
                if (btnPro && !btnPro.disabled) {
                    btnPro.addEventListener('click', () => handleUpgrade('pro'));
                }

            } else {
                // Current Subscription View
                container.innerHTML = `
                <div class="mx-auto max-w-5xl">
                    <div class="rounded-xl border border-white/10 bg-[#1A1A1A] p-6 shadow-lg">
                        <div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                            <div>
                                <h1 class="text-2xl font-bold text-white">Plan ${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</h1>
                                <p class="mt-1 text-gray-400">Activo hasta el 24 de Diciembre, 2024</p>
                            </div>
                            <div class="flex gap-2">
                                <button id="cancel-plan-btn" class="flex h-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-white/5 px-4 text-sm font-bold leading-normal text-white hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/50 border border-transparent transition-all">
                                    <span class="truncate">Cancelar Plan</span>
                                </button>
                                <button id="change-plan-btn" class="flex h-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-4 text-sm font-bold leading-normal text-background-dark hover:brightness-110 transition-all">
                                    <span class="truncate">Cambiar Plan</span>
                                </button>
                            </div>
                        </div>
                        <div class="mt-6 border-t border-white/10 pt-6">
                            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <div class="flex items-start gap-3">
                                    <span class="material-symbols-outlined mt-1 text-primary">check_circle</span>
                                    <div>
                                        <h3 class="font-semibold text-white">100 Diseños 3D / Mes</h3>
                                        <p class="text-sm text-gray-400">Crea y guarda hasta 100 diseños detallados.</p>
                                    </div>
                                </div>
                                <div class="flex items-start gap-3">
                                    <span class="material-symbols-outlined mt-1 text-primary">check_circle</span>
                                    <div>
                                        <h3 class="font-semibold text-white">Acceso a Materiales Premium</h3>
                                        <p class="text-sm text-gray-400">Texturas y tejidos exclusivos para tus creaciones.</p>
                                    </div>
                                </div>
                                <div class="flex items-start gap-3">
                                    <span class="material-symbols-outlined mt-1 text-primary">check_circle</span>
                                    <div>
                                        <h3 class="font-semibold text-white">Soporte Prioritario</h3>
                                        <p class="text-sm text-gray-400">Asistencia técnica especializada 24/7.</p>
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
                                    <h3 class="font-medium text-white">¿Cómo puedo cambiar mi plan de suscripción?</h3>
                                    <span class="material-symbols-outlined text-gray-400 transition-transform group-open:rotate-180">expand_more</span>
                                </summary>
                                <div class="border-t border-white/10 px-4 pb-5 pt-4 sm:px-5">
                                    <p class="text-gray-400">Puedes cambiar tu plan en cualquier momento desde la sección "Mis Suscripciones". Simplemente selecciona "Cambiar Plan" y elige la opción que mejor se adapte a tus necesidades. El cambio se aplicará al final de tu ciclo de facturación actual.</p>
                                </div>
                            </details>
                            <details class="group rounded-lg border border-white/10 bg-[#1A1A1A]/50 transition-all hover:bg-[#1A1A1A]">
                                <summary class="flex cursor-pointer items-center justify-between p-4 sm:p-5">
                                    <h3 class="font-medium text-white">¿Qué sucede si cancelo mi suscripción?</h3>
                                    <span class="material-symbols-outlined text-gray-400 transition-transform group-open:rotate-180">expand_more</span>
                                </summary>
                                <div class="border-t border-white/10 px-4 pb-5 pt-4 sm:px-5">
                                    <p class="text-gray-400">Si cancelas tu suscripción, seguirás teniendo acceso a todas las funciones de tu plan hasta el final de tu ciclo de facturación actual. Después de esa fecha, tu cuenta volverá al plan gratuito con funciones limitadas.</p>
                                </div>
                            </details>
                            <details class="group rounded-lg border border-white/10 bg-[#1A1A1A]/50 transition-all hover:bg-[#1A1A1A]">
                                <summary class="flex cursor-pointer items-center justify-between p-4 sm:p-5">
                                    <h3 class="font-medium text-white">¿Se renueva automáticamente mi suscripción?</h3>
                                    <span class="material-symbols-outlined text-gray-400 transition-transform group-open:rotate-180">expand_more</span>
                                </summary>
                                <div class="border-t border-white/10 px-4 pb-5 pt-4 sm:px-5">
                                    <p class="text-gray-400">Sí, todas nuestras suscripciones se renuevan automáticamente al final de cada ciclo de facturación (mensual o anual) para garantizar un servicio ininterrumpido. Puedes desactivar la renovación automática en cualquier momento desde la configuración de tu cuenta.</p>
                                </div>
                            </details>
                            <details class="group rounded-lg border border-white/10 bg-[#1A1A1A]/50 transition-all hover:bg-[#1A1A1A]">
                                <summary class="flex cursor-pointer items-center justify-between p-4 sm:p-5">
                                    <h3 class="font-medium text-white">¿Aceptan diferentes métodos de pago?</h3>
                                    <span class="material-symbols-outlined text-gray-400 transition-transform group-open:rotate-180">expand_more</span>
                                </summary>
                                <div class="border-t border-white/10 px-4 pb-5 pt-4 sm:px-5">
                                    <p class="text-gray-400">Aceptamos las principales tarjetas de crédito y débito (Visa, MasterCard, American Express) así como pagos a través de PayPal. Toda la información de pago se procesa de forma segura a través de nuestro proveedor de pagos.</p>
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
    <div class="relative flex min-h-screen w-full flex-col bg-base font-display text-text-primary">
        <div class="flex h-full flex-1">
            <!-- SideNavBar -->
            <aside class="flex w-64 flex-col gap-8 border-r border-border-color/50 bg-panel/80 p-4 backdrop-blur-xl">
                <div class="flex items-center gap-3 px-3">
                    <span class="text-primary text-3xl font-black">P</span>
                    <h1 class="text-text-primary text-xl font-bold">PeruStyle</h1>
                </div>
                <nav class="flex h-full flex-col justify-between">
                    <div class="flex flex-col gap-2">
                        <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors" href="/client-dashboard">
                            <span class="material-symbols-outlined">dashboard</span>
                            <p class="text-sm font-medium">Dashboard / Inicio</p>
                        </a>
                        <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors" href="/my-designs">
                            <span class="material-symbols-outlined">design_services</span>
                            <p class="text-sm font-medium">Mis Diseños</p>
                        </a>
                        <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors" href="/orders">
                            <span class="material-symbols-outlined">inventory_2</span>
                            <p class="text-sm font-medium">Mis Pedidos</p>
                        </a>
                        <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors" href="/makers">
                            <span class="material-symbols-outlined">store</span>
                            <p class="text-sm font-medium">Explorar</p>
                        </a>
                        <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors" href="/chat">
                            <span class="material-symbols-outlined">chat</span>
                            <p class="text-sm font-medium">Chat</p>
                        </a>
                        <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors" href="/profile">
                            <span class="material-symbols-outlined">person</span>
                            <p class="text-sm font-medium">Mi Perfil</p>
                        </a>
                        <a class="group flex items-center gap-3 rounded-lg bg-primary/20 px-3 py-2 text-primary shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-colors" href="/plans">
                            <span class="material-symbols-outlined fill" style="font-variation-settings: 'FILL' 1;">credit_card</span>
                            <p class="text-sm font-bold">Mi Suscripción</p>
                        </a>
                    </div>
                    <div class="flex flex-col">
                        <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors" href="/logout" id="logout-btn">
                            <span class="material-symbols-outlined">logout</span>
                            <p class="text-sm font-medium">Cerrar sesión</p>
                        </a>
                    </div>
                </nav>
            </aside>
            <!-- Main Content -->
            <main class="flex-1 overflow-y-auto bg-base p-6 lg:p-10" id="plans-content">
                <!-- Injected via JS -->
            </main>
        </div>
    </div>
    `;
}
