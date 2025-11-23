import { getCurrentUser, signOut } from '../js/auth.js';
import { supabase } from '../js/supabase.js';

export function ProfilePage() {
    setTimeout(async () => {
        const user = await getCurrentUser();
        if (!user) {
            window.location.href = '/login';
            return;
        }

        // Fetch profile data
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        // Update UI with user data
        if (profile) {
            const nameElements = document.querySelectorAll('.user-name');
            const emailElements = document.querySelectorAll('.user-email');
            const avatarElements = document.querySelectorAll('.user-avatar');
            const planElements = document.querySelectorAll('.user-plan');

            nameElements.forEach(el => {
                if (el.tagName === 'INPUT') el.value = profile.full_name || '';
                else el.textContent = profile.full_name || 'Usuario';
            });
            emailElements.forEach(el => {
                if (el.tagName === 'INPUT') el.value = profile.email || user.email || '';
                else el.textContent = profile.email || user.email || '';
            });

            if (profile.avatar_url) {
                avatarElements.forEach(el => el.style.backgroundImage = `url('${profile.avatar_url}')`);
            }

            planElements.forEach(el => el.textContent = (profile.plan || 'Free').charAt(0).toUpperCase() + (profile.plan || 'free').slice(1));
        }

        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', async () => {
            await signOut();
            window.location.href = '/login';
        });

    }, 0);

    return `
    <div class="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-text-dark-primary">
        <div class="flex h-full flex-1">
            <!-- SideNavBar -->
            <aside class="flex w-64 flex-col gap-8 border-r border-border-dark/50 bg-surface-dark/30 p-4">
                <div class="flex items-center gap-3 px-3">
                    <span class="text-primary text-3xl font-black">P</span>
                    <h1 class="text-text-dark-primary text-xl font-bold">PeruStyle</h1>
                </div>
                <nav class="flex h-full flex-col justify-between">
                    <div class="flex flex-col gap-2">
                        <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-text-dark-secondary hover:bg-white/5 hover:text-secondary transition-colors" href="/client-dashboard">
                            <span class="material-symbols-outlined">dashboard</span>
                            <p class="text-sm font-medium">Dashboard / Inicio</p>
                        </a>
                        <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-text-dark-secondary hover:bg-white/5 hover:text-secondary transition-colors" href="/my-designs">
                            <span class="material-symbols-outlined">design_services</span>
                            <p class="text-sm font-medium">Mis Diseños</p>
                        </a>
                        <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-text-dark-secondary hover:bg-white/5 hover:text-secondary transition-colors" href="/orders">
                            <span class="material-symbols-outlined">inventory_2</span>
                            <p class="text-sm font-medium">Mis Pedidos</p>
                        </a>
                        <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-text-dark-secondary hover:bg-white/5 hover:text-secondary transition-colors" href="/makers">
                            <span class="material-symbols-outlined">store</span>
                            <p class="text-sm font-medium">Explorar</p>
                        </a>
                        <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-text-dark-secondary hover:bg-white/5 hover:text-secondary transition-colors" href="/chat">
                            <span class="material-symbols-outlined">chat</span>
                            <p class="text-sm font-medium">Chat</p>
                        </a>
                        <a class="group flex items-center gap-3 rounded-lg bg-primary/20 px-3 py-2 text-primary shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-colors" href="/profile">
                            <span class="material-symbols-outlined fill">person</span>
                            <p class="text-sm font-bold">Mi Perfil</p>
                        </a>
                        <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-text-dark-secondary hover:bg-white/5 hover:text-secondary transition-colors" href="/plans">
                            <span class="material-symbols-outlined">credit_card</span>
                            <p class="text-sm font-medium">Mi Suscripción</p>
                        </a>
                    </div>
                    <div class="flex flex-col">
                        <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-text-dark-secondary hover:bg-white/5 hover:text-secondary transition-colors" href="/logout" id="logout-btn">
                            <span class="material-symbols-outlined">logout</span>
                            <p class="text-sm font-medium">Cerrar sesión</p>
                        </a>
                    </div>
                </nav>
            </aside>
            <!-- Main Content -->
            <main class="flex-1 overflow-y-auto">
                <div class="p-8 md:p-12">
                    <!-- PageHeading -->
                    <header class="mb-10">
                        <h2 class="text-text-dark-primary text-4xl font-black leading-tight tracking-[-0.033em]">Mi Perfil</h2>
                        <p class="text-text-dark-secondary mt-1">Administra tu información personal y de contacto.</p>
                    </header>
                    <!-- ProfileHeader -->
                    <section class="mb-12">
                        <div class="flex w-full flex-col gap-6 rounded-xl border border-border-dark p-6 @container md:flex-row md:items-center md:justify-between glassmorphism">
                            <div class="flex items-center gap-6">
                                <div class="relative">
                                    <div class="user-avatar bg-center bg-no-repeat aspect-square bg-cover rounded-full size-24 md:size-32" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDechkmMRFJNJzsjh3LrWZtzT5dvkdCMiluAY9Evgt4hDfzsxUcnMDRmzo3Ta2lU5V96JWlARHYxK2kAzCdTX0qsvH2bDPpR7I3GZ9HuSRR86y70OfjnZfZajDk7N6zPYW-BpKmWTcO2GQxjzYXryTrMzSBTCymaE1xha0NiwA_MrYN4RAsFw8NzCjMTWO1JkzLCYyRyNdEnNEaVDiuNzFkNDQcrDvkuV1rlepZXR49Px0hPavED0UXP1I8upipvXe3BL0-dCeRRtM");'></div>
                                </div>
                                <div class="flex flex-col justify-center">
                                    <p class="user-name text-text-dark-primary text-[22px] font-bold leading-tight tracking-[-0.015em]">Cargando...</p>
                                    <p class="text-text-dark-secondary text-base font-normal leading-normal">Cliente <span class="user-plan">Free</span></p>
                                </div>
                            </div>
                            <button class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-6 bg-surface-dark text-text-dark-primary border border-border-dark text-sm font-bold leading-normal tracking-[0.015em] transition-colors hover:bg-white/5 w-full @[480px]:w-auto">
                                <span class="truncate">Cambiar foto</span>
                            </button>
                        </div>
                    </section>
                    <!-- Profile Form -->
                    <section>
                        <form class="space-y-8">
                            <div class="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                                <!-- Nombre Completo -->
                                <div>
                                    <label class="flex flex-col min-w-40 flex-1">
                                        <p class="text-text-dark-secondary text-sm font-medium leading-normal pb-2">Nombre Completo</p>
                                        <input class="user-name form-input-custom flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-dark-primary h-14 placeholder:text-text-dark-secondary p-[15px] text-base font-normal leading-normal" value=""/>
                                    </label>
                                </div>
                                <!-- Correo Electrónico -->
                                <div>
                                    <label class="flex flex-col min-w-40 flex-1">
                                        <p class="text-text-dark-secondary text-sm font-medium leading-normal pb-2">Correo Electrónico</p>
                                        <input class="user-email form-input-custom flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-dark-primary h-14 placeholder:text-text-dark-secondary p-[15px] text-base font-normal leading-normal" value=""/>
                                    </label>
                                </div>
                                <!-- Número de Teléfono -->
                                <div>
                                    <label class="flex flex-col min-w-40 flex-1">
                                        <p class="text-text-dark-secondary text-sm font-medium leading-normal pb-2">Número de Teléfono</p>
                                        <input class="form-input-custom flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-dark-primary h-14 placeholder:text-text-dark-secondary p-[15px] text-base font-normal leading-normal" value="+51 987 654 321"/>
                                    </label>
                                </div>
                                <!-- Contraseña -->
                                <div class="flex items-end">
                                    <label class="flex flex-col min-w-40 flex-1">
                                        <p class="text-text-dark-secondary text-sm font-medium leading-normal pb-2">Contraseña</p>
                                        <input class="form-input-custom flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-dark-primary h-14 placeholder:text-text-dark-secondary p-[15px] text-base font-normal leading-normal" type="password" value="••••••••••••"/>
                                    </label>
                                    <button class="ml-4 flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-6 bg-surface-dark text-text-dark-primary border border-border-dark text-sm font-medium leading-normal tracking-[0.015em] transition-colors hover:bg-white/5" type="button">
                                        <span class="truncate">Cambiar</span>
                                    </button>
                                </div>
                                <!-- Dirección de Envío -->
                                <div class="md:col-span-2">
                                    <label class="flex flex-col min-w-40 flex-1">
                                        <p class="text-text-dark-secondary text-sm font-medium leading-normal pb-2">Dirección de Envío</p>
                                        <textarea class="form-input-custom flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-dark-primary min-h-28 placeholder:text-text-dark-secondary p-[15px] text-base font-normal leading-normal">Av. Larco 123, Miraflores, Lima, Perú</textarea>
                                    </label>
                                </div>
                            </div>
                            <div class="flex justify-end pt-4">
                                <button class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-8 bg-primary text-background-dark text-base font-bold leading-normal tracking-[0.015em] transition-transform hover:scale-105">
                                    <span class="truncate">Guardar Cambios</span>
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </main>
        </div>
    </div>
    `;
}
