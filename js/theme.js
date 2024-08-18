const ThemeModule = {
    init() {
        this.themeToggle = document.getElementById('themeSelect');
        this.body = document.body;
        if (this.themeToggle) {
            this.loadTheme();
            this.bindEvents();
        } else {
            console.warn('Theme toggle select not found');
        }
    },

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.body.classList.toggle('light-mode', savedTheme === 'light');
        this.themeToggle.value = savedTheme;
    },

    toggleTheme() {
        const isLightMode = this.themeToggle.value === 'light';
        this.body.classList.toggle('light-mode', isLightMode);
        localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
    },

    bindEvents() {
        this.themeToggle.addEventListener('change', () => this.toggleTheme());
    }
};