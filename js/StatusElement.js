class StatusElement {
  constructor (element) {
    this.element = element
  }

  error(text) {
    if (text) this.element.innerText = text.trim()
    this.element.classList.remove("success")
    this.element.classList.add("error")
    return this
  }
  
  success(text) {
    if (text) this.element.innerText = text.trim()
    this.element.classList.remove("error")
    this.element.classList.add("success")
    return this
  }

  show(bool=true) {
    if (!bool) {
      this.element.classList.add("hidden")
      return this
    }
    this.element.classList.remove("hidden")
    return this
  }
}