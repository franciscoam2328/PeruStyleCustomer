export function DesignerPage() {
    return `
    <div class="min-h-screen bg-background-light font-display">
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
                <span class="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Tecnología 3D</span>
                <h1 class="text-4xl md:text-5xl font-black text-gray-900 mb-6">Diseña tu Prenda Ideal</h1>
                <p class="text-gray-500 max-w-2xl mx-auto text-lg">Nuestra herramienta de diseño 3D te permite visualizar cada detalle antes de confeccionar. Experimenta con colores, texturas y estilos en tiempo real.</p>
            </div>

            <!-- Showcase Content -->
            <div class="flex flex-col lg:flex-row gap-12 items-center mb-20">
                <!-- Left: Static Preview -->
                <div class="w-full lg:w-1/2">
                    <div class="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-gray-100 aspect-square group">
                        <!-- Static Image Placeholder (Simulating 3D View) -->
                        <img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800" alt="3D Design Preview" class="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700">
                        
                        <!-- Overlay UI Elements (Fake Interface) -->
                        <div class="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/50">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-xs font-bold text-gray-500 uppercase">Vista Previa</span>
                                <span class="text-xs font-bold text-primary">Modo Edición</span>
                            </div>
                            <div class="flex gap-2">
                                <div class="w-8 h-8 rounded-full bg-red-500 border-2 border-white shadow-sm"></div>
                                <div class="w-8 h-8 rounded-full bg-blue-500 border-2 border-white shadow-sm"></div>
                                <div class="w-8 h-8 rounded-full bg-black border-2 border-white shadow-sm"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right: Steps & Info -->
                <div class="w-full lg:w-1/2 space-y-8">
                    <div class="flex gap-4">
                        <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">1</div>
                        <div>
                            <h3 class="text-xl font-bold text-gray-900 mb-2">Elige tu Base</h3>
                            <p class="text-gray-600">Comienza seleccionando el tipo de prenda: polo, polera, casaca o camisa. Tenemos moldes base optimizados para la confección.</p>
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">2</div>
                        <div>
                            <h3 class="text-xl font-bold text-gray-900 mb-2">Personaliza Estilo</h3>
                            <p class="text-gray-600">Ajusta colores, cambia texturas (algodón, denim, cuero) y visualiza cómo la luz interactúa con los materiales.</p>
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">3</div>
                        <div>
                            <h3 class="text-xl font-bold text-gray-900 mb-2">Define Medidas</h3>
                            <p class="text-gray-600">Ingresa tus medidas exactas para asegurar un ajuste perfecto. La prenda se confeccionará siguiendo estas especificaciones.</p>
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">4</div>
                        <div>
                            <h3 class="text-xl font-bold text-gray-900 mb-2">Envía a Confección</h3>
                            <p class="text-gray-600">Guarda tu diseño y compártelo directamente con nuestros confeccionistas verificados para recibir cotizaciones.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Call to Action -->
            <div class="text-center bg-gray-900 rounded-3xl p-12 text-white relative overflow-hidden">
                <div class="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div class="relative z-10">
                    <h2 class="text-3xl font-bold mb-4">¿Listo para crear?</h2>
                    <p class="text-gray-400 mb-8 max-w-xl mx-auto">Únete a PeruStyle hoy mismo y accede a nuestra herramienta de diseño completa.</p>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/login" class="px-8 py-3 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                            Iniciar Sesión
                        </a>
                        <a href="/login?register=true" class="px-8 py-3 rounded-full bg-white/10 text-white border border-white/20 font-bold hover:bg-white/20 transition-colors">
                            Crear Cuenta Gratis
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}
