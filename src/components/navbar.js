import { getCurrentUser, signOut } from '../js/auth.js';
import { supabase } from '../js/supabase.js';

export async function Navbar() {
    const user = await getCurrentUser();
    let isMaker = false;

    if (user) {
        const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        isMaker = data?.role === 'maker';
    }

    // Setup logout handler globally
    if (!window.handleLogout) {
        window.handleLogout = async () => {
            await signOut();
            window.location.href = '/login';
        };
    }

    const authLink = user
        ? `<div class="flex items-center space-x-4">
             ${isMaker ? `<a href="/maker-dashboard" class="text-primary font-semibold hover:text-red-700 transition text-sm" data-link>Panel Confeccionista</a> <span class="text-gray-300">|</span>` : ''}
             <a href="/orders" class="text-gray-700 hover:text-primary transition text-sm" data-link>Mis Pedidos</a>
             <span class="text-gray-300">|</span>
             <a href="/profile" class="text-gray-700 text-sm hidden md:block hover:text-primary transition font-medium" data-link>${user.email}</a>
             <button onclick="window.handleLogout()" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition">Salir</button>
           </div>`
        : `<a href="/login" class="bg-primary text-white px-4 py-2 rounded-md hover:bg-red-700 transition" data-link>Ingresar</a>`;

    return `
    <nav class="bg-white shadow-md fixed w-full z-10 top-0">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <a href="/" class="text-2xl font-bold text-primary" data-link>PeruStyle</a>
                </div>
                <div class="hidden md:flex items-center space-x-8">
                    <a href="/" class="text-gray-700 hover:text-primary transition" data-link>Inicio</a>
                    <a href="/#design-preview" class="text-gray-700 hover:text-primary transition" data-link>Diseñar</a>
                    <a href="/#featured-makers" class="text-gray-700 hover:text-primary transition" data-link>Confeccionistas</a>
                    <a href="/#pricing" class="text-gray-700 hover:text-primary transition" data-link>Planes</a>
                    ${authLink}
                </div>
            </div>
        </div>
    </nav>
    `;
}
