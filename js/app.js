const App = {
    albums: [],
    searchResults: [],
    currentPage: 1,
    itemsPerPage: 50,
    searchType: 'all',
    customPath: localStorage.getItem('customPath') || 'music_database_V4.8.json',
    selectedAlbums : [],

    init() {
        this.bindEvents();
        if (typeof ThemeModule !== 'undefined' && ThemeModule.init) {
            ThemeModule.init();
        }
        this.loadCustomFile();
        this.loadSettings();
        this.initScrollToTop();
        this.initScrollToBottom();
    },

    bindEvents() {
        this.addEventListenerSafely('fileInput', 'change', this.handleFileUpload.bind(this));
        this.addEventListenerSafely('keywordInput', 'input', Utils.debounce(this.search.bind(this), 300));
        this.addEventListenerSafely('searchButton', 'click', this.search.bind(this));
        this.addEventListenerSafely('sortOrder', 'change', this.handleSortOrderChange.bind(this));
        
        ['all', 'title', 'composer', 'arranger', 'other'].forEach(type => {
            this.addEventListenerSafely(`${type}Search`, 'click', () => this.toggleSearchType(type));
        });

        ['composer', 'arranger', 'other'].forEach(type => {
            this.addEventListenerSafely(`${type}Checkbox`, 'change', this.search.bind(this));
        });

        this.addEventListenerSafely('customPathBtn', 'click', this.setCustomPath.bind(this));
        this.addEventListenerSafely('loadCustomPathBtn', 'click', this.loadCustomFile.bind(this));
        this.addEventListenerSafely('selectAllAlbums', 'click', this.selectAllAlbums.bind(this));
        this.addEventListenerSafely('deselectAllAlbums', 'click', this.deselectAllAlbums.bind(this));

        this.addEventListenerSafely('settingsBtn', 'click', this.toggleSettings.bind(this));
        this.addEventListenerSafely('fontSizeSelect', 'change', this.changeFontSize.bind(this));
        this.addEventListenerSafely('themeSelect', 'change', this.changeTheme.bind(this));
        this.addEventListenerSafely('sidebarWidthInput', 'change', this.changeSidebarWidth.bind(this));

        this.addEventListenerSafely('collapseAllTracks', 'click', () => this.toggleAllTracks('collapse'));
        this.addEventListenerSafely('expandAllTracks', 'click', () => this.toggleAllTracks('expand'));
        this.addEventListenerSafely('collapseAllAlbums', 'click', () => this.toggleAllAlbums('collapse'));
        this.addEventListenerSafely('expandAllAlbums', 'click', () => this.toggleAllAlbums('expand'));
        this.addEventListenerSafely('scrollToTopBtn', 'click', this.scrollToTop);

        document.getElementById('results').addEventListener('click', this.handleResultsClick.bind(this));
    },

    addEventListenerSafely(id, event, handler) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener(event, handler);
        } else {
            console.warn(`Element with id '${id}' not found`);
        }
    },

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            try {
                const data = await FileHandler.loadFile(file);
                this.albums = FileHandler.processData(data);
                this.setLoadMessage('文件載入成功');
                this.populateAlbumList();
                this.search();
            } catch (error) {
                console.error('File loading error:', error);
                this.setLoadMessage('文件載入失敗：' + error.message);
            }
        }
    },

    setLoadMessage(message) {
        const loadMessage = document.getElementById('loadMessage');
        if (loadMessage) {
            loadMessage.textContent = message;
        } else {
            console.warn('Load message element not found');
        }
    },

    setCustomPath() {
        const newPath = prompt("请输入自定义文件路径:", this.customPath);
        if (newPath) {
            this.customPath = newPath;
            localStorage.setItem('customPath', newPath);
            this.setLoadMessage('自定义路径已设置，点击"获取自定义路径文件"按钮来加载文件。');
        }
    },

    loadCustomFile() {
        fetch(this.customPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('File not found');
                }
                return response.json();
            })
            .then(data => {
                this.albums = FileHandler.processData(data);
                this.setLoadMessage('文件自动載入成功');
                this.populateAlbumList();
                this.search();
            })
            .catch(error => {
                console.error('Auto-load file error:', error);
                this.setLoadMessage('未找到自动加载文件，请检查路径是否正确。');
            });
    },

    populateAlbumList() {
        const albumCheckboxes = document.getElementById('albumCheckboxes');
        if (!albumCheckboxes) return;

        albumCheckboxes.innerHTML = '';
        this.sortAlbums().forEach(album => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `album-${album.album}`;
            checkbox.name = 'album';
            checkbox.value = album.album;
            checkbox.checked = true;
            checkbox.onchange = this.search.bind(this);

            const label = document.createElement('label');
            label.htmlFor = `album-${album.album}`;
            label.textContent = album.album;

            albumCheckboxes.appendChild(checkbox);
            albumCheckboxes.appendChild(label);
            albumCheckboxes.appendChild(document.createElement('br'));
        });
    },

    sortAlbums() {
        const sortOrder = document.getElementById('sortOrder').value;
        return [...this.albums].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });
    },

    handleSortOrderChange() {
        this.populateAlbumList();
        this.search();
    },

    selectAllAlbums() {
        this.setAllAlbumCheckboxes(true);
    },

    deselectAllAlbums() {
        this.setAllAlbumCheckboxes(false);
    },

    setAllAlbumCheckboxes(checked) {
        const checkboxes = document.querySelectorAll('#albumCheckboxes input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
        this.search();
    },

    toggleSearchType(type) {
        this.searchType = type;
        document.getElementById('allSearch').classList.toggle('active', type === 'all');
        document.getElementById('titleSearch').classList.toggle('active', type === 'title');
        document.getElementById('composerSearch').classList.toggle('active', type === 'composer');
        document.getElementById('arrangerSearch').classList.toggle('active', type === 'arranger');
        document.getElementById('otherSearch').classList.toggle('active', type === 'other');
    
        // 更新复选框状态
        const composerCheckbox = document.getElementById('composerCheckbox');
        const arrangerCheckbox = document.getElementById('arrangerCheckbox');
        const otherCheckbox = document.getElementById('otherCheckbox');
    
        composerCheckbox.disabled = type === 'composer';
        arrangerCheckbox.disabled = type === 'arranger';
        otherCheckbox.disabled = type === 'other';
    
        // 记住之前的状态，除非是特定搜索
        if (type === 'composer') composerCheckbox.checked = true;
        if (type === 'arranger') arrangerCheckbox.checked = true;
        if (type === 'other') otherCheckbox.checked = true;
    
        this.search();
    },
    search() {
        const keyword = document.getElementById('keywordInput').value.trim();
        const filters = {
            composerChecked: document.getElementById('composerCheckbox').checked,
            arrangerChecked: document.getElementById('arrangerCheckbox').checked,
            otherChecked: document.getElementById('otherCheckbox').checked
        };
    
        // 获取选中的专辑
        const selectedAlbums = Array.from(document.querySelectorAll('#albumCheckboxes input:checked'))
            .map(checkbox => checkbox.value);
    
        this.searchResults = SearchModule.search(this.albums, keyword, this.searchType, filters, selectedAlbums);
        this.currentPage = 1;
        this.displayResults();
    },

    displayResults() {
        const sortOrder = document.getElementById('sortOrder').value;
        this.searchResults.sort((a, b) => {
            const dateA = new Date(a.album.date);
            const dateB = new Date(b.album.date);
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });
    
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const paginatedResults = this.searchResults.slice(start, end);
        UIRenderer.displayResults(paginatedResults, this.searchResults.length);
        this.displayPagination();
    },
    
    displayPagination() {
        const totalPages = Math.ceil(this.searchResults.length / this.itemsPerPage);
        const paginationElement = document.getElementById('pagination');
        paginationElement.innerHTML = '';
    
        const addPageButton = (page) => {
            const button = document.createElement('button');
            button.innerText = page;
            button.addEventListener('click', () => this.goToPage(page));
            if (page === this.currentPage) {
                button.classList.add('active');
            }
            paginationElement.appendChild(button);
        };
    
        addPageButton(1);
        if (this.currentPage > 3) paginationElement.appendChild(document.createTextNode('...'));
        
        for (let i = Math.max(2, this.currentPage - 1); i <= Math.min(totalPages - 1, this.currentPage + 1); i++) {
            addPageButton(i);
        }
        
        if (this.currentPage < totalPages - 2) paginationElement.appendChild(document.createTextNode('...'));
        if (totalPages > 1) addPageButton(totalPages);
    
        // 添加跳页选单
        const select = document.createElement('select');
        select.addEventListener('change', (e) => this.goToPage(parseInt(e.target.value)));
        for (let i = 1; i <= totalPages; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.text = `跳至第 ${i} 页`;
            select.appendChild(option);
        }
        paginationElement.appendChild(select);
    },
    
    goToPage(page) {
        this.currentPage = page;
        this.displayResults();
    },

    toggleSettings() {
        const settingsPanel = document.getElementById('settingsPanel');
        if (settingsPanel) {
            settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
        }
    },

    changeFontSize(event) {
        document.body.style.fontSize = event.target.value;
        localStorage.setItem('fontSize', event.target.value);
    },

    changeTheme(event) {
        document.body.classList.toggle('light-mode', event.target.value === 'light');
        localStorage.setItem('theme', event.target.value);
    },

    changeSidebarWidth(event) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.style.width = `${event.target.value}px`;
            localStorage.setItem('sidebarWidth', event.target.value);
        }
    },

    loadSettings() {
        const fontSize = localStorage.getItem('fontSize');
        if (fontSize) {
            document.body.style.fontSize = fontSize;
            document.getElementById('fontSizeSelect').value = fontSize;
        }

        const theme = localStorage.getItem('theme');
        if (theme) {
            document.body.classList.toggle('light-mode', theme === 'light');
            document.getElementById('themeSelect').value = theme;
        }

        const sidebarWidth = localStorage.getItem('sidebarWidth');
        if (sidebarWidth) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.style.width = `${sidebarWidth}px`;
                document.getElementById('sidebarWidthInput').value = sidebarWidth;
            }
        }
    },

    toggleAllTracks(action) {
        const roleCcntainers = document.querySelectorAll('.role-container');
        roleCcntainers.forEach(container => {
            container.style.display = action === 'expand' ? 'block' : 'none';
        });
    },

    toggleAllAlbums(action) {
        const trackContainers = document.querySelectorAll('.track-container');
        trackContainers.forEach(container => {
            container.style.display = action === 'expand' ? 'block' : 'none';
        });
    },

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    },
    
    scrollToBottom() {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth"
        });
    },

    handleResultsClick(event) {
        if (event.target.classList.contains('album')) {
            this.toggleTracks(event.target.dataset.albumId);
        } else if (event.target.classList.contains('title')) {
            this.toggleRoles(event.target.dataset.trackId);
        }
    },

    toggleTracks(albumName) {
        const trackContainer = document.getElementById(albumName);
        if (trackContainer) {
            trackContainer.style.display = trackContainer.style.display === 'none' ? 'block' : 'none';
        }
    },
    
    toggleRoles(trackId) {
        const roleContainer = document.getElementById(trackId);
        if (roleContainer) {
            roleContainer.style.display = roleContainer.style.display === 'none' ? 'block' : 'none';
        }
    },
    
    initScrollToTop() {
        const scrollToTopBtn = document.getElementById("scrollToTopBtn");
        
        window.addEventListener("scroll", () => {
            if (window.pageYOffset > 100) { // 当页面滚动超过100px时显示按钮
                scrollToTopBtn.classList.add("show");
            } else {
                scrollToTopBtn.classList.remove("show");
            }
        });
    
        scrollToTopBtn.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    },
    
    initScrollToBottom() {
        const scrollToBottomBtn = document.getElementById("scrollToBottomBtn");
        
        window.addEventListener("scroll", () => {
            if (window.pageYOffset < document.body.scrollHeight - window.innerHeight - 100) {
                scrollToBottomBtn.classList.add("show");
            } else {
                scrollToBottomBtn.classList.remove("show");
            }
        });
    
        scrollToBottomBtn.addEventListener("click", () => {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth"
            });
        });
    }
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => App.init());

