# Bahasadri.com

Modern website built with Next.js 15, deployed on Cloudflare Workers.

## Features
- Next.js App Router
- Cloudflare Workers edge deployment
- TypeScript
- Server Components
- CSS Modules
- Full code documentation

## Prerequisites
- Node.js 18+
- pnpm 8+
- Cloudflare account

## Getting Started

### Install
```bash
pnpm install
```

### Develop
```bash
pnpm dev  # Visit http://localhost:3000
```

### Preview (Workers mode)
```bash
pnpm preview
```

### Deploy
```bash
pnpm deploy
```
See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for details.

## Structure
- `app/` : Pages and components
- `docs/` : Documentation
- `open-next.config.ts` : Cloudflare config
- `next.config.ts` : Next.js config
- `wrangler.toml` : Workers config

## Documentation
- [AI_AGENT_STANDARDS.md](./docs/AI_AGENT_STANDARDS.md) : AI guidelines (mandatory)
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) : Design decisions
- [DEVELOPMENT.md](./docs/DEVELOPMENT.md) : Guidelines
- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) : Deployment process
- [COMPONENTS.md](./docs/COMPONENTS.md) : Component patterns

## Contributing
Follow [DEVELOPMENT.md](./docs/DEVELOPMENT.md). Document all changes.

## License
[Add license here]

## Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [OpenNext](https://opennext.js.org/cloudflare)

Built with Next.js and Cloudflare Workers.
