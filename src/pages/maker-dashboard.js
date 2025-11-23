import { supabase } from '../js/supabase.js';
import { getCurrentUser } from '../js/auth.js';

export async function MakerDashboardPage() {
    const user = await getCurrentUser();

    if (!user) {
        window.location.href = '/login';
        return '';
    }

    // Verify role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, plan')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'maker') {
        return `
        <div class="pt-24 text-center">
            <h2 class="text-2xl font-bold text-red-600">Acceso Restringido</h2>
            <p class="mt-4 text-gray-600">Esta página es solo para confeccionistas registrados.</p>
            <a href="/" class="mt-6 inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-red-700 transition" data-link>Volver al Inicio</a>
        </div>
        `;
    }

    // Fetch assigned orders
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            *,
            designs (name, preview_url),
            profiles:client_id (full_name, email)
        `)
        .eq('maker_id', user.id)
        .order('created_at', { ascending: false });

    // Setup status update handler
    window.updateOrderStatus = async (orderId, newStatus) => {
        const btn = document.getElementById(`btn-${orderId}`);
        if (btn) btn.disabled = true;

        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (error) {
            alert('Error al actualizar: ' + error.message);
            if (btn) btn.disabled = false;
        } else {
            // Refresh page (simple reload for now)
            window.location.reload();
        }
    };

    const ordersHtml = orders && orders.length > 0 ? orders.map(order => `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 class="text-lg font-bold text-gray-900">${order.designs?.name || 'Pedido'}</h3>
                    <p class="text-sm text-gray-500">Cliente: ${order.profiles?.full_name || order.profiles?.email}</p>
                    <p class="text-xs text-gray-400">ID: ${order.id}</p>
                </div>
                
                <div class="flex items-center gap-4">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                        Estado actual: ${order.status}
                    </span>
                    
                    <select onchange="updateOrderStatus('${order.id}', this.value)" class="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pendiente</option>
                        <option value="accepted" ${order.status === 'accepted' ? 'selected' : ''}>Aceptar</option>
                        <option value="in_progress" ${order.status === 'in_progress' ? 'selected' : ''}>En Proceso</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Enviado</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completado</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelar</option>
                    </select>
                </div>
            </div>
        </div>
    `).join('') : '<p class="text-gray-500 text-center py-8">No tienes pedidos asignados actualmente.</p>';

    return `
    <div class="pt-24 pb-12 bg-gray-50 min-h-screen">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col md:flex-row justify-between items-center mb-8">
                <h1 class="text-3xl font-bold text-gray-900">Panel de Confeccionista</h1>
                <div class="mt-4 md:mt-0 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                    <span class="text-gray-600 text-sm">Plan Actual:</span>
                    <span class="font-bold text-primary ml-2 uppercase">${profile.plan}</span>
                    <button class="ml-4 text-xs text-blue-600 hover:underline">Mejorar Plan</button>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Orders Column -->
                <div class="lg:col-span-2">
                    <h2 class="text-xl font-semibold text-gray-900 mb-4">Pedidos Asignados</h2>
                    ${ordersHtml}
                </div>

                <!-- Stats/Quick Actions Column -->
                <div class="space-y-6">
                    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 class="font-semibold text-gray-900 mb-4">Resumen</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="text-center p-4 bg-gray-50 rounded-lg">
                                <div class="text-2xl font-bold text-gray-900">${orders ? orders.length : 0}</div>
                                <div class="text-xs text-gray-500">Total Pedidos</div>
                            </div>
                            <div class="text-center p-4 bg-gray-50 rounded-lg">
                                <div class="text-2xl font-bold text-green-600">$0.00</div>
                                <div class="text-xs text-gray-500">Ganancias</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}
