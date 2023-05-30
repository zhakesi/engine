declare namespace spinex {
    class Color {
        r: number;
        g: number;
        b: number;
        a: number;
        static WHITE: Color;
        static RED: Color;
        static GREEN: Color;
        static BLUE: Color;
        static MAGENTA: Color;
        constructor(r?: number, g?: number, b?: number, a?: number);
        set(r: number, g: number, b: number, a: number): this;
        setFromColor(c: Color): this;
        setFromString(hex: string): this;
        add(r: number, g: number, b: number, a: number): this;
        clamp(): this;
        static rgba8888ToColor(color: Color, value: number): void;
        static rgb888ToColor(color: Color, value: number): void;
    }
}

export default spinex;
