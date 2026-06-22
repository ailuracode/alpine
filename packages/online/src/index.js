export default function onlinePlugin(Alpine) {
  const state = Alpine.reactive({ isOnline: navigator.onLine });

  Alpine.magic("online", () => state);

  const update = () => {
    state.isOnline = navigator.onLine;
  };

  window.addEventListener("online", update);
  window.addEventListener("offline", update);
}
