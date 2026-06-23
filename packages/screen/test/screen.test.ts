import { afterEach, beforeAll, describe, expect, expectTypeOf, it, vi } from "vitest";
import { startAlpine } from "../../../test/helpers.js";
import { setMatchMedia } from "../../../test/setup.js";
import screenPlugin, {
  DEFAULT_DEVICE_BREAKPOINTS,
  DEVICE_TYPES,
  type DeviceSnapshot,
  type DeviceStore,
  type DeviceType,
  deviceBreakpoints,
  readDeviceSnapshot,
  resolveDeviceTypeFromWidth,
} from "../src/index.js";

describe("@ailuracode/alpine-screen type inference", () => {
  it("exports literal device types", () => {
    expectTypeOf(DEVICE_TYPES).toEqualTypeOf<readonly ["mobile", "tablet", "desktop"]>();
    expectTypeOf(DEFAULT_DEVICE_BREAKPOINTS.mobileMax).toEqualTypeOf<767>();
  });

  it("types resolveDeviceTypeFromWidth()", () => {
    expectTypeOf(resolveDeviceTypeFromWidth(500)).toEqualTypeOf<DeviceType>();
    expectTypeOf(
      resolveDeviceTypeFromWidth(800, { mobileMax: 767, tabletMax: 1023 })
    ).toEqualTypeOf<DeviceType>();
  });

  it("types readDeviceSnapshot()", () => {
    const snapshot = readDeviceSnapshot();

    expectTypeOf(snapshot).toEqualTypeOf<DeviceSnapshot>();
    expectTypeOf(snapshot.type).toEqualTypeOf<DeviceType>();
  });

  it("types deviceBreakpoints()", () => {
    const breakpoints = deviceBreakpoints({ mobileMax: 640, tabletMax: 1024 });

    expectTypeOf(breakpoints.mobileMax).toEqualTypeOf<640>();
    expectTypeOf(breakpoints.tabletMax).toEqualTypeOf<1024>();
  });

  it("types $store.device", () => {
    setMatchMedia("(max-width: 767px)", true);
    setMatchMedia("(min-width: 768px) and (max-width: 1023px)", false);

    const Alpine = startAlpine(screenPlugin);
    const device = Alpine.store("device") as DeviceStore;

    expectTypeOf(device.type).toEqualTypeOf<DeviceType>();
    expectTypeOf(device.is).parameters.toEqualTypeOf<[name: DeviceType]>();
    expectTypeOf(device.isMobile).toEqualTypeOf<boolean>();
  });
});

describe("@ailuracode/alpine-screen", () => {
  let store: DeviceStore;

  beforeAll(() => {
    setMatchMedia("(max-width: 767px)", true);
    setMatchMedia("(min-width: 768px) and (max-width: 1023px)", false);

    const Alpine = startAlpine(screenPlugin);
    store = Alpine.store("device") as DeviceStore;
  });

  it("resolves type from width via helper", () => {
    expect(resolveDeviceTypeFromWidth(500)).toBe("mobile");
    expect(resolveDeviceTypeFromWidth(900)).toBe("tablet");
    expect(resolveDeviceTypeFromWidth(1200)).toBe("desktop");
  });

  it("reads device snapshot from width", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 900,
    });

    expect(readDeviceSnapshot()).toEqual({
      width: 900,
      mobileMax: DEFAULT_DEVICE_BREAKPOINTS.mobileMax,
      tabletMax: DEFAULT_DEVICE_BREAKPOINTS.tabletMax,
      type: "tablet",
    });
  });

  it("registers the device store", () => {
    expect(store).toBeDefined();
    expect(store.mobileMax).toBe(767);
    expect(store.tabletMax).toBe(1023);
  });

  it("detects mobile from matchMedia", () => {
    expect(store.type).toBe("mobile");
    expect(store.isMobile).toBe(true);
    expect(store.is("mobile")).toBe(true);
  });

  it("updates breakpoints", () => {
    store.setBreakpoints({ mobileMax: 500, tabletMax: 900 });
    expect(store.mobileMax).toBe(500);
    expect(store.tabletMax).toBe(900);
  });

  it("refreshes width and type", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1200,
    });

    store.refreshWidth();
    expect(store.width).toBe(1200);
    store.refresh();
    expect(store.width).toBe(1200);
  });

  it("reacts to media query changes", () => {
    setMatchMedia("(max-width: 767px)", false);
    setMatchMedia("(min-width: 768px) and (max-width: 1023px)", true);
    store.setBreakpoints({ mobileMax: 767, tabletMax: 1023 });

    expect(store.type).toBe("tablet");
    expect(store.isTablet).toBe(true);
    expect(store.is("tablet")).toBe(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("updates width on resize after debounce", async () => {
    vi.useFakeTimers();

    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 800,
    });

    window.dispatchEvent(new Event("resize"));
    await vi.advanceTimersByTimeAsync(100);

    expect(store.width).toBe(800);
  });
});

describe("@ailuracode/alpine-screen desktop", () => {
  it("detects desktop from matchMedia", () => {
    setMatchMedia("(max-width: 767px)", false);
    setMatchMedia("(min-width: 768px) and (max-width: 1023px)", false);

    const Alpine = startAlpine(screenPlugin);
    const device = Alpine.store("device") as DeviceStore;
    device.setBreakpoints({ mobileMax: 767, tabletMax: 1023 });

    expect(device.type).toBe("desktop");
    expect(device.isDesktop).toBe(true);
    expect(device.is("desktop")).toBe(true);
  });

  it("updates only provided breakpoint values", () => {
    setMatchMedia("(max-width: 767px)", false);
    setMatchMedia("(min-width: 768px) and (max-width: 1023px)", false);

    const Alpine = startAlpine(screenPlugin);
    const device = Alpine.store("device") as DeviceStore;

    device.setBreakpoints({ mobileMax: 600 });
    expect(device.mobileMax).toBe(600);
    expect(device.tabletMax).toBe(1023);
  });
});
