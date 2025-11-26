import { supabase } from '../js/supabase.js';
import { getCurrentUser, signOut } from '../js/auth.js';
import { getLogo } from '../components/logo.js';

export async function MakerPortfolioPage() {
    const user = await getCurrentUser();
    if (!user) { window.location.href = '/login'; return ''; }

    // Fetch profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Fetch portfolio from table
    const { data: portfolio } = await supabase
        .from('portfolio')
        .select('*')
        .eq('maker_id', user.id)
        .order('created_at', { ascending: false });

    const portfolioItems = portfolio || [];

    // Setup listeners
    setTimeout(() => {
        setupPortfolioListeners(user.id, portfolioItems);

        // Logout handler
        document.getElementById('logout-btn')?.addEventListener('click', async () => {
            await signOut();
            window.location.href = '/login';
        });
    }, 0);

    return `
    <div class="flex min-h-screen w-full bg-base font-display text-on-surface">
        <!-- Sidebar -->
        <aside class="w-64 flex-shrink-0 bg-base border-r border-surface/50 p-4 flex flex-col justify-between hidden md:flex sticky top-0 h-screen z-20">
            <div class="flex flex-col gap-8">
                <div class="px-3 flex justify-center">
                    <a href="/maker-dashboard">
                        ${getLogo({ width: "160", height: "45" })}
                    </a>
                </div>
                
                <nav class="flex flex-col gap-2">
                    <a href="/maker-dashboard" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">dashboard</span>
                        <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Dashboard</p>
                    </a>
                    <a href="/maker-orders" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">inventory_2</span>
                        <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Pedidos</p>
                    </a>
                    <a href="/maker-profile" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">person</span>
                        <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Mi Perfil</p>
                    </a>
                    <a href="/maker-portfolio" class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface hover:bg-primary/20 transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl group-hover:text-primary transition-colors">photo_library</span>
                        <p class="text-on-surface text-sm font-medium">Portafolio</p>
                    </a>
                    <a href="/chat" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">chat_bubble_outline</span>
                        <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Chat</p>
                    </a>
                    <a href="/maker-plans" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">workspace_premium</span>
                        <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Mi Suscripción</p>
                    </a>
                </nav>
            </div>
            <div class="flex flex-col gap-1">
                <button id="logout-btn" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group text-left w-full">
                    <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-red-500 transition-colors">logout</span>
                    <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Cerrar sesión</p>
                </button>
            </div>
        </aside>

        <main class="flex-1 p-8 overflow-y-auto">
            <div class="max-w-6xl mx-auto">
                <!-- Header -->
                <header class="flex justify-between items-center mb-8 bg-surface p-4 rounded-xl border border-white/10 shadow-sm">
                    <div>
                        <h1 class="text-3xl font-black text-on-surface mb-1">Mi Portafolio</h1>
                        <p class="text-on-surface/60">Muestra tus mejores trabajos para atraer clientes.</p>
                    </div>
                    <div class="flex items-center gap-6">
                        <button id="btn-add-photo" class="px-6 py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20">
                            <span class="material-symbols-outlined">add_a_photo</span>
                            Subir Foto
                        </button>
                        <div class="flex items-center gap-3 border-l border-white/10 pl-6">
                            <div class="bg-gradient-to-br from-primary to-secondary rounded-full w-10 h-10 flex items-center justify-center text-white font-bold shadow-md overflow-hidden">
                                ${profile.avatar_url ? `<img src="${profile.avatar_url}" class="w-full h-full object-cover">` : (profile.full_name || 'M')[0].toUpperCase()}
                            </div>
                            <div class="flex flex-col text-right hidden sm:flex">
                                <h2 class="text-base font-semibold text-on-surface leading-tight">${profile.full_name || 'Confeccionista'}</h2>
                                <p class="text-primary text-sm font-medium leading-tight uppercase">Plan ${profile.plan || 'Free'}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <!-- Gallery Grid -->
                <div id="portfolio-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${portfolioItems.length > 0 ? portfolioItems.map((item) => renderPortfolioItem(item)).join('') : `
                        <div class="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-xl bg-surface">
                            <span class="material-symbols-outlined text-6xl text-on-surface/40 mb-4">photo_library</span>
                            <p class="text-on-surface/60 text-lg">Tu portafolio está vacío.</p>
                            <p class="text-sm text-on-surface/40">Sube fotos de tus confecciones pasadas.</p>
                        </div>
                    `}
                </div>
            </div>

            <!-- Upload Modal -->
            <div id="modal-upload" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 hidden backdrop-blur-sm">
                <div class="bg-surface p-6 rounded-xl border border-white/10 max-w-md w-full shadow-2xl">
                    <h3 class="text-xl font-bold text-on-surface mb-4">Agregar al Portafolio</h3>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-bold text-on-surface/60 mb-2">Foto</label>
                        <input type="file" id="portfolio-file" accept="image/*" class="w-full bg-base border border-white/10 rounded-lg p-2 text-on-surface">
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-bold text-on-surface/60 mb-2">Título</label>
                        <input type="text" id="portfolio-title" class="w-full bg-base border border-white/10 rounded-lg p-3 text-on-surface focus:border-primary outline-none transition-colors" placeholder="Ej: Vestido de Gala Rojo">
                    </div>

                    <div class="mb-6">
                        <label class="block text-sm font-bold text-on-surface/60 mb-2">Descripción (Opcional)</label>
                        <textarea id="portfolio-desc" rows="2" class="w-full bg-base border border-white/10 rounded-lg p-3 text-on-surface focus:border-primary outline-none transition-colors"></textarea>
                    </div>

                    <div class="flex justify-end gap-3">
                        <button class="close-modal px-4 py-2 text-on-surface/60 hover:text-on-surface transition-colors">Cancelar</button>
                        <button id="submit-upload" class="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">Guardar</button>
                    </div>
                </div>
            </div>

        </main>
    </div>
    `;
}

function renderPortfolioItem(item) {
    return `
        <div class="group relative aspect-[3/4] rounded-xl overflow-hidden bg-surface border border-white/10">
            <img src="${item.image_url}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                <h3 class="text-white font-bold text-lg">${item.title || 'Sin título'}</h3>
                <p class="text-sm text-gray-300 line-clamp-2">${item.description || ''}</p>
                <button class="btn-delete-photo absolute top-4 right-4 p-2 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors" data-id="${item.id}">
                    <span class="material-symbols-outlined text-lg">delete</span>
                </button>
            </div>
        </div>
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
        // Use 'designs' bucket if 'portfolio' doesn't exist, or ensure 'portfolio' bucket is created
        // For now, let's try 'portfolio' as per previous code, but handle error
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
            .from('portfolio')
            .upload(fileName, file);

        if (uploadError) {
            console.error(uploadError);
            // Fallback to 'designs' bucket if portfolio fails (common issue if bucket missing)
            if (uploadError.message.includes('Bucket not found')) {
                alert('Error: El bucket "portfolio" no existe. Por favor contacta soporte.');
            } else {
                alert('Error al subir imagen: ' + uploadError.message);
            }
            btn.innerText = 'Guardar';
            btn.disabled = false;
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('portfolio')
            .getPublicUrl(fileName);

        // Insert into Portfolio Table
        const { error: dbError } = await supabase
            .from('portfolio')
            .insert({
                maker_id: userId,
                image_url: publicUrl,
                title: title,
                description: desc
            });

        if (dbError) {
            console.error(dbError);
            alert('Error al guardar en base de datos.');
            btn.innerText = 'Guardar';
            btn.disabled = false;
        } else {
            window.location.reload();
        }
    });

    // Delete Logic
    document.querySelectorAll('.btn-delete-photo').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (!confirm('¿Eliminar esta foto?')) return;
            const id = btn.dataset.id;

            const { error } = await supabase
                .from('portfolio')
                .delete()
                .eq('id', id);

            if (!error) window.location.reload();
            else alert('Error al eliminar.');
        });
    });
}
