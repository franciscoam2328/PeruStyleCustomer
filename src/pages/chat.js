import { supabase } from '../js/supabase.js';
import { getCurrentUser, signOut } from '../js/auth.js';
import { getLogo } from '../components/logo.js';

export function ChatPage() {
    let userProfile = null; // Store profile for sidebar rendering

    setTimeout(async () => {
        const user = await getCurrentUser();
        if (!user) {
            window.location.href = '/login';
            return;
        }

        // Fetch user profile to determine role
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        userProfile = profile;

        // Render the correct sidebar based on role
        const sidebarContainer = document.getElementById('chat-sidebar');
        if (sidebarContainer && userProfile) {
            sidebarContainer.innerHTML = userProfile.role === 'maker' ? renderMakerSidebar(userProfile) : renderClientSidebar(userProfile);
        }

        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', async () => {
            await signOut();
            window.location.href = '/login';
        });

        const urlParams = new URLSearchParams(window.location.search);
        const recipientId = urlParams.get('recipient_id');

        let activeChatUser = null;
        let conversations = [];
        let realtimeChannel = null;

        // Fetch conversations (unique users interacted with)
        async function fetchConversations() {
            const { data: messages, error } = await supabase
                .from('messages')
                .select(`
                    *,
                    sender:profiles!sender_id(id, full_name, avatar_url),
                    receiver:profiles!receiver_id(id, full_name, avatar_url)
                `)
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching messages:', error);
                return;
            }

            const convMap = new Map();
            messages.forEach(msg => {
                const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender;
                if (!otherUser) return;

                if (!convMap.has(otherUser.id)) {
                    convMap.set(otherUser.id, {
                        id: otherUser.id,
                        name: otherUser.full_name || 'Usuario',
                        avatar: otherUser.avatar_url || 'https://via.placeholder.com/150',
                        lastMessage: msg.content,
                        time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        unread: (msg.receiver_id === user.id && !msg.is_read) ? 1 : 0,
                        online: false,
                        messages: []
                    });
                } else {
                    if (msg.receiver_id === user.id && !msg.is_read) {
                        convMap.get(otherUser.id).unread++;
                    }
                }
                convMap.get(otherUser.id).messages.unshift({
                    text: msg.content,
                    image: msg.image_url,
                    time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    sender: msg.sender_id === user.id ? 'me' : 'contact'
                });
            });

            conversations = Array.from(convMap.values());

            if (recipientId && !convMap.has(recipientId)) {
                const { data: recipient } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', recipientId)
                    .single();

                if (recipient) {
                    const newConv = {
                        id: recipient.id,
                        name: recipient.full_name || 'Usuario',
                        avatar: recipient.avatar_url || 'https://via.placeholder.com/150',
                        lastMessage: 'Nuevo chat',
                        time: '',
                        unread: 0,
                        online: false,
                        messages: []
                    };
                    conversations.unshift(newConv);
                    activeChatUser = newConv;
                }
            } else if (recipientId && convMap.has(recipientId)) {
                activeChatUser = convMap.get(recipientId);
            } else if (conversations.length > 0) {
                activeChatUser = conversations[0];
            }

            renderConversations();
            if (activeChatUser) {
                renderChat();
            }
        }

        function renderConversations() {
            const list = document.getElementById('conversation-list');
            if (!list) return;

            if (conversations.length === 0) {
                list.innerHTML = '<div class="p-4 text-on-surface/60 text-center">No tienes conversaciones.</div>';
                return;
            }

            list.innerHTML = conversations.map(c => `
                <div class="conversation-item flex cursor-pointer gap-4 px-4 py-3 justify-between hover:bg-surface transition-colors duration-200 ${activeChatUser && c.id === activeChatUser.id ? 'bg-surface border-l-4 border-primary' : 'border-l-4 border-transparent'}" data-id="${c.id}">
                    <div class="flex items-center gap-4">
                        <div class="relative">
                            <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 border border-white/10" style='background-image: url("${c.avatar}");'></div>
                            ${c.online ? '<div class="absolute bottom-0 right-0 size-3 rounded-full bg-green-500 border-2 border-base"></div>' : ''}
                        </div>
                        <div class="flex flex-1 flex-col justify-center">
                            <p class="text-on-surface text-sm font-bold leading-normal">${c.name}</p>
                            <p class="text-on-surface/60 text-xs font-medium leading-normal truncate w-40">${c.lastMessage}</p>
                        </div>
                    </div>
                    <div class="shrink-0 flex flex-col items-end gap-1">
                        <p class="text-on-surface/40 text-[10px] font-normal">${c.time}</p>
                        ${c.unread > 0 ? `<div class="flex size-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">${c.unread}</div>` : ''}
                    </div>
                </div>
            `).join('');

            document.querySelectorAll('.conversation-item').forEach(item => {
                item.addEventListener('click', () => {
                    const id = item.dataset.id;
                    activeChatUser = conversations.find(c => c.id === id);
                    renderConversations();
                    renderChat();
                });
            });
        }

        function renderChat() {
            const chat = activeChatUser;
            if (!chat) return;

            // Update Header
            const header = document.getElementById('chat-header');
            if (header) {
                header.innerHTML = `
                    <div class="flex items-center gap-4">
                        <div class="relative">
                            <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-white/10" style='background-image: url("${chat.avatar}");'></div>
                            ${chat.online ? '<div class="absolute bottom-0 right-0 size-3 rounded-full bg-green-500 border-2 border-base"></div>' : ''}
                        </div>
                        <div>
                            <h2 class="text-base font-bold text-on-surface">${chat.name}</h2>
                            <p class="text-xs ${chat.online ? 'text-green-500' : 'text-on-surface/40'}">${chat.online ? 'En línea' : 'Desconectado'}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-on-surface/60">
                        <button class="p-2 rounded-full hover:bg-surface hover:text-on-surface transition-colors">
                            <span class="material-symbols-outlined text-xl">call</span>
                        </button>
                        <button class="p-2 rounded-full hover:bg-surface hover:text-on-surface transition-colors">
                            <span class="material-symbols-outlined text-xl">more_vert</span>
                        </button>
                    </div>
                `;
            }

            // Update Messages
            const messagesContainer = document.getElementById('chat-messages');
            if (messagesContainer) {
                messagesContainer.innerHTML = chat.messages.map(m => {
                    if (m.sender === 'contact') {
                        return `
                            <div class="flex items-end gap-3 max-w-[80%]">
                                <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 shrink-0 border border-white/10" style='background-image: url("${chat.avatar}");'></div>
                                <div class="rounded-2xl rounded-bl-none bg-white border border-gray-200 px-4 py-3 shadow-sm">
                                    <p class="text-sm text-gray-800">${m.text}</p>
                                    <span class="text-[10px] text-gray-400 float-right ml-2 mt-1">${m.time}</span>
                                </div>
                            </div>
                        `;
                    } else {
                        return `
                            <div class="flex items-end gap-3 self-end max-w-[80%]">
                                <div class="rounded-2xl rounded-br-none bg-primary px-4 py-3 shadow-md">
                                    ${m.image ? `<img alt="Image" class="rounded-lg h-48 w-auto" src="${m.image}"/>` : `<p class="text-sm text-white font-medium">${m.text}</p>`}
                                    <span class="text-[10px] text-white/60 float-right ml-2 mt-1">${m.time}</span>
                                </div>
                            </div>
                        `;
                    }
                }).join('');
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }

        // Send Message Logic
        const sendBtn = document.getElementById('send-btn');
        const input = document.getElementById('message-input');

        const sendMessage = async () => {
            const text = input.value.trim();
            if (!text || !activeChatUser) return;

            const now = new Date();
            const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            activeChatUser.messages.push({ text, time, sender: 'me' });
            activeChatUser.lastMessage = text;
            activeChatUser.time = time;
            input.value = '';
            renderConversations();
            renderChat();

            const { error } = await supabase
                .from('messages')
                .insert({
                    sender_id: user.id,
                    receiver_id: activeChatUser.id,
                    content: text
                });

            if (error) {
                console.error('Error sending message:', error);
            }
        };

        if (sendBtn) sendBtn.addEventListener('click', sendMessage);
        if (input) input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });

        // Realtime Subscription
        realtimeChannel = supabase.channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
                const msg = payload.new;
                if (msg.receiver_id === user.id || msg.sender_id === user.id) {
                    fetchConversations();
                }
            })
            .subscribe();

        await fetchConversations();

    }, 0);

    return `
    <div class="flex h-screen w-full bg-base font-display text-on-surface overflow-hidden">
        <!-- SideNavBar (Dynamic) -->
        <div id="chat-sidebar" class="hidden md:block">
            <!-- Will be populated based on user role -->
        </div>
        
        <!-- Main Content -->
        <main class="flex flex-1 overflow-hidden bg-base">
            <!-- A. Left Panel (Conversation List) -->
            <div class="flex w-full md:w-[320px] lg:w-[360px] flex-col border-r border-surface/50 bg-base">
                <div class="p-4 border-b border-surface/50">
                    <h1 class="text-xl font-bold text-on-surface mb-4 md:hidden">Mensajes</h1>
                    <div class="relative">
                        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/40">search</span>
                        <input class="w-full rounded-lg bg-surface border border-white/10 pl-10 pr-4 py-2 text-sm text-on-surface placeholder:text-on-surface/40 focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Buscar en conversaciones..." />
                    </div>
                </div>
                <div class="flex-1 overflow-y-auto" id="conversation-list">
                    <!-- ListItems -->
                </div>
            </div>
            
            <!-- B. Right Panel (Main Chat) -->
            <div class="hidden md:flex flex-1 flex-col bg-surface/30 relative">
                <!-- Chat Header -->
                <header class="flex items-center justify-between border-b border-surface/50 bg-base px-6 py-4 shadow-sm z-10" id="chat-header">
                    <!-- Injected via JS -->
                    <div class="flex items-center gap-4">
                        <div class="h-10 w-10 rounded-full bg-surface animate-pulse"></div>
                        <div class="space-y-2">
                            <div class="h-4 w-32 bg-surface rounded animate-pulse"></div>
                            <div class="h-3 w-20 bg-surface rounded animate-pulse"></div>
                        </div>
                    </div>
                </header>
                
                <!-- Message Area -->
                <div class="flex-1 overflow-y-auto p-6 bg-repeat" style="background-image: radial-gradient(#00000005 1px, transparent 1px); background-size: 20px 20px;">
                    <div class="flex flex-col gap-4" id="chat-messages">
                         <!-- Injected via JS -->
                         <div class="flex flex-col items-center justify-center h-full text-on-surface/40">
                            <span class="material-symbols-outlined text-6xl mb-4">chat</span>
                            <p>Selecciona una conversación para empezar.</p>
                         </div>
                    </div>
                </div>
                
                <!-- Message Input -->
                <div class="mt-auto bg-base p-4 border-t border-surface/50">
                    <div class="flex items-center gap-4 max-w-4xl mx-auto">
                        <button class="p-2 rounded-full text-on-surface/60 hover:bg-surface hover:text-primary transition-colors">
                            <span class="material-symbols-outlined">add_circle</span>
                        </button>
                        <input id="message-input" class="flex-1 rounded-full border border-white/10 bg-surface px-6 py-3 text-sm text-on-surface placeholder-on-surface/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm" placeholder="Escribe un mensaje..." type="text"/>
                        <button id="send-btn" class="flex items-center justify-center size-11 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 hover:scale-105 transition-all">
                            <span class="material-symbols-outlined">send</span>
                        </button>
                    </div>
                </div>
            </div>
        </main>
    </div>
    `;
}

// Sidebar rendering helper functions
function renderMakerSidebar(profile) {
    return `
    <aside class="w-64 flex-shrink-0 bg-base border-r border-surface/50 p-4 flex flex-col justify-between hidden md:flex sticky top-0 h-screen z-20">
        <div class="flex flex-col gap-8">
            <div class="px-3 flex justify-center">
                <a href="/maker-dashboard">
                    ${getLogo({ width: "160", height: "45" })}
                </a>
            </div>
            <nav class="flex flex-col gap-2">
                <a href="/maker-dashboard" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                    <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">dashboard</span>
                    <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Dashboard</p>
                </a>
                <a href="/maker-orders" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                    <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">inventory_2</span>
                    <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Pedidos</p>
                </a>
                <a href="/maker-profile" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                    <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">person</span>
                    <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Mi Perfil</p>
                </a>
                <a href="/chat" class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface hover:bg-primary/20 transition-colors duration-200 group">
                    <span class="material-symbols-outlined text-xl group-hover:text-primary transition-colors">chat_bubble_outline</span>
                    <p class="text-on-surface text-sm font-medium">Chat</p>
                </a>
                <a href="/maker-plans" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                    <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">workspace_premium</span>
                    <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Mi Suscripción</p>
                </a>
            </nav>
        </div>
        <div class="flex flex-col gap-1">
            <button id="logout-btn" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group text-left w-full">
                <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-red-500 transition-colors">logout</span>
                <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Cerrar sesión</p>
            </button>
        </div>
    </aside>
    `;
}

function renderClientSidebar(profile) {
    return `
    <aside class="w-64 flex-shrink-0 bg-base border-r border-surface/50 p-4 flex flex-col justify-between hidden md:flex sticky top-0 h-screen z-20">
        <div class="flex flex-col gap-8">
            <div class="px-3 flex justify-center">
                <a href="/client-dashboard">
                    ${getLogo({ width: "160", height: "45" })}
                </a>
            </div>
            <nav class="flex flex-col gap-2">
                <a href="/client-dashboard" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                    <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">grid_view</span>
                    <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Dashboard</p>
                </a>
                <a href="/my-designs" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                    <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">design_services</span>
                    <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Mis Diseños</p>
                </a>
                <a href="/orders" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                    <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">inventory_2</span>
                    <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Mis Pedidos</p>
                </a>
                <a href="/explore-makers" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                    <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">storefront</span>
                    <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Explorar</p>
                </a>
                <a href="/chat" class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface hover:bg-primary/20 transition-colors duration-200 group">
                    <span class="material-symbols-outlined text-xl group-hover:text-primary transition-colors">chat_bubble_outline</span>
                    <p class="text-on-surface text-sm font-medium">Chat</p>
                </a>
                <a href="/profile" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                    <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">person</span>
                    <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Mi Perfil</p>
                </a>
                <a href="/plans" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group">
                    <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-primary transition-colors">workspace_premium</span>
                    <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Mi Suscripción</p>
                </a>
            </nav>
        </div>
        <div class="flex flex-col gap-1">
            <button id="logout-btn" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors duration-200 group text-left w-full">
                <span class="material-symbols-outlined text-xl text-on-surface/80 group-hover:text-red-500 transition-colors">logout</span>
                <p class="text-on-surface/80 group-hover:text-on-surface text-sm font-medium">Cerrar sesión</p>
            </button>
        </div>
    </aside>
    `;
}
