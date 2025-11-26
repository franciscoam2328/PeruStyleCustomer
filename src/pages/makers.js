import { Navbar } from '../components/navbar.js';

export function MakersPage() {
    setTimeout(() => {
        renderStaticView();
    }, 0);

    return `<div id="makers-page-content" class="min-h-screen bg-background-light"></div>`;
}

function renderStaticView() {
    const container = document.getElementById('makers-page-content');
    if (!container) return;

    // Hardcoded examples as requested
    const exampleMakers = [
        {
            id: 'example-1',
            full_name: 'Ana María Polo',
            bio: 'Especialista en Alta Costura y vestidos de noche. Más de 10 años de experiencia creando piezas únicas.',
            avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
            badge: 'Top Rated',
            rating: 4.9,
            specialty: 'Alta Costura'
        },
        {
            id: 'example-2',
            full_name: 'Carlos Ruiz',
            bio: 'Sastrería clásica y moderna para caballeros. Trajes a medida con acabados impecables.',
            avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
            badge: 'Nuevo Talento',
            rating: 4.7,
            specialty: 'Sastrería'
        },
        {
            id: 'example-3',
            full_name: 'Elena Vega',
            bio: 'Diseño y confección de ropa urbana y casual. Pasión por las texturas y colores vibrantes.',
            avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
            badge: 'Verificado',
            rating: 4.8,
            specialty: 'Urbana'
        },
        {
            id: 'example-4',
            full_name: 'Marco Antonio',
            bio: 'Experto en ropa deportiva y técnica. Materiales de alta calidad para el máximo rendimiento.',
            avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
            badge: null,
            rating: 4.6,
            specialty: 'Deportiva'
        }
    ];

    container.innerHTML = `
    <div class="bg-background-light min-h-screen font-display">
        <!-- Navbar Placeholder (if needed, or back button) -->
        <div class="absolute top-0 left-0 w-full p-6 z-10">
            <a href="/" class="flex items-center gap-2 text-gray-800 hover:text-primary transition-colors font-bold bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm w-fit">
                <span class="material-icons">arrow_back</span>
                Volver al Inicio
            </a>
        </div>

        <div class="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
            <!-- Header -->
            <div class="text-center mb-16">
                <span class="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Nuestra Comunidad</span>
                <h1 class="text-4xl md:text-5xl font-black text-gray-900 mb-6">Confeccionistas Destacados</h1>
                <p class="text-gray-500 max-w-2xl mx-auto text-lg">Explora el talento de nuestros expertos. Estos son algunos ejemplos de los profesionales con los que podrás conectar al registrarte.</p>
            </div>

            <!-- Static Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                ${exampleMakers.map(maker => `
                    <div class="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div class="relative h-72 overflow-hidden">
                            <img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="${maker.avatar_url}" alt="${maker.full_name}" />
                            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                            ${maker.badge ? `<span class="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">${maker.badge}</span>` : ''}
                            <div class="absolute bottom-4 left-4 text-white">
                                <p class="text-xs font-medium opacity-90 mb-1">${maker.specialty}</p>
                                <h3 class="text-xl font-bold">${maker.full_name}</h3>
                            </div>
                        </div>
                        <div class="p-6">
                            <p class="text-sm text-gray-500 mb-4 line-clamp-3 leading-relaxed">${maker.bio}</p>
                            <div class="flex items-center justify-between border-t border-gray-100 pt-4">
                                <div class="flex items-center gap-1">
                                    <span class="text-yellow-400 material-icons text-sm">star</span>
                                    <span class="font-bold text-gray-900">${maker.rating}</span>
                                </div>
                                <span class="text-xs text-gray-400 font-medium">Ejemplo</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Call to Action -->
            <div class="mt-20 text-center bg-primary/5 rounded-3xl p-12 border border-primary/10">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">¿Buscas un experto para tu proyecto?</h2>
                <p class="text-gray-600 mb-8 max-w-xl mx-auto">Regístrate como cliente para acceder a nuestra red completa de confeccionistas, ver perfiles detallados y gestionar tus pedidos.</p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="/login" class="px-8 py-3 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                        Iniciar Sesión
                    </a>
                    <a href="/login?register=true" class="px-8 py-3 rounded-full bg-white text-gray-900 border border-gray-200 font-bold hover:bg-gray-50 transition-colors">
                        Crear Cuenta
                    </a>
                </div>
            </div>
        </div>
    </div>
    `;
}
