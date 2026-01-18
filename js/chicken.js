// Chicken behavior constants
const CHICKEN_CONFIG = {
    size: 32,
    minVelocity: 0.5,
    maxVelocity: 2,
    directionChangeChance: 0.01,
    peckChance: 0.005,
    peckDuration: 600,
    idleChance: 0.003,
    idleMinDuration: 1000,
    idleMaxDuration: 5000,
    jumpDuration: 800,
    jumpHeight: 60,
    jumpDistance: 40,
    followDistance: 100,
    unfollowDistance: 150,
    feedDetectionRadius: 0.25, // fraction of screen
    feedReachDistance: 20,
    feedSpeed: 2,
    mouseFollowSpeed: 1.5,
    eggLayChance: 0.0001,
    eggCooldown: 30000,
    eggSitChance: 0.01,
    eggSitDistance: 30,
    animations: {
        idle: { frames: [0, 1], speed: 500 },
        walking: { frames: [2, 3, 4, 5], speed: 150 },
        pecking: { frames: [6, 7], speed: 300 },
        jumping: { frames: [8, 9], speed: 100 },
        sitting: { frames: [10], speed: 1000 }
    }
};

const CHICK_CONFIG = {
    size: 16,
    runAwaySpeed: 4,
    runAwayDuration: 3000,
    runAwayStopDistance: 100,
    followParentDistance: 80,
    closeToParentDistance: 45,
    ridingChance: 0.003,
    ridingStopChance: 0.002,
    ridingMinDuration: 1500,
    ridingMaxDuration: 3500,
    parentFollowSpeed: 1.8,
    sittingParentDistance: 60,
    sittingParentTargetDistance: 50,
    animations: {
        idle: { frames: [0, 1], speed: 500 },
        walking: { frames: [2, 3], speed: 150 },
        pecking: { frames: [4, 5], speed: 300 },
        running: { frames: [2, 3], speed: 100 },
        riding: { frames: [1], speed: 1000 }
    }
};

class Chicken {
    constructor(id) {
        this.element = document.createElement('div');
        this.element.className = 'chicken sprite';
        this.element.id = 'chicken-' + id;
        document.body.appendChild(this.element);

        this.x = Math.random() * (window.innerWidth - CHICKEN_CONFIG.size);
        this.y = Math.random() * (window.innerHeight - CHICKEN_CONFIG.size);
        this.velocityX = (Math.random() - 0.5) * CHICKEN_CONFIG.maxVelocity;
        this.velocityY = (Math.random() - 0.5) * CHICKEN_CONFIG.maxVelocity;
        this.currentFrame = 0;
        this.frameTime = 0;
        this.animationSpeed = 200;
        this.currentAnimation = 'idle';
        this.isJumping = false;
        this.jumpTime = 0;
        this.isPecking = false;
        this.isIdling = false;
        this.idleTimer = 0;
        this.facingRight = true;
        this.jumpStartY = 0;
        this.jumpProgress = 0;
        this.targetFeed = null;
        this.followingMouse = false;
        this.normalVelocityX = this.velocityX;
        this.normalVelocityY = this.velocityY;

        this.animations = CHICKEN_CONFIG.animations;

        // Egg laying properties
        this.isLayingEgg = false;
        this.isSitting = false;
        this.sittingEgg = null;
        this.lastEggTime = 0;
        this.eggLayingCooldown = CHICKEN_CONFIG.eggCooldown;
        this.isChick = false;

        this.updatePosition();
        this.setupEventListeners();
        // Animation now handled by shared game loop in main.js
    }

    updatePosition() {
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
    }

    updateSprite() {
        const frameX = this.currentFrame * CHICKEN_CONFIG.size;
        this.element.style.backgroundPosition = `-${frameX}px 0px`;
        this.element.style.transform = this.facingRight ? 'scaleX(-1)' : 'scaleX(1)';
    }

    setAnimation(animName) {
        if (this.currentAnimation !== animName) {
            this.currentAnimation = animName;
            this.currentFrame = this.animations[animName].frames[0];
            this.frameTime = 0;
        }
    }

    updateAnimation(deltaTime) {
        if (this.isSitting && this.currentAnimation === 'sitting') {
            this.currentFrame = 10;
            this.updateSprite();
            return;
        }

        const anim = this.animations[this.currentAnimation];
        this.frameTime += deltaTime;

        if (this.frameTime >= anim.speed) {
            this.frameTime = 0;
            const currentFrameIndex = anim.frames.indexOf(this.currentFrame);
            const nextFrameIndex = (currentFrameIndex + 1) % anim.frames.length;
            this.currentFrame = anim.frames[nextFrameIndex];
        }

        this.updateSprite();
    }

    wander(deltaTime) {
        if (this.isJumping) {
            this.updateJump(deltaTime);
            return;
        }

        if (this.isPecking || this.isLayingEgg) return;

        if (this.isSitting) {
            this.setAnimation('sitting');
            return;
        }

        if (window.feedSystem && window.feedSystem.hasMouseFood()) {
            this.checkMouseProximity();
        }

        this.checkForEggsToSitOn();

        if (!this.isChick && Math.random() < CHICKEN_CONFIG.eggLayChance &&
            (Date.now() - this.lastEggTime) > this.eggLayingCooldown) {
            this.layEgg();
            return;
        }

        if (this.targetFeed) {
            this.moveTowardFeed(deltaTime);
            return;
        }

        if (this.followingMouse) {
            this.followMouse();
            return;
        }

        if (!this.targetFeed) {
            this.checkForNearbyFeed();
        }

        if (this.isIdling) {
            this.idleTimer += deltaTime;
            if (this.idleTimer >= this.idleDuration) {
                this.isIdling = false;
                this.idleTimer = 0;
                this.velocityX = (Math.random() - 0.5) * CHICKEN_CONFIG.maxVelocity;
                this.velocityY = (Math.random() - 0.5) * CHICKEN_CONFIG.maxVelocity;
                if (Math.abs(this.velocityX) < CHICKEN_CONFIG.minVelocity) {
                    this.velocityX = this.velocityX >= 0 ? CHICKEN_CONFIG.minVelocity : -CHICKEN_CONFIG.minVelocity;
                }
                if (Math.abs(this.velocityY) < CHICKEN_CONFIG.minVelocity) {
                    this.velocityY = this.velocityY >= 0 ? CHICKEN_CONFIG.minVelocity : -CHICKEN_CONFIG.minVelocity;
                }
            } else {
                return;
            }
        }

        if (Math.random() < CHICKEN_CONFIG.directionChangeChance) {
            this.velocityX = (Math.random() - 0.5) * CHICKEN_CONFIG.maxVelocity;
            this.velocityY = (Math.random() - 0.5) * CHICKEN_CONFIG.maxVelocity;
        }

        if (Math.random() < CHICKEN_CONFIG.peckChance) {
            this.isPecking = true;
            this.setAnimation('pecking');
            setTimeout(() => {
                this.isPecking = false;
                if (!this.isJumping && !this.isIdling) {
                    this.setAnimation(Math.abs(this.velocityX) + Math.abs(this.velocityY) > 0.1 ? 'walking' : 'idle');
                }
            }, CHICKEN_CONFIG.peckDuration);
            return;
        }

        if (Math.random() < CHICKEN_CONFIG.idleChance) {
            this.isIdling = true;
            this.idleTimer = 0;
            this.idleDuration = CHICKEN_CONFIG.idleMinDuration +
                Math.random() * (CHICKEN_CONFIG.idleMaxDuration - CHICKEN_CONFIG.idleMinDuration);
            this.setAnimation('idle');
            return;
        }

        this.x += this.velocityX;
        this.y += this.velocityY;

        if (this.velocityX > 0.1) {
            this.facingRight = true;
        } else if (this.velocityX < -0.1) {
            this.facingRight = false;
        }

        const size = CHICKEN_CONFIG.size;
        if (this.x <= 0 || this.x >= window.innerWidth - size) {
            this.velocityX = -this.velocityX;
            this.x = Math.max(0, Math.min(window.innerWidth - size, this.x));
            this.facingRight = this.velocityX > 0;
        }
        if (this.y <= 0 || this.y >= window.innerHeight - size) {
            this.velocityY = -this.velocityY;
            this.y = Math.max(0, Math.min(window.innerHeight - size, this.y));
        }

        const isMoving = Math.abs(this.velocityX) + Math.abs(this.velocityY) > 0.1;
        this.setAnimation(isMoving ? 'walking' : 'idle');

        this.updatePosition();
    }

    updateJump(deltaTime) {
        this.jumpProgress += deltaTime / CHICKEN_CONFIG.jumpDuration;

        if (this.jumpProgress >= 1) {
            this.isJumping = false;
            this.jumpProgress = 0;
            this.setAnimation(Math.abs(this.velocityX) + Math.abs(this.velocityY) > 0.1 ? 'walking' : 'idle');
            return;
        }

        const jumpHeight = CHICKEN_CONFIG.jumpHeight * Math.sin(this.jumpProgress * Math.PI);
        const jumpDistance = CHICKEN_CONFIG.jumpDistance * this.jumpProgress;

        this.y = this.jumpStartY - jumpHeight;
        this.x += (this.facingRight ? jumpDistance : -jumpDistance) / 20;

        const size = CHICKEN_CONFIG.size;
        this.x = Math.max(0, Math.min(window.innerWidth - size, this.x));
        this.y = Math.max(0, Math.min(window.innerHeight - size, this.y));

        this.updatePosition();
    }

    jump() {
        if (this.isJumping || this.isPecking) return;

        this.isJumping = true;
        this.isPecking = false;
        this.isIdling = false;
        this.jumpStartY = this.y;
        this.jumpProgress = 0;
        this.setAnimation('jumping');
    }

    checkMouseProximity() {
        const mousePos = window.feedSystem.getMousePosition();
        const distance = Math.sqrt(
            Math.pow(this.x - mousePos.x, 2) +
            Math.pow(this.y - mousePos.y, 2)
        );

        if (distance <= CHICKEN_CONFIG.followDistance && !this.followingMouse) {
            this.followingMouse = true;
            this.isIdling = false;
        } else if (distance > CHICKEN_CONFIG.unfollowDistance && this.followingMouse) {
            this.followingMouse = false;
        }
    }

    followMouse() {
        const mousePos = window.feedSystem.getMousePosition();
        const dx = mousePos.x - this.x;
        const dy = mousePos.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > CHICKEN_CONFIG.feedReachDistance) {
            this.velocityX = (dx / distance) * CHICKEN_CONFIG.mouseFollowSpeed;
            this.velocityY = (dy / distance) * CHICKEN_CONFIG.mouseFollowSpeed;
            this.facingRight = this.velocityX > 0;
            this.x += this.velocityX;
            this.y += this.velocityY;
            this.setAnimation('walking');
            this.updatePosition();
        }
    }

    rushToFeed(feed) {
        this.targetFeed = feed;
        this.followingMouse = false;
        this.isIdling = false;
        this.isPecking = false;
    }

    moveTowardFeed(deltaTime) {
        if (!this.targetFeed || !window.feedSystem.feeds.find(f => f.id === this.targetFeed.id)) {
            this.targetFeed = null;
            return;
        }

        const dx = this.targetFeed.x - this.x;
        const dy = this.targetFeed.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= CHICKEN_CONFIG.feedReachDistance) {
            this.peckAtFeed();
        } else {
            this.velocityX = (dx / distance) * CHICKEN_CONFIG.feedSpeed;
            this.velocityY = (dy / distance) * CHICKEN_CONFIG.feedSpeed;
            this.facingRight = this.velocityX > 0;
            this.x += this.velocityX;
            this.y += this.velocityY;
            this.setAnimation('walking');
            this.updatePosition();
        }
    }

    checkForNearbyFeed() {
        if (!window.feedSystem) return;

        let closestFeed = null;
        let closestDistance = Infinity;
        const radius = Math.min(window.innerWidth, window.innerHeight) * CHICKEN_CONFIG.feedDetectionRadius;

        window.feedSystem.feeds.forEach(feed => {
            const distance = Math.sqrt(
                Math.pow(this.x - feed.x, 2) +
                Math.pow(this.y - feed.y, 2)
            );

            if (distance <= radius && distance < closestDistance) {
                closestDistance = distance;
                closestFeed = feed;
            }
        });

        if (closestFeed) {
            this.rushToFeed(closestFeed);
        }
    }

    peckAtFeed() {
        if (!this.isPecking) {
            this.isPecking = true;
            this.setAnimation('pecking');

            const feedGone = window.feedSystem.consumeFeed(this.targetFeed.id);

            setTimeout(() => {
                this.isPecking = false;
                if (feedGone || Math.random() < 0.3) {
                    this.targetFeed = null;
                    this.velocityX = (Math.random() - 0.5) * CHICKEN_CONFIG.maxVelocity;
                    this.velocityY = (Math.random() - 0.5) * CHICKEN_CONFIG.maxVelocity;
                }
                this.setAnimation('idle');
            }, CHICKEN_CONFIG.peckDuration);
        }
    }

    layEgg() {
        this.isLayingEgg = true;
        this.currentFrame = 10;
        this.frameTime = 0;
        this.setAnimation('sitting');
        this.updateSprite();
        this.lastEggTime = Date.now();

        setTimeout(() => {
            const egg = new Egg(this.x, this.y + 16, Date.now());
            window.eggs.push(egg);

            this.isLayingEgg = false;
            this.currentFrame = 0;
            this.frameTime = 0;
            this.setAnimation('idle');
            this.velocityX = (Math.random() - 0.5) * CHICKEN_CONFIG.maxVelocity;
            this.velocityY = (Math.random() - 0.5) * CHICKEN_CONFIG.maxVelocity;
        }, 1500);
    }

    checkForEggsToSitOn() {
        if (this.isChick || !window.eggs) return;

        const nearbyEgg = window.eggs.find(egg => {
            const distance = Math.sqrt(
                Math.pow(this.x - egg.x, 2) +
                Math.pow(this.y - egg.y, 2)
            );
            return distance <= CHICKEN_CONFIG.eggSitDistance &&
                   egg.state === 'waiting' &&
                   !egg.sittingChicken;
        });

        if (nearbyEgg && Math.random() < CHICKEN_CONFIG.eggSitChance) {
            this.startSittingOnEgg(nearbyEgg);
        }
    }

    startSittingOnEgg(egg) {
        if (egg.state !== 'waiting' || egg.sittingChicken) {
            return;
        }

        this.isSitting = true;
        this.sittingEgg = egg;
        this.setAnimation('sitting');
        egg.startSitting(this);

        this.x = egg.x;
        this.y = egg.y - 8;
        this.updatePosition();
    }

    stopSitting() {
        this.isSitting = false;
        this.sittingEgg = null;
        this.currentFrame = 0;
        this.frameTime = 0;
        this.setAnimation('idle');

        this.x += (Math.random() - 0.5) * 30;
        this.y += (Math.random() - 0.5) * 30;

        const size = CHICKEN_CONFIG.size;
        this.x = Math.max(0, Math.min(window.innerWidth - size, this.x));
        this.y = Math.max(0, Math.min(window.innerHeight - size, this.y));
        this.updatePosition();

        this.velocityX = (Math.random() - 0.5) * CHICKEN_CONFIG.maxVelocity;
        this.velocityY = (Math.random() - 0.5) * CHICKEN_CONFIG.maxVelocity;

        setTimeout(() => {
            if (!this.isSitting && !this.isLayingEgg && !this.isPecking) {
                this.x += this.velocityX * 5;
                this.y += this.velocityY * 5;
                this.updatePosition();
            }
        }, 100);
    }

    updateSitting(deltaTime) {
        if (this.isSitting && this.sittingEgg) {
            const shouldStop = this.sittingEgg.updateSitting(deltaTime);
            if (shouldStop) {
                this.stopSitting();
            }
            return shouldStop;
        }
        return false;
    }

    setupEventListeners() {
        this.element.addEventListener('mouseenter', () => {
            this.jump();
        });

        window.addEventListener('resize', () => {
            const size = CHICKEN_CONFIG.size;
            this.x = Math.min(this.x, window.innerWidth - size);
            this.y = Math.min(this.y, window.innerHeight - size);
            this.updatePosition();
        });
    }
}

class Chick extends Chicken {
    constructor(id, parentChicken = null) {
        super(id);

        this.element.remove();
        this.element = document.createElement('div');
        this.element.className = 'chick sprite';
        this.element.id = 'chick-' + id;
        document.body.appendChild(this.element);

        this.isRunningAway = false;
        this.runAwayTimer = 0;
        this.originalSpeed = 1;
        this.runAwaySpeed = CHICK_CONFIG.runAwaySpeed;
        this.parentChicken = parentChicken;
        this.isChick = true;
        this.followingParent = false;
        this.isRiding = false;

        this.animations = CHICK_CONFIG.animations;

        this.updatePosition();
        this.setupChickEventListeners();
    }

    updateSprite() {
        const frameX = this.currentFrame * CHICK_CONFIG.size;
        this.element.style.backgroundPosition = `-${frameX}px 0px`;
        this.element.style.transform = this.facingRight ? 'scaleX(-1)' : 'scaleX(1)';
    }

    setupChickEventListeners() {
        this.element.addEventListener('mouseenter', () => {
            if (this.isRiding) {
                this.stopRiding();
            } else {
                this.runAway();
            }
        });

        if (this.parentChicken && this.parentChicken.element) {
            this.parentChicken.element.addEventListener('mouseenter', () => {
                if (this.isRiding) {
                    this.stopRiding();
                }
            });
        }

        window.addEventListener('resize', () => {
            const size = CHICK_CONFIG.size;
            this.x = Math.min(this.x, window.innerWidth - size);
            this.y = Math.min(this.y, window.innerHeight - size);
            this.updatePosition();
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isRunningAway) {
                this.checkMouseDistance(e.clientX, e.clientY);
            }
        });
    }

    runAway() {
        if (!this.isRunningAway) {
            this.isRunningAway = true;
            this.runAwayTimer = 0;
            this.isPecking = false;
            this.isIdling = false;
            this.targetFeed = null;
            this.followingMouse = false;
        }
    }

    checkMouseDistance(mouseX, mouseY) {
        const distance = Math.sqrt(
            Math.pow(this.x - mouseX, 2) +
            Math.pow(this.y - mouseY, 2)
        );

        if (distance > CHICK_CONFIG.runAwayStopDistance) {
            this.isRunningAway = false;
            this.runAwayTimer = 0;
        }
    }

    wander(deltaTime) {
        if (this.isJumping) {
            this.updateJump(deltaTime);
            return;
        }

        if (this.isPecking) return;

        if (this.isRunningAway) {
            this.runAwayTimer += deltaTime;
            this.runAwayFromMouse();

            if (this.runAwayTimer >= CHICK_CONFIG.runAwayDuration) {
                this.isRunningAway = false;
                this.runAwayTimer = 0;
            }
            return;
        }

        if (this.parentChicken && window.chickens.includes(this.parentChicken) && !this.parentChicken.isChick) {
            if (!this.parentChicken.element || !this.parentChicken.element.parentNode) {
                this.parentChicken = null;
                return;
            }

            if (this.parentChicken.isSitting) {
                const distance = Math.sqrt(
                    Math.pow(this.parentChicken.x - this.x, 2) +
                    Math.pow(this.parentChicken.y - this.y, 2)
                );

                if (distance > CHICK_CONFIG.sittingParentDistance) {
                    const dx = this.parentChicken.x - this.x;
                    const dy = this.parentChicken.y - this.y;

                    if (distance > CHICK_CONFIG.sittingParentTargetDistance) {
                        this.velocityX = (dx / distance) * 1.0;
                        this.velocityY = (dy / distance) * 1.0;
                        this.x += this.velocityX;
                        this.y += this.velocityY;
                        this.facingRight = this.velocityX > 0;
                        this.setAnimation('walking');
                        this.updatePosition();
                        return;
                    }
                }

                this.setAnimation('idle');
                return;
            }

            const distance = Math.sqrt(
                Math.pow(this.parentChicken.x - this.x, 2) +
                Math.pow(this.parentChicken.y - this.y, 2)
            );

            if (!this.isRiding && distance <= 15 && Math.random() < CHICK_CONFIG.ridingChance) {
                this.startRiding();
                return;
            }

            if (this.isRiding) {
                this.rideParent();
                return;
            }

            if (distance > CHICK_CONFIG.followParentDistance) {
                this.followParent();
                return;
            }

            if (distance > CHICK_CONFIG.closeToParentDistance) {
                if (Math.random() < 0.1) {
                    this.followParent();
                    return;
                }
            }
        }

        super.wander(deltaTime);
    }

    runAwayFromMouse() {
        const mousePos = window.feedSystem.getMousePosition();
        const dx = this.x - mousePos.x;
        const dy = this.y - mousePos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.velocityX = (dx / distance) * this.runAwaySpeed;
            this.velocityY = (dy / distance) * this.runAwaySpeed;
            this.facingRight = this.velocityX > 0;

            this.x += this.velocityX;
            this.y += this.velocityY;

            const size = CHICK_CONFIG.size;
            if (this.x <= 0 || this.x >= window.innerWidth - size) {
                this.velocityX = -this.velocityX;
                this.x = Math.max(0, Math.min(window.innerWidth - size, this.x));
            }
            if (this.y <= 0 || this.y >= window.innerHeight - size) {
                this.velocityY = -this.velocityY;
                this.y = Math.max(0, Math.min(window.innerHeight - size, this.y));
            }

            this.setAnimation('running');
            this.updatePosition();
        }
    }

    followParent() {
        if (!this.parentChicken) return;

        const dx = this.parentChicken.x - this.x;
        const dy = this.parentChicken.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 40) {
            this.velocityX = (dx / distance) * CHICK_CONFIG.parentFollowSpeed;
            this.velocityY = (dy / distance) * CHICK_CONFIG.parentFollowSpeed;
            this.facingRight = this.velocityX > 0;

            this.x += this.velocityX;
            this.y += this.velocityY;

            const size = CHICK_CONFIG.size;
            if (this.x <= 0 || this.x >= window.innerWidth - size) {
                this.velocityX = -this.velocityX;
                this.x = Math.max(0, Math.min(window.innerWidth - size, this.x));
            }
            if (this.y <= 0 || this.y >= window.innerHeight - size) {
                this.velocityY = -this.velocityY;
                this.y = Math.max(0, Math.min(window.innerHeight - size, this.y));
            }

            this.setAnimation('walking');
            this.updatePosition();
        } else {
            this.setAnimation('idle');
        }
    }

    startRiding() {
        this.isRiding = true;
        this.setAnimation('riding');
        setTimeout(() => {
            if (this.isRiding && Math.random() < 0.8) {
                this.stopRiding();
            }
        }, CHICK_CONFIG.ridingMinDuration + Math.random() *
           (CHICK_CONFIG.ridingMaxDuration - CHICK_CONFIG.ridingMinDuration));
    }

    stopRiding() {
        this.isRiding = false;
        this.x += (Math.random() - 0.5) * 20;
        this.y += (Math.random() - 0.5) * 20;
        this.updatePosition();
        this.setAnimation('idle');
    }

    rideParent() {
        if (!this.parentChicken) {
            this.stopRiding();
            return;
        }

        this.x = this.parentChicken.x + 2;
        this.y = this.parentChicken.y - 8;
        this.facingRight = this.parentChicken.facingRight;

        this.updatePosition();
        this.setAnimation('riding');

        if (Math.random() < CHICK_CONFIG.ridingStopChance) {
            this.stopRiding();
        }
    }
}
