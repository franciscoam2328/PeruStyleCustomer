export function HomePage() {
    setTimeout(() => {
        setupHomeInteractions();
    }, 0);

    return `
    <div class="bg-background-light text-text-main min-h-screen font-display">
        <main class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
            <!-- Hero Section -->
            <section class="relative bg-accent-teal rounded-lg overflow-hidden my-8">
                <div class="absolute inset-0 bg-black bg-opacity-10"></div>
                <div class="container mx-auto px-6 py-12 md:py-20 lg:py-24 flex flex-col md:flex-row items-center relative z-10 gap-12">
                    <div class="w-full md:w-1/2 text-center md:text-left">
                        <h2 class="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-4">
                            Diseña tu Moda <br>
                            <span class="text-primary">Conecta con Expertos</span>
                        </h2>
                        <p class="text-lg text-gray-700 mb-8 max-w-lg mx-auto md:mx-0">
                            La plataforma que une a diseñadores creativos con los mejores confeccionistas del Perú.
                        </p>
                        <a href="/designer" class="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-gray-900 rounded-full hover:bg-gray-800 hover:shadow-lg hover:-translate-y-1">
                            EMPEZAR AHORA
                            <span class="material-icons ml-2">arrow_forward</span>
                        </a>
                    </div>
                    <div class="w-full md:w-1/2 flex justify-center md:justify-end">
                        <div class="relative w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform md:rotate-3 hover:rotate-0 transition-transform duration-500">
                            <img 
                                src="https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=800&q=80" 
                                alt="Sastrería y Personalización" 
                                class="absolute inset-0 w-full h-full object-cover"
                            />
                            <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            <div class="absolute bottom-6 left-6 text-white">
                                <p class="font-bold text-lg">Calidad Premium</p>
                                <p class="text-sm opacity-90">Hecho en Perú</p>
                            </div>
                        </div>
                    </div>
                </div>

            </section>

            <!-- Categories Grid -->
            <section class="my-16 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="relative rounded-lg overflow-hidden h-64 md:h-80 group">
                    <img alt="Office Furniture" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800"/>
                    <div class="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white">
                        <h3 class="text-2xl font-bold">CONFECCIONISTAS</h3>
                        <a class="mt-2 text-sm font-semibold tracking-wider border-b-2 border-white pb-1" href="/makers">VER TODOS</a>
                    </div>
                </div>
                <div class="relative rounded-lg overflow-hidden h-64 md:h-80 group">
                    <img alt="Home Furniture" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800"/>
                    <div class="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white">
                        <h3 class="text-2xl font-bold">DISEÑADOR 3D</h3>
                        <a class="mt-2 text-sm font-semibold tracking-wider border-b-2 border-white pb-1" href="/designer">PROBAR AHORA</a>
                    </div>
                </div>
            </section>

            <!-- How It Works -->
            <section class="my-20">
                <div class="text-center mb-12">
                    <h2 class="text-3xl font-bold text-gray-900">Cómo Funciona</h2>
                    <p class="mt-2 text-gray-500">Tu camino desde la idea hasta la prenda real.</p>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div class="text-center p-6 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                        <div class="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <span class="material-icons text-3xl text-gray-800">edit</span>
                        </div>
                        <h3 class="text-lg font-bold text-gray-900 mb-2">1. Diseña</h3>
                        <p class="text-sm text-gray-500">Crea tu prenda en 3D con herramientas fáciles de usar.</p>
                    </div>
                    <div class="text-center p-6 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                        <div class="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <span class="material-icons text-3xl text-gray-800">send</span>
                        </div>
                        <h3 class="text-lg font-bold text-gray-900 mb-2">2. Envía</h3>
                        <p class="text-sm text-gray-500">Comparte tu diseño con nuestra red de expertos.</p>
                    </div>
                    <div class="text-center p-6 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                        <div class="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <span class="material-icons text-3xl text-gray-800">check_circle</span>
                        </div>
                        <h3 class="text-lg font-bold text-gray-900 mb-2">3. Valida</h3>
                        <p class="text-sm text-gray-500">Aprueba la muestra antes de la producción final.</p>
                    </div>
                    <div class="text-center p-6 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                        <div class="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <span class="material-icons text-3xl text-gray-800">inventory_2</span>
                        </div>
                        <h3 class="text-lg font-bold text-gray-900 mb-2">4. Recibe</h3>
                        <p class="text-sm text-gray-500">Obtén tu pedido en la puerta de tu casa.</p>
                    </div>
                </div>
            </section>

            <!-- Popular Section -->
            <section class="my-16">
                <div class="text-center mb-12">
                    <h2 class="text-3xl font-bold text-gray-900">Destacados</h2>
                    <div class="mt-2 text-sm text-gray-500">
                        <a class="hover:text-primary" href="/makers">MEJORES CALIFICADOS</a> - <a class="hover:text-primary text-gray-900 font-medium" href="/makers">NUEVOS TALENTOS</a>
                    </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <!-- Card 1 -->
                    <div class="group">
                        <div class="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                            <img alt="Maker 1" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400"/>
                            <span class="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">Top</span>
                        </div>
                        <div class="mt-4 text-center">
                            <h3 class="font-semibold text-gray-800">Ana María Polo</h3>
                            <p class="mt-1 text-sm text-gray-500">Alta Costura</p>
                            <p class="mt-1">
                                <span class="text-primary font-bold">4.9 ★</span>
                            </p>
                        </div>
                    </div>
                    <!-- Card 2 -->
                    <div class="group">
                        <div class="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                            <img alt="Maker 2" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"/>
                            <span class="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">Nuevo</span>
                        </div>
                        <div class="mt-4 text-center">
                            <h3 class="font-semibold text-gray-800">Carlos Ruiz</h3>
                            <p class="mt-1 text-sm text-gray-500">Sastrería</p>
                            <p class="mt-1">
                                <span class="text-primary font-bold">5.0 ★</span>
                            </p>
                        </div>
                    </div>
                    <!-- Card 3 -->
                    <div class="group">
                        <div class="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                            <img alt="Maker 3" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400"/>
                        </div>
                        <div class="mt-4 text-center">
                            <h3 class="font-semibold text-gray-800">Elena Vega</h3>
                            <p class="mt-1 text-sm text-gray-500">Moda Urbana</p>
                            <p class="mt-1">
                                <span class="text-primary font-bold">4.8 ★</span>
                            </p>
                        </div>
                    </div>
                    <!-- Card 4 -->
                    <div class="group">
                        <div class="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                            <img alt="Maker 4" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://images.unsplash.com/photo-1558769132-cb1aea3c8565?w=400"/>
                            <span class="absolute top-3 right-3 bg-gray-800 text-white text-xs font-semibold px-2 py-1 rounded">-10%</span>
                        </div>
                        <div class="mt-4 text-center">
                            <h3 class="font-semibold text-gray-800">Taller Central</h3>
                            <p class="mt-1 text-sm text-gray-500">Producción Masiva</p>
                            <p class="mt-1">
                                <span class="text-primary font-bold">4.7 ★</span>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Benefits Section -->
            <section class="my-20 bg-gray-50 rounded-2xl p-8 md:p-12">
                <div class="text-center mb-12">
                    <h2 class="text-3xl font-bold text-gray-900">Por qué elegirnos</h2>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="flex flex-col items-center text-center">
                        <span class="material-icons text-4xl text-gray-800 mb-4">visibility</span>
                        <h3 class="font-bold text-lg mb-2">Visualización 3D</h3>
                        <p class="text-sm text-gray-500">Mira cada detalle antes de confeccionar.</p>
                    </div>
                    <div class="flex flex-col items-center text-center">
                        <span class="material-icons text-4xl text-gray-800 mb-4">verified</span>
                        <h3 class="font-bold text-lg mb-2">Calidad Verificada</h3>
                        <p class="text-sm text-gray-500">Solo trabajamos con los mejores.</p>
                    </div>
                    <div class="flex flex-col items-center text-center">
                        <span class="material-icons text-4xl text-gray-800 mb-4">lock</span>
                        <h3 class="font-bold text-lg mb-2">Seguridad Total</h3>
                        <p class="text-sm text-gray-500">Pagos y entregas protegidos.</p>
                    </div>
                </div>
            </section>

            <!-- Pricing Section -->
            <section class="my-20" id="pricing">
                <div class="text-center mb-12">
                    <h2 class="text-3xl font-bold text-gray-900">Planes Flexibles</h2>
                    <p class="text-gray-500 mb-8">Elige la opción perfecta para ti.</p>
                    
                    <!-- Toggle -->
                    <div class="inline-flex bg-gray-100 p-1 rounded-full relative">
                        <button id="toggle-client" class="px-6 py-2 rounded-full text-sm font-bold transition-all bg-primary text-white shadow-md">
                            Diseñador
                        </button>
                        <button id="toggle-maker" class="px-6 py-2 rounded-full text-sm font-bold text-gray-500 hover:text-gray-900 transition-all">
                            Confeccionista
                        </button>
                    </div>
                </div>
                
                <div id="plans-container" class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <!-- Plans injected via JS -->
                </div>
            </section>
        </main>

        <!-- Footer -->
        <footer class="bg-background-dark text-white py-12 mt-12">
            <div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <img src="/assets/logo.png" alt="PeruStyle" class="h-10 mb-4 bg-white rounded-lg px-2 py-1">
                        <p class="text-gray-400 text-sm">Innovando la moda peruana con tecnología y talento local.</p>
                    </div>
                    <div>
                        <h4 class="font-bold mb-4">Plataforma</h4>
                        <ul class="space-y-2 text-sm text-gray-400">
                            <li><a href="#" class="hover:text-white">Cómo funciona</a></li>
                            <li><a href="#" class="hover:text-white">Precios</a></li>
                            <li><a href="#" class="hover:text-white">Confeccionistas</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-bold mb-4">Empresa</h4>
                        <ul class="space-y-2 text-sm text-gray-400">
                            <li><a href="#" class="hover:text-white">Sobre nosotros</a></li>
                            <li><a href="#" class="hover:text-white">Contacto</a></li>
                            <li><a href="#" class="hover:text-white">Blog</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-bold mb-4">Legal</h4>
                        <ul class="space-y-2 text-sm text-gray-400">
                            <li><a href="#" class="hover:text-white">Términos</a></li>
                            <li><a href="#" class="hover:text-white">Privacidad</a></li>
                        </ul>
                    </div>
                </div>
                <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p class="text-xs text-gray-500">© 2024 PeruStyle. Todos los derechos reservados.</p>
                    <div class="flex space-x-4 mt-4 md:mt-0">
                        <a href="#" class="text-gray-400 hover:text-white"><span class="material-icons">facebook</span></a>
                        <a href="#" class="text-gray-400 hover:text-white"><span class="material-icons">camera_alt</span></a>
                    </div>
                </div>
            </div>
        </footer>

        <!-- Register Modal -->
        <div id="register-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 hidden backdrop-blur-sm">
            <div class="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
                <div class="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <span class="material-icons text-3xl text-gray-800">person_add</span>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-2">¡Únete a PeruStyle!</h3>
                <p class="text-gray-500 mb-8">Crea una cuenta para acceder a estos beneficios.</p>
                
                <div class="flex flex-col gap-3">
                    <a href="/login" class="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-gray-800 transition-colors">
                        Registrarme ahora
                    </a>
                    <button id="close-modal" class="w-full py-3 bg-transparent text-gray-500 font-medium hover:text-gray-900 transition-colors">
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

    // Data
    const clientPlans = [
        { name: 'Básico', price: 'Gratis', desc: 'Para empezar', features: ['2 Diseños 3D', 'Chat con Confeccionistas', 'Enviar Pedidos'], popular: false },
        { name: 'Premium', price: '$29.99', desc: 'Para entusiastas', features: ['10 Diseños 3D', 'Personalización Avanzada', 'Acceso Prioritario'], popular: true },
        { name: 'Pro', price: '$59.99', desc: 'Para profesionales', features: ['Diseños Ilimitados', 'Herramientas Avanzadas', 'Soporte VIP'], popular: false }
    ];

    const makerPlans = [
        { name: 'Básico', price: 'Gratis', desc: 'Para nuevos', features: ['Comisión 15%', '3 Fotos en Portafolio', 'Perfil Básico'], popular: false },
        { name: 'Premium', price: '$19.99', desc: 'Para crecimiento', features: ['Comisión 10%', '20 Fotos en Portafolio', 'Insignia Verificado'], popular: true },
        { name: 'Elite', price: '$49.99', desc: 'Para expertos', features: ['Comisión 5%', 'Portafolio Ilimitado', 'Máxima Visibilidad'], popular: false }
    ];

    function renderPlans(type) {
        const plans = type === 'client' ? clientPlans : makerPlans;
        if (!plansContainer) return;

        plansContainer.innerHTML = plans.map(plan => `
            <div class="bg-white rounded-xl p-6 border ${plan.popular ? 'border-primary ring-1 ring-primary' : 'border-gray-200'} hover:shadow-lg transition-shadow relative flex flex-col">
                ${plan.popular ? '<span class="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">POPULAR</span>' : ''}
                <h3 class="text-xl font-bold text-gray-900">${plan.name}</h3>
                <p class="text-gray-500 text-sm mt-1">${plan.desc}</p>
                <div class="my-6">
                    <span class="text-4xl font-bold text-gray-900">${plan.price}</span>
                    ${plan.price !== 'Gratis' ? '<span class="text-gray-400">/mes</span>' : ''}
                </div>
                <ul class="space-y-3 mb-8 flex-1">
                    ${plan.features.map(f => `
                        <li class="flex items-center text-sm text-gray-600">
                            <span class="material-icons text-green-500 text-sm mr-2">check</span>
                            ${f}
                        </li>
                    `).join('')}
                </ul>
                <button class="btn-start w-full py-2 rounded-lg font-bold transition-colors ${plan.popular ? 'bg-primary text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}">
                    Elegir Plan
                </button>
            </div>
        `).join('');

        // Re-attach listeners
        document.querySelectorAll('.btn-start').forEach(btn => {
            btn.addEventListener('click', () => {
                if (modal) modal.classList.remove('hidden');
            });
        });
    }

    if (toggleClient && toggleMaker) {
        renderPlans('client');

        toggleClient.addEventListener('click', () => {
            toggleClient.classList.add('bg-primary', 'text-white', 'shadow-md');
            toggleClient.classList.remove('text-gray-500', 'hover:text-gray-900');

            toggleMaker.classList.remove('bg-primary', 'text-white', 'shadow-md');
            toggleMaker.classList.add('text-gray-500', 'hover:text-gray-900');

            renderPlans('client');
        });

        toggleMaker.addEventListener('click', () => {
            toggleMaker.classList.add('bg-primary', 'text-white', 'shadow-md');
            toggleMaker.classList.remove('text-gray-500', 'hover:text-gray-900');

            toggleClient.classList.remove('bg-primary', 'text-white', 'shadow-md');
            toggleClient.classList.add('text-gray-500', 'hover:text-gray-900');

            renderPlans('maker');
        });
    }

    if (closeModal && modal) {
        closeModal.addEventListener('click', () => modal.classList.add('hidden'));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    }
}
