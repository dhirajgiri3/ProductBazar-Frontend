"use client"

import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: "fnt";
    src: url("/Assets/Fonts/Fontspring-DEMO-biotif-lightitalic.otf");
  }
  @font-face {
    font-family: "fnt-bold";
    src: url("/Assets/Fonts/Fontspring-DEMO-biotif-book.otf");
  }
  @font-face {
    font-family: "clash-bold";
    src: url("/Assets/Fonts/ClashDisplay-Bold.otf");
  }
  @font-face {
    font-family: "clash-regular";
    src: url("/Assets/Fonts/ClashDisplay-Regular.otf");
  }
  @font-face {
    font-family: "clash-light";
    src: url("/Assets/Fonts/ClashDisplay-Light.otf");
  }
  @font-face {
    font-family: "clash";
    src: url("/Assets/Fonts/ClashDisplay-Variable.ttf");
  }
  
`;

export default GlobalStyle;
