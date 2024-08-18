
const MobileUI = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('toggleSearch').addEventListener('click', () => this.toggleSection('searchSection'));
        document.getElementById('toggleAlbums').addEventListener('click', () => this.toggleSection('sidebar'));
        document.getElementById('toggleTools').addEventListener('click', () => this.toggleSection('toolsPanel'));

        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeSection(e.target.parentElement.id));
        });
        document.getElementById('searchButton').addEventListener('click', () => this.closeSection('searchSection'));
        document.getElementById('closeAllSections').addEventListener('click', () => this.closeAllSections());

    },

    toggleSection(sectionId) {
        const section = document.getElementById(sectionId);
        section.classList.toggle('active');
    },

    closeSection(sectionId) {
        document.getElementById(sectionId).classList.remove('active');
    },
    closeAllSections() {
        this.closeSection('searchSection');
        this.closeSection('sidebar');
        this.closeSection('toolsPanel');
        // 這裡可以新增其他需要關閉的介面
    }

};
