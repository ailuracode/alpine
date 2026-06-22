export interface TouchMagic {
  isTouch: boolean;
  isCoarse: boolean;
  isFine: boolean;
  canHover: boolean;
  maxTouchPoints: number;
}

declare function touchPlugin(Alpine: Alpine.Alpine): void;

export default touchPlugin;

declare namespace Alpine {
  interface Magics<T> {
    $touch: TouchMagic;
  }
}
