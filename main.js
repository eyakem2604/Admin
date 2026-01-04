// Supabase Configuration
const SUPABASE_URL = 'https://bbjlfleaksumwtimzdim.supabase.co';
const SUPABASE_KEY = 'sb_publishable_C9TxlMKsCRzYaOMZz_nsNg_9Dg3rD4y';

// Create Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const closeMenuBtn = document.querySelector('.close-menu');
const videoModal = document.querySelector('.video-modal');
const videoCloseBtn = document.querySelector('.video-close');
const searchInput = document.querySelector('.search-input');
const mobileSearch = document.querySelector('.mobile-search');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initVideoPlayer();
    initSearch();
    loadPageContent();
    setActiveNavLink();
});

// ====== NAVIGATION FUNCTIONS ======

// Initialize Navigation
function initNavigation() {
    // Hamburger menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    // Close menu button
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', closeMobileMenu);
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (mobileMenu.classList.contains('active') && 
            !mobileMenu.contains(e.target) && 
            !hamburger.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // Close menu with ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
}

// Toggle Mobile Menu
function toggleMobileMenu() {
    mobileMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    
    // Animate hamburger lines
    const lines = document.querySelectorAll('.hamburger-line');
    if (mobileMenu.classList.contains('active')) {
        lines[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        lines[1].style.opacity = '0';
        lines[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
        lines[0].style.transform = 'none';
        lines[1].style.opacity = '1';
        lines[2].style.transform = 'none';
    }
}

// Close Mobile Menu
function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    hamburger.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset hamburger lines
    const lines = document.querySelectorAll('.hamburger-line');
    lines[0].style.transform = 'none';
    lines[1].style.opacity = '1';
    lines[2].style.transform = 'none';
}

// Set Active Navigation Link
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Desktop links
    document.querySelectorAll('.nav-link').forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || 
            (currentPage === 'index.html' && linkPage === './')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Mobile links
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || 
            (currentPage === 'index.html' && linkPage === './')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ====== VIDEO PLAYER FUNCTIONS ======

// Initialize Video Player
function initVideoPlayer() {
    if (videoCloseBtn) {
        videoCloseBtn.addEventListener('click', closeVideoPlayer);
    }
    
    // Close video player when clicking outside
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            closeVideoPlayer();
        }
    });
    
    // Close with ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal.classList.contains('active')) {
            closeVideoPlayer();
        }
    });
}

// Open Video Player
function openVideoPlayer(videoId, title, description = '') {
    const container = document.querySelector('.video-container');
    
    container.innerHTML = `
        <button class="video-close">&times;</button>
        <div style="padding: 2rem;">
            <h2 style="color: white; margin-bottom: 1rem;">${title}</h2>
            ${description ? `<p style="color: #94A3B8; margin-bottom: 1.5rem;">${description}</p>` : ''}
            <div style="position: relative; padding-bottom: 56.25%; height: 0;">
                <iframe 
                    src="https://www.youtube.com/embed/${videoId}" 
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
        </div>
    `;
    
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Re-attach close button listener
    document.querySelector('.video-close').addEventListener('click', closeVideoPlayer);
}

// Close Video Player
function closeVideoPlayer() {
    videoModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Extract YouTube ID
function extractYouTubeId(url) {
    if (!url) return null;
    
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    
    return null;
}

// ====== SEARCH FUNCTIONALITY ======

// Initialize Search
function initSearch() {
    // Desktop search
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Mobile search
    if (mobileSearch) {
        mobileSearch.addEventListener('input', debounce(handleMobileSearch, 300));
    }
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle Search
async function handleSearch(e) {
    const query = e.target.value.trim();
    if (query.length < 2) {
        hideSearchResults();
        return;
    }
    
    const results = await performSearch(query);
    displaySearchResults(results, 'desktop');
}

// Handle Mobile Search
async function handleMobileSearch(e) {
    const query = e.target.value.trim();
    if (query.length < 2) {
        hideSearchResults();
        return;
    }
    
    const results = await performSearch(query);
    displaySearchResults(results, 'mobile');
}

// Perform Search
async function performSearch(query) {
    try {
        // Search in all tables
        const [news, programs, jobs] = await Promise.all([
            supabase.from('news').select('*').ilike('title', `%${query}%`).limit(5),
            supabase.from('programs').select('*').ilike('title', `%${query}%`).limit(5),
            supabase.from('jobs').select('*').ilike('title', `%${query}%`).limit(5)
        ]);

        return [
            ...(news.data || []).map(item => ({ ...item, type: 'news' })),
            ...(programs.data || []).map(item => ({ ...item, type: 'programs' })),
            ...(jobs.data || []).map(item => ({ ...item, type: 'jobs' }))
        ];
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

// Display Search Results
function displaySearchResults(results, type = 'desktop') {
    let resultsContainer;
    
    if (type === 'desktop') {
        resultsContainer = document.querySelector('.search-results') || createSearchResultsContainer('desktop');
    } else {
        resultsContainer = document.getElementById('mobile-search-results') || createSearchResultsContainer('mobile');
    }
    
    if (!results || results.length === 0) {
        resultsContainer.innerHTML = '<div class="search-result-item">No results found</div>';
        resultsContainer.classList.add('active');
        return;
    }
    
    resultsContainer.innerHTML = results.map(item => `
        <div class="search-result-item" onclick="goToItem('${item.type}', ${item.id})">
            <div class="search-result-title">${item.title}</div>
            <div class="search-result-meta">
                <span class="search-result-type">${item.type.toUpperCase()}</span>
                <span>${new Date(item.created_at || item.date).toLocaleDateString()}</span>
            </div>
        </div>
    `).join('');
    
    resultsContainer.classList.add('active');
}

// Create Search Results Container
function createSearchResultsContainer(type) {
    const container = document.createElement('div');
    container.className = 'search-results';
    
    if (type === 'mobile') {
        container.id = 'mobile-search-results';
        mobileSearch.parentNode.appendChild(container);
    } else {
        searchInput.parentNode.appendChild(container);
    }
    
    return container;
}

// Hide Search Results
function hideSearchResults() {
    document.querySelectorAll('.search-results').forEach(container => {
        container.classList.remove('active');
    });
}

// Go to Search Result Item
function goToItem(type, id) {
    window.location.href = `${type}.html#${id}`;
    closeMobileMenu();
    hideSearchResults();
}

// ====== PAGE CONTENT LOADING ======

// Load Page Content
async function loadPageContent() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    try {
        switch(currentPage) {
            case 'index.html':
            case '':
            case '/':
                await loadHomePage();
                break;
            case 'news.html':
                await loadNewsPage();
                break;
            case 'programs.html':
                await loadProgramsPage();
                break;
            case 'jobs.html':
                await loadJobsPage();
                break;
            case 'contact.html':
                initContactForm();
                break;
            case 'admin.html':
                initAdminPage();
                break;
        }
    } catch (error) {
        console.error('Error loading page:', error);
        showError('Failed to load content. Please try again later.');
    }
}

// Load Home Page
async function loadHomePage() {
    try {
        const [news, programs, jobs] = await Promise.all([
            supabase.from('news').select('*').order('created_at', { ascending: false }).limit(4),
            supabase.from('programs').select('*').order('created_at', { ascending: false }).limit(4),
            supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(4)
        ]);

        renderSection('newsHighlights', news.data || [], 'news');
        renderSection('programsHighlights', programs.data || [], 'programs');
        renderSection('jobsHighlights', jobs.data || [], 'jobs');
    } catch (error) {
        console.error('Error loading home page:', error);
    }
}

// Load News Page
async function loadNewsPage() {
    try {
        const { data, error } = await supabase
            .from('news')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (!error && data) {
            renderGrid('newsGrid', data, 'news');
        }
    } catch (error) {
        console.error('Error loading news:', error);
    }
}

// Load Programs Page
async function loadProgramsPage() {
    try {
        const { data, error } = await supabase
            .from('programs')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (!error && data) {
            renderGrid('programsGrid', data, 'programs');
        }
    } catch (error) {
        console.error('Error loading programs:', error);
    }
}

// Load Jobs Page
async function loadJobsPage() {
    try {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (!error && data) {
            renderGrid('jobsGrid', data, 'jobs');
        }
    } catch (error) {
        console.error('Error loading jobs:', error);
    }
}

// ====== RENDER FUNCTIONS ======

// Render Section
function renderSection(containerId, items, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!items || items.length === 0) {
        container.innerHTML = '<p class="loading">No content available</p>';
        return;
    }
    
    container.innerHTML = items.map(item => createCard(item, type)).join('');
    attachCardListeners(container, items, type);
}

// Render Grid
function renderGrid(containerId, items, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!items || items.length === 0) {
        container.innerHTML = '<p class="loading">No content found</p>';
        return;
    }
    
    container.innerHTML = items.map(item => createCard(item, type)).join('');
    attachCardListeners(container, items, type);
}

// Create Card HTML
function createCard(item, type) {
    const date = new Date(item.created_at || item.date).toLocaleDateString();
    const category = item.category || type;
    
    if (type === 'jobs') {
        return `
            <div class="card" data-id="${item.id}">
                <div class="card-content">
                    <span class="card-category">${category}</span>
                    <h3 class="card-title">${item.title}</h3>
                    <p class="card-description">${item.description.substring(0, 150)}...</p>
                    <div class="card-footer">
                        <span class="card-date">${item.company} • ${item.location}</span>
                        <button class="btn btn-secondary view-details" data-type="job">View Details</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="card" data-id="${item.id}">
            <div class="card-content">
                <span class="card-category">${category}</span>
                <h3 class="card-title">${item.title}</h3>
                <p class="card-description">${item.description.substring(0, 200)}...</p>
                <div class="card-footer">
                    <span class="card-date">${date}</span>
                    ${item.youtube_url ? '<button class="btn btn-primary watch-btn">Watch</button>' : ''}
                </div>
            </div>
        </div>
    `;
}

// Attach Card Event Listeners
function attachCardListeners(container, items, type) {
    // Watch buttons
    container.querySelectorAll('.watch-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const item = items[index];
            const videoId = extractYouTubeId(item.youtube_url);
            if (videoId) {
                openVideoPlayer(videoId, item.title, item.description);
            }
        });
    });
    
    // View details buttons for jobs
    container.querySelectorAll('.view-details').forEach((btn, index) => {
        if (type === 'jobs') {
            btn.addEventListener('click', () => {
                const item = items[index];
                openJobModal(item);
            });
        }
    });
}

// ====== JOB MODAL ======

// Open Job Modal
function openJobModal(job) {
    const container = document.querySelector('.video-container');
    
    container.innerHTML = `
        <button class="video-close">&times;</button>
        <div style="padding: 2rem;">
            <h2 style="color: white; margin-bottom: 1rem;">${job.title}</h2>
            
            ${job.logo_url ? `
                <img src="${job.logo_url}" alt="${job.company}" style="max-width: 100px; margin-bottom: 1.5rem;">
            ` : ''}
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div>
                    <h4 style="color: #94A3B8; margin-bottom: 0.5rem;">Company</h4>
                    <p style="color: white;">${job.company}</p>
                </div>
                <div>
                    <h4 style="color: #94A3B8; margin-bottom: 0.5rem;">Location</h4>
                    <p style="color: white;">${job.location}</p>
                </div>
                <div>
                    <h4 style="color: #94A3B8; margin-bottom: 0.5rem;">Type</h4>
                    <p style="color: white;">${job.type}</p>
                </div>
                <div>
                    <h4 style="color: #94A3B8; margin-bottom: 0.5rem;">Salary</h4>
                    <p style="color: white;">${job.salary_range || 'Not specified'}</p>
                </div>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <h3 style="color: white; margin-bottom: 1rem;">Job Description</h3>
                <p style="color: #CBD5E1; line-height: 1.6;">${job.description}</p>
            </div>
            
            ${job.deadline ? `
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="color: #94A3B8; margin-bottom: 0.5rem;">Application Deadline</h4>
                    <p style="color: white;">${new Date(job.deadline).toLocaleDateString()}</p>
                </div>
            ` : ''}
            
            ${job.apply_url ? `
                <a href="${job.apply_url}" target="_blank" class="btn btn-primary" style="width: 100%; text-align: center;">
                    Apply Now
                </a>
            ` : ''}
        </div>
    `;
    
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Re-attach close button listener
    document.querySelector('.video-close').addEventListener('click', closeVideoPlayer);
}

// ====== CONTACT FORM ======

// Initialize Contact Form
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message'),
            created_at: new Date().toISOString()
        };
        
        try {
            const { error } = await supabase.from('messages').insert([data]);
            
            if (error) throw error;
            
            form.reset();
            showMessage('Message sent successfully! We will get back to you soon.', 'success');
        } catch (error) {
            console.error('Error sending message:', error);
            showMessage('Failed to send message. Please try again.', 'error');
        }
    });
}

// ====== ADMIN PAGE ======

// Initialize Admin Page
function initAdminPage() {
    const loginForm = document.getElementById('adminLogin');
    const adminPanel = document.getElementById('adminPanel');
    
    if (!loginForm || !adminPanel) return;
    
    // Check if already logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        loginForm.style.display = 'none';
        adminPanel.style.display = 'block';
        loadAdminData();
        return;
    }
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        
        if (email === 'eyakemabi@gmail.com' && password === '@Eyu26042604') {
            localStorage.setItem('adminLoggedIn', 'true');
            loginForm.style.display = 'none';
            adminPanel.style.display = 'block';
            loadAdminData();
        } else {
            showMessage('Invalid credentials', 'error');
        }
    });
}

// Load Admin Data
async function loadAdminData() {
    const tables = ['news', 'programs', 'jobs', 'messages'];
    
    for (const table of tables) {
        await loadAdminTable(table);
    }
}

// Load Admin Table
async function loadAdminTable(table) {
    try {
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .order('created_at', { ascending: false });
            
        if (!error && data) {
            renderAdminTable(table, data);
        }
    } catch (error) {
        console.error(`Error loading ${table}:`, error);
    }
}

// Render Admin Table
function renderAdminTable(table, items) {
    const tbody = document.getElementById(`${table}Table`);
    if (!tbody) return;
    
    if (!items || items.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: #64748B;">
                    No ${table} found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = items.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>${item.title || item.name || 'N/A'}</td>
            <td>${item.description || item.message || 'N/A'}</td>
            <td>${item.category || item.email || 'N/A'}</td>
            <td>${new Date(item.created_at).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-secondary" onclick="editItem('${table}', ${item.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteItem('${table}', ${item.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// ====== UTILITY FUNCTIONS ======

// Show Message
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        color: white;
        font-weight: 500;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        messageDiv.style.background = '#10B981';
    } else if (type === 'error') {
        messageDiv.style.background = '#EF4444';
    } else {
        messageDiv.style.background = '#3B82F6';
    }
    
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// Show Error
function showError(message) {
    showMessage(message, 'error');
}

// Logout Admin
window.logoutAdmin = function() {
    localStorage.removeItem('adminLoggedIn');
    window.location.reload();
};

// Edit Item (placeholder)
window.editItem = function(table, id) {
    showMessage(`Edit ${table} item ${id} - This feature requires backend implementation`, 'info');
};

// Delete Item
window.deleteItem = async function(table, id) {
    if (!confirm(`Are you sure you want to delete this ${table} item?`)) return;
    
    try {
        const { error } = await supabase.from(table).delete().eq('id', id);
        
        if (error) throw error;
        
        showMessage('Item deleted successfully', 'success');
        loadAdminTable(table);
    } catch (error) {
        console.error('Delete error:', error);
        showMessage('Failed to delete item', 'error');
    }
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #1E293B;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0.75rem;
        margin-top: 0.5rem;
        max-height: 400px;
        overflow-y: auto;
        display: none;
        z-index: 1000;
    }
    
    .search-results.active {
        display: block;
    }
    
    .search-result-item {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        cursor: pointer;
        transition: background-color 0.2s;
    }
    
    .search-result-item:hover {
        background: rgba(255, 255, 255, 0.05);
    }
    
    .search-result-item:last-child {
        border-bottom: none;
    }
    
    .search-result-title {
        color: white;
        font-weight: 500;
        margin-bottom: 0.25rem;
    }
    
    .search-result-meta {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8rem;
        color: #94A3B8;
    }
    
    .search-result-type {
        background: #0066FF;
        color: white;
        padding: 0.125rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
    }
`;
document.head.appendChild(style);