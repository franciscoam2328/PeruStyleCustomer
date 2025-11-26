import { supabase } from '../js/supabase.js';
import { getCurrentUser, signOut } from '../js/auth.js';
import { getLogo } from '../components/logo.js';

export async function MakerProfileEditPage() {
    const user = await getCurrentUser();
    if (!user) { window.location.href = '/login'; return ''; }

    // Fetch profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Setup event listeners after render
    setTimeout(() => {
        setupProfileListeners(user.id, profile);

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
                    <a href="/maker-profile" class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface hover:bg-primary/20 transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl group-hover:text-primary transition-colors">person</span>
                        <p class="text-on-surface text-sm font-medium">Mi Perfil</p>
                    </a>
                    <a href="/maker-portfolio" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                        <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">photo_library</span>
                        <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Portafolio</p>
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
            <div class="max-w-4xl mx-auto">
                <!-- Header -->
                <header class="flex justify-between items-center mb-8 bg-surface p-4 rounded-xl border border-white/10 shadow-sm">
                    <div>
                        <h1 class="text-3xl font-black text-on-surface mb-1">Editar Perfil</h1>
                        <p class="text-on-surface/60">Personaliza cómo te ven los clientes en el directorio.</p>
                    </div>
                    <div class="flex items-center gap-6">
                        <button class="relative p-2 text-on-surface/80 hover:text-primary transition-colors">
                            <span class="material-symbols-outlined text-2xl">notifications</span>
                            <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
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

                <div class="bg-surface rounded-xl border border-white/10 p-8 space-y-8 shadow-lg">
                    
                    <!-- Avatar Section -->
                    <div class="flex items-center gap-6 border-b border-white/10 pb-8">
                        <div class="relative group">
                            <div class="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-primary/30">
                                <img id="avatar-preview" src="${profile.avatar_url || ''}" class="w-full h-full object-cover ${profile.avatar_url ? '' : 'hidden'}">
                                <span class="material-symbols-outlined text-primary text-4xl ${profile.avatar_url ? 'hidden' : ''}">person</span>
                            </div>
                            <label for="avatar-upload" class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                                <span class="material-symbols-outlined text-white">edit</span>
                            </label>
                            <input type="file" id="avatar-upload" accept="image/*" class="hidden">
                        </div>
                        <div>
                            <h3 class="text-on-surface font-bold text-lg">Foto de Perfil</h3>
                            <p class="text-sm text-on-surface/60">Recomendado: 400x400px. JPG o PNG.</p>
                        </div>
                    </div>

                    <!-- Personal Info -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-on-surface/60">Nombre Completo</label>
                            <input type="text" id="full-name" value="${profile.full_name || ''}" class="w-full bg-base border border-white/10 rounded-lg p-3 text-on-surface focus:border-primary outline-none transition-colors">
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-on-surface/60">Ubicación (Ciudad)</label>
                            <input type="text" id="location" value="${profile.location || ''}" class="w-full bg-base border border-white/10 rounded-lg p-3 text-on-surface focus:border-primary outline-none transition-colors" placeholder="Ej: Lima, Perú">
                        </div>
                    </div>

                    <!-- Professional Info -->
                    <div class="space-y-2">
                        <label class="text-sm font-bold text-on-surface/60">Biografía Profesional</label>
                        <textarea id="bio" rows="4" class="w-full bg-base border border-white/10 rounded-lg p-3 text-on-surface focus:border-primary outline-none transition-colors" placeholder="Cuéntanos sobre tu experiencia, estilo de trabajo y qué te hace único...">${profile.bio || ''}</textarea>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-on-surface/60">Años de Experiencia</label>
                            <input type="number" id="experience" value="${profile.experience_years || 0}" class="w-full bg-base border border-white/10 rounded-lg p-3 text-on-surface focus:border-primary outline-none transition-colors">
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-on-surface/60">Especialidades (Separadas por coma)</label>
                            <input type="text" id="specialties" value="${(profile.specialties || []).join(', ')}" class="w-full bg-base border border-white/10 rounded-lg p-3 text-on-surface focus:border-primary outline-none transition-colors" placeholder="Ej: Cuero, Vestidos de Noche, Denim">
                        </div>
                    </div>

                    <!-- Save Button -->
                    <div class="pt-4 border-t border-white/10 flex justify-end">
                        <button id="save-profile" class="px-8 py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                            Guardar Cambios
                        </button>
                    </div>

                </div>
            </div>
        </main>
    </div>
    `;
}

function setupProfileListeners(userId, currentProfile) {
    // Avatar Upload
    const avatarInput = document.getElementById('avatar-upload');
    avatarInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.getElementById('avatar-preview');
            img.src = e.target.result;
            img.classList.remove('hidden');
            img.nextElementSibling.classList.add('hidden');
        };
        reader.readAsDataURL(file);

        // Upload to Supabase
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) {
            console.error(uploadError);
            return alert('Error al subir imagen');
        }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        // Update profile with new avatar URL immediately or wait for save? 
        // Let's wait for save button, but store it in a data attribute or global var?
        // Actually, better to update the input value or just auto-save the avatar.
        // Let's auto-save avatar for better UX.
        await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId);
    });

    // Save Profile
    document.getElementById('save-profile').addEventListener('click', async () => {
        const btn = document.getElementById('save-profile');
        btn.innerText = 'Guardando...';
        btn.disabled = true;

        const fullName = document.getElementById('full-name').value;
        const location = document.getElementById('location').value;
        const bio = document.getElementById('bio').value;
        const experience = document.getElementById('experience').value;
        const specialtiesStr = document.getElementById('specialties').value;

        const specialties = specialtiesStr.split(',').map(s => s.trim()).filter(s => s);

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: fullName,
                location: location,
                bio: bio,
                experience_years: parseInt(experience),
                specialties: specialties
            })
            .eq('id', userId);

        if (error) {
            console.error(error);
            alert('Error al guardar cambios.');
            btn.innerText = 'Guardar Cambios';
            btn.disabled = false;
        } else {
            alert('Perfil actualizado correctamente.');
            btn.innerText = 'Guardar Cambios';
            btn.disabled = false;
        }
    });
}
