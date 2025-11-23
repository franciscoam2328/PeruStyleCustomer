import { supabase } from '../js/supabase.js';
import { getCurrentUser } from '../js/auth.js';

export async function ProfilePage() {
    const user = await getCurrentUser();

    if (!user) {
        window.location.href = '/login';
        return '';
    }

    // Fetch current profile data
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        return `<div class="pt-24 text-center text-red-500">Error al cargar perfil: ${error.message}</div>`;
    }

    setTimeout(() => {
        const form = document.getElementById('profile-form');
        const avatarInput = document.getElementById('avatar-input');
        const avatarPreview = document.getElementById('avatar-preview');
        const saveBtn = document.getElementById('save-profile-btn');
        const messageDiv = document.getElementById('profile-message');

        // Handle Avatar Preview
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        avatarPreview.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Handle Form Submit
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                saveBtn.disabled = true;
                saveBtn.textContent = 'Guardando...';
                messageDiv.textContent = '';

                const fullName = document.getElementById('full-name').value;
                const bio = document.getElementById('bio').value;
                const avatarFile = avatarInput.files[0];
                let avatarUrl = profile.avatar_url;

                try {
                    // Upload Avatar if changed
                    if (avatarFile) {
                        const fileExt = avatarFile.name.split('.').pop();
                        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
                        const filePath = `${fileName}`;

                        const { error: uploadError } = await supabase.storage
                            .from('avatars')
                            .upload(filePath, avatarFile);

                        if (uploadError) throw uploadError;

                        const { data: { publicUrl } } = supabase.storage
                            .from('avatars')
                            .getPublicUrl(filePath);

                        avatarUrl = publicUrl;
                    }

                    // Update Profile
                    const { error: updateError } = await supabase
                        .from('profiles')
                        .update({
                            full_name: fullName,
                            bio: bio,
                            avatar_url: avatarUrl
                        })
                        .eq('id', user.id);

                    if (updateError) throw updateError;

                    messageDiv.className = 'text-green-500 text-sm text-center mt-4';
                    messageDiv.textContent = '¡Perfil actualizado correctamente!';
                    setTimeout(() => window.location.reload(), 1500);

                } catch (err) {
                    console.error(err);
                    messageDiv.className = 'text-red-500 text-sm text-center mt-4';
                    messageDiv.textContent = 'Error al actualizar: ' + err.message;
                } finally {
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Guardar Cambios';
                }
            });
        }
    }, 0);

    return `
    <div class="pb-12 bg-base min-h-screen">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Botón de regreso -->
            <div class="mb-6">
                <a href="${profile.role === 'maker' ? '/maker-dashboard' : '/client-dashboard'}" 
                   class="inline-flex items-center gap-2 text-on-surface/80 hover:text-primary transition-colors">
                    <span class="text-2xl">←</span>
                    <span class="font-medium">Volver al Dashboard</span>
                </a>
            </div>

            <div class="bg-surface rounded-xl shadow-lg overflow-hidden border border-white/10">
                <div class="bg-gradient-to-r from-primary to-secondary h-32 w-full"></div>
                <div class="px-8 pb-8">
                    <div class="relative -mt-16 mb-6 flex justify-center">
                        <div class="relative">
                            <img id="avatar-preview" src="${profile.avatar_url || 'https://via.placeholder.com/150'}" 
                                 class="h-32 w-32 rounded-full border-4 border-white bg-gray-200 object-cover shadow-md">
                            <label for="avatar-input" class="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-100 transition border border-gray-200">
                                📷
                                <input type="file" id="avatar-input" accept="image/*" class="hidden">
                            </label>
                        </div>
                    </div>

                    <h1 class="text-3xl font-bold text-center text-on-surface mb-2">${profile.full_name || 'Usuario'}</h1>
                    <p class="text-center text-on-surface/60 mb-8">${profile.email}</p>

                    <form id="profile-form" class="space-y-6 max-w-lg mx-auto">
                        <div>
                            <label for="full-name" class="block text-sm font-medium text-on-surface/80">Nombre Completo</label>
                            <input type="text" id="full-name" value="${profile.full_name || ''}" required
                                   class="mt-1 block w-full bg-base border-white/10 text-on-surface rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2 border">
                        </div>

                        <div>
                            <label for="bio" class="block text-sm font-medium text-on-surface/80">Biografía / Sobre mí</label>
                            <textarea id="bio" rows="4" 
                                      class="mt-1 block w-full bg-base border-white/10 text-on-surface rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2 border"
                                      placeholder="Cuéntanos un poco sobre ti...">${profile.bio || ''}</textarea>
                        </div>

                        <div class="flex items-center justify-between pt-4">
                            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-surface border border-white/10 text-on-surface uppercase">
                                Rol: ${profile.role}
                            </span>
                            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-secondary/20 border border-secondary/30 text-secondary uppercase">
                                Plan: ${profile.plan}
                            </span>
                        </div>

                        <div>
                            <button id="save-profile-btn" type="submit" 
                                    class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition">
                                Guardar Cambios
                            </button>
                        </div>
                        <div id="profile-message" class="h-4"></div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    `;
}
