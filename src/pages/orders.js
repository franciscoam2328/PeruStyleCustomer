import { supabase } from '../js/supabase.js';
import { getCurrentUser } from '../js/auth.js';

export async function OrdersPage() {
    const user = await getCurrentUser();

    if (!user) {
        return `
        <div class="pt-24 text-center">
            <h2 class="text-2xl font-bold text-gray-900">Debes iniciar sesión</h2>
            <p class="mt-4 text-gray-600">Por favor, ingresa a tu cuenta para ver tus pedidos.</p>
            <a href="/login" class="mt-6 inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-red-700 transition" data-link>Ir al Login</a>
        </div>
        `;
    }

    // Fetch orders
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            *,
            designs (name, preview_url)
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        return `<div class="pt-24 text-center text-red-500">Error al cargar pedidos: ${error.message}</div>`;
    }

    if (!orders || orders.length === 0) {
        return `
        <div class="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-8">Mis Pedidos</h1>
            <div class="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
                <div class="text-6xl mb-4">📦</div>
                <h3 class="text-xl font-medium text-gray-900">Aún no tienes pedidos</h3>
                <p class="mt-2 text-gray-500">¡Empieza diseñando tu primera prenda personalizada!</p>
                <a href="/designer" class="mt-6 inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition" data-link>
                    Crear Nuevo Diseño
                </a>
            </div>
        </div>
        `;
    }

    const statusColors = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'accepted': 'bg-blue-100 text-blue-800',
        'in_progress': 'bg-purple-100 text-purple-800',
        'shipped': 'bg-indigo-100 text-indigo-800',
        'completed': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800'
    };

    const statusLabels = {
        'pending': 'Pendiente',
        'accepted': 'Aceptado',
        'in_progress': 'En Confección',
        'shipped': 'Enviado',
        'completed': 'Completado',
        'cancelled': 'Cancelado'
    };

    const ordersHtml = orders.map(order => `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
            <div class="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div class="flex items-center gap-6 w-full md:w-auto">
                    <div class="h-20 w-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <span class="text-2xl">👕</span>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">${order.designs?.name || 'Diseño sin nombre'}</h3>
                        <p class="text-sm text-gray-500">Orden #${order.id.slice(0, 8)}</p>
                        <p class="text-sm text-gray-500">Fecha: ${new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                
                <div class="flex flex-col items-end gap-2 w-full md:w-auto">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}">
                        ${statusLabels[order.status] || order.status}
                    </span>
                    <span class="font-bold text-gray-900">
                        ${order.price ? `$${order.price}` : 'Por cotizar'}
                    </span>
                    ${order.status === 'accepted' && order.payment_status === 'unpaid'
            ? `<button class="text-sm bg-primary text-white px-4 py-1 rounded hover:bg-red-700 transition">Pagar Ahora</button>`
            : ''}
                </div>
            </div>
        </div>
    `).join('');

    return `
    <div class="pt-24 pb-12 bg-gray-50 min-h-screen">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-8">Mis Pedidos</h1>
            <div class="space-y-4">
                ${ordersHtml}
            </div>
        </div>
    </div>
    `;
}
