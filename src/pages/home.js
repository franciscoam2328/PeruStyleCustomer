export function HomePage() {
    return `
    <div class="bg-background-dark text-text-beige min-h-screen">
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

        <!-- Showcase -->
        <section class="py-20 px-4">
            <div class="max-w-7xl mx-auto">
                <div class="max-w-3xl mx-auto text-center mb-12">
                    <h2 class="text-3xl md:text-4xl font-bold text-text-beige mb-4">De la Idea a la Realidad</h2>
                    <p class="text-text-muted">
                        Explora cómo tus conceptos cobran vida a través de nuestra plataforma.
                    </p>
                </div>
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="aspect-square">
                        <img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400" alt="Diseño 3D" class="w-full h-full object-cover rounded-xl">
                    </div>
                    <div class="aspect-square">
                        <img src="https://images.unsplash.com/photo-1558769132-cb1aea3c8565?w=400" alt="Taller" class="w-full h-full object-cover rounded-xl">
                    </div>
                    <div class="aspect-square">
                        <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400" alt="Modelo" class="w-full h-full object-cover rounded-xl">
                    </div>
                    <div class="aspect-square">
                        <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400" alt="Interfaz" class="w-full h-full object-cover rounded-xl">
                    </div>
                </div>
            </div>
        </section>

        <!-- Pricing -->
        <section class="py-20 px-4 bg-card-dark/30" id="pricing">
            <div class="max-w-7xl mx-auto">
                <div class="max-w-3xl mx-auto text-center mb-12">
                    <h2 class="text-3xl md:text-4xl font-bold text-text-beige mb-4">Planes para cada necesidad</h2>
                    <p class="text-text-muted">
                        Elige el plan que mejor se adapte a tu proyecto, ya seas diseñador o confeccionista.
                    </p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Básico -->
                    <div class="bg-card-dark/50 backdrop-blur-lg border border-accent-gold/20 rounded-xl p-6">
                        <h3 class="text-lg font-bold text-text-beige">Básico</h3>
                        <p class="text-text-muted text-sm mt-1">Ideal para empezar.</p>
                        <p class="text-4xl font-black text-text-beige mt-4">Gratis</p>
                        <ul class="mt-6 space-y-3 text-text-muted text-sm">
                            <li class="flex items-center gap-2">
                                <span class="text-accent-gold">✓</span>
                                2 Diseños 3D
                            </li>
                            <li class="flex items-center gap-2">
                                <span class="text-accent-gold">✓</span>
                                Chat con confeccionistas
                            </li>
                            <li class="flex items-center gap-2">
                                <span class="text-accent-gold">✓</span>
                                Enviar pedidos
                            </li>
                        </ul>
                        <a href="/login" class="mt-8 block w-full text-center rounded-lg bg-transparent border-2 border-primary py-2.5 text-sm font-bold text-primary hover:bg-primary hover:text-background-dark transition-all">
                            Empezar ahora
                        </a>
                    </div>

                    <!-- Premium -->
                    <div class="relative bg-card-dark border-2 border-primary rounded-xl p-6">
                        <p class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-3 py-1 text-xs font-bold text-background-dark">
                            MÁS POPULAR
                        </p>
                        <h3 class="text-lg font-bold text-text-beige">Premium</h3>
                        <p class="text-text-muted text-sm mt-1">Para profesionales.</p>
                        <p class="text-4xl font-black text-text-beige mt-4">$9.99<span class="text-base font-medium text-text-muted">/mes</span></p>
                        <ul class="mt-6 space-y-3 text-text-muted text-sm">
                            <li class="flex items-center gap-2">
                                <span class="text-accent-gold">✓</span>
                                10 Diseños 3D
                            </li>
                            <li class="flex items-center gap-2">
                                <span class="text-accent-gold">✓</span>
                                Opciones avanzadas
                            </li>
                            <li class="flex items-center gap-2">
                                <span class="text-accent-gold">✓</span>
                                Prioridad en mensajes
                            </li>
                        </ul>
                        <a href="/plans" class="mt-8 block w-full text-center rounded-lg bg-primary py-2.5 text-sm font-bold text-background-dark hover:scale-105 transition-transform">
                            Empezar ahora
                        </a>
                    </div>

                    <!-- Pro -->
                    <div class="bg-card-dark/50 backdrop-blur-lg border border-accent-gold/20 rounded-xl p-6">
                        <h3 class="text-lg font-bold text-text-beige">Pro</h3>
                        <p class="text-text-muted text-sm mt-1">Para equipos y marcas.</p>
                        <p class="text-4xl font-black text-text-beige mt-4">$19.99<span class="text-base font-medium text-text-muted">/mes</span></p>
                        <ul class="mt-6 space-y-3 text-text-muted text-sm">
                            <li class="flex items-center gap-2">
                                <span class="text-accent-gold">✓</span>
                                Diseños ilimitados
                            </li>
                            <li class="flex items-center gap-2">
                                <span class="text-accent-gold">✓</span>
                                Herramientas avanzadas
                            </li>
                            <li class="flex items-center gap-2">
                                <span class="text-accent-gold">✓</span>
                                Respuesta garantizada
                            </li>
                        </ul>
                        <a href="/plans" class="mt-8 block w-full text-center rounded-lg bg-transparent border-2 border-primary py-2.5 text-sm font-bold text-primary hover:bg-primary hover:text-background-dark transition-all">
                            Empezar ahora
                        </a>
                    </div>
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
    </div>
    `;
}
