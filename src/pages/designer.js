import { initScene, updateGarmentColor, updateGarmentTexture, updateGarmentType, getDesignConfig, captureScreenshot } from '../js/three/scene.js';
import { supabase } from '../js/supabase.js';
import { getCurrentUser } from '../js/auth.js';

export function DesignerPage() {
    let currentStep = 1;
    let designData = {
        type: 'polo',
        color: '#333333',
        texture: 'algodon',
        measurements: {
            largo: '',
            pecho: '',
            cintura: '',
            mangas: '',
            hombros: ''
        },
        name: ''
    };

    setTimeout(() => {
        initScene('3d-container');

        // Navigation
        const nextBtns = document.querySelectorAll('.next-step');
        const prevBtns = document.querySelectorAll('.prev-step');

        function showStep(step) {
            for (let i = 1; i <= 4; i++) {
                const stepEl = document.getElementById(`step-${i}`);
                if (stepEl) {
                    stepEl.classList.toggle('hidden', i !== step);
                }
            }
            currentStep = step;
            updateProgressBar();

            // Update step number display
            const stepNum = document.getElementById('current-step-num');
            if (stepNum) stepNum.textContent = step;

            // Update summary when reaching step 4
            if (step === 4) {
                updateSummary();
            }
        }

        function updateProgressBar() {
            const progress = (currentStep / 4) * 100;
            const progressBar = document.getElementById('progress-bar');
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
        }

        // Next/Prev buttons
        nextBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (currentStep < 4) showStep(currentStep + 1);
            });
        });

        prevBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (currentStep > 1) showStep(currentStep - 1);
            });
        });

        // STEP 1: Garment Type Selection
        const typeCards = document.querySelectorAll('.garment-type-card');
        typeCards.forEach(card => {
            card.addEventListener('click', () => {
                typeCards.forEach(c => c.classList.remove('border-primary', 'border-2'));
                typeCards.forEach(c => c.classList.add('border-transparent'));
                card.classList.remove('border-transparent');
                card.classList.add('border-primary', 'border-2');

                const typeName = card.querySelector('.garment-name')?.textContent.toLowerCase();
                designData.type = typeName || 'polo';

                // Update 3D model
                updateGarmentType(typeName);
            });
        });

        // STEP 2: Color Picker (input type="color")
        const colorPicker = document.getElementById('color-picker');
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
                designData.color = e.target.value;
                updateGarmentColor(e.target.value);
            });
        }

        // STEP 2: Texture Selection
        const textureBtns = document.querySelectorAll('.texture-btn');
        textureBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                textureBtns.forEach(b => {
                    b.classList.remove('border-primary', 'bg-primary/20');
                    b.classList.add('border-white/10', 'bg-white/5');
                });
                btn.classList.remove('border-white/10', 'bg-white/5');
                btn.classList.add('border-primary', 'bg-primary/20');

                const texture = btn.dataset.texture;
                if (texture) {
                    designData.texture = texture;
                    updateGarmentTexture(texture);
                }
            });
        });

        // STEP 3: Measurements
        const measureInputs = document.querySelectorAll('.measure-input');
        measureInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const field = e.target.dataset.field;
                if (field) {
                    designData.measurements[field] = e.target.value;
                }
            });
        });

        // STEP 4: Save Design
        const saveBtn = document.getElementById('save-design-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                const user = await getCurrentUser();
                if (!user) {
                    alert('Debes iniciar sesión para guardar.');
                    window.location.href = '/login';
                    return;
                }

                const designName = document.getElementById('design-name-input')?.value || 'Mi Diseño';
                designData.name = designName;

                saveBtn.disabled = true;
                saveBtn.textContent = 'Capturando diseño...';

                try {
                    // Capture screenshot of 3D model
                    const screenshot = captureScreenshot();
                    console.log('Screenshot captured:', screenshot ? 'Yes' : 'No');

                    let previewUrl = null;

                    if (screenshot) {
                        saveBtn.textContent = 'Subiendo imagen...';

                        // Convert data URL to blob
                        const response = await fetch(screenshot);
                        const blob = await response.blob();
                        console.log('Blob size:', blob.size, 'bytes');

                        // Generate unique filename
                        const fileName = `${user.id}/${Date.now()}.png`;
                        console.log('Uploading to:', fileName);

                        // Upload to Supabase Storage
                        const { data: uploadData, error: uploadError } = await supabase.storage
                            .from('design-previews')
                            .upload(fileName, blob, {
                                contentType: 'image/png',
                                cacheControl: '3600'
                            });

                        if (uploadError) {
                            console.error('Error uploading image:', uploadError);
                            alert('Error al subir imagen: ' + uploadError.message);
                        } else {
                            console.log('Upload successful:', uploadData);
                            // Get public URL
                            const { data: { publicUrl } } = supabase.storage
                                .from('design-previews')
                                .getPublicUrl(fileName);

                            previewUrl = publicUrl;
                            console.log('Public URL:', previewUrl);
                        }
                    } else {
                        console.warn('No screenshot captured - renderer might not be ready');
                    }

                    saveBtn.textContent = 'Guardando diseño...';

                    // Save design to database
                    const { error } = await supabase.from('designs').insert({
                        user_id: user.id,
                        name: designData.name,
                        config: designData,
                        preview_url: previewUrl
                    });

                    if (error) {
                        console.error('Database error:', error);
                        alert('Error al guardar: ' + error.message);
                        saveBtn.disabled = false;
                        saveBtn.textContent = 'Guardar diseño';
                    } else {
                        console.log('Design saved successfully with preview:', previewUrl);
                        alert('¡Diseño guardado con éxito!');
                        window.location.href = '/client-dashboard';
                    }
                } catch (err) {
                    console.error('Error:', err);
                    alert('Error al procesar el diseño: ' + err.message);
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Guardar diseño';
                }
            });
        }

        // Edit previous steps button
        const editBtn = document.getElementById('edit-steps-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                showStep(1);
            });
        }

        // Update summary in Step 4
        function updateSummary() {
            const summaryType = document.getElementById('summary-type');
            const summaryColor = document.getElementById('summary-color');
            const summaryTexture = document.getElementById('summary-texture');
            const summaryMeasures = document.getElementById('summary-measures');

            if (summaryType) summaryType.textContent = designData.type.charAt(0).toUpperCase() + designData.type.slice(1);
            if (summaryColor) summaryColor.textContent = designData.color;
            if (summaryTexture) summaryTexture.textContent = designData.texture.charAt(0).toUpperCase() + designData.texture.slice(1);
            if (summaryMeasures) {
                const hasMeasures = Object.values(designData.measurements).some(v => v);
                summaryMeasures.textContent = hasMeasures ? 'Personalizada' : 'Sin especificar';
            }
        }

    }, 0);

    return `
    <div class="min-h-screen bg-background-dark text-white flex flex-col">
        <!-- Header -->
        <header class="flex items-center justify-between border-b border-white/10 px-6 py-3">
            <div class="flex items-center gap-4">
                <div class="w-6 h-6 text-primary">
                    <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z"/>
                        <path d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z"/>
                    </svg>
                </div>
                <h2 class="text-lg font-bold">PeruStyle</h2>
            </div>
        </header>

        <!-- Main Content -->
        <div class="flex-1 flex flex-col lg:flex-row overflow-hidden">
            <!-- Left Panel: 3D Viewer -->
            <div class="w-full lg:w-3/5 bg-black/20 relative flex flex-col">
                <!-- Progress Bar -->
                <div class="p-6">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-base font-medium">Paso <span id="current-step-num">1</span> de 4</p>
                    </div>
                    <div class="rounded-full bg-white/10 h-2">
                        <div id="progress-bar" class="h-2 rounded-full bg-primary transition-all duration-300" style="width: 25%;"></div>
                    </div>
                </div>

                <!-- 3D Container -->
                <div id="3d-container" class="flex-1"></div>
            </div>

            <!-- Right Panel: Controls -->
            <div class="w-full lg:w-2/5 overflow-y-auto">
                ${renderStep1()}
                ${renderStep2()}
                ${renderStep3()}
                ${renderStep4()}
            </div>
        </div>
    </div>
    `;
}

function renderStep1() {
    return `
    <div id="step-1" class="p-6 space-y-6">
        <div>
            <h1 class="text-3xl font-bold mb-2">Elige tu tipo de prenda</h1>
            <p class="text-white/60">Selecciona la base para tu diseño</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div class="garment-type-card flex flex-col gap-3 cursor-pointer border-2 border-primary rounded-lg overflow-hidden transition-all hover:scale-105">
                <div class="aspect-[3/4] bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400');"></div>
                <p class="garment-name text-center font-medium pb-3">Polo</p>
            </div>
            <div class="garment-type-card flex flex-col gap-3 cursor-pointer border-2 border-transparent rounded-lg overflow-hidden transition-all hover:scale-105 hover:border-primary/50">
                <div class="aspect-[3/4] bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400');"></div>
                <p class="garment-name text-center font-medium pb-3">Polera</p>
            </div>
            <div class="garment-type-card flex flex-col gap-3 cursor-pointer border-2 border-transparent rounded-lg overflow-hidden transition-all hover:scale-105 hover:border-primary/50">
                <div class="aspect-[3/4] bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400');"></div>
                <p class="garment-name text-center font-medium pb-3">Casaca</p>
            </div>
            <div class="garment-type-card flex flex-col gap-3 cursor-pointer border-2 border-transparent rounded-lg overflow-hidden transition-all hover:scale-105 hover:border-primary/50">
                <div class="aspect-[3/4] bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400');"></div>
                <p class="garment-name text-center font-medium pb-3">Camisa</p>
            </div>
        </div>

        <div class="pt-4">
            <button class="next-step w-full bg-primary text-black py-3 rounded-lg font-bold hover:brightness-110 transition">
                Siguiente
            </button>
        </div>
    </div>
    `;
}

function renderStep2() {
    return `
    <div id="step-2" class="hidden p-6 space-y-6">
        <div>
            <h2 class="text-2xl font-bold mb-2">Personaliza</h2>
            <p class="text-white/60">Color y textura</p>
        </div>

        <!-- Color Picker -->
        <div>
            <h3 class="text-lg font-bold mb-4">Elige un Color</h3>
            <input type="color" id="color-picker" value="#333333" class="w-full h-16 rounded-lg cursor-pointer border-2 border-white/10">
        </div>

        <!-- Texture Selector -->
        <div>
            <h3 class="text-lg font-bold mb-4">Selecciona una Textura</h3>
            <div class="grid grid-cols-2 gap-3">
                <button class="texture-btn rounded-lg border-2 border-primary bg-primary/20 px-4 py-3 font-semibold transition-colors" data-texture="algodon">Algodón</button>
                <button class="texture-btn rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-medium transition-colors hover:bg-white/10" data-texture="licra">Licra</button>
                <button class="texture-btn rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-medium transition-colors hover:bg-white/10" data-texture="denim">Denim</button>
                <button class="texture-btn rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-medium transition-colors hover:bg-white/10" data-texture="cuero">Cuero</button>
                <button class="texture-btn rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-medium transition-colors hover:bg-white/10" data-texture="lana">Lana</button>
            </div>
        </div>

        <div class="flex justify-between pt-4">
            <button class="prev-step text-white/60 hover:text-white font-medium">Atrás</button>
            <button class="next-step bg-primary text-black px-8 py-3 rounded-lg font-bold hover:brightness-110 transition">Siguiente</button>
        </div>
    </div>
    `;
}

function renderStep3() {
    return `
    <div id="step-3" class="hidden p-6 space-y-6">
        <div>
            <h2 class="text-2xl font-bold mb-2">Tus Medidas</h2>
            <p class="text-white/60">Para un ajuste perfecto (en cm)</p>
        </div>

        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-2">Largo (cm)</label>
                <input type="number" data-field="largo" class="measure-input w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-primary" placeholder="ej: 70">
            </div>
            <div>
                <label class="block text-sm font-medium mb-2">Pecho (cm)</label>
                <input type="number" data-field="pecho" class="measure-input w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-primary" placeholder="ej: 100">
            </div>
            <div>
                <label class="block text-sm font-medium mb-2">Cintura (cm)</label>
                <input type="number" data-field="cintura" class="measure-input w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-primary" placeholder="ej: 90">
            </div>
            <div>
                <label class="block text-sm font-medium mb-2">Mangas (cm)</label>
                <input type="number" data-field="mangas" class="measure-input w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-primary" placeholder="ej: 22">
            </div>
            <div>
                <label class="block text-sm font-medium mb-2">Hombros (cm)</label>
                <input type="number" data-field="hombros" class="measure-input w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-primary" placeholder="ej: 48">
            </div>
        </div>

        <div class="flex justify-between pt-4">
            <button class="prev-step text-white/60 hover:text-white font-medium">Atrás</button>
            <button class="next-step bg-primary text-black px-8 py-3 rounded-lg font-bold hover:brightness-110 transition">Siguiente</button>
        </div>
    </div>
    `;
}

function renderStep4() {
    return `
    <div id="step-4" class="hidden p-6 space-y-6">
        <div>
            <h2 class="text-2xl font-bold mb-2">Resumen del Diseño</h2>
            <p class="text-white/60">Revisa y guarda tu creación</p>
        </div>

        <div class="bg-surface/50 rounded-xl p-6 border border-white/10">
            <h3 class="text-lg font-bold mb-4 pb-4 border-b border-white/10">Detalles</h3>
            <div class="space-y-4">
                <div class="flex justify-between">
                    <span class="text-white/60">Tipo de prenda</span>
                    <span id="summary-type" class="font-medium">Polo</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-white/60">Color</span>
                    <span id="summary-color" class="font-medium">#333333</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-white/60">Textura</span>
                    <span id="summary-texture" class="font-medium">Algodón</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-white/60">Medidas</span>
                    <span id="summary-measures" class="font-medium">Sin especificar</span>
                </div>
            </div>
        </div>

        <div>
            <label class="block text-sm font-medium mb-2">Nombre del diseño</label>
            <input type="text" id="design-name-input" class="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-primary" placeholder="ej: Polera Verano 2025">
        </div>

        <div class="space-y-3">
            <button id="save-design-btn" class="w-full bg-primary text-black py-3 rounded-lg font-bold hover:brightness-110 transition flex items-center justify-center gap-2">
                <span>💾</span>
                Guardar diseño
            </button>
            <button id="edit-steps-btn" class="w-full bg-white/10 text-white py-3 rounded-lg font-medium hover:bg-white/20 transition flex items-center justify-center gap-2">
                <span>✏️</span>
                Editar pasos anteriores
            </button>
        </div>
    </div>
    `;
}
