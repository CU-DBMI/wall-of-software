document.addEventListener("alpine:init", async () => {
  // init store
  Alpine.store("store", {
    title: [],
    list: [],
    cols: 1,
    set(key, value) {
      this[key] = value;
    },
  });

  // page title, split by word and char
  let index = 0;
  const title = "Wall of Software"
    .split(" ")
    .map((word) => word.split("").map((char) => ({ char, index: index++ })));

  // set title
  Alpine.store("store").set("title", title);

  // load json
  const list = await (await fetch("list.json")).json();
  // shuffle
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }

  // set list
  Alpine.store("store").set("list", list);

  // set number of cols on resize
  function updateCols() {
    Alpine.store("store").set(
      "cols",
      Math.min(10, Math.floor(window.innerWidth / 200))
    );
  }
  updateCols();
  window.addEventListener("resize", updateCols);
});
