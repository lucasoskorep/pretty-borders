export default class RGBColor {
    r: number;
    g: number;
    b: number;
    a: number;

    constructor(r: number, g: number, b: number, a: number = 0.8) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    static fromHSL(hsl: HSLColor): RGBColor {
        // Normalize HSL values
        hsl.h = hsl.h % 360;
        hsl.s = Math.max(0, Math.min(1, hsl.s));
        hsl.l = Math.max(0, Math.min(1, hsl.l));
        hsl.a = Math.max(0, Math.min(1, hsl.a)); // Clamp alpha between 0 and 1

        const c = (1 - Math.abs(2 * hsl.l - 1)) * hsl.s;
        const x = c * (1 - Math.abs((hsl.h / 60) % 2 - 1));
        const m = hsl.l - c / 2;
        let r = 0, g = 0, b = 0;

        if (hsl.h < 60) {
            r = c;
            g = x;
            b = 0;
        } else if (hsl.h < 120) {
            r = x;
            g = c;
            b = 0;
        } else if (hsl.h < 180) {
            r = 0;
            g = c;
            b = x;
        } else if (hsl.h < 240) {
            r = 0;
            g = x;
            b = c;
        } else if (hsl.h < 300) {
            r = x;
            g = 0;
            b = c;
        } else {
            r = c;
            g = 0;
            b = x;
        }
        return new RGBColor(
            Math.round((r + m) * 255),
            Math.round((g + m) * 255),
            Math.round((b + m) * 255),
            hsl.a
        );
    }

}

export class HSLColor {
    h: number;
    s: number;
    l: number;
    a: number;

    constructor(h: number, s: number, l: number, a: number = .8) {
        this.h = h;
        this.s = s;
        this.l = l;
        this.a = a;
    }
}