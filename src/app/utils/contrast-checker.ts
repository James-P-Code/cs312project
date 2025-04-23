/* 
*  This is based on the WCAG 2.0 algorithm for determining color contrast.
*  See https://www.w3.org/TR/WCAG20-TECHS/G17.html and
*  https://github.com/squizlabs/HTML_CodeSniffer/blob/90b8660fbc22698f98f3d50122241c123b3491c0/HTMLCS.js
*  for more info 
*/

export class ContrastChecker {

    public static constrastRatio(color1: string, color2: string): number {
        let contrastRatio = (0.05 + this.relativeLuminescence(color1)) / (0.05 + this.relativeLuminescence(color2));
        if (contrastRatio < 1) {
            contrastRatio = 1 / contrastRatio;
        }

        return contrastRatio;
    }

    public static relativeLuminescence(color: string): number {
        let rgbColor = this.convertHexToRGB(color);
        let transformed: number[] = [];
        const rgbValues = 3;

        for (let i = 0; i < rgbValues; i++) {
            if (rgbColor[i] <= 0.03928) {
                transformed[i] = rgbColor[i] / 12.92;
            } else {
                transformed[i] = Math.pow(((rgbColor[i] + 0.055) / 1.055), 2.4);
            }
        }

        return (transformed[0] * 0.2126)
            + (transformed[1] * 0.7152)
            + (transformed[2] * 0.0722); 
    }

    private static convertHexToRGB(hex: string): number[] {
        let color = hex.toLowerCase();

        if (color.charAt(0) === '#') {
            color = color.substring(1);
        }

        let r = parseInt(color.substring(0, 2), 16) / 255;
        let g = parseInt(color.substring(2, 4), 16) / 255;
        let b = parseInt(color.substring(4, 6), 16) / 255;

        return [r, g, b];
    }
}
