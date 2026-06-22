export interface OnlineMagic {
  isOnline: boolean;
}

declare function onlinePlugin(Alpine: Alpine.Alpine): void;

export default onlinePlugin;

declare namespace Alpine {
  interface Magics<T> {
    $online: OnlineMagic;
  }
}
