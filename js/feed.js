// Feed system constants
const FEED_CONFIG = {
    size: 16,
    initialAmount: 100,
    consumeAmount: 10,
    notifyRadius: 0.5, // fraction of screen
    spriteThresholds: {
        full: 0.66,
        half: 0.33
    }
};

class FeedSystem {
    constructor() {
        this.hasFood = false;
        this.feeds = [];
        this.mouseFeed = document.getElementById('mouse-feed');
        this.feedBag = document.getElementById('feed-bag');
        this.mouseX = 0;
        this.mouseY = 0;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Feed bag click
        this.feedBag.addEventListener('click', () => {
            this.hasFood = true;
            this.mouseFeed.style.display = 'block';
            document.body.style.cursor = 'none';
        });

        // Mouse movement tracking
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            if (this.hasFood) {
                this.mouseFeed.style.left = (e.clientX - 8) + 'px';
                this.mouseFeed.style.top = (e.clientY - 8) + 'px';
            }
        });

        // Screen click to place feed
        document.addEventListener('click', (e) => {
            if (this.hasFood && !e.target.closest('#feed-bag') && !e.target.closest('.panel')) {
                this.placeFeed(e.clientX, e.clientY);
                this.hasFood = false;
                this.mouseFeed.style.display = 'none';
                document.body.style.cursor = 'default';
            }
        });
    }

    placeFeed(x, y) {
        const feed = {
            x: x - 8,
            y: y - 8,
            element: document.createElement('div'),
            amount: FEED_CONFIG.initialAmount,
            maxAmount: FEED_CONFIG.initialAmount,
            id: Date.now()
        };

        feed.element.className = 'feed sprite';
        feed.element.style.left = feed.x + 'px';
        feed.element.style.top = feed.y + 'px';
        this.updateFeedSprite(feed);
        document.body.appendChild(feed.element);
        this.feeds.push(feed);

        this.notifyChickens(feed);
    }

    updateFeedSprite(feed) {
        const percentage = feed.amount / feed.maxAmount;
        let frameX = 0;

        if (percentage > FEED_CONFIG.spriteThresholds.full) {
            frameX = 0;
        } else if (percentage > FEED_CONFIG.spriteThresholds.half) {
            frameX = -FEED_CONFIG.size;
        } else if (percentage > 0) {
            frameX = -FEED_CONFIG.size * 2;
        }

        feed.element.style.backgroundPosition = `${frameX}px 0px`;
    }

    notifyChickens(feed) {
        const radius = Math.min(window.innerWidth, window.innerHeight) * FEED_CONFIG.notifyRadius;
        window.chickens.forEach(chicken => {
            const distance = Math.sqrt(
                Math.pow(chicken.x - feed.x, 2) +
                Math.pow(chicken.y - feed.y, 2)
            );
            if (distance <= radius) {
                chicken.rushToFeed(feed);
            }
        });
    }

    consumeFeed(feedId, amount = FEED_CONFIG.consumeAmount) {
        const feed = this.feeds.find(f => f.id === feedId);
        if (feed) {
            feed.amount -= amount;
            this.updateFeedSprite(feed);

            if (feed.amount <= 0) {
                feed.element.remove();
                this.feeds = this.feeds.filter(f => f.id !== feedId);
                return true;
            }
        }
        return false;
    }

    getMousePosition() {
        return { x: this.mouseX, y: this.mouseY };
    }

    hasMouseFood() {
        return this.hasFood;
    }
}
