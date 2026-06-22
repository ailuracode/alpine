export function createMagicHarness(plugin) {
  const magics = {};

  const Alpine = {
    reactive(value) {
      return value;
    },
    magic(name, factory) {
      magics[name] = factory();
    },
    store(_name, _value) {
      // mock stub
    },
  };

  plugin(Alpine);

  return magics;
}
