document.addEventListener('DOMContentLoaded', function (event) {
  setTimeout(function () {
    alert(document.domain) // "google.com"
  }, 1000)
})
