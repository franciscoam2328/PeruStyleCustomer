import { signIn, signUp, signInWithGoogle } from '../js/auth.js';

export function LoginPage() {
    setTimeout(() => {
        const form = document.getElementById('auth-form');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const submitBtn = document.getElementById('submit-btn');
        const googleBtn = document.getElementById('google-btn');
        const toggleBtn = document.getElementById('toggle-mode');
        const roleSelector = document.getElementById('role-selector');
        const title = document.getElementById('auth-title');
        const messageDiv = document.getElementById('auth-message');

        let isLogin = true;

        if (googleBtn) {
            googleBtn.addEventListener('click', async () => {
                const { error } = await signInWithGoogle();
                if (error) {
                    messageDiv.textContent = error.message;
                    messageDiv.className = 'text-red-500 text-sm text-center mt-4';
                }
            });
        }

        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                isLogin = !isLogin;
                title.textContent = isLogin ? 'Iniciar Sesión' : 'Crear Cuenta';
                submitBtn.textContent = isLogin ? 'Ingresar' : 'Registrarse';
                toggleBtn.textContent = isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión';
                messageDiv.textContent = '';

                // Toggle Role Selector
                if (roleSelector) {
                    roleSelector.classList.toggle('hidden', isLogin);
                }
            });
        }

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                submitBtn.disabled = true;
                messageDiv.textContent = 'Procesando...';

                const email = emailInput.value;
                const password = passwordInput.value;
                const role = document.querySelector('input[name="role"]:checked')?.value || 'client';

                let result;
                if (isLogin) {
                    result = await signIn(email, password);
                } else {
                    result = await signUp(email, password, role);
                }

                if (result.error) {
                    messageDiv.className = 'text-red-500 text-sm text-center mt-4';
                    messageDiv.textContent = result.error.message;
                    submitBtn.disabled = false;
                } else {
                    messageDiv.className = 'text-green-500 text-sm text-center mt-4';
                    messageDiv.textContent = isLogin ? '¡Bienvenido!' : '¡Cuenta creada! Revisa tu correo.';

                    if (isLogin || result.data?.user) {
                        // Fetch profile to check role
                        const { supabase } = await import('../js/supabase.js');
                        const user = result.data.user;

                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('role')
                            .eq('id', user.id)
                            .single();

                        setTimeout(() => {
                            if (profile && profile.role === 'maker') {
                                window.location.href = '/maker-dashboard';
                            } else {
                                window.location.href = '/client-dashboard'; // Clients go to their dashboard
                            }
                        }, 1000);
                    }
                }
            });
        }
    }, 0);

    return `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
            <div>
                <h2 id="auth-title" class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Iniciar Sesión
                </h2>
                <p class="mt-2 text-center text-sm text-gray-600">
                    O accede a tu cuenta de PeruStyle
                </p>
            </div>

            <div class="mt-8">
                <button id="google-btn" type="button" class="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" class="h-5 w-5 mr-2" style="height: 20px; width: 20px;" alt="Google logo">
                    Continuar con Google
                </button>
                
                <div class="mt-6 relative">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-gray-300"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                        <span class="px-2 bg-white text-gray-500">O usa tu correo</span>
                    </div>
                </div>
            </div>

            <form id="auth-form" class="mt-6 space-y-6">
                <!-- Role Selector (Only for Register) -->
                <div id="role-selector" class="hidden space-y-2">
                    <label class="block text-sm font-medium text-gray-700">¿Cómo quieres usar PeruStyle?</label>
                    <div class="grid grid-cols-2 gap-4">
                        <label class="cursor-pointer">
                            <input type="radio" name="role" value="client" class="peer sr-only" checked>
                            <div class="rounded-lg border-2 border-gray-300 p-4 text-center hover:bg-gray-50 peer-checked:border-primary peer-checked:bg-red-50 peer-checked:ring-2 peer-checked:ring-primary transition-all">
                                <div class="font-semibold text-gray-700 peer-checked:text-primary">Cliente</div>
                                <div class="text-xs text-gray-500">Quiero diseñar y comprar</div>
                            </div>
                        </label>
                        <label class="cursor-pointer">
                            <input type="radio" name="role" value="maker" class="peer sr-only">
                            <div class="rounded-lg border-2 border-gray-300 p-4 text-center hover:bg-gray-50 peer-checked:border-primary peer-checked:bg-red-50 peer-checked:ring-2 peer-checked:ring-primary transition-all">
                                <div class="font-semibold text-gray-700 peer-checked:text-primary">Confeccionista</div>
                                <div class="text-xs text-gray-500">Quiero recibir pedidos</div>
                            </div>
                        </label>
                    </div>
                </div>

                <div class="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label for="email" class="sr-only">Correo electrónico</label>
                        <input id="email" name="email" type="email" autocomplete="email" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Correo electrónico">
                    </div>
                    <div>
                        <label for="password" class="sr-only">Contraseña</label>
                        <input id="password" name="password" type="password" autocomplete="current-password" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Contraseña">
                    </div>
                </div>

                <div>
                    <button id="submit-btn" type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition">
                        Ingresar
                    </button>
                </div>
                
                <div id="auth-message" class="text-center mt-4 h-4"></div>

                <div class="text-center">
                    <button id="toggle-mode" class="font-medium text-primary hover:text-red-500 transition">
                        ¿No tienes cuenta? Regístrate
                    </button>
                </div>
            </form>
        </div>
    </div>
    `;
}
