import { supabase } from '../js/supabase.js';
import { getCurrentUser } from '../js/auth.js';

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
    }, 0);

    return `
    <div class="flex min-h-screen w-full bg-background-dark font-display text-text-beige">
        ${renderSidebar(profile)}
        <main class="flex-1 p-8 overflow-y-auto">
            <div class="max-w-4xl mx-auto">
                <h1 class="text-3xl font-black text-white mb-2">Editar Perfil</h1>
                <p class="text-text-beige-muted mb-8">Personaliza cómo te ven los clientes en el directorio.</p>

                <div class="bg-card-dark rounded-xl border border-white/5 p-8 space-y-8">
                    
                    <!-- Avatar Section -->
                    <div class="flex items-center gap-6 border-b border-white/5 pb-8">
                        <div class="relative group">
                            <div class="w-24 h-24 rounded-full bg-accent-gold/20 flex items-center justify-center overflow-hidden border-2 border-accent-gold/30">
                                <img id="avatar-preview" src="${profile.avatar_url || ''}" class="w-full h-full object-cover ${profile.avatar_url ? '' : 'hidden'}">
                                <span class="material-symbols-outlined text-accent-gold text-4xl ${profile.avatar_url ? 'hidden' : ''}">person</span>
                            </div>
                            <label for="avatar-upload" class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                                <span class="material-symbols-outlined text-white">edit</span>
                            </label>
                            <input type="file" id="avatar-upload" accept="image/*" class="hidden">
                        </div>
                        <div>
                            <h3 class="text-white font-bold text-lg">Foto de Perfil</h3>
                            <p class="text-sm text-gray-400">Recomendado: 400x400px. JPG o PNG.</p>
                        </div>
                    </div>

                    <!-- Personal Info -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-400">Nombre Completo</label>
                            <input type="text" id="full-name" value="${profile.full_name || ''}" class="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-accent-gold outline-none">
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-400">Ubicación (Ciudad)</label>
                            <input type="text" id="location" value="${profile.location || ''}" class="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-accent-gold outline-none" placeholder="Ej: Lima, Perú">
                        </div>
                    </div>

                    <!-- Professional Info -->
                    <div class="space-y-2">
                        <label class="text-sm font-bold text-gray-400">Biografía Profesional</label>
                        <textarea id="bio" rows="4" class="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-accent-gold outline-none" placeholder="Cuéntanos sobre tu experiencia, estilo de trabajo y qué te hace único...">${profile.bio || ''}</textarea>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-400">Años de Experiencia</label>
                            <input type="number" id="experience" value="${profile.experience_years || 0}" class="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-accent-gold outline-none">
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-400">Especialidades (Separadas por coma)</label>
                            <input type="text" id="specialties" value="${(profile.specialties || []).join(', ')}" class="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-accent-gold outline-none" placeholder="Ej: Cuero, Vestidos de Noche, Denim">
                        </div>
                    </div>

                    <!-- Save Button -->
                    <div class="pt-4 border-t border-white/5 flex justify-end">
                        <button id="save-profile" class="px-8 py-3 rounded-lg bg-accent-gold text-black font-bold hover:bg-accent-gold/90 transition-colors shadow-lg shadow-accent-gold/20">
                            Guardar Cambios
                        </button>
                    </div>

                </div>
            </div>
        </main>
    </div>
    `;
}

function renderSidebar(profile) {
    // Reusing the sidebar component logic (simplified for brevity in this file, ideally should be a shared component)
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
                <a class="relative flex items-center gap-4 rounded-lg bg-accent-gold/10 px-4 py-2.5 text-sm font-bold text-accent-gold shadow-gold-glow-soft" href="/maker-profile-edit">
                    <span class="absolute left-0 h-6 w-1 rounded-r-full bg-accent-gold"></span>
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
                <a class="flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-text-beige-muted transition-all hover:text-accent-gold hover:bg-white/5" href="/maker-plans">
                    <span class="material-symbols-outlined text-xl">credit_card</span>
                    Suscripción
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
