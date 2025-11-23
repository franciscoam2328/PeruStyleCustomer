import { HomePage } from '../pages/home.js';
import { LoginPage } from '../pages/login.js';
import { DesignerPage } from '../pages/designer.js';
import { OrdersPage } from '../pages/orders.js';
import { MakersPage } from '../pages/makers.js';
import { MakerDashboardPage } from '../pages/maker-dashboard.js';
import { PlansPage } from '../pages/plans.js';
import { ProfilePage } from '../pages/profile.js';
import { ClientDashboardPage } from '../pages/client-dashboard.js';
import { MyDesignsPage } from '../pages/my-designs.js';
import { Navbar } from '../components/navbar.js';

const routes = {
    '/': HomePage,
    '/login': LoginPage,
    '/designer': DesignerPage,
    '/orders': OrdersPage,
    '/makers': MakersPage,
    '/maker-dashboard': MakerDashboardPage,
    '/plans': PlansPage,
    '/profile': ProfilePage,
    '/client-dashboard': ClientDashboardPage,
    '/my-designs': MyDesignsPage
};

export async function router() {
    const app = document.getElementById('app');
    const navContainer = document.getElementById('nav');

    const navigateTo = url => {
        history.pushState(null, null, url);
        render(url);
    };

    const render = async (path) => {
        const view = routes[path] || routes['/'];

        // Lista de rutas donde NO se debe mostrar el navbar (solo para usuarios autenticados)
        const dashboardRoutes = [
            '/client-dashboard',
            '/maker-dashboard',
            '/designer',
            '/my-designs',
            '/profile',
            '/orders',
            '/chat'
        ];
        const shouldShowNavbar = !dashboardRoutes.includes(path);

        // Mostrar u ocultar navbar según la ruta
        if (navContainer) {
            if (shouldShowNavbar) {
                navContainer.innerHTML = await Navbar();
            } else {
                navContainer.innerHTML = ''; // Ocultar navbar en dashboards
            }
        }

        app.innerHTML = await view();

        // Re-attach event listeners for links
        document.querySelectorAll('[data-link]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                navigateTo(e.target.getAttribute('href'));
            });
        });
    };

    window.addEventListener('popstate', () => {
        render(location.pathname);
    });

    // Initial render
    render(location.pathname);
}
