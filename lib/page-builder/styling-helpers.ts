import React from 'react';
import { RowStyling, ColumnStyling } from '@/types/pagebuilder';

export function stylingToCSS(styling: RowStyling | ColumnStyling | undefined): React.CSSProperties {
  if (!styling) return {};

  const css: React.CSSProperties = {};

  if (styling.backgroundColor) css.backgroundColor = styling.backgroundColor;
  if (styling.backgroundImage) css.backgroundImage = `url('${styling.backgroundImage}')`;
  if (styling.backgroundSize) css.backgroundSize = styling.backgroundSize;
  if (styling.backgroundPosition) css.backgroundPosition = styling.backgroundPosition;
  // @ts-ignore - backgroundRepeat is not in CSSProperties but it is valid CSS
  if (styling.backgroundRepeat) css.backgroundRepeat = styling.backgroundRepeat;
  
  if (styling.padding) css.padding = styling.padding;
  if (styling.margin) css.margin = styling.margin;
  
  if (styling.borderColor) css.borderColor = styling.borderColor;
  if (styling.borderWidth) css.borderWidth = styling.borderWidth;
  if (styling.borderStyle) css.borderStyle = styling.borderStyle;
  if (styling.borderRadius) css.borderRadius = styling.borderRadius;
  
  if (styling.boxShadow) css.boxShadow = styling.boxShadow;
  if (styling.opacity !== undefined) css.opacity = styling.opacity;

  // Row specific
  if ('minHeight' in styling && styling.minHeight) css.minHeight = styling.minHeight;
  if ('maxHeight' in styling && styling.maxHeight) css.maxHeight = styling.maxHeight;

  // Column specific
  if ('textAlign' in styling && styling.textAlign) css.textAlign = styling.textAlign;
  if ('verticalAlign' in styling && styling.verticalAlign) css.verticalAlign = styling.verticalAlign;

  return css;
}
