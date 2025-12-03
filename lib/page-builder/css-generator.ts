
export function generateStyleCSS(style: any, selector: string): string {
  if (!style) return '';

  const cssRules: string[] = [];

  if (style.backgroundColor) {
    cssRules.push(`background-color: ${style.backgroundColor};`);
  }

  if (style.backgroundImage) {
    cssRules.push(`background-image: url('${style.backgroundImage}');`);
  }

  if (style.backgroundSize) {
    cssRules.push(`background-size: ${style.backgroundSize};`);
  }

  if (style.backgroundPosition) {
    cssRules.push(`background-position: ${style.backgroundPosition};`);
  }

  if (style.padding) {
    const { top, right, bottom, left } = style.padding;
    cssRules.push(`padding: ${top} ${right} ${bottom} ${left};`);
  }

  if (style.margin) {
    const { top, right, bottom, left } = style.margin;
    cssRules.push(`margin: ${top} ${right} ${bottom} ${left};`);
  }

  if (style.borderRadius) {
    cssRules.push(`border-radius: ${style.borderRadius};`);
  }

  if (style.border) {
    cssRules.push(`border: ${style.border};`);
  }

  if (style.boxShadow) {
    cssRules.push(`box-shadow: ${style.boxShadow};`);
  }

  if (style.textAlign) {
    cssRules.push(`text-align: ${style.textAlign};`);
  }

  if (style.minHeight) {
    cssRules.push(`min-height: ${style.minHeight};`);
  }

  if (style.customCSS) {
    cssRules.push(style.customCSS);
  }

  if (cssRules.length === 0) return '';

  return `
    ${selector} {
      ${cssRules.join('\n      ')}
    }
  `;
}
