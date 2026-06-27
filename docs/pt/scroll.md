# Rolagem

Package: `@ailuracode/alpine-scroll`

Rastreia posição, direção e progresso da rolagem. Fornece bloqueio de scroll do body com contagem de referências para modais e overlays.

## Instalação

```bash
npm install @ailuracode/alpine-scroll alpinejs
```

## Configuração

```js
import Alpine from "alpinejs";
import scroll from "@ailuracode/alpine-scroll";

Alpine.plugin(scroll());
Alpine.start();
```

O bloqueio de scroll aplica estilos inline em `html` e `body` (overflow hidden, body fixed). Nenhuma classe CSS ou estilo de framework é necessário.

### Callback opcional de bloqueio

Adicione suas próprias classes ou atributos quando o estado de bloqueio mudar:

```js
Alpine.plugin(
  scroll({
    onLockChange(locked) {
      document.documentElement.toggleAttribute("data-scroll-locked", locked);
    },
  }),
);
```

## Helpers exportados

```js
import {
  SCROLL_DIRECTIONS,
  computeScrollDirection,
  computeScrollMetrics,
  readScrollSnapshot,
  scrollOptions,
} from "@ailuracode/alpine-scroll";
```

## Store API

Store name: `$store.scroll`

### Estado

| Propriedade | Tipo | Descrição |
|----------|------|-------------|
| `x` | `number` | Deslocamento horizontal de scroll |
| `y` | `number` | Deslocamento vertical de scroll |
| `direction` | `ScrollDirection` | `up`, `down` ou `none` |
| `progress` | `number` | Progresso de scroll `0–100` |
| `atTop` | `boolean` | No topo da página |
| `atBottom` | `boolean` | No final da página |
| `locked` | `boolean` | Scroll do body bloqueado |

### Getters

| Getter | Descrição |
|--------|-------------|
| `isLocked` | Igual a `locked` |
| `isAtTop` | Igual a `atTop` |
| `isAtBottom` | Igual a `atBottom` |
| `isScrollingDown` | `direction === 'down'` |
| `isScrollingUp` | `direction === 'up'` |
| `showToTop` | Rolou para baixo e não está bloqueado — ideal para botões voltar ao topo |

### Métodos

| Método | Descrição |
|--------|-------------|
| `lock()` | Bloqueia o scroll do body (contagem de referências) |
| `unlock()` | Libera um bloqueio |
| `toggleLock()` | Alterna o estado de bloqueio |
| `isDirection(direction)` | Verifica a direção atual (`ScrollDirection`) |
| `toTop(behavior?)` | Rola para o topo (`behavior` padrão: `'smooth'`) |
| `toBottom(behavior?)` | Rola para o final |
| `refresh()` | Atualiza métricas manualmente |

## Exemplos HTML

### Barra de progresso

```html
<div
  class="scroll-progress"
  :style="`width: ${$store.scroll.progress}%`"
></div>
```

### Voltar ao topo

```html
<button x-show="$store.scroll.showToTop" @click="$store.scroll.toTop()">
  ↑ Top
</button>
```

### Modal com bloqueio de scroll

```html
<div x-data="{ open: false }">
  <button @click="open = true; $store.scroll.lock()">Open modal</button>

  <div x-show="open" @keydown.escape.window="open = false; $store.scroll.unlock()">
    <div @click.outside="open = false; $store.scroll.unlock()">
      <p>Modal content</p>
      <button @click="open = false; $store.scroll.unlock()">Close</button>
    </div>
  </div>
</div>
```

## Contagem de referências

Vários componentes podem chamar `lock()` independentemente. O scroll é restaurado somente quando todos os bloqueios são liberados via `unlock()`. Seguro para modais aninhados.

## Comportamento enquanto bloqueado

- As métricas de scroll pausam atualizações enquanto bloqueado
- `toTop()` / `toBottom()` são no-ops enquanto bloqueado
