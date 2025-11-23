import { supabase } from '../js/supabase.js';
import { getCurrentUser } from '../js/auth.js';

export async function MakerPortfolioPage() {
    const user = await getCurrentUser();
    if (!user) { window.location.href = '/login'; return ''; }

    // Fetch profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    const portfolio = profile.portfolio || [];

    // Setup listeners
    setTimeout(() => {
        setupPortfolioListeners(user.id, portfolio);
    }, 0);

    return `
    <div class="flex min-h-screen w-full bg-background-dark font-display text-text-beige">
        ${renderSidebar(profile)}
        <main class="flex-1 p-8 overflow-y-auto">
            <div class="max-w-6xl mx-auto">
                <div class="flex justify-between items-center mb-8">
                    <div>
                        <h1 class="text-3xl font-black text-white mb-2">Mi Portafolio</h1>
                        <p class="text-text-beige-muted">Muestra tus mejores trabajos para atraer clientes.</p>
                    </div>
                    <button id="btn-add-photo" class="px-6 py-3 rounded-lg bg-accent-gold text-black font-bold hover:bg-accent-gold/90 transition-colors flex items-center gap-2">
                        <span class="material-symbols-outlined">add_a_photo</span>
                        Subir Foto
                    </button>
                </div>

                <!-- Gallery Grid -->
                <div id="portfolio-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${portfolio.length > 0 ? portfolio.map((item, index) => renderPortfolioItem(item, index)).join('') : `
                        <div class="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-xl bg-white/5">
                            <span class="material-symbols-outlined text-6xl text-gray-600 mb-4">photo_library</span>
                            <p class="text-gray-400 text-lg">Tu portafolio está vacío.</p>
                            <p class="text-sm text-gray-500">Sube fotos de tus confecciones pasadas.</p>
                        </div>
                    `}
                </div>
            </div>

            <!-- Upload Modal -->
            <div id="modal-upload" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 hidden backdrop-blur-sm">
                <div class="bg-card-dark p-6 rounded-xl border border-white/10 max-w-md w-full">
                    <h3 class="text-xl font-bold text-white mb-4">Agregar al Portafolio</h3>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-bold text-gray-400 mb-2">Foto</label>
                        <input type="file" id="portfolio-file" accept="image/*" class="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white">
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-bold text-gray-400 mb-2">Título</label>
                        <input type="text" id="portfolio-title" class="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-accent-gold outline-none" placeholder="Ej: Vestido de Gala Rojo">
                    </div>

                    <div class="mb-6">
                        <label class="block text-sm font-bold text-gray-400 mb-2">Descripción (Opcional)</label>
                        <textarea id="portfolio-desc" rows="2" class="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-accent-gold outline-none"></textarea>
                    </div>

                    <div class="flex justify-end gap-3">
                        <button class="close-modal px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
                        <button id="submit-upload" class="px-6 py-2 bg-accent-gold text-black rounded-lg font-bold hover:bg-accent-gold/90">Guardar</button>
                    </div>
                </div>
            </div>

        </main>
    </div>
    `;
}

function renderPortfolioItem(item, index) {
    return `
        <div class="group relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-800 border border-white/5">
            <img src="${item.url}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                <h3 class="text-white font-bold text-lg">${item.title}</h3>
                <p class="text-sm text-gray-300 line-clamp-2">${item.description || ''}</p>
                <button class="btn-delete-photo absolute top-4 right-4 p-2 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors" data-index="${index}">
                    <span class="material-symbols-outlined text-lg">delete</span>
                </button>
            </div>
        </div>
    `;
}

function renderSidebar(profile) {
    // Reusing sidebar again (should be componentized)
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
                <a class="relative flex items-center gap-4 rounded-lg bg-accent-gold/10 px-4 py-2.5 text-sm font-bold text-accent-gold shadow-gold-glow-soft" href="/maker-portfolio">
                    <span class="absolute left-0 h-6 w-1 rounded-r-full bg-accent-gold"></span>
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

function setupPortfolioListeners(userId, currentPortfolio) {
    // Modal Logic
    const modal = document.getElementById('modal-upload');
    document.getElementById('btn-add-photo').addEventListener('click', () => {
        modal.classList.remove('hidden');
    });
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => modal.classList.add('hidden'));
    });

    // Upload Logic
    document.getElementById('submit-upload').addEventListener('click', async () => {
        const fileInput = document.getElementById('portfolio-file');
        const title = document.getElementById('portfolio-title').value;
        const desc = document.getElementById('portfolio-desc').value;
        const file = fileInput.files[0];

        if (!file || !title) return alert('Selecciona una foto y un título.');

        const btn = document.getElementById('submit-upload');
        btn.innerText = 'Subiendo...';
        btn.disabled = true;

        // Upload to Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
            .from('portfolio')
            .upload(fileName, file);

        if (uploadError) {
            console.error(uploadError);
            alert('Error al subir imagen.');
            btn.innerText = 'Guardar';
            btn.disabled = false;
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('portfolio')
            .getPublicUrl(fileName);

        // Update Profile JSONB
        const newItem = { url: publicUrl, title, description: desc };
        const newPortfolio = [...currentPortfolio, newItem];

        const { error: dbError } = await supabase
            .from('profiles')
            .update({ portfolio: newPortfolio })
            .eq('id', userId);

        if (dbError) {
            console.error(dbError);
            alert('Error al guardar en base de datos.');
        } else {
            window.location.reload();
        }
    });

    // Delete Logic
    document.querySelectorAll('.btn-delete-photo').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (!confirm('¿Eliminar esta foto?')) return;
            const index = parseInt(btn.dataset.index);

            const newPortfolio = currentPortfolio.filter((_, i) => i !== index);

            const { error } = await supabase
                .from('profiles')
                .update({ portfolio: newPortfolio })
                .eq('id', userId);

            if (!error) window.location.reload();
        });
    });
}
