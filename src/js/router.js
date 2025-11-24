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
import { MakerProfilePage } from '../pages/maker-profile.js';
import { ChatPage } from '../pages/chat.js';
import { MakerOrdersPage } from '../pages/maker-orders.js';
import { MakerProfileEditPage } from '../pages/maker-profile-edit.js';
import { MakerPortfolioPage } from '../pages/maker-portfolio.js';
import { MakerPlansPage } from '../pages/maker-plans.js';
import { NotificationsPage } from '../pages/notifications.js';
import { Navbar } from '../components/navbar.js';

const routes = {
    '/': HomePage,
    '/login': LoginPage,
    '/designer': DesignerPage,
    '/orders': OrdersPage,
    '/makers': MakersPage,
    '/maker-profile': MakerProfilePage,
    '/chat': ChatPage,
    '/maker-dashboard': MakerDashboardPage,
    '/maker-orders': MakerOrdersPage,
    '/maker-profile-edit': MakerProfileEditPage,
    '/maker-portfolio': MakerPortfolioPage,
    '/maker-plans': MakerPlansPage,
    '/notifications': NotificationsPage,
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
        // Handle query params and hash
        const [pathWithoutQuery, queryString] = path.split('?');
        const [cleanPath, hash] = pathWithoutQuery.split('#');

        const view = routes[cleanPath] || routes['/'];

        // Lista de rutas donde NO se debe mostrar el navbar (solo para usuarios autenticados)
        const dashboardRoutes = [
            '/client-dashboard',
            '/maker-dashboard',
            '/maker-orders',
            '/maker-profile-edit',
            '/maker-portfolio',
            '/maker-plans',
            '/notifications',
            '/designer',
            '/my-designs',
            '/profile',
            '/orders',
            '/chat',
            '/makers',
            '/maker-profile'
        ];
        const shouldShowNavbar = !dashboardRoutes.includes(cleanPath);

        // Mostrar u ocultar navbar según la ruta
        if (navContainer) {
            if (shouldShowNavbar) {
                navContainer.innerHTML = await Navbar();
            } else {
                navContainer.innerHTML = ''; // Ocultar navbar en dashboards
            }
        }

        app.innerHTML = await view();

        // Handle Hash Scrolling
        if (hash) {
            setTimeout(() => {
                const element = document.getElementById(hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        } else if (path.includes('#')) {
            // Fallback if hash was in the second part of split (e.g. /#id)
            const actualHash = path.split('#')[1];
            if (actualHash) {
                setTimeout(() => {
                    const element = document.getElementById(actualHash);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
            }
        }

        // Re-attach event listeners for links
        document.querySelectorAll('[data-link]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                navigateTo(e.target.getAttribute('href'));
            });
        });
    };

    window.addEventListener('popstate', () => {
        render(location.pathname + location.hash);
    });

    // Initial render
    render(location.pathname + location.hash);
}
