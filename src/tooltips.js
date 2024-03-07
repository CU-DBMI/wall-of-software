// shrink tooltips to max content width, accounting for wrapping
const shrinkTooltips = async () => {
  // wait for repaint
  await new Promise((resolve) => window.setTimeout(resolve, 0));
  const tooltips = document.querySelectorAll(".tooltip");
  for (const tooltip of tooltips) {
    // unset any previously set size
    tooltip.style.width = "";
    // get size of just text
    const text = tooltip.querySelector(".tooltip-content").firstChild;
    const range = document.createRange();
    range.setStartBefore(text);
    range.setEndAfter(text);
    const width = range.getBoundingClientRect().width + 1;
    // fit tooltip to size
    tooltip.style.width = width + "px";
  }
};

window.addEventListener("load", shrinkTooltips);
window.addEventListener("resize", shrinkTooltips);
