// Egg behavior constants
const EGG_CONFIG = {
    size: 16,
    sittingRequired: 10000, // 10 seconds
    hatchingFrameDelay: 800,
    shellRemoveDelay: 2000,
    chickenMoveAwayDelay: 2000,
    hatchingFrames: [1, 2, 3, 4] // hatching, chick peeking, chick popping, empty shell
};

class Egg {
    constructor(x, y, id) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.element = document.createElement('div');
        this.element.className = 'egg sprite';
        this.element.id = 'egg-' + id;
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        document.body.appendChild(this.element);

        this.currentFrame = 0;
        this.frameTime = 0;
        this.state = 'waiting'; // waiting, hatching, hatched
        this.sittingChicken = null;
        this.sittingTime = 0;
        this.sittingRequired = EGG_CONFIG.sittingRequired;

        this.updateSprite();
    }

    updateSprite() {
        const frameX = this.currentFrame * EGG_CONFIG.size;
        this.element.style.backgroundPosition = `-${frameX}px 0px`;
    }

    startSitting(chicken) {
        if (this.state === 'waiting' && !this.sittingChicken) {
            this.sittingChicken = chicken;
            this.parentChickenRef = chicken;
            this.sittingTime = 0;
        }
    }

    updateSitting(deltaTime) {
        if (this.sittingChicken && this.state === 'waiting') {
            this.sittingTime += deltaTime;

            if (this.sittingTime >= this.sittingRequired) {
                const parentChicken = this.sittingChicken;
                this.sittingChicken = null;

                if (parentChicken) {
                    parentChicken.stopSitting();
                }

                setTimeout(() => {
                    this.startHatching();
                }, EGG_CONFIG.chickenMoveAwayDelay);

                return true;
            }
        }
        return false;
    }

    startHatching() {
        this.state = 'hatching';
        this.currentFrame = 1;
        this.frameTime = 0;
        this.animateHatching();
    }

    animateHatching() {
        const hatchingFrames = EGG_CONFIG.hatchingFrames;
        let frameIndex = 0;

        const animate = () => {
            if (frameIndex < hatchingFrames.length - 1) {
                this.currentFrame = hatchingFrames[frameIndex];
                this.updateSprite();
                frameIndex++;
                setTimeout(animate, EGG_CONFIG.hatchingFrameDelay);
            } else if (frameIndex === hatchingFrames.length - 1) {
                this.hatch();
                this.currentFrame = hatchingFrames[frameIndex];
                this.updateSprite();
                setTimeout(() => {
                    this.element.remove();
                    window.eggs = window.eggs.filter(e => e.id !== this.id);
                }, EGG_CONFIG.shellRemoveDelay);
            }
        };

        animate();
    }

    hatch() {
        this.state = 'hatched';

        let parentChicken = this.parentChickenRef;
        if (!parentChicken || !window.chickens.includes(parentChicken)) {
            parentChicken = this.findParentChicken();
        }

        const chick = new Chick(Date.now(), parentChicken);
        chick.x = this.x + (Math.random() - 0.5) * 10;
        chick.y = this.y + (Math.random() - 0.5) * 10;
        chick.velocityX = (Math.random() - 0.5) * 1.5;
        chick.velocityY = (Math.random() - 0.5) * 1.5;
        chick.updatePosition();

        window.chickens.push(chick);
    }

    findParentChicken() {
        return window.chickens.find(chicken =>
            chicken instanceof Chicken &&
            !chicken.isChick &&
            chicken.constructor.name === 'Chicken' &&
            Math.sqrt(Math.pow(chicken.x - this.x, 2) + Math.pow(chicken.y - this.y, 2)) < 80
        );
    }

    remove() {
        this.element.remove();
    }
}
