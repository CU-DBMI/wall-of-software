// reactive render html

document.addEventListener("alpine:init", async () => {
  // init store
  Alpine.store("store", {
    title: [],
    list: [],
    count: 0,
    cols: 1,
    set(key, value) {
      this[key] = value;
    },
  });
  const store = Alpine.store("store");

  // type in title
  const title = "Wall of Software";
  let titleCount = 0;
  const typeIn = () => {
    store.set("title", title.slice(0, titleCount).split(""));
    titleCount++;
    if (titleCount <= title.length) window.setTimeout(typeIn, 50);
  };
  typeIn();

  // count up
  window.countUp = async () => {
    const count = store.count;
    store.set("count", store.count + 1);
    if (count < store.list.length - 1 || !store.list.length)
      window.setTimeout(countUp, 50);
  };

  // load list
  const list = (await (await fetch("list.json")).json()).map(
    (entry, index) => ({ ...entry, order: index })
  );
  // shuffle
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }

  // set list
  store.set("list", list);

  // set number of cols on window resize
  const updateCols = () =>
    store.set("cols", Math.min(10, Math.floor(window.innerWidth / 200)));
  updateCols();
  window.addEventListener("resize", updateCols);
});
