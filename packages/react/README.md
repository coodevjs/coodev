# Coodev Core

## Usage

### Install

```bash
npm i @coodev/react react react-dom
```

#### Create pages

Create page component in `pages` directory, for example `pages/index.tsx`

```typescript
import React from 'react'

export default function Home() {
  return <div>Home</div>
}
```

### Development

Add dev script in `package.json`

```json
{
  "scripts": {
    "dev": "coodev-react"
  }
}
```

Start development server

```bash
npm run dev
```

### Build

Add build script in `package.json`

```json
{
  "scripts": {
    "build": "coodev-react build"
  }
}
```

Build

```bash
npm run build
```

## Coodev Configuration
```typescript
/**
 * config
 */
const coodevConfig = {
  root: '.',
  ssr: {
    streamingHtml: true,
  },
  runtimeConfig: {},
  plugins: [
    {
      configResolved?(config: InternalConfiguration): Promisable<void>
      configureCoodev?(coodev: Coodev): void | (() => void)
      buildEnd?(options: BuildEndOptions, output: BuildOutput): Promisable<void>
      documentHtml?(html: string): Promisable<void | string>
      htmlRendered?(html: string): Promisable<void | string>
    }
  ],
}
```
