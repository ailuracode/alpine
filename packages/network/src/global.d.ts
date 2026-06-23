/// <reference types="@types/alpinejs" />

export interface NetworkMagic {
  readonly isOnline: boolean;
  readonly isOffline: boolean;
}

export function readNetworkState(): NetworkMagic;

export function createNetworkState(isOnline?: boolean): NetworkMagic;

declare global {
  namespace Alpine {
    interface Magics<T> {
      $network: NetworkMagic;
    }
  }
}
