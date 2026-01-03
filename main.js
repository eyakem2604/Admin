// Supabase Configuration
const SUPABASE_URL = 'https://bbjlfleaksumwtimzdim.supabase.co';
const SUPABASE_KEY = 'sb_publishable_C9TxlMKsCRzYaOMZz_nsNg_9Dg3rD4y';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Global State
let currentPage = 1;
let currentFilters = {};
let currentSort = 'date_desc';

// DOM Elements
const mobileNav = document.getElementById('mobileNav');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const closeModal = document.querySelector('.close-modal');
const contactForm = document.getElementById('contactForm');
const thankYouMessage = document.getElementById('thankYouMessage');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminDashboard = document.getElementById('adminDashboard');

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initHamburgerMenu();
    initSearch();
    initModals();
    initSorting();
    initFilters();
    
    // Page-specific initialization
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    
    switch(page) {
        case 'index.html':
            loadHighlights();
            break;
        case 'news.html':
            loadNews();
            break;
        case 'programs.html':
            loadPrograms();
            break;
        case 'live.html':
            loadLive();
            break;
        case 'jobs.html':
            loadJobs();
            break;
        case 'contact.html':
            initContactForm();
            break;
        case 'admin.html':
            initAdminPage();
            break;
    }
});

// Hamburger Menu
function initHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const closeMenu = document.querySelector('.close-menu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            mobileNav.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeMenu) {
        closeMenu.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// Live Search
function initSearch() {
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            searchResults.classList.remove('active');
            return;
        }
        
        searchTimeout = setTimeout(async () => {
            await performSearch(query);
        }, 300);
    });
    
    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });
}

async function performSearch(query) {
    try {
        // Search across multiple tables
        const [newsResults, programsResults, liveResults, jobsResults] = await Promise.all([
            supabase.from('news').select('*').ilike('title', `%${query}%`).limit(5),
            supabase.from('programs').select('*').ilike('title', `%${query}%`).limit(5),
            supabase.from('live').select('*').ilike('title', `%${query}%`).limit(5),
            supabase.from('jobs').select('*').ilike('title', `%${query}%`).limit(5)
        ]);
        
        const results = [
            ...(newsResults.data || []).map(item => ({...item, type: 'news'})),
            ...(programsResults.data || []).map(item => ({...item, type: 'programs'})),
            ...(liveResults.data || []).map(item => ({...item, type: 'live'})),
            ...(jobsResults.data || []).map(item => ({...item, type: 'jobs'}))
        ];
        
        displaySearchResults(results);
    } catch (error) {
        console.error('Search error:', error);
    }
}

function displaySearchResults(results) {
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
        searchResults.classList.add('active');
        return;
    }
    
    results.forEach(result => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.textContent = result.title;
        item.addEventListener('click', () => {
            window.location.href = `${result.type}.html#${result.id}`;
            searchResults.classList.remove('active');
            searchInput.value = '';
        });
        searchResults.appendChild(item);
    });
    
    searchResults.classList.add('active');
}

// Modal System
function initModals() {
    if (closeModal) {
        closeModal.addEventListener('click', closeModalFunc);
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalFunc();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModalFunc();
        }
    });
}

function openModal(content) {
    modalContent.innerHTML = content;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModalFunc() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    modalContent.innerHTML = '';
}

// YouTube Modal
function openYouTubeModal(youtubeUrl, title, description) {
    const videoId = extractYouTubeId(youtubeUrl);
    
    const content = `
        <button class="close-modal" aria-label="Close modal">&times;</button>
        <h2 class="text-gold">${title}</h2>
        ${description ? `<p class="mt-2">${description}</p>` : ''}
        <div class="video-container">
            <iframe 
                src="https://www.youtube.com/embed/${videoId}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        </div>
    `;
    
    openModal(content);
    
    // Re-attach close button listener
    document.querySelector('.close-modal').addEventListener('click', closeModalFunc);
}

function extractYouTubeId(url) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : '';
}

// Job Detail Modal
function openJobModal(job) {
    const content = `
        <button class="close-modal" aria-label="Close modal">&times;</button>
        <h2 class="text-gold">${job.title}</h2>
        
        ${job.logo_url ? `<img src="${job.logo_url}" alt="${job.company} logo" class="company-logo">` : ''}
        
        <div class="job-details">
            <div class="job-detail-item">
                <strong>Company:</strong> ${job.company}
            </div>
            <div class="job-detail-item">
                <strong>Location:</strong> ${job.location}
            </div>
            <div class="job-detail-item">
                <strong>Type:</strong> ${job.type}
            </div>
            <div class="job-detail-item">
                <strong>Salary:</strong> ${job.salary_range || 'Not specified'}
            </div>
            <div class="job-detail-item">
                <strong>Deadline:</strong> ${new Date(job.deadline).toLocaleDateString()}
            </div>
            <div class="job-detail-item">
                <strong>Posted:</strong> ${new Date(job.date).toLocaleDateString()}
            </div>
        </div>
        
        <div class="mt-2">
            <h3 class="text-blue">Job Description</h3>
            <p>${job.description}</p>
        </div>
        
        ${job.apply_url ? `
            <div class="mt-2">
                <a href="${job.apply_url}" target="_blank" class="play-btn">Apply Now</a>
            </div>
        ` : ''}
    `;
    
    openModal(content);
    
    // Re-attach close button listener
    document.querySelector('.close-modal').addEventListener('click', closeModalFunc);
}

// Sorting
function initSorting() {
    const sortBtns = document.querySelectorAll('.sort-btn');
    sortBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sortBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSort = btn.dataset.sort;
            
            // Reload content based on current page
            const path = window.location.pathname;
            const page = path.split('/').pop();
            
            switch(page) {
                case 'news.html':
                    loadNews();
                    break;
                case 'programs.html':
                    loadPrograms();
                    break;
                case 'live.html':
                    loadLive();
                    break;
                case 'jobs.html':
                    loadJobs();
                    break;
            }
        });
    });
}

// Filtering
function initFilters() {
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            const filterType = e.target.dataset.filter;
            const value = e.target.value;
            
            if (value === 'all') {
                delete currentFilters[filterType];
            } else {
                currentFilters[filterType] = value;
            }
            
            // Reload content based on current page
            const path = window.location.pathname;
            const page = path.split('/').pop();
            
            switch(page) {
                case 'news.html':
                    loadNews();
                    break;
                case 'programs.html':
                    loadPrograms();
                    break;
                case 'live.html':
                    loadLive();
                    break;
                case 'jobs.html':
                    loadJobs();
                    break;
            }
        });
    });
}

// Loading Functions
async function loadHighlights() {
    try {
        // Fetch latest from each category
        const [news, programs, live, jobs] = await Promise.all([
            supabase.from('news').select('*').order('date', { ascending: false }).limit(4),
            supabase.from('programs').select('*').order('date', { ascending: false }).limit(4),
            supabase.from('live').select('*').order('date', { ascending: false }).limit(4),
            supabase.from('jobs').select('*').order('date', { ascending: false }).limit(4)
        ]);
        
        displayHighlights('news', news.data || []);
        displayHighlights('programs', programs.data || []);
        displayHighlights('live', live.data || []);
        displayHighlights('jobs', jobs.data || []);
    } catch (error) {
        console.error('Error loading highlights:', error);
        showError('Failed to load content. Please try again later.');
    }
}

function displayHighlights(type, items) {
    const container = document.getElementById(`${type}Highlights`);
    if (!container) return;
    
    if (!items || items.length === 0) {
        container.innerHTML = '<p class="loading">No content available</p>';
        return;
    }
    
    container.innerHTML = items.map(item => createCard(item, type)).join('');
    
    // Attach event listeners to play buttons
    container.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const item = items.find(i => i.id === parseInt(btn.dataset.id));
            if (type === 'jobs') {
                openJobModal(item);
            } else {
                openYouTubeModal(item.youtube_url, item.title, item.description);
            }
        });
    });
}

async function loadNews() {
    try {
        let query = supabase.from('news').select('*');
        
        // Apply filters
        if (currentFilters.category) {
            query = query.eq('category', currentFilters.category);
        }
        
        if (currentFilters.section) {
            query = query.eq('section', currentFilters.section);
        }
        
        // Apply sorting
        const [field, order] = currentSort.split('_');
        query = query.order(field, { ascending: order === 'asc' });
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        displayContent('newsGrid', data || [], 'news');
        
        // Update filter options
        updateFilterOptions('news');
    } catch (error) {
        console.error('Error loading news:', error);
        showError('Failed to load news. Please try again later.');
    }
}

async function loadPrograms() {
    try {
        let query = supabase.from('programs').select('*');
        
        // Apply filters
        if (currentFilters.category) {
            query = query.eq('category', currentFilters.category);
        }
        
        // Apply sorting
        const [field, order] = currentSort.split('_');
        query = query.order(field, { ascending: order === 'asc' });
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        displayContent('programsGrid', data || [], 'programs');
        
        // Update filter options
        updateFilterOptions('programs');
    } catch (error) {
        console.error('Error loading programs:', error);
        showError('Failed to load programs. Please try again later.');
    }
}

async function loadLive() {
    try {
        let query = supabase.from('live').select('*');
        
        // Apply sorting
        const [field, order] = currentSort.split('_');
        query = query.order(field, { ascending: order === 'asc' });
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        displayContent('liveGrid', data || [], 'live');
    } catch (error) {
        console.error('Error loading live videos:', error);
        showError('Failed to load live videos. Please try again later.');
    }
}

async function loadJobs() {
    try {
        let query = supabase.from('jobs').select('*');
        
        // Apply filters
        if (currentFilters.category) {
            query = query.eq('category', currentFilters.category);
        }
        
        if (currentFilters.type) {
            query = query.eq('type', currentFilters.type);
        }
        
        if (currentFilters.location) {
            query = query.ilike('location', `%${currentFilters.location}%`);
        }
        
        // Apply sorting
        if (currentSort === 'deadline_asc') {
            query = query.order('deadline', { ascending: true });
        } else if (currentSort === 'deadline_desc') {
            query = query.order('deadline', { ascending: false });
        } else {
            const [field, order] = currentSort.split('_');
            query = query.order(field, { ascending: order === 'asc' });
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        displayContent('jobsGrid', data || [], 'jobs');
        
        // Update filter options
        updateFilterOptions('jobs');
    } catch (error) {
        console.error('Error loading jobs:', error);
        showError('Failed to load jobs. Please try again later.');
    }
}

function displayContent(containerId, items, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!items || items.length === 0) {
        container.innerHTML = '<p class="loading">No content found</p>';
        return;
    }
    
    container.innerHTML = items.map(item => createCard(item, type)).join('');
    
    // Attach event listeners
    container.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const item = items.find(i => i.id === parseInt(btn.dataset.id));
            if (type === 'jobs') {
                openJobModal(item);
            } else {
                openYouTubeModal(item.youtube_url, item.title, item.description);
            }
        });
    });
}

function createCard(item, type) {
    const date = new Date(item.date).toLocaleDateString();
    const category = item.category || type;
    
    if (type === 'jobs') {
        const deadline = new Date(item.deadline).toLocaleDateString();
        return `
            <div class="card">
                <div class="card-content">
                    <span class="card-category">${category}</span>
                    <h3 class="card-title">${item.title}</h3>
                    <p class="card-description">${item.description.substring(0, 150)}...</p>
                    <div class="card-meta">
                        <span>${item.company} • ${item.location}</span>
                        <span>${item.type}</span>
                    </div>
                    <div class="card-meta">
                        <span>Deadline: ${deadline}</span>
                        <button class="view-btn" data-id="${item.id}">View Details</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="card">
            <div class="card-content">
                <span class="card-category">${category}</span>
                <h3 class="card-title">${item.title}</h3>
                <p class="card-description">${item.description.substring(0, 200)}...</p>
                <div class="card-meta">
                    <span>${date}</span>
                    ${item.youtube_url ? `<button class="play-btn" data-id="${item.id}">Watch Now</button>` : ''}
                </div>
            </div>
        </div>
    `;
}

async function updateFilterOptions(type) {
    if (type === 'news') {
        // Get unique categories and sections
        const { data } = await supabase.from('news').select('category, section');
        
        if (data) {
            const categories = [...new Set(data.map(item => item.category).filter(Boolean))];
            const sections = [...new Set(data.map(item => item.section).filter(Boolean))];
            
            updateSelectOptions('categoryFilter', categories);
            updateSelectOptions('sectionFilter', sections);
        }
    } else if (type === 'jobs') {
        // Get unique categories, types, and locations
        const { data } = await supabase.from('jobs').select('category, type, location');
        
        if (data) {
            const categories = [...new Set(data.map(item => item.category).filter(Boolean))];
            const types = [...new Set(data.map(item => item.type).filter(Boolean))];
            const locations = [...new Set(data.map(item => item.location).filter(Boolean))];
            
            updateSelectOptions('jobCategoryFilter', categories);
            updateSelectOptions('jobTypeFilter', types);
            updateSelectOptions('jobLocationFilter', locations);
        }
    }
}

function updateSelectOptions(selectId, options) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    // Keep the "All" option
    const allOption = select.querySelector('option[value="all"]');
    select.innerHTML = '';
    if (allOption) select.appendChild(allOption);
    
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        select.appendChild(opt);
    });
}

// Contact Form
function initContactForm() {
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message'),
            date: new Date().toISOString()
        };
        
        try {
            const { error } = await supabase.from('messages').insert([data]);
            
            if (error) throw error;
            
            // Show thank you message
            contactForm.reset();
            thankYouMessage.classList.add('active');
            
            // Hide message after 5 seconds
            setTimeout(() => {
                thankYouMessage.classList.remove('active');
            }, 5000);
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Failed to send message. Please try again.');
        }
    });
}

// Admin Page
function initAdminPage() {
    if (!adminLoginForm) return;
    
    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        
        if (email === 'eyakemabi@gmail.com' && password === '@Eyu26042604') {
            adminLoginForm.style.display = 'none';
            adminDashboard.style.display = 'block';
            loadAdminData();
        } else {
            alert('Invalid credentials');
        }
    });
}

async function loadAdminData() {
    try {
        // Load all tables
        const [news, programs, live, jobs, messages] = await Promise.all([
            supabase.from('news').select('*').order('date', { ascending: false }),
            supabase.from('programs').select('*').order('date', { ascending: false }),
            supabase.from('live').select('*').order('date', { ascending: false }),
            supabase.from('jobs').select('*').order('date', { ascending: false }),
            supabase.from('messages').select('*').order('date', { ascending: false })
        ]);
        
        displayAdminTable('newsTable', news.data || [], 'news');
        displayAdminTable('programsTable', programs.data || [], 'programs');
        displayAdminTable('liveTable', live.data || [], 'live');
        displayAdminTable('jobsTable', jobs.data || [], 'jobs');
        displayAdminTable('messagesTable', messages.data || [], 'messages');
        
        // Initialize form submission handlers
        initAdminForms();
    } catch (error) {
        console.error('Error loading admin data:', error);
        showError('Failed to load admin data');
    }
}

function displayAdminTable(tableId, items, type) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    
    items.forEach(item => {
        const row = document.createElement('tr');
        
        // Different columns for different types
        if (type === 'messages') {
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.email}</td>
                <td>${item.message.substring(0, 50)}...</td>
                <td>${new Date(item.date).toLocaleDateString()}</td>
                <td>
                    <button class="action-btn delete-btn" onclick="deleteRecord('${type}', ${item.id})">Delete</button>
                </td>
            `;
        } else {
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.title}</td>
                <td>${item.description.substring(0, 50)}...</td>
                <td>${item.category || 'N/A'}</td>
                <td>${new Date(item.date).toLocaleDateString()}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editRecord('${type}', ${item.id})">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteRecord('${type}', ${item.id})">Delete</button>
                </td>
            `;
        }
        
        tbody.appendChild(row);
    });
}

function initAdminForms() {
    const forms = ['newsForm', 'programsForm', 'liveForm', 'jobsForm'];
    
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await handleAdminFormSubmit(formId);
            });
        }
    });
}

async function handleAdminFormSubmit(formId) {
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Convert to appropriate table name
    const table = formId.replace('Form', '');
    
    // Add date if not present
    if (!data.date) {
        data.date = new Date().toISOString();
    }
    
    try {
        const { error } = await supabase.from(table).insert([data]);
        
        if (error) throw error;
        
        alert('Record added successfully!');
        form.reset();
        loadAdminData(); // Refresh tables
    } catch (error) {
        console.error('Error adding record:', error);
        alert('Failed to add record');
    }
}

// These functions need to be globally accessible
window.editRecord = async (table, id) => {
    // Implementation for editing records
    alert(`Edit ${table} record ${id} - This feature requires additional implementation`);
};

window.deleteRecord = async (table, id) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
        const { error } = await supabase.from(table).delete().eq('id', id);
        
        if (error) throw error;
        
        alert('Record deleted successfully!');
        loadAdminData(); // Refresh tables
    } catch (error) {
        console.error('Error deleting record:', error);
        alert('Failed to delete record');
    }
};

// Utility Functions
function showError(message) {
    const container = document.querySelector('.container') || document.body;
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    container.prepend(errorDiv);
    
    setTimeout(() => errorDiv.remove(), 5000);
}

// Date formatting helper
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}