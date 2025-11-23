// Sidebar rendering functions for Chat page
function renderMakerSidebar(profile) {
    return `
    <aside class="flex w-64 flex-col bg-p-sidebar p-4 border-r border-white/5">
        <div class="mb-8 flex items-center gap-3">
            <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style="background-image: url('${profile.avatar_url || ''}'); background-color: rgba(212,175,55,0.2);">
                ${!profile.avatar_url ? '<span class="material-symbols-outlined text-a-gold">checkroom</span>' : ''}
            </div>
            <div class="flex flex-col">
                <h1 class="text-base font-medium leading-normal text-white">${profile.full_name || 'Confeccionista'}</h1>
                <p class="text-sm font-normal leading-normal text-a-gold uppercase">${profile.plan || 'Free'}</p>
            </div>
        </div>
        <nav class="flex flex-1 flex-col gap-2">
            <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-a-beige hover:bg-p-panel hover:text-a-gold transition-colors" href="/maker-dashboard">
                <span class="material-symbols-outlined text-2xl">dashboard</span>
                <p class="text-sm font-medium leading-normal">Dashboard</p>
            </a>
            <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-a-beige hover:bg-p-panel hover:text-a-gold transition-colors" href="/maker-orders">
                <span class="material-symbols-outlined text-2xl">inventory_2</span>
                <p class="text-sm font-medium leading-normal">Pedidos</p>
            </a>
            <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-a-beige hover:bg-p-panel hover:text-a-gold transition-colors" href="/maker-profile-edit">
                <span class="material-symbols-outlined text-2xl">person_edit</span>
                <p class="text-sm font-medium leading-normal">Mi Perfil</p>
            </a>
            <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-a-beige hover:bg-p-panel hover:text-a-gold transition-colors" href="/maker-portfolio">
                <span class="material-symbols-outlined text-2xl">photo_library</span>
                <p class="text-sm font-medium leading-normal">Portafolio</p>
            </a>
            <a class="flex items-center gap-3 rounded-lg bg-a-copper/20 px-3 py-2 text-a-gold shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-colors" href="/chat">
                <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">chat_bubble</span>
                <p class="text-sm font-medium leading-normal">Chat</p>
            </a>
        </nav>
        <div class="mt-auto">
            <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-a-beige hover:bg-p-panel hover:text-a-gold transition-colors" href="/logout" id="logout-btn">
                <span class="material-symbols-outlined text-2xl">logout</span>
                <p class="text-sm font-medium leading-normal">Cerrar sesión</p>
            </a>
        </div>
    </aside>
    `;
}

function renderClientSidebar(profile) {
    return `
    <aside class="flex w-64 flex-col bg-p-sidebar p-4 border-r border-white/5">
        <div class="mb-8 flex items-center gap-3">
            <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-primary/20 flex items-center justify-center text-primary font-bold">
                ${profile.avatar_url ? `<img src="${profile.avatar_url}" class="w-full h-full rounded-full object-cover">` : 'U'}
            </div>
            <div class="flex flex-col">
                <h1 class="text-base font-medium leading-normal text-white">PeruStyle</h1>
                <p class="text-sm font-normal leading-normal text-a-gray">Customer Dashboard</p>
            </div>
        </div>
        <nav class="flex flex-1 flex-col gap-2">
            <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-a-beige hover:bg-p-panel hover:text-a-gold transition-colors" href="/client-dashboard">
                <span class="material-symbols-outlined text-2xl">dashboard</span>
                <p class="text-sm font-medium leading-normal">Dashboard / Inicio</p>
            </a>
            <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-a-beige hover:bg-p-panel hover:text-a-gold transition-colors" href="/my-designs">
                <span class="material-symbols-outlined text-2xl">design_services</span>
                <p class="text-sm font-medium leading-normal">Mis Diseños</p>
            </a>
            <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-a-beige hover:bg-p-panel hover:text-a-gold transition-colors" href="/orders">
                <span class="material-symbols-outlined text-2xl">inventory_2</span>
                <p class="text-sm font-medium leading-normal">Mis Pedidos</p>
            </a>
            <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-a-beige hover:bg-p-panel hover:text-a-gold transition-colors" href="/makers">
                <span class="material-symbols-outlined text-2xl">storefront</span>
                <p class="text-sm font-medium leading-normal">Explorar</p>
            </a>
            <a class="flex items-center gap-3 rounded-lg bg-a-copper/20 px-3 py-2 text-a-gold shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-colors" href="/chat">
                <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">chat_bubble</span>
                <p class="text-sm font-medium leading-normal">Chat</p>
            </a>
            <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-a-beige hover:bg-p-panel hover:text-a-gold transition-colors" href="/profile">
                <span class="material-symbols-outlined text-2xl">person</span>
                <p class="text-sm font-medium leading-normal">Mi Perfil</p>
            </a>
            <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-a-beige hover:bg-p-panel hover:text-a-gold transition-colors" href="/plans">
                <span class="material-symbols-outlined text-2xl">credit_card</span>
                <p class="text-sm font-medium leading-normal">Mi Suscripción</p>
            </a>
        </nav>
        <div class="mt-auto">
            <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-a-beige hover:bg-p-panel hover:text-a-gold transition-colors" href="/logout" id="logout-btn">
                <span class="material-symbols-outlined text-2xl">logout</span>
                <p class="text-sm font-medium leading-normal">Cerrar sesión</p>
            </a>
        </div>
    </aside>
    `;
}
