import { supabase } from '../js/supabase.js';
import { getCurrentUser } from '../js/auth.js';

export async function NotificationsPage() {
    const user = await getCurrentUser();
    if (!user) { window.location.href = '/login'; return ''; }

    // Fetch profile to determine sidebar
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    // Fetch notifications
    const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Mark all as read on load (simple approach)
    if (notifications && notifications.length > 0) {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);
    }

    return `
    <div class="flex min-h-screen w-full bg-background-dark font-display text-text-beige">
        ${profile.role === 'maker' ? renderMakerSidebar(profile) : renderClientSidebar(profile)}
        <main class="flex-1 p-8 overflow-y-auto">
            <div class="max-w-4xl mx-auto">
                <div class="flex justify-between items-center mb-8">
                    <h1 class="text-3xl font-black text-white">Notificaciones</h1>
                    <button class="text-sm text-accent-gold hover:underline">Marcar todo como leído</button>
                </div>

                <div class="space-y-4">
                    ${notifications && notifications.length > 0 ? notifications.map(n => renderNotificationItem(n)).join('') : `
                        <div class="text-center py-20 border-2 border-dashed border-white/5 rounded-xl bg-white/5">
                            <span class="material-symbols-outlined text-6xl text-gray-600 mb-4">notifications_off</span>
                            <p class="text-gray-400">No tienes notificaciones nuevas.</p>
                        </div>
                    `}
                </div>
            </div>
        </main>
    </div>
    `;
}

function renderNotificationItem(n) {
    const iconMap = {
        'info': 'info',
        'success': 'check_circle',
        'warning': 'warning',
        'error': 'error'
    };
    const colorMap = {
        'info': 'text-blue-400 bg-blue-400/10',
        'success': 'text-green-400 bg-green-400/10',
        'warning': 'text-yellow-400 bg-yellow-400/10',
        'error': 'text-red-400 bg-red-400/10'
    };

    return `
        <div class="bg-card-dark border border-white/10 rounded-xl p-4 flex gap-4 hover:bg-white/5 transition-colors ${n.is_read ? 'opacity-70' : 'border-l-4 border-l-accent-gold'}">
            <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorMap[n.type] || colorMap['info']}">
                <span class="material-symbols-outlined">${iconMap[n.type] || 'notifications'}</span>
            </div>
            <div class="flex-1">
                <h3 class="text-white font-bold text-sm mb-1">${n.title}</h3>
                <p class="text-gray-400 text-sm mb-2">${n.content}</p>
                <span class="text-xs text-gray-600">${new Date(n.created_at).toLocaleString()}</span>
            </div>
            ${n.link ? `
                <a href="${n.link}" class="self-center px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors">
                    Ver
                </a>
            ` : ''}
        </div>
    `;
}

function renderMakerSidebar(profile) {
    return `
    <nav class="w-64 flex-shrink-0 bg-sidebar-dark border-r border-white/5 p-4 flex flex-col justify-between hidden md:flex">
        <div class="flex flex-col gap-4">
            <div class="flex items-center gap-3 p-2">
                <div class="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center overflow-hidden border border-accent-gold/30">
                    ${profile.avatar_url ? `<img src="${profile.avatar_url}" class="w-full h-full object-cover">` : '<span class="material-symbols-outlined text-accent-gold">checkroom</span>'}
                </div>
                <div class="flex flex-col">
                    <h1 class="text-white text-sm font-bold leading-normal">${profile.full_name || 'Confeccionista'}</h1>
                    <p class="text-accent-gold text-xs font-medium uppercase tracking-wider">${profile.plan || 'Free'}</p>
                </div>
            </div>
            <div class="flex flex-col gap-1">
                <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-gold hover:bg-white/5" href="/maker-dashboard">
                    <span class="material-symbols-outlined text-xl">dashboard</span>
                    Dashboard
                </a>
                <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-gold hover:bg-white/5" href="/maker-orders">
                    <span class="material-symbols-outlined text-xl">inventory_2</span>
                    Pedidos
                </a>
                <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-gold hover:bg-white/5" href="/maker-profile-edit">
                    <span class="material-symbols-outlined text-xl">person_edit</span>
                    Mi Perfil
                </a>
                <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-gold hover:bg-white/5" href="/maker-portfolio">
                    <span class="material-symbols-outlined text-xl">photo_library</span>
                    Portafolio
                </a>
                <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-gold hover:bg-white/5" href="/chat">
                    <span class="material-symbols-outlined text-xl">chat</span>
                    Mensajes
                </a>
            </div>
        </div>
        <div class="flex flex-col gap-1">
            <a class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-text-beige-muted hover:text-accent-copper" href="/logout" id="logout-btn">
                <span class="material-symbols-outlined">logout</span>
                <p class="text-sm font-medium leading-normal">Cerrar sesión</p>
            </a>
        </div>
    </nav>
    `;
}

function renderClientSidebar(profile) {
    return `
    <aside class="flex w-64 flex-col gap-8 border-r border-border-color/50 bg-panel/80 p-4 backdrop-blur-xl hidden md:flex">
        <div class="flex items-center gap-3 px-3">
            <span class="text-primary text-3xl font-black">P</span>
            <h1 class="text-text-primary text-xl font-bold">PeruStyle</h1>
        </div>
        <nav class="flex h-full flex-col justify-between">
            <div class="flex flex-col gap-2">
                <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors" href="/client-dashboard">
                    <span class="material-symbols-outlined">dashboard</span>
                    <p class="text-sm font-medium">Dashboard / Inicio</p>
                </a>
                <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors" href="/my-designs">
                    <span class="material-symbols-outlined">design_services</span>
                    <p class="text-sm font-medium">Mis Diseños</p>
                </a>
                <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors" href="/orders">
                    <span class="material-symbols-outlined">inventory_2</span>
                    <p class="text-sm font-medium">Mis Pedidos</p>
                </a>
                <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors" href="/makers">
                    <span class="material-symbols-outlined">store</span>
                    <p class="text-sm font-medium">Explorar</p>
                </a>
                <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors" href="/chat">
                    <span class="material-symbols-outlined">chat</span>
                    <p class="text-sm font-medium">Chat</p>
                </a>
                <a class="relative flex items-center gap-3 rounded-lg bg-primary/20 px-3 py-2 text-primary shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-colors" href="/notifications">
                    <span class="material-symbols-outlined fill" style="font-variation-settings: 'FILL' 1;">notifications</span>
                    <p class="text-sm font-bold">Notificaciones</p>
                </a>
            </div>
            <div class="flex flex-col">
                <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors" href="/logout" id="logout-btn">
                    <span class="material-symbols-outlined">logout</span>
                    <p class="text-sm font-medium">Cerrar sesión</p>
                </a>
            </div>
        </nav>
    </aside>
    `;
}
