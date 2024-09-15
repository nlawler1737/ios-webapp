// window.navigator.standalone = true;

const appTitleStatus = new StatusElement(
  document.querySelector("#title-label > small")
);
const appColorStatus = new StatusElement(
  document.querySelector("#color-label > small")
);
const appIconStatus = new StatusElement(
  document.querySelector("#icon-label > small")
);
const appBase64Status = new StatusElement(
  document.querySelector("#base64-label > small")
);

const shareStatus = new StatusElement(
  document.querySelector("#share-instructions")
);

const titleInput = document.querySelector("#title-input");
const colorInput = document.querySelector("#color-input");
const iconInput = document.querySelector("#app-icon-url-input");
const base64Input = document.querySelector("#base64-input");
const htmlFileInput = document.querySelector("#html-file-input");
const iconFileInput = document.querySelector("#appIcon-input");
const fromHtmlInput = document.querySelector("#from-html-input");

const saveBtn = document.querySelector("#redirect-btn");
const loadHtmlBtn = document.querySelector("#load-html-button");

const appPreviewIcon = document.querySelector("#app-icon-preview");
const appPreviewTitle = document.querySelector("#app-title-preview");

const appleIconMeta = document.querySelector("#apple-icon-meta");
const appleTitleMeta = document.querySelector("#apple-title-meta");

const webApp = new WebApp();

const isStandalone =
  "standalone" in window.navigator && window.navigator.standalone;

setTimeout(onUserHtmlLoaded, 1000);

displayInformation();

if (isStandalone) {
  toggleHiddenElement(titleInput.parentElement, false);
  toggleHiddenElement(iconInput.parentElement.parentElement, false);
  toggleHiddenElement(fromHtmlInput.parentElement.parentElement, false);
} else {
  toggleHiddenElement(colorInput.parentElement, false);
  toggleHiddenElement(base64Input.parentElement.parentElement, false);
}

if (
  (localStorage.getItem("dev") === "true" ||
    ("standalone" in window.navigator && window.navigator.standalone)) &&
  localStorage.getItem("ready") === "true"
) {
  const base64 = atob(webApp.get("base64"));
  window.onload = function () {
    document.open();
    document.write(base64);
    document.close();
  };
} else {
  document.querySelector("#content").style.display = "block";
}

titleInput.addEventListener("change", handleTitleInput, false);

htmlFileInput.addEventListener("change", handleHtmlFileSelect, false);

base64Input.addEventListener("change", handleBase64Input, false);

colorInput.addEventListener("change", handleColorInput, false);

iconInput.addEventListener("change", handleUrlInput, false);

iconFileInput.addEventListener("change", handleIconFileSelect, false);

saveBtn.addEventListener("click", handleSaveButton);

loadHtmlBtn.addEventListener("click", handleLoadHtmlButton);

function handleLoadHtmlButton() {
  if (!fromHtmlInput.value) {
    fromHtmlInput.style.border = "1px solid red";
    return;
  }
  fromHtmlInput.style.border = null;

  const dom = domFromString(fromHtmlInput.value);

  const title = dom.querySelector("title").innerText;
  const icon = getAppIconFromDOM(dom);

  titleInput.value = title;
  iconInput.value = icon;

  titleInput.dispatchEvent(new Event("change"));
  iconInput.dispatchEvent(new Event("change"));
}

function onUserHtmlLoaded() {
  function pageClicked() {
    let count = 0;
    let start = null;
    return () => {
      const now = Date.now();
      if (start === null || now > start + 1000) {
        count = 0;
        start = now;
      }

      count++;

      if (count !== 5) return;

      const devStatus = JSON.parse(window.localStorage.getItem("ready"));

      window.localStorage.setItem("ready", devStatus ? "false" : "true");
      window.location.reload();
    };
  }
  document.ontouchstart = function (e) {
    if (e.touches.length === 5) {
      window.localStorage.setItem("ready", "false");
      window.location.reload();
    }
  };

  window.addEventListener("click", pageClicked());
}

function displayInformation() {
  const base64 = webApp.get("base64");
  const background = webApp.get("background");
  const icon = webApp.get("icon");
  const title = webApp.get("title");

  updateBase64(base64);

  updateBackground(background);

  updateIcon(icon);

  updateTitle(title);
}

function updateTitle(title) {
  if (!title) return;
  title = title.trim();
  titleInput.value = title;
  appleTitleMeta.setAttribute("content", title);
  appPreviewTitle.innerText = formatLongText(title);
}

function updateBackground(background) {
  const color = colorInput.value;

  colorInput.value = background || color;
  document.body.style.background = background || color;
  document
    .querySelector("[name='theme-color']")
    .setAttribute("content", background || color);
}

function updateIcon(icon) {
  appPreviewIcon.src = icon ? icon : "";
  const urlMatch = icon?.match(/^https?/);
  iconInput.value = urlMatch ? icon : "";
  appleIconMeta.href = icon;
  return !!urlMatch;
}

function updateBase64(base64) {
  base64Input.value = base64 || "";
}

function handleTitleInput(event) {
  webApp.set("title", titleInput.value);
  updateTitle(titleInput.value);
}

function handleColorInput(event) {
  webApp.set("background", colorInput.value);
  updateBackground(colorInput.value);
}

function handleUrlInput(event) {
  const status = updateIcon(iconInput.value);
  webApp.set("icon", iconInput.value);
  if (!status) {
    appIconStatus.error("Invalid").show();
    return;
  }
}

function handleBase64Input(event) {
  const base64 = btoa(htmlFromString(base64Input.value));
  webApp.set("base64", base64);
  updateBase64(base64);
}

function handleHtmlFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.readAsText(file, "utf-8");
    reader.onload = function (a) {
      const text = a.target.result.trim();
      const base64 = btoa(text);
      webApp.set("base64", base64);
      updateBase64(base64);
    };
  }
}

function handleSaveButton(event) {
  if (isStandalone) {
    if (!webApp.get("background")) {
      appColorStatus.error("Select Color").show();
      return;
    } else {
      appColorStatus.success("✓").show();
    }

    if (!webApp.get("base64")) {
      appBase64Status.error("Invalid").show();
      return;
    } else {
      appBase64Status.success("✓").show();
    }
    if (!webApp.checkStandaloneReady()) {
      shareStatus.error("Missing Fields").show();
      return;
    } else {
      shareStatus.show(false);
    }
    window.location.reload();
  } else {
    if (!webApp.get("title")) {
      appTitleStatus.error("Invalid").show();
      return;
    } else {
      appTitleStatus.success("✓").show();
    }
    if (!webApp.get("icon")) {
      appIconStatus.error("Invalid").show();
      return;
    } else {
      appIconStatus.success("✓").show();
    }
    if (!webApp.checkSetupReady()) {
      shareStatus.error("Missing Fields").show();
    } else {
      shareStatus.show();
    }
  }
  displayInformation();
  webApp.checkStandaloneReady();
}

function handleIconFileSelect(event) {
  const selectedFile = event.target.files[0];

  if (selectedFile) {
    if (selectedFile.size > 2e6) {
      alert("Image Too Large. Image must be 2mb or less. Or use a URL");
      return;
    }

    const reader = new FileReader();

    reader.readAsDataURL(selectedFile);

    reader.onload = function (event) {
      const src = event.target.result;
      webApp.set("icon", src);
      updateIcon(src);
    };
  }
}

function isBase64(text) {
  if (text === "") return false;
  const regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;
  return regex.test(text);
}

function formatLongText(string) {
  if (string.length > 16) {
    return string.slice(0, 16) + "...";
  }
  return string;
}

function debugText(text, ms = 500) {
  let el = document.createElement("div");
  el.style =
    "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0,0,0,0.7); color: white; display: flex; justify-content: center; align-items: center; font-size: 30px;";
  el.innerText = text;
  document.body.append(el);
  setTimeout(function () {
    el.remove();
    el = null;
  }, ms);
}

function toggleHiddenElement(element, shownBool = null) {
  if (shownBool !== null) {
    if (shownBool) element.classList.remove("hidden");
    else element.classList.add("hidden");
    return;
  }
  element.classList.toggle("hidden");
}

/**
 * parses a string into a DOM
 * @param {string} string
 * @returns {Document}
 */
function domFromString(string) {
  const str = htmlFromString(string);
  const parser = new DOMParser();
  return parser.parseFromString(str, "text/html");
}

function getAppIconFromDOM(dom) {
  const el =
    dom.head.querySelector("link[rel=apple-touch-icon-precomposed]") ||
    dom.head.querySelector("link[rel=apple-touch-icon]") ||
    dom.head.querySelector("link[rel=icon]");
  if (el) {
    return el.href;
  }
  return "";
}

function htmlFromString(string) {
  let str = "";
  try {
    str = atob(string);
  } catch (e) {
    if (string.startsWith("data:text/html;base64,")) {
      str = atob(string.slice(22));
    } else if (string.startsWith("data:text/html,")) {
      str = string.slice(15);
    } else {
      str = string;
    }
  }
  return str;
}
