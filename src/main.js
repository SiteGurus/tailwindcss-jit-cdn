import observerScript from "./observer";

(() => {
  const config = {
    attributes: true,
    attributeFilter: ["class"],
    childList: true,
    subtree: true,
  };

  new MutationObserver(observerScript(false)).observe(
    document.documentElement,
    config
  );

  observerScript();

  window.tailwindCSS = {
    refresh: observerScript(true),
  }

  window.addEventListener('load', () => {
    // Upload css to siteglide site
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    var urlencoded = new URLSearchParams();
    urlencoded.append("css", document.querySelectorAll('.tailwindCompiledCss')[0].innerHTML);
    urlencoded.append("page_slug", document.querySelectorAll('meta[name="page_slug"]')[0].attributes.content.value);

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: urlencoded,
      redirect: 'follow'
    };
    fetch("/modules/module_86/api/tailwind/cache-page", requestOptions).catch(error => console.log('error', error))  });
})();