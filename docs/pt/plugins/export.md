---
title: "Export"
description: "Exportar dados para CSV, JSON e outros formatos com $export."
---

Package: `@ailuracode/alpine-export`

Dispara downloads de arquivos no navegador a partir de templates Alpine via magic `$export`. Suporta URLs, blobs, arquivos e texto simples. Nunca lança exceções — resolve para `true` em sucesso e `false` em falha.

> **Nota:** Este pacote é publicado como `alpine-export` (não `alpine-download`) porque o npm bloqueia novos nomes de pacote contendo a palavra "download".

## Instalação

```bash
npm install @ailuracode/alpine-export alpinejs
```

## Configuração

```js
import Alpine from "alpinejs";
import exportPlugin from "@ailuracode/alpine-export";

Alpine.plugin(exportPlugin);
Alpine.start();
```

Consumidores TypeScript podem adicionar:

```ts
/// <reference types="@ailuracode/alpine-export/global" />
```

## Magic API

Chamável como `$clipboard` e `$share`:

| Uso | Retorno | Descrição |
|-------|---------|-------------|
| `await $export(source, options?)` | `Promise<boolean>` | Inicia um download de arquivo. Resolve `true` em sucesso, `false` quando não suportado ou inválido. Nunca lança exceções. |
| `$export.isSupported` | `boolean` (getter) | `true` quando exportações baseadas em anchor estão disponíveis. |

Use `$export.isSupported` sem parênteses nos templates.

### `source`

| Tipo | Comportamento |
|------|----------|
| String de URL (`https://…`, `/path`, `data:…`, `blob:…`) | Abre um `<a download>` temporário apontando para a URL |
| String de texto simples | Exige um nome de arquivo; salvo como blob de texto |
| `Blob` / `File` | Salvo via `URL.createObjectURL` |

### `options`

Passe um atalho de string com o nome do arquivo ou um objeto de opções:

| Campo | Tipo | Descrição |
|-------|------|-------------|
| `filename` | `string` | Nome sugerido para o download |
| `mimeType` | `string` | Tipo MIME para exportações de texto simples (padrão: `text/plain;charset=utf-8`) |

## Exemplos HTML

### Exportar texto

```html
<button @click="await $export('Hello world', 'hello.txt')">
  Download text
</button>
```

### Exportar uma URL

```html
<button @click="await $export('/assets/guide.pdf', 'guide.pdf')">
  Download PDF
</button>
```

### Exportar JSON gerado

```html
<div
  x-data="{
    exportData() {
      const payload = JSON.stringify({ savedAt: Date.now() }, null, 2);
      return $export(payload, {
        filename: 'export.json',
        mimeType: 'application/json'
      });
    }
  }"
>
  <button type="button" @click="exportData()">Export JSON</button>
</div>
```

### Feedback no componente

```html
<div
  x-data="{
    status: 'idle',
    async saveReport() {
      const ok = await $export(reportText, 'report.txt');
      this.status = ok ? 'saved' : 'failed';
      setTimeout(() => this.status = 'idle', 2000);
    }
  }"
>
  <button type="button" @click="saveReport()">Save report</button>
  <p x-show="status === 'saved'" x-cloak>Download started.</p>
  <p x-show="status === 'failed'" x-cloak>Export failed.</p>
</div>
```

## Suporte ao navegador

- Funciona em todos os navegadores modernos com suporte a `<a download>`
- URLs cross-origin podem abrir em uma nova aba em vez de fazer download quando o servidor não envia cabeçalhos CORS permissivos — hospede arquivos na mesma origem ou use exportações blob para conteúdo gerado
- Exportações de `File` e `Blob` usam object URLs e funcionam offline

## Segurança

Exportações devem ser disparadas por um gesto do usuário (clique). Chame `$export()` a partir de handlers de eventos, não no carregamento da página.
