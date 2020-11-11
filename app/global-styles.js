import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  html,
  @import url('https://fonts.googleapis.com/css2?family=Courier+Prime&display=swap')
  body {
    height: 100%;
    width: 100%;
  }

  body {
    font-family: courier;
  }

  body.fontLoaded {
    font-family: 'Courier Prime', monospace;
  }

  #app {
    background-color: #ffffff;
    min-height: 100%;
    min-width: 100%;
  }

  p,
  label {
    line-height: 1.5em;
  }

  .borderedSquare {
    border: 0.2em solid;
    border-color: black;
    border-radius: 0.4em;
    margin-top: 3em;
    width: 20em;
    height: 20em;
    margin-bottom: 2em;
    margin-left: 3em;
    float: left;
  }

  .greySquare {
    border-radius: 0.2em;
    width: 100%;
    height: 100%;
    background-color: grey;
  }

  .centered {
      text-align: center;
  }

  .small {
      font-size: 0.75em;
  }

  .hidden {
      display: none;
  }

  .green {
      color: green;
  }

  button {
    background-color: black;
    outline:none;
    color: white;
    border-radius: 0.9em;
    border-color: black;
    line-height:1.5em;
    font-size:0.8em;
    margin-right: 0.3em;
    margin-left: 0.3em;
    margin-top: 0;
    margin-bottom: 0;
    width: auto;
  }

  .classicLink {
      color: blue,
      text-decoration: underline,
      cursor: pointer,
  }

  .classicLink:hover {
      color: grey,
  }

  .classicLink:hover {
      color: purple,
  }

  button:hover {
    cursor:pointer;
    transform: scale(1.2);
  }
`;

export default GlobalStyle;
