import { supabase } from '../js/supabase.js';
import { getCurrentUser, signOut } from '../js/auth.js';

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
            // This is a bit complex in standard SQL without a dedicated conversations table
            // We'll fetch all messages involving the user and group them
            const { data: messages, error } = await supabase
                .from('messages')
                .select(`
                    *,
                    sender:sender_id(id, full_name, avatar_url),
                    receiver:receiver_id(id, full_name, avatar_url)
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
                if (!otherUser) return; // Should not happen

                if (!convMap.has(otherUser.id)) {
                    convMap.set(otherUser.id, {
                        id: otherUser.id,
                        name: otherUser.full_name || 'Usuario',
                        avatar: otherUser.avatar_url || 'https://via.placeholder.com/150',
                        lastMessage: msg.content,
                        time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        unread: (msg.receiver_id === user.id && !msg.is_read) ? 1 : 0, // Simple unread count logic
                        online: false, // Need presence for this
                        messages: []
                    });
                } else {
                    // Accumulate unread count
                    if (msg.receiver_id === user.id && !msg.is_read) {
                        convMap.get(otherUser.id).unread++;
                    }
                }
                // Add message to conversation
                convMap.get(otherUser.id).messages.unshift({
                    text: msg.content,
                    image: msg.image_url,
                    time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    sender: msg.sender_id === user.id ? 'me' : 'contact'
                });
            });

            conversations = Array.from(convMap.values());

            // If starting a new chat with someone not in list
            if (recipientId && !convMap.has(recipientId)) {
                // Fetch recipient details
                const { data: recipient } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', recipientId)
                    .single();

                if (recipient) {
                    const newConv = {
                        id: recipient.id,
                        name: recipient.full_name,
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
            if (activeChatUser) renderChat();
        }

        function renderConversations() {
            const list = document.getElementById('conversation-list');
            if (!list) return;

            if (conversations.length === 0) {
                list.innerHTML = '<div class="p-4 text-a-gray text-center">No tienes conversaciones.</div>';
                return;
            }

            list.innerHTML = conversations.map(c => `
                <div class="conversation-item flex cursor-pointer gap-4 px-4 py-3 justify-between hover:bg-p-panel transition-colors duration-200 ${activeChatUser && c.id === activeChatUser.id ? 'bg-a-copper/20 border-l-2 border-a-gold' : 'border-l-2 border-transparent'}" data-id="${c.id}">
                    <div class="flex items-center gap-4">
                        <div class="relative">
                            <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-14" style='background-image: url("${c.avatar}");'></div>
                            ${c.online ? '<div class="absolute bottom-0 right-0 size-4 rounded-full bg-green-500 border-2 border-p-panel"></div>' : ''}
                        </div>
                        <div class="flex flex-1 flex-col justify-center">
                            <p class="text-a-beige text-base font-medium leading-normal">${c.name}</p>
                            <p class="text-a-gold text-sm font-medium leading-normal truncate w-48">${c.lastMessage}</p>
                        </div>
                    </div>
                    <div class="shrink-0 flex flex-col items-end gap-2">
                        <p class="text-a-gray text-xs font-normal">${c.time}</p>
                        ${c.unread > 0 ? `<div class="flex size-6 items-center justify-center rounded-full bg-a-gold text-p-base text-xs font-bold">${c.unread}</div>` : ''}
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
                            <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12" style='background-image: url("${chat.avatar}");'></div>
                            ${chat.online ? '<div class="absolute bottom-0 right-0 size-3.5 rounded-full bg-green-500 border-2 border-p-panel"></div>' : ''}
                        </div>
                        <div>
                            <h2 class="text-lg font-semibold text-a-beige">${chat.name}</h2>
                            <p class="text-sm ${chat.online ? 'text-green-400' : 'text-a-gray'}">${chat.online ? 'En línea' : 'Desconectado'}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-4 text-a-gray">
                        <button class="p-2 rounded-full hover:bg-white/10 hover:text-a-beige">
                            <span class="material-symbols-outlined">call</span>
                        </button>
                        <button class="p-2 rounded-full hover:bg-white/10 hover:text-a-beige">
                            <span class="material-symbols-outlined">more_vert</span>
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
                            <div class="flex items-end gap-3 max-w-lg">
                                <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 shrink-0" style='background-image: url("${chat.avatar}");'></div>
                                <div class="rounded-xl rounded-bl-none bg-[#333333] px-4 py-3">
                                    <p class="text-sm text-a-beige">${m.text}</p>
                                    <span class="text-xs text-a-gray/70 float-right ml-2 mt-1">${m.time}</span>
                                </div>
                            </div>
                        `;
                    } else {
                        return `
                            <div class="flex items-end gap-3 self-end max-w-lg">
                                <div class="rounded-xl rounded-br-none bg-a-copper ${m.image ? 'p-2' : 'px-4 py-3'} shadow-[0_4px_15px_rgba(184,115,51,0.2)]">
                                    ${m.image ? `<img alt="Image" class="rounded-lg h-48 w-auto" src="${m.image}"/>` : `<p class="text-sm text-p-base">${m.text}</p>`}
                                    <span class="text-xs text-p-base/70 float-right ml-2 mt-1">${m.time}</span>
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

            // Optimistic update
            const now = new Date();
            const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            activeChatUser.messages.push({ text, time, sender: 'me' });
            activeChatUser.lastMessage = text;
            activeChatUser.time = time;
            input.value = '';
            renderConversations();
            renderChat();

            // Send to Supabase
            const { error } = await supabase
                .from('messages')
                .insert({
                    sender_id: user.id,
                    receiver_id: activeChatUser.id,
                    content: text
                });

            if (error) {
                console.error('Error sending message:', error);
                // Revert optimistic update? For now just log
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
                // If message is for me or from me (though from me is handled optimistically, but good to sync)
                if (msg.receiver_id === user.id || msg.sender_id === user.id) {
                    // Refresh conversations to handle new messages properly
                    // A more optimized way would be to just append, but full refresh ensures consistency
                    fetchConversations();
                }
            })
            .subscribe();

        // Initial fetch
        await fetchConversations();

    }, 0);

    return `
    <div class="flex h-screen w-full text-a-beige bg-p-base font-display">
        <!-- SideNavBar (Dynamic) -->
        <div id="chat-sidebar">
            <!-- Will be populated based on user role -->
        </div>
        <!-- Main Content -->
        <main class="flex flex-1 overflow-hidden">
            <!-- A. Left Panel (Conversation List) -->
            <div class="flex w-[380px] flex-col border-r border-white/10 bg-gradient-to-b from-p-base to-[#151515]">
                <div class="p-4">
                    <label class="flex flex-col min-w-40 h-12 w-full">
                        <div class="flex w-full flex-1 items-stretch rounded-lg h-full">
                            <div class="text-a-gray flex border-none bg-p-panel items-center justify-center pl-4 rounded-l-lg border-r-0">
                                <span class="material-symbols-outlined">search</span>
                            </div>
                            <input class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-a-beige focus:outline-0 focus:ring-1 focus:ring-a-copper border-none bg-p-panel h-full placeholder:text-a-gray px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal" placeholder="Buscar en conversaciones..." value=""/>
                        </div>
                    </label>
                </div>
                <div class="flex-1 overflow-y-auto">
                    <!-- ListItems -->
                    <div class="flex flex-col" id="conversation-list">
                        <!-- Injected via JS -->
                        <div class="p-4 text-center text-a-gray">Cargando conversaciones...</div>
                    </div>
                </div>
            </div>
            <!-- B. Right Panel (Main Chat) -->
            <div class="flex flex-1 flex-col bg-p-panel bg-cover bg-center" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDi8hc93X9PWfkm3xt4JaVQuUuUWY3ITw1wgzfMbEc1z58iBL4ZPWnPg8XpDTMpYH5IscRk8GLpAfeNE5D9gq1WfRoEr8kJWm3yz389SnF-gbI-Udn0yfoeKyfcpGl-XeUlYad8dJlJ8aEA9o7aNeydd83oxC17ZLGk-YqdBcrKRfgmZz_uk6pvBOFALBefquNqlp6KZ1ROa5KIJL3j7RLP7yo07c8QmM34YPGuNZvYx606qT4uo1BWjZwtHg0mr_lc4WD2GSg8rvU');">
                <!-- Chat Header -->
                <header class="flex items-center justify-between border-b border-white/10 bg-p-panel/80 px-6 py-4 backdrop-blur-sm" id="chat-header">
                    <!-- Injected via JS -->
                </header>
                <!-- Message Area -->
                <div class="flex-1 overflow-y-auto p-6">
                    <div class="flex flex-col gap-4" id="chat-messages">
                         <!-- Injected via JS -->
                         <div class="flex flex-col items-center justify-center h-full text-a-gray">
                            <span class="material-symbols-outlined text-6xl mb-4">chat</span>
                            <p>Selecciona una conversación para empezar.</p>
                         </div>
                    </div>
                </div>
                <!-- Message Input -->
                <div class="mt-auto bg-p-panel/80 p-4 backdrop-blur-sm">
                    <div class="flex items-center gap-4">
                        <button class="p-2 rounded-full text-a-gray hover:bg-white/10 hover:text-a-beige">
                            <span class="material-symbols-outlined">add</span>
                        </button>
                        <input id="message-input" class="flex-1 rounded-lg border-none bg-[#333333] px-4 py-3 text-sm text-a-beige placeholder-a-gray focus:ring-1 focus:ring-a-copper" placeholder="Escribe un mensaje..." type="text"/>
                        <button id="send-btn" class="flex items-center justify-center size-11 rounded-full bg-a-copper text-p-base shadow-[0_0_15px_rgba(184,115,51,0.4)] hover:bg-a-gold transition-colors">
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
    <aside class="flex w-64 flex-col bg-p-sidebar p-4 border-r border-white/5">
        <div class="mb-8 flex items-center gap-3">
            <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style="background-image: url('${profile.avatar_url || ''}'); background-color: rgba(212,175,55,0.2);">
                ${!profile.avatar_url ? '<span class="material-symbols-outlined text-a-gold">checkroom</span>' : ''}
            </div>
            <div class="flex flex-col">
                <h1 class="text-base font-medium leading-normal text-white">${profile.full_name || 'Confeccionista'}</h1>
                <p class="text-sm font-normal leading-normal text-a-gold uppercase">${profile.plan || 'Free'}</p>
            </div>
        </div>
        <nav class="flex flex-1 flex-col gap-2">
            <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-a-beige hover:bg-p-panel hover:text-a-gold transition-colors" href="/maker-dashboard">
                <span class="material-symbols-outlined text-2xl">dashboard</span>
                <p class="text-sm font-medium leading-normal">Dashboard</p>
            </a>
            <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-a-beige hover:bg-p-panel hover:text-a-gold transition-colors" href="/maker-orders">
                <span class="material-symbols-outlined text-2xl">inventory_2</span>
                <p class="text-sm font-medium leading-normal">Pedidos</p>
            </a>
            <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-a-beige hover:bg-p-panel hover:text-a-gold transition-colors" href="/maker-profile-edit">
                <span class="material-symbols-outlined text-2xl">person_edit</span>
                <p class="text-sm font-medium leading-normal">Mi Perfil</p>
            </a>
            <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-a-beige hover:bg-p-panel hover:text-a-gold transition-colors" href="/maker-portfolio">
                <span class="material-symbols-outlined text-2xl">photo_library</span>
                <p class="text-sm font-medium leading-normal">Portafolio</p>
            </a>
            <a class="flex items-center gap-3 rounded-lg bg-a-copper/20 px-3 py-2 text-a-gold shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-colors" href="/chat">
                <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">chat_bubble</span>
                <p class="text-sm font-medium leading-normal">Chat</p>
            </a>
        </nav>
        <div class="mt-auto">
            <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-a-beige hover:bg-p-panel hover:text-a-gold transition-colors" href="/logout" id="logout-btn">
                <span class="material-symbols-outlined text-2xl">logout</span>
                <p class="text-sm font-medium leading-normal">Cerrar sesión</p>
            </a>
        </div>
    </aside>
    `;
}

function renderClientSidebar(profile) {
    return `
    <aside class="flex w-64 flex-col bg-p-sidebar p-4 border-r border-white/5">
        <div class="mb-8 flex items-center gap-3">
            <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-primary/20 flex items-center justify-center text-primary font-bold">
                ${profile.avatar_url ? `<img src="${profile.avatar_url}" class="w-full h-full rounded-full object-cover">` : 'U'}
            </div>
            <div class="flex flex-col">
                <h1 class="text-base font-medium leading-normal text-white">PeruStyle</h1>
                <p class="text-sm font-normal leading-normal text-a-gray">Customer Dashboard</p>
            </div>
        </div>
        <nav class="flex flex-1 flex-col gap-2">
            <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-a-beige hover:bg-p-panel hover:text-a-gold transition-colors" href="/client-dashboard">
                <span class="material-symbols-outlined text-2xl">dashboard</span>
                <p class="text-sm font-medium leading-normal">Dashboard / Inicio</p>
            </a>
            <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-a-beige hover:bg-p-panel hover:text-a-gold transition-colors" href="/my-designs">
                <span class="material-symbols-outlined text-2xl">design_services</span>
                <p class="text-sm font-medium leading-normal">Mis Diseños</p>
            </a>
            <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-a-beige hover:bg-p-panel hover:text-a-gold transition-colors" href="/orders">
                <span class="material-symbols-outlined text-2xl">inventory_2</span>
                <p class="text-sm font-medium leading-normal">Mis Pedidos</p>
            </a>
            <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-a-beige hover:bg-p-panel hover:text-a-gold transition-colors" href="/makers">
                <span class="material-symbols-outlined text-2xl">storefront</span>
                <p class="text-sm font-medium leading-normal">Explorar</p>
            </a>
            <a class="flex items-center gap-3 rounded-lg bg-a-copper/20 px-3 py-2 text-a-gold shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-colors" href="/chat">
                <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">chat_bubble</span>
                <p class="text-sm font-medium leading-normal">Chat</p>
            </a>
            <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-a-beige hover:bg-p-panel hover:text-a-gold transition-colors" href="/profile">
                <span class="material-symbols-outlined text-2xl">person</span>
                <p class="text-sm font-medium leading-normal">Mi Perfil</p>
            </a>
            <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-a-beige hover:bg-p-panel hover:text-a-gold transition-colors" href="/plans">
                <span class="material-symbols-outlined text-2xl">credit_card</span>
                <p class="text-sm font-medium leading-normal">Mi Suscripción</p>
            </a>
        </nav>
        <div class="mt-auto">
            <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-a-beige hover:bg-p-panel hover:text-a-gold transition-colors" href="/logout" id="logout-btn">
                <span class="material-symbols-outlined text-2xl">logout</span>
                <p class="text-sm font-medium leading-normal">Cerrar sesión</p>
            </a>
        </div>
    </aside>
    `;
}

