# @ailuracode/alpine-url

Alpine.js plugin — reactive `$store.url` synced with the browser URL, typed and validated with **Zod**.

## Install

```bash
npm install @ailuracode/alpine-url zod alpinejs
```

## Usage

```ts
import Alpine from "alpinejs";
import createUrlPlugin from "@ailuracode/alpine-url";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().optional(),
  search: z.string().optional(),
  tab: z.enum(["overview", "settings", "billing"]).optional(),
});

Alpine.plugin(createUrlPlugin({ schema: querySchema }));
Alpine.start();
```

```html
<button @click="$store.url.set('page', ($store.url.get('page') ?? 1) + 1)">Next</button>
<p x-text="$store.url.search"></p>
```

## API

- **`createUrlPlugin({ schema, syncUrl?, pushOnSet?, onChange? })`** — register `$store.url`
- **`urlSchema(zodObject)`** — preserve literal inference when defining the schema separately
- **`UrlStoreOf<typeof schema>`** — typed store from a Zod object
- **`UrlStoreFor<z.infer<typeof schema>>`** — typed store for app-level Alpine augmentation

See [full docs](https://github.com/ailuracode/alpinejs-toolkit/tree/master/docs/plugins/url.md).

## License

MIT
