// ComicData.js - Utility class for loading comic data and managing progress

class ComicData {
    /**
     * Fetch and parse JSON file
     * @param {string} path - Path to JSON file
     * @returns {Promise<Object>} Parsed JSON data
     */
    static async fetchJSON(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${path}:`, error);
            throw error;
        }
    }

    /**
     * Get list of all series
     * @returns {Promise<Array>} Array of series objects
     */
    static async getSeriesList() {
        const data = await this.fetchJSON('data/series.json');
        return data.series || [];
    }

    /**
     * Get series metadata
     * @param {string} slug - Series slug
     * @returns {Promise<Object>} Series metadata
     */
    static async getSeriesData(slug) {
        return await this.fetchJSON(`data/${slug}/series.json`);
    }

    /**
     * Get chapter data for a series
     * @param {string} slug - Series slug
     * @returns {Promise<Object>} Chapter data with pages
     */
    static async getChapterData(slug) {
        return await this.fetchJSON(`data/${slug}/chapters.json`);
    }

    /**
     * Get full path to page image
     * @param {string} slug - Series slug
     * @param {string} filename - Image filename
     * @returns {string} Full path to image
     */
    static getPagePath(slug, filename) {
        return `data/${slug}/pages/${filename}`;
    }

    /**
     * Save reading progress to localStorage
     * @param {string} slug - Series slug
     * @param {number} chapter - Chapter number
     * @param {number} page - Page number
     * @param {string} mode - Reader mode ('webtoon' or 'paged')
     */
    static saveProgress(slug, chapter, page, mode) {
        try {
            const progress = this.getAllProgress();
            progress[slug] = {
                chapter: chapter,
                page: page,
                mode: mode,
                timestamp: Date.now()
            };
            localStorage.setItem('comicProgress', JSON.stringify(progress));
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }

    /**
     * Load reading progress from localStorage
     * @param {string} slug - Series slug
     * @returns {Object|null} Progress object or null if no progress found
     */
    static loadProgress(slug) {
        try {
            const progress = this.getAllProgress();
            return progress[slug] || null;
        } catch (error) {
            console.error('Error loading progress:', error);
            return null;
        }
    }

    /**
     * Get all progress data
     * @returns {Object} All progress data
     */
    static getAllProgress() {
        try {
            const data = localStorage.getItem('comicProgress');
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Error reading progress:', error);
            return {};
        }
    }

    /**
     * Clear progress for a series
     * @param {string} slug - Series slug
     */
    static clearProgress(slug) {
        try {
            const progress = this.getAllProgress();
            delete progress[slug];
            localStorage.setItem('comicProgress', JSON.stringify(progress));
        } catch (error) {
            console.error('Error clearing progress:', error);
        }
    }
}
