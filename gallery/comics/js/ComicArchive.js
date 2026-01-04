// ComicArchive.js - Archive page controller for displaying comic series

class ComicArchive {
    constructor() {
        this.series = [];
        this.container = document.getElementById('series-grid');
        this.loadingEl = document.getElementById('loading');
        this.errorEl = document.getElementById('error');
    }

    /**
     * Initialize the archive page
     */
    async init() {
        try {
            await this.loadSeriesData();
            this.renderSeriesList();
        } catch (error) {
            this.showError('Failed to load comics. Please try again later.');
            console.error('Error initializing archive:', error);
        }
    }

    /**
     * Load series data from JSON
     */
    async loadSeriesData() {
        this.series = await ComicData.getSeriesList();
    }

    /**
     * Render the series list to the page
     */
    renderSeriesList() {
        this.loadingEl.style.display = 'none';

        if (this.series.length === 0) {
            this.showEmptyState();
            return;
        }

        this.container.innerHTML = '';

        this.series.forEach(series => {
            const card = this.createSeriesCard(series);
            this.container.appendChild(card);
        });
    }

    /**
     * Create a series card element
     * @param {Object} series - Series data
     * @returns {HTMLElement} Series card element
     */
    createSeriesCard(series) {
        const card = document.createElement('a');
        card.className = 'series-card';

        // Check if user has reading progress
        const progress = ComicData.loadProgress(series.slug);
        const continueReading = progress !== null;

        // Determine link URL
        if (continueReading) {
            card.href = `reader.html?series=${series.slug}&ch=${progress.chapter}&page=${progress.page}&mode=${progress.mode}`;
        } else {
            const defaultMode = series.defaultMode || 'webtoon';
            card.href = `reader.html?series=${series.slug}&ch=1&page=1&mode=${defaultMode}`;
        }

        // Create cover image
        const cover = this.createCoverImage(series);
        card.appendChild(cover);

        // Create info section
        const info = document.createElement('div');
        info.className = 'series-info';

        const title = document.createElement('h2');
        title.className = 'series-title';
        title.textContent = series.title;
        info.appendChild(title);

        const description = document.createElement('p');
        description.className = 'series-description';
        description.textContent = series.description;
        info.appendChild(description);

        // Meta information
        const meta = document.createElement('div');
        meta.className = 'series-meta';

        const status = document.createElement('span');
        status.className = `series-status ${series.status}`;
        status.textContent = series.status;
        meta.appendChild(status);

        info.appendChild(meta);

        // Read button
        const readBtn = document.createElement('div');
        readBtn.className = `read-button ${continueReading ? 'continue-reading' : ''}`;
        readBtn.textContent = continueReading ? 'CONTINUE READING' : 'START READING';
        info.appendChild(readBtn);

        card.appendChild(info);

        return card;
    }

    /**
     * Create cover image element
     * @param {Object} series - Series data
     * @returns {HTMLElement} Cover image element
     */
    createCoverImage(series) {
        const img = document.createElement('img');
        img.className = 'series-cover';
        img.alt = `${series.title} cover`;

        // Use cover image if available, otherwise show placeholder
        if (series.coverImage) {
            img.src = series.coverImage;
            img.onerror = () => {
                // If image fails to load, show placeholder
                const placeholder = document.createElement('div');
                placeholder.className = 'series-cover placeholder';
                placeholder.textContent = '📚';
                img.replaceWith(placeholder);
            };
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'series-cover placeholder';
            placeholder.textContent = '📚';
            return placeholder;
        }

        return img;
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

    /**
     * Show empty state when no series are available
     */
    showEmptyState() {
        this.container.innerHTML = `
            <div class="empty-state">
                <h2>No Comics Yet!</h2>
                <p>
                    To add your comics, create a new folder in <code>data/</code>
                    with your comic files and metadata. Check out the sample-comic
                    folder for an example structure.
                </p>
                <p>
                    Each comic needs a <code>series.json</code>, <code>chapters.json</code>,
                    and your comic page images in the <code>pages/</code> folder.
                </p>
            </div>
        `;
    }
}
