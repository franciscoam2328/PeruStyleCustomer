export function HomePage() {
    setTimeout(() => {
        setupHomeInteractions();
    }, 0);

    return `
    <div class="bg-background-dark text-text-beige min-h-screen font-display">
        <!-- Hero Section -->
        <section class="relative">
            <div class="relative bg-cover bg-center bg-no-repeat min-h-[70vh] flex items-center justify-center px-4" style="background: linear-gradient(180deg, rgba(13, 13, 13, 0.85) 0%, rgba(13, 13, 13, 0.95) 100%), url('https://images.unsplash.com/photo-1558769132-cb1aea3c8565?w=1920') center/cover;">
                <div class="max-w-4xl mx-auto text-center py-24">
                    <h1 class="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
                        Diseña, Confirma y<br/>Confecciona Tu Prenda<br/>Perfecta
                    </h1>
                    <p class="text-base md:text-lg text-text-muted mb-10 max-w-2xl mx-auto">
                        Conecta con los mejores confeccionistas y visualiza tu diseño en 3D antes de producir.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/login" class="px-8 py-3.5 bg-primary text-white font-bold rounded-lg hover:bg-opacity-90 transition-all shadow-lg">
                            Ingresar
                        </a>
                        <a href="/makers" class="px-8 py-3.5 bg-card-dark/80 backdrop-blur-sm border border-text-muted/30 text-text-beige font-bold rounded-lg hover:border-primary transition-all">
                            Explorar confeccionistas
                        </a>
                    </div>
                </div>
            </div>
        </section>

        <!-- Cómo funciona -->
        <section class="py-20 px-4" id="how-it-works">
            <div class="max-w-7xl mx-auto">
                <h2 class="text-3xl md:text-4xl font-bold text-center text-white mb-16">Cómo funciona</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="bg-card-dark/60 backdrop-blur-md border border-text-muted/10 rounded-2xl p-8 text-center hover:border-accent-gold/30 transition-all">
                        <div class="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                            <span class="text-4xl">✏️</span>
                        </div>
                        <h3 class="text-lg font-bold text-white mb-3">Diseña</h3>
                        <p class="text-sm text-text-muted leading-relaxed">Personaliza tu prenda en 3D.</p>
                    </div>
                    <div class="bg-card-dark/60 backdrop-blur-md border border-text-muted/10 rounded-2xl p-8 text-center hover:border-accent-gold/30 transition-all">
                        <div class="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                            <span class="text-4xl">📨</span>
                        </div>
                        <h3 class="text-lg font-bold text-white mb-3">Envía</h3>
                        <p class="text-sm text-text-muted leading-relaxed">Compártela con confeccionistas reales.</p>
                    </div>
                    <div class="bg-card-dark/60 backdrop-blur-md border border-text-muted/10 rounded-2xl p-8 text-center hover:border-accent-gold/30 transition-all">
                        <div class="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                            <span class="text-4xl">✅</span>
                        </div>
                        <h3 class="text-lg font-bold text-white mb-3">Valida</h3>
                        <p class="text-sm text-text-muted leading-relaxed">Aprueba una muestra visual antes de producir.</p>
                    </div>
                    <div class="bg-card-dark/60 backdrop-blur-md border border-text-muted/10 rounded-2xl p-8 text-center hover:border-accent-gold/30 transition-all">
                        <div class="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                            <span class="text-4xl">📦</span>
                        </div>
                        <h3 class="text-lg font-bold text-white mb-3">Recibe</h3>
                        <p class="text-sm text-text-muted leading-relaxed">Obtén tu prenda final con calidad garantizada.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Beneficios -->
        <section class="py-20 px-4 bg-card-dark/30" id="benefits">
            <div class="max-w-7xl mx-auto">
                <div class="max-w-3xl mx-auto text-center mb-12">
                    <h2 class="text-3xl md:text-4xl font-bold text-text-beige mb-4">Beneficios de PeruStyle</h2>
                    <p class="text-text-muted">
                        Descubre las ventajas de utilizar nuestra plataforma para dar vida a tus creaciones de moda con tecnología de punta.
                    </p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-card-dark border border-accent-gold/20 rounded-xl p-6">
                        <div class="text-4xl text-primary mb-4">🔮</div>
                        <h3 class="text-lg font-bold text-text-beige mb-2">Diseño 3D en tiempo real</h3>
                        <p class="text-sm text-text-muted">Visualiza y ajusta cada detalle de tu prenda con nuestra herramienta de diseño 3D interactiva.</p>
                    </div>
                    <div class="bg-card-dark border border-accent-gold/20 rounded-xl p-6">
                        <div class="text-4xl text-primary mb-4">✓</div>
                        <h3 class="text-lg font-bold text-text-beige mb-2">Confeccionistas calificados</h3>
                        <p class="text-sm text-text-muted">Accede a una red de profesionales verificados para garantizar la mejor calidad de confección.</p>
                    </div>
                    <div class="bg-card-dark border border-accent-gold/20 rounded-xl p-6">
                        <div class="text-4xl text-primary mb-4">🔒</div>
                        <h3 class="text-lg font-bold text-text-beige mb-2">Proceso transparente y seguro</h3>
                        <p class="text-sm text-text-muted">Sigue cada paso de la producción, desde la muestra hasta la entrega final, con total confianza.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Design Preview Section -->
        <section class="py-20 px-4 bg-black/20" id="design-preview">
            <div class="max-w-7xl mx-auto">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <span class="text-accent-gold font-bold tracking-wider uppercase text-sm mb-2 block">Tecnología 3D</span>
                        <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">Diseña en tiempo real</h2>
                        <p class="text-text-muted text-lg mb-8">
                            Nuestra herramienta de diseño te permite visualizar cada detalle de tu prenda antes de confeccionarla. Elige telas, colores y cortes con precisión milimétrica.
                        </p>
                        <ul class="space-y-4 mb-8">
                            <li class="flex items-center gap-3 text-text-beige">
                                <span class="material-symbols-outlined text-accent-gold">3d_rotation</span>
                                Vista de 360 grados
                            </li>
                            <li class="flex items-center gap-3 text-text-beige">
                                <span class="material-symbols-outlined text-accent-gold">palette</span>
                                Biblioteca de texturas y colores
                            </li>
                            <li class="flex items-center gap-3 text-text-beige">
                                <span class="material-symbols-outlined text-accent-gold">straighten</span>
                                Ajuste de tallas personalizado
                            </li>
                        </ul>
                        <a href="/login" class="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors border border-white/10">
                            Probar herramienta
                            <span class="material-symbols-outlined">arrow_forward</span>
                        </a>
                    </div>
                    <div class="relative group">
                        <div class="absolute -inset-1 bg-gradient-to-r from-accent-gold to-primary rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <div class="relative rounded-2xl overflow-hidden border border-white/10 bg-card-dark aspect-video">
                            <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80" alt="Interfaz de Diseño 3D" class="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-500">
                            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span class="material-symbols-outlined text-6xl text-white drop-shadow-lg opacity-80">view_in_ar</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Featured Makers Section -->
        <section class="py-20 px-4" id="featured-makers">
            <div class="max-w-7xl mx-auto">
                <div class="text-center mb-16">
                    <span class="text-accent-gold font-bold tracking-wider uppercase text-sm mb-2 block">Talento Local</span>
                    <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Confeccionistas Destacados</h2>
                    <p class="text-text-muted max-w-2xl mx-auto">
                        Trabaja con expertos verificados que harán realidad tus diseños con la mejor calidad.
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <!-- Maker Card 1 -->
                    <div class="bg-card-dark rounded-xl border border-white/5 overflow-hidden hover:border-accent-gold/30 transition-all group">
                        <div class="h-48 bg-gray-800 relative overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1558769132-cb1aea3c8565?w=500" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                            <div class="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1">
                                <span class="material-symbols-outlined text-yellow-500 text-sm">star</span>
                                <span class="text-white text-xs font-bold">4.9</span>
                            </div>
                        </div>
                        <div class="p-6">
                            <div class="flex items-center gap-4 mb-4">
                                <div class="w-12 h-12 rounded-full bg-accent-gold/20 border border-accent-gold/30 overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100" class="w-full h-full object-cover">
                                </div>
                                <div>
                                    <h3 class="text-white font-bold">Ana María Polo</h3>
                                    <p class="text-accent-gold text-xs font-bold uppercase">Alta Costura</p>
                                </div>
                            </div>
                            <p class="text-sm text-text-muted mb-4 line-clamp-2">Especialista en vestidos de noche y novias con más de 15 años de experiencia en acabados a mano.</p>
                            <div class="flex flex-wrap gap-2 mb-6">
                                <span class="px-2 py-1 rounded bg-white/5 text-xs text-gray-400">Seda</span>
                                <span class="px-2 py-1 rounded bg-white/5 text-xs text-gray-400">Encaje</span>
                                <span class="px-2 py-1 rounded bg-white/5 text-xs text-gray-400">Bordado</span>
                            </div>
                            <button class="w-full py-2 rounded-lg bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-colors border border-white/10">
                                Ver Perfil
                            </button>
                        </div>
                    </div>

                    <!-- Maker Card 2 -->
                    <div class="bg-card-dark rounded-xl border border-white/5 overflow-hidden hover:border-accent-gold/30 transition-all group">
                        <div class="h-48 bg-gray-800 relative overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                            <div class="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1">
                                <span class="material-symbols-outlined text-yellow-500 text-sm">star</span>
                                <span class="text-white text-xs font-bold">5.0</span>
                            </div>
                        </div>
                        <div class="p-6">
                            <div class="flex items-center gap-4 mb-4">
                                <div class="w-12 h-12 rounded-full bg-accent-gold/20 border border-accent-gold/30 overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" class="w-full h-full object-cover">
                                </div>
                                <div>
                                    <h3 class="text-white font-bold">Carlos Ruiz</h3>
                                    <p class="text-accent-gold text-xs font-bold uppercase">Sastrería</p>
                                </div>
                            </div>
                            <p class="text-sm text-text-muted mb-4 line-clamp-2">Maestro sastre enfocado en trajes a medida y ropa formal masculina. Ajuste perfecto garantizado.</p>
                            <div class="flex flex-wrap gap-2 mb-6">
                                <span class="px-2 py-1 rounded bg-white/5 text-xs text-gray-400">Lana</span>
                                <span class="px-2 py-1 rounded bg-white/5 text-xs text-gray-400">Lino</span>
                                <span class="px-2 py-1 rounded bg-white/5 text-xs text-gray-400">Algodón</span>
                            </div>
                            <button class="w-full py-2 rounded-lg bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-colors border border-white/10">
                                Ver Perfil
                            </button>
                        </div>
                    </div>

                    <!-- Maker Card 3 -->
                    <div class="bg-card-dark rounded-xl border border-white/5 overflow-hidden hover:border-accent-gold/30 transition-all group">
                        <div class="h-48 bg-gray-800 relative overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=500" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                            <div class="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1">
                                <span class="material-symbols-outlined text-yellow-500 text-sm">star</span>
                                <span class="text-white text-xs font-bold">4.8</span>
                            </div>
                        </div>
                        <div class="p-6">
                            <div class="flex items-center gap-4 mb-4">
                                <div class="w-12 h-12 rounded-full bg-accent-gold/20 border border-accent-gold/30 overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100" class="w-full h-full object-cover">
                                </div>
                                <div>
                                    <h3 class="text-white font-bold">Elena Vega</h3>
                                    <p class="text-accent-gold text-xs font-bold uppercase">Moda Urbana</p>
                                </div>
                            </div>
                            <p class="text-sm text-text-muted mb-4 line-clamp-2">Diseñadora y confeccionista de streetwear y ropa casual. Experta en denim y tejidos de punto.</p>
                            <div class="flex flex-wrap gap-2 mb-6">
                                <span class="px-2 py-1 rounded bg-white/5 text-xs text-gray-400">Denim</span>
                                <span class="px-2 py-1 rounded bg-white/5 text-xs text-gray-400">Jersey</span>
                                <span class="px-2 py-1 rounded bg-white/5 text-xs text-gray-400">Cuero</span>
                            </div>
                            <button class="w-full py-2 rounded-lg bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-colors border border-white/10">
                                Ver Perfil
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="mt-12 text-center">
                    <a href="/login" class="inline-flex items-center gap-2 text-primary font-bold hover:text-red-400 transition-colors">
                        Ver todos los confeccionistas
                        <span class="material-symbols-outlined">arrow_forward</span>
                    </a>
                </div>
            </div>
        </section>

        <!-- Pricing -->
        <section class="py-20 px-4 bg-card-dark/30" id="pricing">
            <div class="max-w-7xl mx-auto">
                <div class="max-w-3xl mx-auto text-center mb-12">
                    <h2 class="text-3xl md:text-4xl font-bold text-text-beige mb-4">Planes para cada necesidad</h2>
                    <p class="text-text-muted mb-8">
                        Elige el plan que mejor se adapte a tu proyecto, ya seas diseñador o confeccionista.
                    </p>
                    
                    <!-- Toggle Switch -->
                    <div class="inline-flex bg-black/40 p-1 rounded-full border border-white/10 relative">
                        <button id="toggle-client" class="px-6 py-2 rounded-full text-sm font-bold transition-all bg-primary text-background-dark shadow-lg z-10">
                            Diseñador
                        </button>
                        <button id="toggle-maker" class="px-6 py-2 rounded-full text-sm font-bold text-text-muted hover:text-white transition-all z-10">
                            Confeccionista
                        </button>
                    </div>
                </div>
                
                <div id="plans-container" class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Content injected via JS -->
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="border-t border-accent-gold/20 py-12 px-4">
            <div class="max-w-7xl mx-auto">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <div class="flex items-center gap-2 mb-4">
                            <span class="text-3xl text-accent-gold">✨</span>
                            <h2 class="text-xl font-bold text-text-beige">PeruStyle</h2>
                        </div>
                        <p class="text-sm text-text-muted">Revolucionando la industria de la moda, un diseño a la vez.</p>
                    </div>
                    <div>
                        <h4 class="font-bold text-text-beige mb-3">Plataforma</h4>
                        <div class="flex flex-col gap-2 text-sm text-text-muted">
                            <a href="#how-it-works" class="hover:text-primary">Cómo funciona</a>
                            <a href="#pricing" class="hover:text-primary">Precios</a>
                            <a href="#benefits" class="hover:text-primary">Beneficios</a>
                        </div>
                    </div>
                    <div>
                        <h4 class="font-bold text-text-beige mb-3">Empresa</h4>
                        <div class="flex flex-col gap-2 text-sm text-text-muted">
                            <a href="#" class="hover:text-primary">Sobre nosotros</a>
                            <a href="#" class="hover:text-primary">Contacto</a>
                            <a href="#" class="hover:text-primary">Prensa</a>
                        </div>
                    </div>
                    <div>
                        <h4 class="font-bold text-text-beige mb-3">Legal</h4>
                        <div class="flex flex-col gap-2 text-sm text-text-muted">
                            <a href="#" class="hover:text-primary">Términos de servicio</a>
                            <a href="#" class="hover:text-primary">Política de privacidad</a>
                        </div>
                    </div>
                </div>
                <div class="pt-8 border-t border-accent-gold/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p class="text-xs text-text-muted">© 2024 PeruStyle. Todos los derechos reservados.</p>
                    <div class="flex gap-4 text-text-muted">
                        <a href="#" class="hover:text-primary">Facebook</a>
                        <a href="#" class="hover:text-primary">Twitter</a>
                        <a href="#" class="hover:text-primary">Instagram</a>
                    </div>
                </div>
            </div>
        </footer>

        <!-- Register Modal -->
        <div id="register-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 hidden backdrop-blur-sm">
            <div class="bg-card-dark p-8 rounded-xl border border-white/10 max-w-md w-full text-center transform transition-all scale-100 shadow-2xl">
                <div class="w-16 h-16 mx-auto mb-6 bg-primary/20 rounded-full flex items-center justify-center">
                    <span class="material-symbols-outlined text-4xl text-primary">person_add</span>
                </div>
                <h3 class="text-2xl font-bold text-white mb-2">¡Únete a PeruStyle!</h3>
                <p class="text-gray-400 mb-8">Para suscribirte a un plan, primero necesitas crear una cuenta.</p>
                
                <div class="flex flex-col gap-3">
                    <a href="/login" class="w-full py-3 bg-primary text-background-dark font-bold rounded-lg hover:bg-primary/90 transition-colors">
                        Registrarme ahora
                    </a>
                    <button id="close-modal" class="w-full py-3 bg-transparent text-gray-400 font-medium hover:text-white transition-colors">
                        Quizás luego
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;
}

function setupHomeInteractions() {
    const plansContainer = document.getElementById('plans-container');
    const toggleClient = document.getElementById('toggle-client');
    const toggleMaker = document.getElementById('toggle-maker');
    const modal = document.getElementById('register-modal');
    const closeModal = document.getElementById('close-modal');

    const clientPlans = [
        {
            name: 'Básico',
            desc: 'Ideal para empezar.',
            price: 'Gratis',
            features: ['2 Diseños 3D', 'Chat con confeccionistas', 'Enviar pedidos'],
            popular: false
        },
        {
            name: 'Premium',
            desc: 'Para profesionales.',
            price: '$9.99',
            period: '/mes',
            features: ['10 Diseños 3D', 'Opciones avanzadas', 'Prioridad en mensajes'],
            popular: true
        },
        {
            name: 'Pro',
            desc: 'Para equipos y marcas.',
            price: '$19.99',
            period: '/mes',
            features: ['Diseños ilimitados', 'Herramientas avanzadas', 'Respuesta garantizada'],
            popular: false
        }
    ];

    const makerPlans = [
        {
            name: 'Básico',
            desc: 'Empieza tu negocio.',
            price: 'Gratis',
            features: ['Comisión del 15%', '3 Fotos en Portafolio', 'Perfil Básico'],
            popular: false
        },
        {
            name: 'Premium',
            desc: 'Destaca tu taller.',
            price: '$19.99',
            period: '/mes',
            features: ['Comisión del 10%', '20 Fotos en Portafolio', 'Insignia Verificado'],
            popular: true
        },
        {
            name: 'Elite',
            desc: 'Máxima visibilidad.',
            price: '$49.99',
            period: '/mes',
            features: ['Comisión del 5%', 'Portafolio Ilimitado', 'Soporte VIP'],
            popular: false
        }
    ];

    function renderPlans(type) {
        const plans = type === 'client' ? clientPlans : makerPlans;

        plansContainer.innerHTML = plans.map(plan => `
            <div class="relative bg-card-dark/50 backdrop-blur-lg border ${plan.popular ? 'border-primary' : 'border-accent-gold/20'} rounded-xl p-6 flex flex-col">
                ${plan.popular ? `
                    <p class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-3 py-1 text-xs font-bold text-background-dark">
                        MÁS POPULAR
                    </p>
                ` : ''}
                <h3 class="text-lg font-bold text-text-beige">${plan.name}</h3>
                <p class="text-text-muted text-sm mt-1">${plan.desc}</p>
                <p class="text-4xl font-black text-text-beige mt-4">${plan.price}<span class="text-base font-medium text-text-muted">${plan.period || ''}</span></p>
                <ul class="mt-6 space-y-3 text-text-muted text-sm flex-1">
                    ${plan.features.map(f => `
                        <li class="flex items-center gap-2">
                            <span class="text-accent-gold">✓</span>
                            ${f}
                        </li>
                    `).join('')}
                </ul>
                <button class="btn-start mt-8 block w-full text-center rounded-lg ${plan.popular ? 'bg-primary text-background-dark' : 'bg-transparent border-2 border-primary text-primary'} py-2.5 text-sm font-bold hover:bg-primary hover:text-background-dark transition-all">
                    Empezar ahora
                </button>
            </div>
        `).join('');

        // Re-attach modal listeners
        document.querySelectorAll('.btn-start').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.remove('hidden');
            });
        });
    }

    // Initial Render
    renderPlans('client');

    // Toggle Logic
    toggleClient.addEventListener('click', () => {
        toggleClient.classList.add('bg-primary', 'text-background-dark', 'shadow-lg');
        toggleClient.classList.remove('text-text-muted');

        toggleMaker.classList.remove('bg-primary', 'text-background-dark', 'shadow-lg');
        toggleMaker.classList.add('text-text-muted');

        renderPlans('client');
    });

    toggleMaker.addEventListener('click', () => {
        toggleMaker.classList.add('bg-primary', 'text-background-dark', 'shadow-lg');
        toggleMaker.classList.remove('text-text-muted');

        toggleClient.classList.remove('bg-primary', 'text-background-dark', 'shadow-lg');
        toggleClient.classList.add('text-text-muted');

        renderPlans('maker');
    });

    // Modal Logic
    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
}
