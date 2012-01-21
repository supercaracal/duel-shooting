/**
 *
 * @class DuelShooting
 */
var DuelShooting = Class.create({

    /**
     *
     * @type {string}
     */
    TITLE_TEXT: 'Duel Shooting',

    /**
     *
     * @type {number}
     */
    Z_INDEX_BASE: 3000,

    /**
     *
     * @type {number}
     */
    INTERVAL_WAIT_MSEC: 16,

    /**
     *
     * @type {number}
     */
    FUNNEL_MAX: 5,

    /**
     *
     * @type {number}
     */
    MEGA_CANNON_WAIT: 250,

    /**
     *
     * @type {number}
     */
    MEGA_CANNON_HEIGHT: 29,

    /**
     *
     * @type {number}
     */
    STEP_DURATION: 10,

    /**
     *
     * @type {number}
     */
    timerId: null,

    /**
     *
     * @type {number}
     */
    timeCountTimerId: null,

    /**
     *
     * @type {number}
     */
    timeCount: null,

    /**
     *
     * @type {Element}
     */
    modal: null,

    /**
     *
     * @type {Element}
     */
    enemy: null,

    /**
     *
     * @type {Element}
     */
    ship: null,

    /**
     *
     * @type {Element}
     */
    timeCounter: null,

    /**
     *
     * @type {number}
     */
    clientHeight: null,

    /**
     *
     * @type {number}
     */
    clientWidth: null,

    /**
     *
     * @type {string}
     */
    nextCommand: null,

    /**
     *
     * @type {Array.<Element>}
     */
    shipBullets: null,

    /**
     *
     * @type {Array.<Element>}
     */
    enemyBullets: null,

    /**
     *
     * @type {Array.<Element>}
     */
    shipFunnels: null,

    /**
     *
     * @type {Array.<Object>}
     */
    enemyFunnels: null,

    /**
     *
     * @type {Array.<Element>}
     */
    comeBackShipFunnels: null,

    /**
     *
     * @type {number}
     */
    enemyHP: null,

    /**
     *
     * @type {number}
     */
    shipHP: null,

    /**
     *
     * @typr {number}
     */
    funnelCount: null,

    /**
     *
     * @type {number}
     */
    megaCannonWaitCount: null,

    /**
     *
     * @type {number}
     */
    megaCannonHeight: null,

    /**
     *
     * @type {number}
     */
    enemyBulletCount: null,

    /**
     *
     * @type {boolean}
     */
    hasTouchEvent: null,

    /**
     *
     * @type {Object}
     */
    se: null,

    /**
     *
     * @ty@e {Element}
     */
    enemyIFieldFunnelLeft: null,

    /**
     *
     * @type {Element}
     */
    enemyIFieldFunnelRight: null,

    /**
     *
     * @type {Element}
     */
    enemyIField: null,

    /**
     *
     * @type {boolean}
     */
    isActiveEnemyIField: null,

    /**
     *
     * @type {boolean}
     */
    isEnemyMoveRight: null,

    /**
     *
     * @protected
     * @constructor
     */
    initialize: function () {
        this.preLoad();
        this.addAudioMethod();
        this.addDivMethod();
        Number.prototype.isTiming = (function (num) { return Math.floor(Math.random() * 100) % num === 0; }).methodize();
        this.hasTouchEvent = (function () { return new Element('div', {ontouchstart: 'return;'}).ontouchstart == 'function'; }());
        this.setClientHeight();
        this.setClientWidth();
        this.enemyHP = 100;
        this.shipHP = 100;
        this.createModal();
        this.createEnemy();
        this.createTimeCounter();
        this.createShip();
        this.createEnemyIFieldFunnels();
        this.createEnemyIField();
        this.shipBullets = [];
        this.enemyBullets = [];
        this.shipFunnels = [];
        this.enemyFunnels = [];
        this.funnelCount = this.FUNNEL_MAX;
        this.megaCannonWaitCount = 0;
        this.megaCannonHeight = 0;
        this.enemyBulletCount = 0;
        this.comeBackShipFunnels = [];
        this.enemyTurn = true;
        this.isActiveEnemyIField = false;
        Event.observe(window, 'resize', this.redeploy.bindAsEventListener(this));
        this.animateOpening(
             this.TITLE_TEXT,
             (function () {
                  this.setEventListener();
                  this.addElems();
                  this.start();
             }).bind(this)
        );
    },

    /**
     *
     * @private
     */
    preLoad: function () {
        this.se = $H({
            hit: new Element('audio', {src: './se/hit.wav'}),
            attack: new Element('audio', {src: './se/attack.wav'}),
            mega: new Element('audio', {src: './se/mega.wav'}),
            newtype: new Element('audio', {src: './se/newtype.wav'}),
            lose: new Element('audio', {src: './se/lose.wav'}),
            funnelMove: new Element('audio', {src: './se/funnel1.wav'}),
            funnelAttack: new Element('audio', {src: './se/funnel2.wav'})
        });
    },

    /**
     *
     * @private
     */
    addAudioMethod: function () {
        if (Prototype.Browser.IE) {
            Element.addMethods({stop: Prototype.emptyFunction, replay: Prototype.emptyFunction});
            return;
        }
        Element.addMethods('audio', {
            stop: function (audio) {
                if (!('pause' in audio)) return;
                audio.pause();
                audio.currentTime = 0;
            },
            replay: function (audio) {
                if (!('pause' in audio)) return;
                audio.pause();
                audio.currentTime = 0;
                audio.play();
            }
        });
    },

    /**
     *
     * @private
     */
    addDivMethod: function () {
        Element.addMethods('div', {
            getTop: function (div) {
                return div.getStyle('top').replace('px', '') - 0;
            },
            getLeft: function (div) {
                return div.getStyle('left').replace('px', '') - 0;
            },
            getPos: function (div) {
                return {top: div.getStyle('top').replace('px', '') - 0, left: div.getStyle('left').replace('px', '') - 0};
            },
            getTransformRotate: function (div) {
                return (div.getStyle('-webkit-transform') || div.getStyle('-moz-transform') || div.getStyle('-ms-transform') || div.getStyle('transform') || '').replace('rotate(', '').replace('deg)', '') - 0;
            },
            setTop: function (div, px) {
                div.setStyle({top: px + 'px'});
            },
            setLeft: function (div, px) {
                div.setStyle({left: px + 'px'});
            },
            setPos: function (div, pxs) {
                if (pxs['top'] !== undefined) div.setStyle({top: pxs.top + 'px'});
                if (pxs['left'] !== undefined) div.setStyle({left: pxs.left + 'px'});
            },
            setTransformRotate: function (div, value) {
                div.setStyle({webkitTransform: 'rotate(' + value + 'deg)', MozTransform: 'rotate(' + value + 'deg)', msTransform: 'rotate(' + value + 'deg)', transform: 'rotate(' + value + 'deg)'});
            }
        });
    },

    /**
     *
     * @param {string} text
     * @param {Function} callback
     * @private
     */
    animateOpening: function (text, callback) {
        var modal  = new Element('div').setStyle({
            display: 'block',
            position: 'absolute',
            zIndex: this.Z_INDEX_BASE + 100,
            top: '0px',
            left: '0px',
            backgroundColor: '#111111',
            height: this.clientHeight + 'px',
            width: this.clientWidth + 'px',
        });
        modal.setOpacity(1.0);
        var title = new Element('div').setStyle({
            display: 'none',
            position: 'absolute',
            zIndex: this.Z_INDEX_BASE + 101,
            fontSize: '36px',
            color: '#FFFFFF',
            top: '0px',
            left: '0px'
        }).update(text);
        title.setOpacity(0.0);
        modal.insert(title);
        Element.insert(document.body, modal);
        var dim = title.getDimensions();
        title.setStyle({
            display: 'block',
            top: this.clientHeight / 2 - (dim.height / 2 - 0) + 'px',
            left: this.clientWidth / 2 - (dim.width / 2 - 0) + 'px'
        });
        var timerId = window.setInterval(function () {
            var opacity = title.getOpacity();
            if (opacity >= 1.0) {
                window.clearInterval(timerId);
                setTimeout(function () {
                    callback();
                    title.remove();
                    var timerId = window.setInterval(function () {
                        var opacity = modal.getOpacity();
                        if (opacity <= 0.0) {
                            window.clearInterval(timerId);
                            modal.remove();
                        }
                        modal.setOpacity(opacity - 0.1);
                    }, 32);
                }, 2000);
            }
            title.setOpacity(opacity + 0.1);
        }, 128);
    },

    /**
     *
     * @private
     */
    setClientHeight: function () {
        var height = (document.documentElement.clientHeight || document.body.clientHeight);
        this.clientHeight = height - (height % 10);
    },

    /**
     *
     * @private
     */
    setClientWidth: function () {
        var width = (document.documentElement.clientWidth || document.body.clientWidth);
        this.clientWidth = width - (width % 10);
    },

    /**
     *
     * @private
     */
    createModal: function () {
        this.modal = new Element('div').setStyle({
            display: 'block',
            position: 'fixed',
            zIndex: this.Z_INDEX_BASE,
            top: '0px',
            left: '0px',
            backgroundColor: '#333333',
            height: this.clientHeight + 'px',
            width: this.clientWidth + 'px',
        });
        this.modal.setOpacity(0.8);
    },

    /**
     *
     * @private
     */
    createEnemy: function () {
        var color = '#FF5555';
        var obj = new Element('div').setStyle({width: '90px', height: '60px', zIndex: this.Z_INDEX_BASE + 10, position: 'fixed', top: '0px', left: '0px'});
        obj.insert(new Element('div').setStyle({width: '90px', height: '30px', backgroundColor: color, borderRadius: '6px', boxShadow: '0px 0px 30px ' + color, textAlign: 'center', fontWeight: 800, fontSize: '20px'}).update(this.enemyHP));
        obj.insert(new Element('div').setStyle({width: '30px', height: '30px', backgroundColor: color, borderRadius: '6px', boxShadow: '0px 0px 30px ' + color, marginLeft: '30px'}));
        this.enemy = obj;
    },

    /**
     *
     * @private
     */
    createShip: function () {
        var color = '#FFFFFF';
        var obj = new Element('div').setStyle({width: '90px', height: '60px', zIndex: this.Z_INDEX_BASE + 10, position: 'fixed', top: this.clientHeight - 60 + 'px', left: this.clientWidth - 90 + 'px'});
        obj.insert(new Element('div').setStyle({width: '30px', height: '30px', backgroundColor: color, borderRadius: '6px', boxShadow: '0px 0px 10px ' + color, marginLeft: '30px'}));
        obj.insert(new Element('div').setStyle({width: '90px', height: '30px', backgroundColor: color, borderRadius: '6px', boxShadow: '0px 0px 10px ' + color, textAlign: 'center', fontWeight: 800, fontSize: '20px'}).update(this.shipHP));
        this.ship = obj;
    },

    /**
     *
     * @private
     */
    createEnemyIFieldFunnels: function () {
        this.enemyIFieldFunnelLeft = this.getEnemyFunnel();
        this.enemyIFieldFunnelRight = this.getEnemyFunnel();
        this.moveEnemyIFieldFunnels();
        this.enemyIFieldFunnelLeft.setTransformRotate(225);
        this.enemyIFieldFunnelRight.setTransformRotate(135);
    },

    /**
     *
     * @private
     */
    createEnemyIField: function () {
        var color = '#FFFFFF';
        this.enemyIField = new Element('div').setStyle({width: '100px', height: '20px', backgroundColor: color, zIndex: this.Z_INDEX_BASE + 11, position: 'fixed', top: '75px', left: '0px', boxShadow: '0px 0px 10px ' + color, borderRadius: '10px', display: 'none'});
        this.enemyIField.setOpacity(0.5);
    },

    /**
     *
     * @private
     */
    createTimeCounter: function () {
        this.timeCounter = new Element('div').setStyle({
             top: '2px',
             right: '10px',
             zIndex: this.Z_INDEX_BASE + 20,
             position: 'fixed',
             height: '30px',
             width: '60px',
             fontSize: '20px',
             fontWeight: 800,
             color: '#FFFFFF',
             textAlign: 'right'
         }).update('0');
    },

    /**
     *
     * @private
     */
    getEnemyAfterimage: function () {
        var color = '#FF5555';
        var obj = new Element('div').setStyle({width: '90px', height: '60px', zIndex: this.Z_INDEX_BASE + 1, position: 'fixed', top: '0px', left: '0px', opacity: '0.2'});
        obj.insert(new Element('div').setStyle({width: '90px', height: '30px', backgroundColor: color, borderRadius: '6px', textAlign: 'center'}).update(this.enemyHP));
        obj.insert(new Element('div').setStyle({width: '30px', height: '30px', backgroundColor: color, borderRadius: '6px', marginLeft: '30px'}));
        return obj;
    },

    /**
     *
     * @private
     * @return Element
     */
    getBullet: function () {
        var color = '#55FF55';
        var obj = new Element('div').setStyle({width: '30px', height: '30px', zIndex: this.Z_INDEX_BASE + 5, position: 'fixed'});
        obj.insert(new Element('div').setStyle({width: '20px', height: '20px', margin: '5px', backgroundColor: color, borderRadius: '20px', boxShadow: '0px 0px 10px ' + color}));
        return obj;
    },

    /**
     *
     * @private
     * @return Element
     */
    getHomingBullet: function () {
        var color = '#FF55FF';
        var outer = new Element('div').setStyle({width: '30px', height: '30px', zIndex: this.Z_INDEX_BASE + 6, position: 'fixed'});
        var inner = new Element('div').setStyle({width: '20px', height: '20px', margin: '5px', backgroundColor: color, borderRadius: '20px', boxShadow: '0px 0px 10px ' + color});
        return inner.wrap(outer);
    },

    /**
     *
     * @private
     */
    getShipFunnel: function () {
        var color = '#9999FF';
        var obj = new Element('div').setStyle({width: '30px', height: '30px', zIndex: this.Z_INDEX_BASE + 4, position: 'fixed'});
        obj.insert(new Element('div').setStyle({width: '6px', height: '20px', marginLeft: '12px', backgroundColor: color, borderRadius: '2px', boxShadow: '0px 0px 10px ' + color}));
        obj.insert(new Element('div').setStyle({width: '20px', height: '10px', margin: '0px 5px 0px 5px', backgroundColor: color, borderRadius: '20px', boxShadow: '0px 0px 10px ' + color}));
        return obj;
    },

    /**
     *
     * @private
     */
    getEnemyFunnel: function () {
        var color = '#FF9900';
        var obj = new Element('div').setStyle({width: '30px', height: '30px', zIndex: this.Z_INDEX_BASE + 4, position: 'fixed'});
        obj.insert(new Element('div').setStyle({width: '20px', height: '10px', margin: '0px 5px 0px 5px', backgroundColor: color, borderRadius: '20px', boxShadow: '0px 0px 10px ' + color}));
        obj.insert(new Element('div').setStyle({width: '6px', height: '20px', marginLeft: '12px', backgroundColor: color, borderRadius: '2px', boxShadow: '0px 0px 10px ' + color}));
        return obj;
    },

    /**
     *
     * @private
     */
    addShipBullet: function () {
        var obj = this.getBullet();
        obj.setPos({top: this.clientHeight - 90, left: this.ship.getLeft() + 30});
        Element.insert(document.body, obj);
        this.shipBullets.push(obj);
    },

    /**
     *
     * @param {Element} elm
     * @param {number} top
     * @param {number} left
     * @private
     */
    addEnemyBullet: function (elm, top, left) {
        var obj = this.getHomingBullet();
        obj.setPos({top: top, left: left});
        Element.insert(document.body, obj);
        this.enemyBullets.push(obj);
    },

    /**
     *
     * @private
     */
    addEnemyFunnel: function () {
        var obj = this.getEnemyFunnel();
        obj.setPos({top: 60, left: this.enemy.getLeft() + 30});
        Element.insert(document.body, obj);
        this.enemyFunnels.push({
            elm: obj,
            r: 70,
            theta: 0,
            speed: 3,
            isClockwise: true,
            baseX: obj.getTop(),
            baseY: obj.getLeft()
        });
    },

    /**
     *
     * @param {number} left
     * @private
     */
    addShipFunnelBullet: function (left) {
        var obj = this.getBullet();
        obj.setPos({top: this.clientHeight - 120, left: left});
        Element.insert(document.body, obj);
        this.shipBullets.push(obj);
        this.se.get('funnelAttack').replay();
    },

    /**
     *
     * @private
     */
    addShipMegaCannonBullet: function () {
        var objL = this.getBullet();
        var objM = this.getBullet();
        var objR = this.getBullet();
        objL.setPos({top: this.clientHeight - 90, left: this.ship.getLeft()});
        objM.setPos({top: this.clientHeight - 90, left: this.ship.getLeft() + 30});
        objR.setPos({top: this.clientHeight - 90, left: this.ship.getLeft() + 60});
        Element.insert(document.body, objL);
        Element.insert(document.body, objM);
        Element.insert(document.body, objR);
        this.shipBullets.push(objL);
        this.shipBullets.push(objM);
        this.shipBullets.push(objR);
    },

    /**
     *
     * @private
     */
    addShipFunnel: function () {
        var obj = this.getShipFunnel();
        obj.setPos({top: this.clientHeight - 90, left: this.ship.getLeft() + 30});
        Element.insert(document.body, obj);
        this.shipFunnels.push(obj);
        this.se.get('funnelMove').replay();
    },

    /**
     *
     * @param {Array} lefts
     * @private
     */
    addEnemyAfterimage: function (lefts) {
        if (!lefts) {
            return;
        }
        lefts.each((function (left) {
            var afterimage = this.getEnemyAfterimage();
            afterimage.setPos({top: this.enemy.getTop(), left: left});
            Element.insert(document.body, afterimage);
            (function () { afterimage.remove(); }).delay(0.3);
        }).bind(this));
    },

    /**
     *
     * @private
     */
    moveShipBullets: function () {
        var enemyLeft = this.enemy.getLeft();
        var elm, top, left, iFieldHeight;
        for (var i = 0, len = this.shipBullets.length; i < len; ++i) {
            elm = this.shipBullets[i];
            if (!elm) {
                continue;
            }
            top = elm.getTop();
            left = elm.getLeft();
            if (this.isActiveEnemyIField && top - 10 < 80 && enemyLeft - 25 < left && left < enemyLeft + 95) {
                this.shipBullets[i] = null;
                elm.remove();
                iFieldHeight = this.enemyIField.getHeight();
                iFieldHeight -= 2;
                iFieldHeight = iFieldHeight < 0 ? 0 : iFieldHeight;
                this.enemyIField.setStyle({height: iFieldHeight + 'px'});
                this.enemyIField.setTop(this.enemyIField.getTop() + 1);
                continue;
            }
            if ((enemyLeft - 25 < left) && (left <= enemyLeft + 5) && (top - 10 < 30)) {
                this.shipBullets[i] = null;
                elm.remove();
                this.hitEnemy();
                continue;
            }
            if ((enemyLeft + 5 < left) && (left < enemyLeft + 60) && (top - 10 < 60)) {
                this.shipBullets[i] = null;
                elm.remove();
                this.hitEnemy();
                continue;
            }
            if ((enemyLeft + 60 <= left) && (left < enemyLeft + 90) && (top - 10 < 30)) {
                this.shipBullets[i] = null;
                elm.remove();
                this.hitEnemy();
                continue;
            }
            if (top - 10 < 0) {
                this.shipBullets[i] = null;
                elm.remove();
                continue;

            }
            elm.setTop(top - 10);
        }
        this.shipBullets = this.shipBullets.compact();
    },

    /**
     *
     * @private
     */
    moveEnemyBullets: function () {
        var shipLeft = this.ship.getLeft();
        var elm, top, left;
        for (var i = 0, len = this.enemyBullets.length; i < len; ++i) {
            elm = this.enemyBullets[i];
            if (!elm) {
                continue;
            }
            top = elm.getTop();
            left = elm.getLeft();
            if ((shipLeft - 25 < left) && (left <= shipLeft + 5) && ((top + 10) > (this.clientHeight - 30))) {
                this.enemyBullets[i] = null;
                elm.remove();
                this.hitShip();
                continue;
            }
            if ((shipLeft + 5 < left) && (left < shipLeft + 60) && ((top + 10) > (this.clientHeight - 60))) {
                this.enemyBullets[i] = null;
                elm.remove();
                this.hitShip();
                continue;
            }
            if ((shipLeft + 60 <= left) && (left < shipLeft + 90) && ((top + 10) > (this.clientHeight - 30))) {
                this.enemyBullets[i] = null;
                elm.remove();
                this.hitShip();
                continue;
            }
            if (this.clientHeight < (top + 5)) {
                this.enemyBullets[i] = null;
                elm.remove();
                continue;
            }
            if ((this.clientHeight / 2) < top) {
                distance = 0;
            } else if (left < shipLeft) {
                distance = 10;
            } else if ((shipLeft + 60) < left) {
                distance = -10;
            } else {
                distance = 0;
            }
            elm.setPos({top: top + 10, left: left + distance});
        }
        this.enemyBullets = this.enemyBullets.compact();
    },

    /**
     *
     * @private
     */
    moveShipFunnels: function () {
        var enemyCenterLeft = this.enemy.getLeft() + 30;
        var elm, left;
        for (var i = 0, len = this.shipFunnels.length; i < len; ++i) {
            elm = this.shipFunnels[i];
            if (!elm) {
                continue;
            }
            left = elm.getLeft();
            if (Math.abs(enemyCenterLeft - left) < 30) {
                this.addShipFunnelBullet(elm.getLeft());
                this.shipFunnels[i] = null;
                this.comeBackShipFunnels.push(elm);
                continue;
            }
            elm.setLeft(left + ((enemyCenterLeft - left) > 0 ? 10 : -10));
        }
        this.shipFunnels = this.shipFunnels.compact();
    },

    /**
     *
     * @private
     */
    moveComeBackShipFunnels: function () {
        var shipCenterLeft = this.ship.getLeft() + 30;
        var elm, left;
        for (var i = 0, len = this.comeBackShipFunnels.length; i < len; ++i) {
            elm = this.comeBackShipFunnels[i];
            if (!elm) {
                continue;
            }
            left = elm.getLeft();
            if (Math.abs(shipCenterLeft - left) < 30) {
                this.comeBackShipFunnels[i] = null;
                elm.remove();
                ++this.funnelCount;
                continue;
            }
            elm.setLeft(left + ((shipCenterLeft - left) > 0 ? 10 : -10));
        }
        this.comeBackShipFunnels = this.comeBackShipFunnels.compact();
    },

    /**
     *
     * @private
     */
    moveEnemyFunnels: function () {
        this.enemyFunnels.each((function (x) {
            if (x.move === undefined) x.move = this.moveCircle.methodize();
            x.move();
        }).bind(this));
    },

    /**
     *
     * @private
     */
    moveEnemy: function () {
        var enemyLeft = this.enemy.getLeft();
        var move = 0;
        var moveMax = 90;
        var searchSectorX = 90;
        var searchSectorY = 30;
        var isLeft = false;
        var elm, top, left;
        for (var i = 0, len = this.shipBullets.length; !this.isActiveEnemyIField && i < len; ++i) {
            elm = this.shipBullets[i];
            if (!elm) {
                continue;
            }
            top = elm.getTop();
            left = elm.getLeft();
            if (enemyLeft - searchSectorY <= left && (left <= enemyLeft + moveMax) && top < searchSectorX) {
                if (enemyLeft - moveMax < 0) {
                    move = moveMax;
                } else if (enemyLeft + moveMax > this.clientWidth - 90) {
                    move = -moveMax;
                } else {
                    move = (2).isTiming() ? moveMax : -moveMax;
                }
            }
        }
        this.enemy.setLeft(enemyLeft + move);
        if (move === 0) {
            this.isEnemyMoveRight = enemyLeft - 3 < 0 ? true : ((this.clientWidth - 90 < enemyLeft + 3) ? false : this.isEnemyMoveRight);
            this.enemy.setLeft(enemyLeft + (this.isEnemyMoveRight ? 3 : -3));
            return;
        }
        var sign = (move < 0) ? -1 : 1;
        var inc = 10;
        this.addEnemyAfterimage([enemyLeft, enemyLeft + (inc * 3 * sign), enemyLeft + (inc * 6 * sign)]);
        this.se.get('newtype').replay();
    },

    /**
     *
     * @private
     */
    moveEnemyIFieldFunnels: function () {
        this.enemyIFieldFunnelLeft.setPos({top: this.enemy.getTop() + 70, left: this.enemy.getLeft() - 40});
        this.enemyIFieldFunnelRight.setPos({top: this.enemy.getTop() + 70, left: this.enemy.getLeft() + 100});
    },

    /**
     *
     * @private
     */
    moveEnemyIField: function () {
        this.enemyIField.setLeft(this.enemy.getLeft() - 5);
    },

    /**
     *
     * @private
     */
    rotateEnemyIFieldFunnels: function () {
        if (this.isActiveEnemyIField) {
            this.enemyIFieldFunnelLeft.setTransformRotate(270);
            this.enemyIFieldFunnelRight.setTransformRotate(90);
            return;
        }
        var deg = this.enemyIFieldFunnelLeft.getTransformRotate();
        deg = deg > 360 ? 0 : deg;
        this.enemyIFieldFunnelLeft.setTransformRotate(++deg);
        deg = this.enemyIFieldFunnelRight.getTransformRotate();
        deg = deg < 0 ? 360 : deg;
        this.enemyIFieldFunnelRight.setTransformRotate(--deg);
    },

    /**
     *
     * @param {Object} obj
     * @private
     */
    moveCircle: function (obj) {
        var y = obj.baseY + Math.sin(Math.PI / 180 * obj.theta) * obj.r;
        var x = obj.baseX + obj.r - Math.cos(Math.PI / 180 * obj.theta) * obj.r;
        obj.elm.setPos({top: x, left: y});
        obj.theta += obj.isClockwise ? obj.speed : -obj.speed;
        if (obj.theta < 0 || 360 < obj.theta ) {
            obj.theta = obj.isClockwise ? 0 : 360;
        }
    },

    /**
     *
     * @private
     */
    hitEnemy: function () {
        this.enemy.down(0).update(--this.enemyHP);
        this.se.get('hit').replay();
        if (this.enemyHP < 1) {
            this.stop();
            this.enemy.down(0).update(0);
            this.enemyHP = 0;
            return;
        }
    },

    /**
     *
     * @private
     */
    hitShip: function () {
        this.ship.down(1).update(--this.shipHP);
        if (this.shipHP < 1) {
            this.stop();
            this.ship.down(1).update(0);
            this.shipHP = 0;
            this.se.get('lose').replay();
            return;
        }
    },

    /**
     *
     * Use debug.
     *
     * @param {number} num
     * @private
     */
    setShipHP: function (num) {
        this.shipHP = num;
        this.ship.down(1).update(num);
    },

    /**
     *
     * Use debug.
     *
     * @param {number} num
     * @private
     */
    setEnemyHP: function (num) {
        this.enemyHP = num;
        this.enemy.down(0).update(num);
    },

    /**
     *
     * @private
     */
    setEnemyIFieldColor: function () {
        var color = '#' + Math.floor(Math.random() * 100).toColorPart() + Math.floor(Math.random() * 100).toColorPart() + Math.floor(Math.random() * 100).toColorPart();
        this.enemyIField.setStyle({backgroundColor: color});
    },

    /**
     *
     * @private
     */
    setEventListener: function () {
        if (this.hasTouchEvent) {
            Event.observe(document, 'touchstart', this.handlerSmart.bindAsEventListener(this));
        } else {
            Event.observe(document, 'keydown', this.handler.bindAsEventListener(this));
            Event.observe(document, 'mousedown', this.handlerMouse.bindAsEventListener(this));
        }
    },

    /**
     *
     * @private
     */
    redeploy: function (e) {
        (function () {
            this.setClientHeight();
            this.setClientWidth();
            this.modal.setStyle({height: this.clientHeight + 'px', width: this.clientWidth + 'px'});
            this.enemy.setPos({top: 0, left: 0});
            this.ship.setPos({top: this.clientHeight - 60, left: this.clientWidth - 90});
        }).bind(this).defer();
    },

    /**
     *
     * @private
     * @param {event} e
     */
    handler: function (e) {
        var KEY_F = 70;
        var KEY_M = 77;
        switch (e.keyCode) {
            case Event.KEY_RIGHT:
               this.nextCommand = 'stepRight';
               break;
            case Event.KEY_LEFT:
               this.nextCommand = 'stepLeft';
               break;
            case Event.KEY_UP:
               this.nextCommand = 'attack';
               break;
            case Event.KEY_DOWN:
               this.nextCommand = 'wait';
               break;
            case KEY_F:
               this.nextCommand = 'funnel';
               break;
            case KEY_M:
               this.nextCommand = 'megaCannon';
               break;

        }
    },

    /**
     *
     * @private
     * @param {event} e
     */
    handlerMouse: function (e) {
        this.convertToAction(e.pageX, e.pageY);
    },

    /**
     *
     * @private
     * @param {event} e
     */
    handlerSmart: function (e) {
        this.convertToAction(e.touches[0].pageX, e.touches[0].pageY);
    },

    /**
     *
     * @private
     * @param {number} x
     * @param {number} y
     */
    convertToAction: function (x, y) {
        if ((this.clientHeight / 2 < y) && (x < this.clientWidth / 3)) {
            this.nextCommand = 'stepLeft';
        } else if ((this.clientHeight / 2 < y) && (this.clientWidth / 3 < x) && (x < this.clientWidth / 3 * 2)) {
            this.nextCommand = 'wait';
        } else if ((this.clientHeight / 2 < y) && (this.clientWidth / 3 * 2 < x)) {
            this.nextCommand = 'stepRight';
        } else if ((y < this.clientHeight / 2) && (x < this.clientWidth / 3)) {
            this.nextCommand = 'funnel';
        } else if ((y < this.clientHeight / 2) && (this.clientWidth / 3 < x) && (x < this.clientWidth / 3 * 2)) {
            this.nextCommand = 'attack';
        } else if ((y < this.clientHeight / 2) && (this.clientWidth / 3 * 2 < x)) {
            this.nextCommand = 'megaCannon';
        }
    },

    /**
     *
     * @private
     */
    stepRight: function () {
        var left = this.ship.getLeft();
        var max = this.clientWidth - 90;
        if (left + 10 <= max) {
            this.ship.setLeft(left + 10);
        }
    },

    /**
     *
     * @private
     */
    stepLeft: function () {
        var left = this.ship.getLeft();
        var min = 0;
        if (min <= left - 10) {
            this.ship.setLeft(left - 10);
        }
    },

    /**
     *
     * @private
     */
    wait: Prototype.emptyFunction,

    /**
     *
     * @private
     */
    attack: function () {
        this.addShipBullet();
        this.se.get('attack').replay();
    },

    /**
     *
     * @private
     */
    funnel: function () {
        if (this.funnelCount < 1) {
            this.funnelCount = 0;
            return;
        }
        --this.funnelCount;
        this.addShipFunnel();
    },

    /**
     *
     * @private
     */
    megaCannon: function () {
        if (this.megaCannonWaitCount > 0) {
            return;
        }
        this.addShipMegaCannonBullet();
        this.megaCannonWaitCount = this.MEGA_CANNON_WAIT;
        this.megaCannonHeight = this.MEGA_CANNON_HEIGHT;
        this.se.get('mega').replay();
    },

    /**
     *
     * @private
     */
    addElems: function () {
        Element.insert(document.body, this.modal);
        Element.insert(document.body, this.enemy);
        Element.insert(document.body, this.ship);
        Element.insert(document.body, this.timeCounter);
        Element.insert(document.body, this.enemyIFieldFunnelLeft);
        Element.insert(document.body, this.enemyIFieldFunnelRight);
        Element.insert(document.body, this.enemyIField);
    },

    /**
     *
     * @private
     */
    moveElem: function () {
        this.moveShipBullets();
        this.moveShipFunnels();
        this.moveComeBackShipFunnels();
        this.battle();
        this.moveEnemy();
        this.moveEnemyIFieldFunnels();
        this.moveEnemyIField();
        this.moveEnemyBullets();
        this.moveEnemyFunnels();
    },

    /**
     *
     * @private
     */
    battle: function () {
        if (this.nextCommand && (this.nextCommand in this)) {
            (this[this.nextCommand].bind(this))();
            if (this.nextCommand !== 'stepRight' && this.nextCommand !== 'stepLeft') {
                this.nextCommand = null;
            }
        }
        if (this.megaCannonWaitCount > 0) {
            --this.megaCannonWaitCount;
        }
        if (this.megaCannonHeight > 0) {
            if (this.megaCannonHeight % 3 === 0) this.addShipMegaCannonBullet();
            --this.megaCannonHeight;
        }
        if (!this.isActiveEnemyIField && (50).isTiming()) {
            this.enemyBulletCount += Math.floor(Math.random() * 100) % 5;
        }
        if (this.enemyBulletCount > 0) {
            this.addEnemyBullet(this.enemy, 60, this.enemy.getLeft() + 30);
            --this.enemyBulletCount;
        }
        if (this.enemyHP < 50 && (99).isTiming() && (9).isTiming() && this.enemyFunnels.length < 2) {
            this.addEnemyFunnel();
        }
        if (0 < this.enemyFunnels.length) {
            this.enemyFunnels.each((function (x) {
                if ((13).isTiming() && (3).isTiming()) {
                    this.addEnemyBullet(x.elm, x.elm.getTop() + 20, x.elm.getLeft());
                    this.addEnemyBullet(x.elm, x.elm.getTop() + 30, x.elm.getLeft());
                    this.addEnemyBullet(x.elm, x.elm.getTop() + 40, x.elm.getLeft());
                }
            }).bind(this));
        }
        if (!this.isActiveEnemyIField && (this.enemyHP > 100 ? 100 : this.enemyHP).isTiming() && (9).isTiming()) {
            this.enemyIField.setStyle({height: 20 + 'px'});
            this.enemyIField.setTop(75);
            this.isActiveEnemyIField = true;
            this.enemyIField.show();
        }
        if (this.isActiveEnemyIField) {
            this.setEnemyIFieldColor();
        }
        if (this.enemyIField.getHeight() < 2) {
            this.enemyIField.hide();
            this.isActiveEnemyIField = false;
        }
        this.rotateEnemyIFieldFunnels();
    },

    /**
     *
     * Use debug.
     *
     * @private
     */
    setupDebugMode: function () {
        this.setShipHP(100000);
        this.setEnemyHP(100000);
        this.addEnemyFunnel();
    },

    /**
     *
     * @private
     */
    start: function () {
        if (this.timerId !== null) return;
        this.timerId = window.setInterval(this.moveElem.bind(this), this.INTERVAL_WAIT_MSEC);
        this.timeCountTimerId = window.setInterval((function () {
             ++this.timeCount;
             this.timeCounter.update(this.timeCount);
        }).bind(this), 1000);
    },

    /**
     *
     * Use debug.
     *
     * @private
     */
    pause: function () {
        this.timerId === null ? this.start() : this.stop();
    },

    /**
     *
     * @private
     */
    stop: function () {
        this.se.each((function (x) { x.value.stop(); }).bind(this));
        window.clearInterval(this.timerId);
        window.clearInterval(this.timeCountTimerId);
        this.timerId = null;
        this.timeCountTimerId = null;
    }
});
