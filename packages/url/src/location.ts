/** Read the current browser search string as URLSearchParams. */
export function readLocationSearch(): URLSearchParams {
  if (typeof window === "undefined") {
    return new URLSearchParams();
  }

  return new URLSearchParams(window.location.search);
}
