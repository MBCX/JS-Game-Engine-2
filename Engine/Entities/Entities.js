import Engine from "../Engine.js";
import { CANVAS_PREFIX_GAME_ID } from "../shared/shared_variables.js";

export class Entities extends Engine {
    constructor(entity_name, width, height, controls = []) {
        super();
        this.canvas_container = document.createElement("canvas");
        this.canvas_container.id = `${CANVAS_PREFIX_GAME_ID}-${entity_name}`;

        // Removes canvas blur.
        this.canvas_container.getContext(
            "2d"
        ).webkitImageSmoothingEnabled = true;
        this.canvas_container.getContext("2d").imageSmoothingEnabled = true;

        /**
         * @readonly
         * @private
         */
        this.entities_map = new Map();

        /** @readonly */
        this.name = entity_name;
        this.width = width;
        this.height = height;
        this.x = 0;
        this.y = 0;
        console.assert(
            Array.isArray(controls),
            "Controls parameter for Entities must be an array."
        );

        /**
         * Holds the set of keys for an entity.
         * @property control_set
         * @property is_pressed
         * @readonly
         * @private
         */
        this.entity_controls = {
            control_set: controls,
            is_pressed: new Array(controls.length),
        };

        /** @private */
        this.entity_instance = null;

        this.entity_string = "";
        this.entity_image = "";
        this.entity_colour = "";

        this.init.bind(this)();
        this.entityInit();
    }

    /** @public */
    getCanvasEl() {
        return this.canvas_container;
    }

    /** @public */
    getEntityId() {
        return this.entities_map.get(this.name);
    }

    /** @public */
    getAllEntities() {
        return this.entities_map;
    }

    /** @public */
    getEntityName() {
        return this.name;
    }

    /**
     * @param {String} key
     * @private
     */
    findRequestedKeyIndex(key) {
        let index = 0;
        for (; this.entity_controls.control_set.length > index; ++index) {
            if (key === this.entity_controls.control_set[index]) {
                return index;
            }
        }

        // The requested key was not found (or it doesn't exists.)
        return false;
    }

    /**
     * @private
     */
    init() {
        // Makes sure all entities have unique IDs.
        this.entities_map.set(this.name, Date.now());

        // Managing controlable entities.
        if (this.entity_controls.control_set.length > 0) {
            document.body.addEventListener(
                "keydown",
                this.setKeyPressed.bind(this)
            );
            document.body.addEventListener(
                "keyup",
                this.removeKeyPressed.bind(this)
            );
        }
        document.body.append(this.canvas_container);
    }

    /**
     * @override
     */
    gameLoop() {
        this.entityStep();
        this.setCanvasProperties();
        this.renderCanvasAgainIfNecessary();
    }

    /** @public */
    entityInit() {}

    /** @public */
    entityStep() {}

    /** @public */
    entityDestroy() {}

    /**
     * REFERENCE: https://stackoverflow.com/questions/15661339/how-do-i-fix-blurry-text-in-my-html5-canvas
     * @private
     */
    setCanvasProperties() {
        const canvas = this.getCanvasEl();
        const ratio = this.getPixelRatio();

        canvas.width = this.screen_width * ratio;
        canvas.height = this.screen_height * ratio;
        canvas.style.position = "absolute";
        canvas.style.width = this.screen_width + "px";
        canvas.style.height = this.screen_height + "px";
    }

    /**
     * @param {Number} x
     * @param {Number} y
     * @param {Number*} width How wide you want it to be (in px).
     * @param {Number*} height How tall you want it to be (in px).
     * @param {String*} colour
     * @public
     */
    drawSquare(x, y, width = this.width, height = this.height, colour = "black") {
        const canvas = this.getCanvasEl().getContext("2d");
        canvas.fillStyle = colour;
        canvas.fillRect(x, y, width, height);

        this.x = x;
        this.y = y;
        this.entity_colour = colour;
    }

    /**
     * @param {Number} x
     * @param {Number} y
     * @param {String} text
     * @param {Object*} styles
     * @public
     */
    drawText(
        x,
        y,
        text,
        styles = {
            fontName: "system-ui",
            fontSizeBase: 16,
            align: "center",
            fill: "black",
        }
    ) {
        const canvas = this.getCanvasEl().getContext("2d");
        this.entity_string = text;
        canvas.mozTextStyle = styles.fontSizeBase + "px " + styles.fontName;
        canvas.font = styles.fontSizeBase + "px " + styles.fontName;
        canvas.fillStyle = styles.fill;
        canvas.textAlign = styles.align;
        canvas.fillText(this.entity_string, x, y);

        this.x = x;
        this.y = y;
    }

    /**
     * @param {Number} x
     * @param {Number} y
     * @param {String} image
     * @public
     */
    drawImage(x, y, image) {
        this.y = y;
        this.x = x;
    }

    /** @private */
    renderCanvasAgainIfNecessary() {
        // We use our drawing functions because
        // they already draw the necessary components to each entity's canvas.
        if (this.isTextEmpty()) {
            this.drawSquare(this.x, this.y, this.width, this.height, this.entity_colour);
        } else {
            this.drawText(this.x, this.y, this.entity_string);
        }
    }

    /**
     * @param {!KeyboardEvent} e Current key pressed.
     * @private
     */
    setKeyPressed(e) {
        let index = this.findRequestedKeyIndex(e.key);
        if (this.entity_controls.control_set[index]) {
            this.entity_controls.is_pressed[index] = true;
            return;
        }

        // Something has gone wrong, hasn't it?
        return null;
    }

    /**
     * @param {!KeyboardEvent} e Current key released.
     * @private
     */
    removeKeyPressed(e) {
        let index = this.findRequestedKeyIndex(e.key);
        if (this.entity_controls.control_set[index]) {
            this.entity_controls.is_pressed[index] = false;
            return;
        }

        // Something has gone wrong, hasn't it?
        return null;
    }

    /**
     * Returns true if a particular key from a set of controls from an entity has been pressed.
     * False otherwise.
     * @param {String} key The key string to check for.
     * @public
     */
    isKeyPressed(key) {
        console.assert(
            this.findRequestedKeyIndex(key) !== false,
            `The requested key: ${key} does not exits in the controls map for entity ${this.name}`
        );
        return this.entity_controls.is_pressed[this.findRequestedKeyIndex(key)];
    }

    /**
     * This method is generally used to control entities or game objects
     * that have text in their canvas (like HUDs).
     * @private
     */
    isTextEmpty() {
        return this.entity_string === "";
    }

    /** @private */
    getPixelRatio() {
        const canvas = this.getCanvasEl().getContext("2d");
        const bsr =
            canvas.webkitBackingStorePixelRatio ||
            canvas.mozBackingStorePixelRatio ||
            canvas.msBackingStorePixelRatio ||
            canvas.oBackingStorePixelRatio ||
            canvas.backingStorePixelRatio ||
            1;
        return this.device_dpi / bsr;
    }

    /**
     * An automatic singleton for every entity class object.
     * This is best use if you want to get the instance
     * of a player class (for example) without having to create
     * a new class instance altogether.
     * @public
     */
    static getInstance() {
        // return (
        //     this.entity_instance ??
        //     (this.entity_instance = new this(
        //         this.name,
        //         this.width,
        //         this.height,
        //         this.entity_controls.control_set
        //     ))
        // );
    }
}

export default Entities;
