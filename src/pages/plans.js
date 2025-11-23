import { getCurrentUser } from '../js/auth.js';
import { supabase } from '../js/supabase.js';

export async function PlansPage() {
    const user = await getCurrentUser();
    let role = 'client'; // Default view

    if (user) {
        const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        if (data) role = data.role;
    }

    // Define plans
    const clientPlans = [
        { name: 'Básico', price: '0.00', features: ['Diseños ilimitados', 'Guardar 3 diseños', 'Acceso a confeccionistas'], id: 'client_basic' },
        { name: 'Premium', price: '9.99', features: ['Guardado ilimitado', 'Exportar modelos 3D', 'Soporte prioritario'], id: 'client_premium' },
        { name: 'Pro', price: '19.99', features: ['Todo lo de Premium', 'Descuentos en confección', 'Asesoría de imagen'], id: 'client_pro' }
    ];

    const makerPlans = [
        { name: 'Inicial', price: '0.00', features: ['Perfil visible', 'Hasta 5 pedidos/mes', 'Comisión estándar'], id: 'maker_basic' },
        { name: 'Profesional', price: '29.99', features: ['Pedidos ilimitados', 'Perfil destacado', 'Comisión reducida'], id: 'maker_premium' },
        { name: 'Empresarial', price: '49.99', features: ['Todo lo de Profesional', 'Analíticas avanzadas', 'Soporte 24/7'], id: 'maker_pro' }
    ];

    const activePlans = role === 'maker' ? makerPlans : clientPlans;
    const title = role === 'maker' ? 'Planes para Confeccionistas' : 'Planes para Clientes';

    setTimeout(() => {
        // Render PayPal buttons for paid plans
        activePlans.forEach(plan => {
            if (plan.price === '0.00') return;

            const containerId = `paypal-button-container-${plan.id}`;
            const container = document.getElementById(containerId);

            if (container && window.paypal) {
                window.paypal.Buttons({
                    createOrder: async (data, actions) => {
                        const response = await fetch('/api/paypal/create-order', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ plan: plan.id, price: plan.price })
                        });
                        const order = await response.json();
                        return order.id;
                    },
                    onApprove: async (data, actions) => {
                        const response = await fetch('/api/paypal/capture-order', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ orderID: data.orderID })
                        });
                        const details = await response.json();

                        if (details.status === 'success') {
                            alert(`¡Pago exitoso! Bienvenido al plan ${plan.name}`);
                            // Update user plan in DB
                            await supabase.from('profiles').update({ plan: plan.id.split('_')[1] }).eq('id', user.id);
                            window.location.reload();
                        } else {
                            alert('Hubo un problema con el pago.');
                        }
                    }
                }).render(`#${containerId}`);
            }
        });
    }, 0);

    const plansHtml = activePlans.map(plan => `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col">
            <div class="p-8 text-center">
                <h3 class="text-2xl font-bold text-gray-900 mb-2">${plan.name}</h3>
                <div class="text-4xl font-bold text-primary mb-4">$${plan.price}<span class="text-base text-gray-500 font-normal">/mes</span></div>
                <ul class="text-left space-y-3 mb-8 text-gray-600">
                    ${plan.features.map(f => `<li class="flex items-center"><span class="text-green-500 mr-2">✓</span>${f}</li>`).join('')}
                </ul>
                
                ${plan.price === '0.00'
            ? `<button class="w-full bg-gray-100 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-200 transition">Plan Actual</button>`
            : `<div id="paypal-button-container-${plan.id}" class="w-full"></div>`
        }
            </div>
        </div>
    `).join('');

    return `
    <div class="pt-24 pb-12 bg-gray-50 min-h-screen">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-12">
                <h1 class="text-4xl font-bold text-gray-900 mb-4">${title}</h1>
                <p class="text-xl text-gray-600">Elige el plan perfecto para potenciar tu experiencia en PeruStyle.</p>
                ${!user ? '<p class="mt-4 text-sm text-red-500">Inicia sesión para ver los planes específicos para tu rol.</p>' : ''}
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                ${plansHtml}
            </div>
        </div>
    </div>
    `;
}
