import { supabase } from '../js/supabase.js';

export async function MakersPage() {
    // Fetch makers
    const { data: makers, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'maker');

    if (error) {
        return `<div class="pt-24 text-center text-red-500">Error al cargar confeccionistas: ${error.message}</div>`;
    }

    if (!makers || makers.length === 0) {
        return `
        <div class="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-8">Nuestros Confeccionistas</h1>
            <div class="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
                <div class="text-6xl mb-4">🧵</div>
                <h3 class="text-xl font-medium text-gray-900">Aún no hay confeccionistas registrados</h3>
                <p class="mt-2 text-gray-500">¡Sé el primero en unirte a nuestra red de profesionales!</p>
                <a href="/login" class="mt-6 inline-block border-2 border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition" data-link>
                    Registrarme como Confeccionista
                </a>
            </div>
        </div>
        `;
    }

    const makersHtml = makers.map(maker => `
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col">
            <div class="h-32 bg-gradient-to-r from-red-500 to-primary"></div>
            <div class="p-6 flex-1 flex flex-col">
                <div class="-mt-16 mb-4">
                    <div class="h-24 w-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                        ${maker.avatar_url
            ? `<img src="${maker.avatar_url}" alt="${maker.full_name}" class="h-full w-full object-cover">`
            : `<div class="h-full w-full flex items-center justify-center text-2xl">👤</div>`
        }
                    </div>
                </div>
                
                <h3 class="text-xl font-bold text-gray-900 mb-1">${maker.full_name || 'Confeccionista'}</h3>
                <p class="text-sm text-primary font-medium mb-4">${maker.plan === 'pro' ? '⭐ Pro Maker' : 'Confeccionista Verificado'}</p>
                
                <p class="text-gray-600 text-sm mb-6 flex-1">
                    ${maker.bio || 'Especialista en confección de prendas personalizadas de alta calidad.'}
                </p>

                <button class="w-full bg-white border-2 border-primary text-primary py-2 rounded-lg font-semibold hover:bg-primary hover:text-white transition">
                    Ver Perfil
                </button>
            </div>
        </div>
    `).join('');

    return `
    <div class="pt-24 pb-12 bg-gray-50 min-h-screen">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-end mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">Confeccionistas</h1>
                    <p class="text-gray-600 mt-2">Encuentra al experto ideal para tu proyecto.</p>
                </div>
                <!-- Filter placeholder -->
                <div class="hidden md:block">
                    <select class="border-gray-300 rounded-md text-sm shadow-sm focus:border-primary focus:ring-primary">
                        <option>Todos los niveles</option>
                        <option>Premium</option>
                        <option>Pro</option>
                    </select>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                ${makersHtml}
            </div>
        </div>
    </div>
    `;
}
