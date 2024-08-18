const App = {
    albums: [],
    searchResults: [],
    currentPage: 1,
    itemsPerPage: 50,
    searchType: 'all',
    customPath: localStorage.getItem('customPath') || 'music_database_V4.8.8.json',
    selectedAlbums : [],

    init() {
        this.bindEvents();
        if (typeof ThemeModule !== 'undefined' && ThemeModule.init) {
            ThemeModule.init();
        }
        this.addEventListenerSafely('fileInput', 'change', this.handleFileUpload.bind(this));
        // this.loadData();
        this.loadCustomFile();
        this.loadSettings();
        this.initScrollToTop();
        this.initScrollToBottom();
        MobileUI.init();
        SpecialCollectionHandler.loadCollections('path/to/special_collections.json');
        this.addEventListenerSafely('specialCollectionSelect', 'change', this.handleSpecialCollectionChange.bind(this));
        this.addEventListenerSafely('loadCustomPathsBtn', 'click', this.loadCustomPaths.bind(this));
    },
    
    bindEvents() {
        this.addEventListenerSafely('loadFileBtn', 'click', this.handleFileUpload.bind(this));
        this.addEventListenerSafely('reloadDataBtn', 'click', this.loadCustomFile.bind(this));
        this.addEventListenerSafely('genshinPath', 'change', this.updatePath.bind(this, 'genshinPath'));
        this.addEventListenerSafely('starRailPath', 'change', this.updatePath.bind(this, 'starRailPath'));
        this.addEventListenerSafely('specialCollectionPath', 'change', this.updatePath.bind(this, 'specialCollectionPath'));
        
        this.addEventListenerSafely('selectGenshinAlbums', 'click', this.selectGenshinAlbums.bind(this));
        this.addEventListenerSafely('selectStarRailAlbums', 'click', this.selectStarRailAlbums.bind(this));
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
    
    loadData() {
        const genshinPath = '';
        const starRailPath = '';
        const specialCollectionPath = '';
    
        const loadPromises = [];
    
        const fetchData = (path) => {
            return fetch(path)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('File not found');
                    }
                    return response.json();
                })
                .then(data => {
                    this.albums = FileHandler.processData(data);
                    this.setLoadMessage('test file loaded successfully');
                    this.populateAlbumList();
                    this.search();
                })
                .catch(error => {
                    console.error(`Error fetching ${path}:`, error);
                    return [];  // 返回空数组，以便继续处理
                });
        };
    
        if (document.getElementById('loadGenshin').checked) {
            loadPromises.push(fetchData(genshinPath));
        } else {
            loadPromises.push(Promise.resolve([]));
        }
    
        if (document.getElementById('loadStarRail').checked) {
            loadPromises.push(fetchData(starRailPath));
        } else {
            loadPromises.push(Promise.resolve([]));
        }
    
        if (document.getElementById('loadSpecialCollection').checked) {
            loadPromises.push(fetchData(specialCollectionPath).then(data => {
                SpecialCollectionHandler.collections = data;
                return data;
            }));
        } else {
            loadPromises.push(Promise.resolve({}));
        }
    
        Promise.all(loadPromises)
            .then(([genshinData, starRailData, specialCollections]) => {
                this.albums = [...genshinData, ...starRailData];
                this.setLoadMessage('选中的文件加载成功');
                this.populateAlbumList();
                // this.populateSpecialCollectionSelect();
                this.search();
            })
            .catch(error => {
                console.error('Error loading files:', error);
                this.setLoadMessage('文件加载失败：' + error.message);
            });
    
        this.saveSettings();
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
                this.setLoadMessage('test file loaded successfully');
                this.populateAlbumList();
                this.search();
            })
            .catch(error => {
                console.error('Auto-load file error:', error);
                this.setLoadMessage('test file not found');
            });
    },

    populateSpecialCollectionSelect() {
        const select = document.getElementById('specialCollectionSelect');
        select.innerHTML = '<option value="">无</option>';
        Object.keys(SpecialCollectionHandler.collections).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = key;
            select.appendChild(option);
        });
    },
    
    
    loadJSON(path) {
        return fetch(path).then(response => response.json());
    },

    async handleFileUpload(event) {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.albums = FileHandler.processData(data);
                    this.setLoadMessage('文件加载成功');
                    this.populateAlbumList();
                    this.search();
                } catch (error) {
                    console.error('File parsing error:', error);
                    this.setLoadMessage('文件加载失败：' + error.message);
                }
            };
            reader.onerror = (error) => {
                console.error('File reading error:', error);
                this.setLoadMessage('文件读取失败');
            };
            reader.readAsText(file);
        } else {
            this.setLoadMessage('请选择一个文件');
        }
    },
    
    setLoadMessage(message) {
        const loadMessageElement = document.getElementById('loadMessage');
        if (loadMessageElement) {
            loadMessageElement.textContent = message;
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

    loadCustomPaths() {
        const genshinPath = document.getElementById('genshinPath').value;
        const starRailPath = document.getElementById('starRailPath').value;
        const specialCollectionPath = document.getElementById('specialCollectionPath').value;
    
        Promise.all([
            this.loadJSON(genshinPath),
            this.loadJSON(starRailPath),
            SpecialCollectionHandler.loadCollections(specialCollectionPath)
        ]).then(([genshinData, starRailData]) => {
            this.albums = [...genshinData, ...starRailData];
            this.setLoadMessage('所有文件加载成功');
            this.populateAlbumList();
            this.search();
        }).catch(error => {
            console.error('Error loading files:', error);
            this.setLoadMessage('文件加载失败：' + error.message);
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
        if (!this.albums || this.albums.length === 0) {
            console.log('No albums loaded yet');
            return;
        }
        const keyword = document.getElementById('keywordInput').value.trim();
        const filters = {
            composerChecked: document.getElementById('composerCheckbox').checked,
            arrangerChecked: document.getElementById('arrangerCheckbox').checked,
            otherChecked: document.getElementById('otherCheckbox').checked
        };
    
        // 获取选中的专辑
        const selectedAlbums = Array.from(document.querySelectorAll('#albumCheckboxes input:checked'))
            .map(checkbox => checkbox.value);
    
        // 执行基本搜索
        this.searchResults = SearchModule.search(this.albums, keyword, this.searchType, filters, selectedAlbums);
    
        // 应用特别收录过滤
        const specialCollection = document.getElementById('specialCollectionSelect').value;
        if (specialCollection) {
            this.searchResults = SpecialCollectionHandler.filterResults(this.searchResults, specialCollection);
        }
    
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
        console.log('Toggle settings called');
        const settingsPanel = document.getElementById('settingsPanel');
        if (settingsPanel) {
            console.log('Settings panel found');
            const newDisplay = settingsPanel.style.display === 'none' ? 'block' : 'none';
            console.log(`Changing display to: ${newDisplay}`);
            settingsPanel.style.display = newDisplay;
        } else {
            console.error('Settings panel not found');
        }
    },
    changeFontSize(event) {
        const size = event.target.value;
        document.body.classList.remove('font-small', 'font-medium', 'font-large');
        document.body.classList.add(`font-${size}`);
        localStorage.setItem('fontSize', size);
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
        ['Genshin', 'StarRail', 'SpecialCollection'].forEach(fileType => {
            const checkbox = document.getElementById(`load${fileType}`);
            if (checkbox) {
                const savedState = localStorage.getItem(`load${fileType}`);
                checkbox.checked = savedState === null ? true : (savedState === 'true');
            }
        });
    },
    saveSettings() {
        // ... 其他设置保存代码 ...
        
        // 保存文件选择状态
        ['Genshin', 'StarRail', 'SpecialCollection'].forEach(fileType => {
            const checkbox = document.getElementById(`load${fileType}`);
            if (checkbox) {
                localStorage.setItem(`load${fileType}`, checkbox.checked);
            }
        });
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
    },
    selectGenshinAlbums() {
        this.selectAlbumsByKeyword('原神');
    },
    
    selectStarRailAlbums() {
        this.selectAlbumsByKeyword('星穹');
    },
    selectAlbumsByKeyword(keyword) {
        const checkboxes = document.querySelectorAll('#albumCheckboxes input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checkbox.value.includes(keyword);
        });
        this.search();
    },
    handleSpecialCollectionChange() {
        this.search();
    },
    updatePath(pathType, event) {
        localStorage.setItem(pathType, event.target.value);
    }
};







// 初始化应用
document.addEventListener('DOMContentLoaded', () => App.init());

