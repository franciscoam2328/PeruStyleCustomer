import { initScene, updateGarmentColor, updateGarmentTexture, updateGarmentType, getDesignConfig, captureScreenshot } from '../js/three/scene.js';
import { supabase } from '../js/supabase.js';
import { getCurrentUser } from '../js/auth.js';

export function DesignToolPage() {
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
                    b.classList.remove('border-primary', 'bg-primary/10');
                    b.classList.add('border-gray-200', 'bg-gray-50');
                });
                btn.classList.remove('border-gray-200', 'bg-gray-50');
                btn.classList.add('border-primary', 'bg-primary/10');

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
    <div class="min-h-screen bg-background-light text-gray-900 flex flex-col font-display">
        <!-- Header -->
        <header class="flex items-center justify-between border-b border-gray-200 px-6 py-3 bg-white">
            <div class="flex items-center gap-4">
                <a href="/my-designs" class="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                    <span class="material-icons">arrow_back</span>
                    <span class="font-medium text-sm">Volver</span>
                </a>
                <div class="h-6 w-px bg-gray-200"></div>
                <img src="/assets/logo.png" alt="PeruStyle" class="h-8 w-auto object-contain">
                <h2 class="text-lg font-bold text-gray-900">Estudio de Diseño</h2>
            </div>
            <div class="flex items-center gap-2">
                <span class="text-xs text-gray-500">Modo Preview</span>
            </div>
        </header>

        <!-- Main Content -->
        <div class="flex-1 flex flex-col lg:flex-row overflow-hidden">
            <!-- Left Panel: 3D Viewer -->
            <div class="w-full lg:w-3/5 bg-gray-100 relative flex flex-col">
                <!-- Progress Bar -->
                <div class="p-6 absolute top-0 left-0 w-full z-10">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-sm font-medium text-gray-600 bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm">Paso <span id="current-step-num">1</span> de 4</p>
                    </div>
                    <div class="rounded-full bg-gray-300 h-1.5 w-full max-w-xs">
                        <div id="progress-bar" class="h-1.5 rounded-full bg-primary transition-all duration-300" style="width: 25%;"></div>
                    </div>
                </div>

                <!-- 3D Container -->
                <div id="3d-container" class="flex-1"></div>
            </div>

            <!-- Right Panel: Controls -->
            <div class="w-full lg:w-2/5 overflow-y-auto bg-white border-l border-gray-200">
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
    <div id="step-1" class="p-8 space-y-8">
        <div>
            <h1 class="text-3xl font-bold mb-2 text-gray-900">Elige tu prenda</h1>
            <p class="text-gray-500">Selecciona la base para comenzar tu diseño.</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div class="garment-type-card flex flex-col gap-3 cursor-pointer border-2 border-primary rounded-xl overflow-hidden transition-all hover:shadow-md bg-gray-50">
                <div class="aspect-[3/4] bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400');"></div>
                <p class="garment-name text-center font-bold text-gray-800 pb-3">Polo</p>
            </div>
            <div class="garment-type-card flex flex-col gap-3 cursor-pointer border-2 border-transparent rounded-xl overflow-hidden transition-all hover:shadow-md hover:border-gray-300 bg-gray-50">
                <div class="aspect-[3/4] bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400');"></div>
                <p class="garment-name text-center font-bold text-gray-800 pb-3">Polera</p>
            </div>
            <div class="garment-type-card flex flex-col gap-3 cursor-pointer border-2 border-transparent rounded-xl overflow-hidden transition-all hover:shadow-md hover:border-gray-300 bg-gray-50">
                <div class="aspect-[3/4] bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400');"></div>
                <p class="garment-name text-center font-bold text-gray-800 pb-3">Casaca</p>
            </div>
            <div class="garment-type-card flex flex-col gap-3 cursor-pointer border-2 border-transparent rounded-xl overflow-hidden transition-all hover:shadow-md hover:border-gray-300 bg-gray-50">
                <div class="aspect-[3/4] bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400');"></div>
                <p class="garment-name text-center font-bold text-gray-800 pb-3">Camisa</p>
            </div>
        </div>

        <div class="pt-4">
            <button class="next-step w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-200">
                Siguiente Paso
            </button>
        </div>
    </div>
    `;
}

function renderStep2() {
    return `
    <div id="step-2" class="hidden p-8 space-y-8">
        <div>
            <h2 class="text-2xl font-bold mb-2 text-gray-900">Personaliza</h2>
            <p class="text-gray-500">Define el color y la textura de tu prenda.</p>
        </div>

        <!-- Color Picker -->
        <div>
            <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Color Base</h3>
            <div class="flex items-center gap-4">
                <input type="color" id="color-picker" value="#333333" class="w-16 h-16 rounded-full cursor-pointer border-4 border-white shadow-md p-0 overflow-hidden">
                <span class="text-sm text-gray-500">Haz clic para cambiar</span>
            </div>
        </div>

        <!-- Texture Selector -->
        <div>
            <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Textura</h3>
            <div class="grid grid-cols-2 gap-3">
                <button class="texture-btn rounded-lg border-2 border-primary bg-primary/10 px-4 py-3 font-bold text-gray-800 transition-colors" data-texture="algodon">Algodón</button>
                <button class="texture-btn rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 font-medium text-gray-600 transition-colors hover:bg-gray-100" data-texture="licra">Licra</button>
                <button class="texture-btn rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 font-medium text-gray-600 transition-colors hover:bg-gray-100" data-texture="denim">Denim</button>
                <button class="texture-btn rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 font-medium text-gray-600 transition-colors hover:bg-gray-100" data-texture="cuero">Cuero</button>
                <button class="texture-btn rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 font-medium text-gray-600 transition-colors hover:bg-gray-100" data-texture="lana">Lana</button>
            </div>
        </div>

        <div class="flex justify-between pt-8 border-t border-gray-100">
            <button class="prev-step text-gray-500 hover:text-gray-900 font-medium px-4">Atrás</button>
            <button class="next-step bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-200">Siguiente</button>
        </div>
    </div>
    `;
}

function renderStep3() {
    return `
    <div id="step-3" class="hidden p-8 space-y-8">
        <div>
            <h2 class="text-2xl font-bold mb-2 text-gray-900">Tus Medidas</h2>
            <p class="text-gray-500">Ingresa tus medidas para un ajuste perfecto (cm).</p>
        </div>

        <div class="space-y-5">
            <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Largo</label>
                <input type="number" data-field="largo" class="measure-input w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all" placeholder="ej: 70">
            </div>
            <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Pecho</label>
                <input type="number" data-field="pecho" class="measure-input w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all" placeholder="ej: 100">
            </div>
            <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Cintura</label>
                <input type="number" data-field="cintura" class="measure-input w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all" placeholder="ej: 90">
            </div>
            <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Mangas</label>
                <input type="number" data-field="mangas" class="measure-input w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all" placeholder="ej: 22">
            </div>
            <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Hombros</label>
                <input type="number" data-field="hombros" class="measure-input w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all" placeholder="ej: 48">
            </div>
        </div>

        <div class="flex justify-between pt-8 border-t border-gray-100">
            <button class="prev-step text-gray-500 hover:text-gray-900 font-medium px-4">Atrás</button>
            <button class="next-step bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-200">Siguiente</button>
        </div>
    </div>
    `;
}

function renderStep4() {
    return `
    <div id="step-4" class="hidden p-8 space-y-8">
        <div>
            <h2 class="text-2xl font-bold mb-2 text-gray-900">Resumen</h2>
            <p class="text-gray-500">Revisa los detalles antes de guardar.</p>
        </div>

        <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200">Detalles del Diseño</h3>
            <div class="space-y-4">
                <div class="flex justify-between">
                    <span class="text-gray-500">Tipo de prenda</span>
                    <span id="summary-type" class="font-bold text-gray-900">Polo</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">Color</span>
                    <span id="summary-color" class="font-bold text-gray-900">#333333</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">Textura</span>
                    <span id="summary-texture" class="font-bold text-gray-900">Algodón</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">Medidas</span>
                    <span id="summary-measures" class="font-bold text-gray-900">Sin especificar</span>
                </div>
            </div>
        </div>

        <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Nombre del diseño</label>
            <input type="text" id="design-name-input" class="w-full bg-white border border-gray-200 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all" placeholder="ej: Polera Verano 2025">
        </div>

        <div class="space-y-3 pt-4">
            <button id="save-design-btn" class="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-200 flex items-center justify-center gap-2">
                <span class="material-icons text-sm">save</span>
                Guardar Diseño
            </button>
            <button id="edit-steps-btn" class="w-full bg-white text-gray-700 py-3 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition flex items-center justify-center gap-2">
                <span class="material-icons text-sm">edit</span>
                Editar pasos anteriores
            </button>
        </div>
    </div>
    `;
}
