class WebApp {
  #props = new Map();
  #storage_keys = ["base64", "background", "icon", "title"];
  constructor() {
    for (const i of this.#storage_keys) {
      if (!localStorage.getItem(i)) localStorage.setItem(i, "");
      this.set(i, localStorage.getItem(i));
    }

    return this;
  }
  set(key, value) {
    this.#props.set(key, value);
    // const data = JSON.parse(localStorage.setItem("web-apps"))
    localStorage.setItem(key, value);
    // this.checkReady()
    // window.location.hash = this.hash;
    return;
  }
  get(key) {
    return this.#props.get(key);
  }
  get object() {
    // return { ...this.#params };
  }
  // get hash() {
  //   return (
  //     "#" +
  //     Object.entries(this.#params)
  //       .filter((a) => a[1])
  //       .sort((a, b) => b.length - a.length)
  //       .map((a) => {
  //         a[1] = encodeURIComponent(a[1]);
  //         return a.join(this.#split_keyvalue);
  //       })
  //       .join(this.#split_entry)
  //   );
  // }
  checkReady() {
    const ready = this.#storage_keys.every((key) => {
      return localStorage.getItem(key);
    });
    localStorage.setItem("ready", ready);
  }
  // #anyKeyExists() {
  //   return this.#storage_keys.some((key) => {
  //     return localStorage.getItem(key) !== null;
  //   });
  // }
}
