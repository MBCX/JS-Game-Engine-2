import Entities from "../../../../Engine/Entities/Entities.js";

export class HUD extends Entities {
    constructor(entity_name, width, height) {
        super(entity_name, width, height);
    }

    /**
     * @override
     */
    entityInit()
    {
        // this.drawText(
        //     64,
        //     32,
        //     "This is a text rendering test."
        // );
        this.drawImage(
            "./img/cursor_test_img.png",
            128,
            128,
            64,
            64
        );
    }

    /**
     * @override
     */
    entityStep()
    {

    }
}
export default HUD;