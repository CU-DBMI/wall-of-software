// reactive render html

document.addEventListener("alpine:init", async () => {
  // init store
  Alpine.store("store", {
    title: [],
    software: [],
    groups: [],
    count: 0,
    cols: 5,
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
    if (count < store.software.length - 1 || !store.software.length)
      window.setTimeout(countUp, 50);
  };

  // load data lists
  store.set("software", await loadList("software.json"));
  store.set("groups", await loadList("groups.json"));

  // set number of cols on window resize
  const updateCols = () =>
    store.set(
      "cols",
      Math.min(5, Math.max(1, Math.floor(window.innerWidth / 250)))
    );
  updateCols();
  window.addEventListener("resize", updateCols);
});

// load list data
const loadList = async (url) => {
  try {
    let list = await (await fetch(url)).json();
    list = list.map((entry, index) => ({ ...entry, order: index }));
    shuffle(list);
    return list;
  } catch (error) {
    return [];
  }
};

// shuffle list
const shuffle = (list) => {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
};
