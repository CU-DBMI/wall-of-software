// reactive render html

document.addEventListener("alpine:init", async () => {
  // init store
  Alpine.store("store", {
    list: [],
    count: 0,
    cols: 1,
    set(key, value) {
      this[key] = value;
    },
  });
  const store = Alpine.store("store");

  // load list
  const list = await (await fetch("list.json")).json();
  // shuffle
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }

  // count up
  const countUp = () => {
    const count = store.count;
    store.set("count", count + 1);
    if (count < list.length - 1) window.setTimeout(countUp, 50);
  };
  window.setTimeout(countUp, 1000);

  // set list
  store.set("list", list);

  // set number of cols on window resize
  function updateCols() {
    store.set("cols", Math.min(10, Math.floor(window.innerWidth / 200)));
  }
  updateCols();
  window.addEventListener("resize", updateCols);
});
