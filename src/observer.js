import parseCustomConfig from "./parseCustomConfig";
import { VIRTUAL_SOURCE_PATH, VIRTUAL_HTML_FILENAME } from "./constants";
import tailwindcss from "tailwindcss";
import postcss from "postcss";
import { nanoid } from "nanoid";

const tailwindId = nanoid();
const preflight = `a,hr{color:inherit}progress,sub,sup{vertical-align:baseline}blockquote,body,dd,dl,fieldset,figure,h1,h2,h3,h4,h5,h6,hr,menu,ol,p,pre,ul{margin:0}fieldset,legend,menu,ol,ul{padding:0}*,::after,::before{box-sizing:border-box;border-width:0;border-style:solid;border-color:theme('borderColor.DEFAULT', currentColor)}::after,::before{--tw-content:''}html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:theme('fontFamily.sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji")}body{line-height:inherit}hr{height:0;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,pre,samp{font-family:theme('fontFamily.mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace);font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}[type=button],[type=reset],[type=submit],button{-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}menu,ol,ul{list-style:none}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:theme('colors.gray.4', #9ca3af)}[role=button],button{cursor:pointer}:disabled{cursor:default}audio,canvas,embed,iframe,img,object,svg,video{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}`

let lastProcessedHtml = "";

export default (force = false) => {
  return async () => {
    self[VIRTUAL_HTML_FILENAME] = document.documentElement.outerHTML;

    if (self[VIRTUAL_HTML_FILENAME] === lastProcessedHtml && force === false) {
      return;
    }

    let userConfig = parseCustomConfig();

    lastProcessedHtml = self[VIRTUAL_HTML_FILENAME];
    let defaultConfig = {
      content: [VIRTUAL_HTML_FILENAME],
      theme: {},
      corePlugins: {
        preflight: true,
      },
      plugins: [
        require("@tailwindcss/forms"),
        require("@tailwindcss/typography"),
        require("@tailwindcss/aspect-ratio"),
        require("@tailwindcss/line-clamp")
      ],
    };

    let customCss = '';
    document.querySelectorAll('style[type="postcss"]').forEach(styleTag => {
      customCss += styleTag.innerHTML;
    })

    const result = await postcss([
      tailwindcss({ ...defaultConfig, ...userConfig }),
    ]).process(
      `
      ${preflight}
      @tailwind base;
      @tailwind components;
      ${customCss}
      @tailwind utilities;
      `,
      {
        from: VIRTUAL_SOURCE_PATH,
      }
    );

    let style = document.getElementById(tailwindId);

    if (style === null) {
      style = document.createElement("style");
      style.id = tailwindId;
      style.classList = 'tailwindCompiledCss';
      document.head.append(style);
    }

    style.textContent = result.css;
  };
};