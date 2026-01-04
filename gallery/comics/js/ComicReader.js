// ComicReader.js - Main comic reader controller with dual mode support

class ComicReader {
    constructor() {
        // URL parameters
        this.seriesSlug = null;
        this.chapterNum = 1;
        this.currentPage = 1;
        this.mode = 'webtoon'; // 'webtoon' or 'paged'

        // Data
        this.seriesData = null;
        this.chapterData = null;
        this.currentChapter = null;

        // DOM elements
        this.container = document.getElementById('reader-container');
        this.loadingEl = document.getElementById('loading');
        this.errorEl = document.getElementById('error');
        this.pageNav = document.getElementById('page-nav');
        this.chapterMenu = document.getElementById('chapter-menu');
        this.menuOverlay = document.getElementById('menu-overlay');

        // Touch handling
        this.touchStartX = 0;
        this.touchStartY = 0;

        // Lazy loading observer
        this.imageObserver = null;
    }

    /**
     * Initialize the reader
     */
    async init() {
        try {
            this.parseURLParams();
            await this.loadData();
            this.setupUI();
            this.renderReader();
            this.setupEventListeners();
            this.startProgressTracking();
        } catch (error) {
            this.showError('Failed to load comic. Please try again later.');
            console.error('Error initializing reader:', error);
        }
    }

    /**
     * Parse URL parameters
     */
    parseURLParams() {
        const params = new URLSearchParams(window.location.search);
        this.seriesSlug = params.get('series') || null;
        this.chapterNum = parseInt(params.get('ch')) || 1;
        this.currentPage = parseInt(params.get('page')) || 1;
        this.mode = params.get('mode') || 'webtoon';

        if (!this.seriesSlug) {
            throw new Error('No series specified');
        }
    }

    /**
     * Load series and chapter data
     */
    async loadData() {
        this.seriesData = await ComicData.getSeriesData(this.seriesSlug);
        this.chapterData = await ComicData.getChapterData(this.seriesSlug);

        // Find current chapter
        this.currentChapter = this.chapterData.chapters.find(
            ch => ch.number === this.chapterNum
        );

        if (!this.currentChapter) {
            throw new Error('Chapter not found');
        }

        // Use series default mode if not specified in URL
        if (!new URLSearchParams(window.location.search).has('mode')) {
            this.mode = this.seriesData.defaultMode || 'webtoon';
        }
    }

    /**
     * Setup UI elements
     */
    setupUI() {
        // Set titles
        document.getElementById('series-title').textContent = this.seriesData.title;
        document.getElementById('chapter-title').textContent =
            `Ch. ${this.currentChapter.number}: ${this.currentChapter.title}`;

        // Set page title
        document.title = `${this.seriesData.title} - Ch. ${this.currentChapter.number}`;

        // Update mode button
        this.updateModeButton();

        // Render chapter menu
        this.renderChapterMenu();
    }

    /**
     * Render the reader based on current mode
     */
    renderReader() {
        this.loadingEl.style.display = 'none';
        this.container.className = `reader-container ${this.mode}`;

        if (this.mode === 'webtoon') {
            this.renderWebtoonMode();
        } else {
            this.renderPagedMode();
        }
    }

    /**
     * Render webtoon mode (vertical scroll)
     */
    renderWebtoonMode() {
        this.container.innerHTML = '';
        this.pageNav.style.display = 'none';

        // Create all page images
        this.currentChapter.pages.forEach((page, index) => {
            const img = document.createElement('img');
            img.className = 'comic-page';
            img.alt = page.alt || `Page ${index + 1}`;
            img.dataset.src = ComicData.getPagePath(this.seriesSlug, page.file);
            img.dataset.pageNum = index + 1;

            // Lazy loading
            if (index < 3) {
                // Load first 3 pages immediately
                img.src = img.dataset.src;
            } else {
                // Lazy load the rest
                this.observeImage(img);
            }

            this.container.appendChild(img);
        });

        // Scroll to current page
        setTimeout(() => this.scrollToPage(this.currentPage), 100);
    }

    /**
     * Render paged mode (single page)
     */
    renderPagedMode() {
        this.container.innerHTML = '';
        this.pageNav.style.display = 'flex';

        const page = this.currentChapter.pages[this.currentPage - 1];
        if (!page) {
            this.showError('Page not found');
            return;
        }

        const img = document.createElement('img');
        img.className = 'comic-page';
        img.src = ComicData.getPagePath(this.seriesSlug, page.file);
        img.alt = page.alt || `Page ${this.currentPage}`;

        this.container.appendChild(img);

        // Update navigation
        this.updatePageNav();

        // Preload adjacent pages
        this.preloadAdjacentPages();
    }

    /**
     * Toggle between webtoon and paged modes
     */
    toggleMode() {
        this.mode = this.mode === 'webtoon' ? 'paged' : 'webtoon';
        this.updateModeButton();
        this.updateURL();
        this.renderReader();
    }

    /**
     * Update mode toggle button
     */
    updateModeButton() {
        const icon = document.getElementById('mode-icon');
        const text = document.getElementById('mode-text');

        if (this.mode === 'webtoon') {
            icon.textContent = '📜';
            text.textContent = 'Webtoon';
        } else {
            icon.textContent = '📖';
            text.textContent = 'Paged';
        }
    }

    /**
     * Navigate to previous page
     */
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updateURL();
            if (this.mode === 'paged') {
                this.renderPagedMode();
            }
        } else if (this.chapterNum > 1) {
            // Go to previous chapter
            this.navigateToChapter(this.chapterNum - 1, 'last');
        }
    }

    /**
     * Navigate to next page
     */
    nextPage() {
        if (this.currentPage < this.currentChapter.pages.length) {
            this.currentPage++;
            this.updateURL();
            if (this.mode === 'paged') {
                this.renderPagedMode();
            }
        } else if (this.chapterNum < this.chapterData.chapters.length) {
            // Go to next chapter
            this.navigateToChapter(this.chapterNum + 1, 1);
        }
    }

    /**
     * Navigate to a specific chapter
     * @param {number} chapterNum - Chapter number
     * @param {number|string} page - Page number or 'last'
     */
    async navigateToChapter(chapterNum, page = 1) {
        this.chapterNum = chapterNum;
        this.currentChapter = this.chapterData.chapters.find(
            ch => ch.number === chapterNum
        );

        if (!this.currentChapter) {
            return;
        }

        if (page === 'last') {
            this.currentPage = this.currentChapter.pages.length;
        } else {
            this.currentPage = page;
        }

        this.setupUI();
        this.updateURL();
        this.renderReader();
        this.closeChapterMenu();
    }

    /**
     * Update page navigation
     */
    updatePageNav() {
        document.getElementById('current-page').textContent = this.currentPage;
        document.getElementById('total-pages').textContent = this.currentChapter.pages.length;

        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        prevBtn.disabled = this.currentPage === 1 && this.chapterNum === 1;
        nextBtn.disabled = this.currentPage === this.currentChapter.pages.length &&
                          this.chapterNum === this.chapterData.chapters.length;
    }

    /**
     * Render chapter menu
     */
    renderChapterMenu() {
        const list = document.getElementById('chapter-list');
        list.innerHTML = '';

        this.chapterData.chapters.forEach(chapter => {
            const item = document.createElement('div');
            item.className = 'chapter-item';
            if (chapter.number === this.chapterNum) {
                item.classList.add('current');
            }

            item.innerHTML = `
                <h3>Chapter ${chapter.number}</h3>
                <p>${chapter.title}</p>
            `;

            item.addEventListener('click', () => {
                this.navigateToChapter(chapter.number, 1);
            });

            list.appendChild(item);
        });
    }

    /**
     * Toggle chapter menu
     */
    toggleChapterMenu() {
        this.chapterMenu.classList.toggle('open');
        this.menuOverlay.classList.toggle('active');
    }

    /**
     * Close chapter menu
     */
    closeChapterMenu() {
        this.chapterMenu.classList.remove('open');
        this.menuOverlay.classList.remove('active');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Mode toggle
        document.getElementById('mode-toggle-btn').addEventListener('click', () => {
            this.toggleMode();
        });

        // Menu toggle
        document.getElementById('menu-toggle-btn').addEventListener('click', () => {
            this.toggleChapterMenu();
        });

        // Menu close
        document.getElementById('menu-close-btn').addEventListener('click', () => {
            this.closeChapterMenu();
        });

        // Menu overlay
        this.menuOverlay.addEventListener('click', () => {
            this.closeChapterMenu();
        });

        // Page navigation buttons
        document.getElementById('prev-btn').addEventListener('click', () => {
            this.previousPage();
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            this.nextPage();
        });

        // Keyboard navigation
        this.setupKeyboardNav();

        // Touch gestures
        this.setupTouchGestures();

        // Window resize
        window.addEventListener('resize', () => {
            if (this.mode === 'webtoon') {
                this.scrollToPage(this.getCurrentVisiblePage());
            }
        });
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousPage();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextPage();
                    break;
                case 'm':
                case 'M':
                    e.preventDefault();
                    this.toggleMode();
                    break;
                case 'c':
                case 'C':
                    e.preventDefault();
                    this.toggleChapterMenu();
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.closeChapterMenu();
                    break;
            }
        });
    }

    /**
     * Setup touch gestures
     */
    setupTouchGestures() {
        this.container.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }, { passive: true });

        this.container.addEventListener('touchend', (e) => {
            if (this.mode !== 'paged') return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const deltaX = touchEndX - this.touchStartX;
            const deltaY = touchEndY - this.touchStartY;

            // Horizontal swipe
            if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0) {
                    this.previousPage();
                } else {
                    this.nextPage();
                }
            }
        }, { passive: true });
    }

    /**
     * Update URL without page reload
     */
    updateURL() {
        const url = new URL(window.location);
        url.searchParams.set('series', this.seriesSlug);
        url.searchParams.set('ch', this.chapterNum);
        url.searchParams.set('page', this.currentPage);
        url.searchParams.set('mode', this.mode);
        window.history.pushState({}, '', url);
    }

    /**
     * Save progress
     */
    saveProgress() {
        ComicData.saveProgress(
            this.seriesSlug,
            this.chapterNum,
            this.currentPage,
            this.mode
        );
    }

    /**
     * Start progress tracking
     */
    startProgressTracking() {
        // Save immediately
        this.saveProgress();

        // Save every 5 seconds
        setInterval(() => {
            if (this.mode === 'webtoon') {
                this.currentPage = this.getCurrentVisiblePage();
            }
            this.saveProgress();
        }, 5000);
    }

    /**
     * Get currently visible page in webtoon mode
     * @returns {number} Page number
     */
    getCurrentVisiblePage() {
        const images = this.container.querySelectorAll('.comic-page');
        const viewportMiddle = window.scrollY + window.innerHeight / 2;

        let closestPage = 1;
        let closestDistance = Infinity;

        images.forEach((img) => {
            const rect = img.getBoundingClientRect();
            const imgMiddle = window.scrollY + rect.top + rect.height / 2;
            const distance = Math.abs(imgMiddle - viewportMiddle);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestPage = parseInt(img.dataset.pageNum) || 1;
            }
        });

        return closestPage;
    }

    /**
     * Scroll to a specific page in webtoon mode
     * @param {number} pageNum - Page number
     */
    scrollToPage(pageNum) {
        const img = this.container.querySelector(`[data-page-num="${pageNum}"]`);
        if (img) {
            img.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /**
     * Preload adjacent pages in paged mode
     */
    preloadAdjacentPages() {
        const prevPage = this.currentPage - 1;
        const nextPage = this.currentPage + 1;

        if (prevPage > 0 && prevPage <= this.currentChapter.pages.length) {
            const img = new Image();
            img.src = ComicData.getPagePath(
                this.seriesSlug,
                this.currentChapter.pages[prevPage - 1].file
            );
        }

        if (nextPage > 0 && nextPage <= this.currentChapter.pages.length) {
            const img = new Image();
            img.src = ComicData.getPagePath(
                this.seriesSlug,
                this.currentChapter.pages[nextPage - 1].file
            );
        }
    }

    /**
     * Setup lazy loading observer
     */
    setupLazyLoading() {
        this.imageObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        this.imageObserver.unobserve(img);
                    }
                });
            },
            { rootMargin: '200px' }
        );
    }

    /**
     * Observe an image for lazy loading
     * @param {HTMLElement} img - Image element
     */
    observeImage(img) {
        if (!this.imageObserver) {
            this.setupLazyLoading();
        }
        this.imageObserver.observe(img);
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        this.loadingEl.style.display = 'none';
        this.errorEl.textContent = message;
        this.errorEl.style.display = 'block';
    }
}
