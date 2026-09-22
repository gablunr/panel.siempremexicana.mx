export const confirmLeave = () =>
  !document.querySelector("form[data-unsaved]") ||
  window.confirm("Tienes cambios sin guardar. ¿Salir sin guardarlos?")
