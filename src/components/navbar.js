import { getCurrentUser, signOut } from '../js/auth.js';
import { supabase } from '../js/supabase.js';
import { getLogo } from './logo.js';

export async function Navbar() {
    return `
    <header class="py-6 bg-background-light border-b border-gray-100">
        <div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between">
                <!-- Logo -->
                <div class="flex items-center">
                    <a href="/" class="flex items-center hover:opacity-80 transition-opacity">
                        ${getLogo({ width: "140", height: "40" })}
                    </a>
                </div>

                <!-- Navigation Links (Center) -->
                <nav class="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
                    <a href="/" class="hover:text-primary transition-colors" data-link>Inicio</a>
                    <a href="/makers" class="hover:text-primary transition-colors" data-link>Confeccionistas</a>
                    <a href="/designer" class="hover:text-primary transition-colors" data-link>Diseñar</a>
                    <a href="/login" class="hover:text-primary transition-colors" data-link>Ingresar</a>
                </nav>

                <!-- Icons (Right) -->
                <div class="flex items-center space-x-4 text-gray-600">
                    <button class="hover:text-primary transition-colors">
                        <span class="material-icons">search</span>
                    </button>
                    <a href="/login" class="hover:text-primary transition-colors" data-link>
                        <span class="material-icons">person_outline</span>
                    </a>
                    <button class="flex items-center space-x-1 hover:text-primary transition-colors">
                        <span class="material-icons">shopping_bag</span>
                        <span class="text-sm font-medium">(0)</span>
                    </button>
                </div>
            </div>
        </div>
    </header>
    `;
}
