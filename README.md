# Bahasadri.com

A modern, high-performance website built with **Next.js 15** and deployed on **Cloudflare Workers**. This project follows a structured development approach with comprehensive documentation for every component, page, and feature.

## 🚀 Features

-   **Next.js 15** with App Router
-   **Cloudflare Workers** deployment for edge computing
-   **TypeScript** for type-safe development
-   **Server Components** for optimal performance
-   **CSS Modules** for scoped styling
-   **Comprehensive Documentation** for all code

## 📋 Prerequisites

-   **Node.js** 18+ (v24.9.0 recommended)
-   **pnpm** 8+ (v10.18.3 recommended)
-   **Cloudflare Account** (for deployment)

## 🛠️ Getting Started

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start Next.js development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

### Preview with Cloudflare Adapter

To test your application in the Cloudflare Workers runtime (more accurate to production):

```bash
# Build and preview with Cloudflare adapter
pnpm preview
```

This command:

1. Builds your Next.js application
2. Transforms it using the OpenNext Cloudflare adapter
3. Serves it locally using `wrangler dev` in the `workerd` runtime

### Deployment

```bash
# Build and deploy to Cloudflare Workers
pnpm deploy
```

This will:

1. Build your Next.js application
2. Transform it for Cloudflare Workers
3. Deploy to your Cloudflare account

## 📁 Project Structure

```
bahasadri.com/
├── app/                    # Next.js App Router directory
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page component
│   ├── page.module.css    # Home page styles
│   └── globals.css        # Global styles
├── docs/                   # Documentation (see below)
├── open-next.config.ts    # OpenNext Cloudflare configuration
├── next.config.ts         # Next.js configuration
├── wrangler.toml          # Cloudflare Workers configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## 📚 Documentation

This project maintains comprehensive documentation:

-   **[README.md](./README.md)** - This file, project overview
-   **[AI_AGENT_STANDARDS.md](./docs/AI_AGENT_STANDARDS.md)** - ⚠️ **MANDATORY** standards for AI agents working on this codebase
-   **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture and design decisions
-   **[DEVELOPMENT.md](./docs/DEVELOPMENT.md)** - Development guidelines and best practices
-   **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Deployment process and configuration
-   **[COMPONENTS.md](./docs/COMPONENTS.md)** - Component documentation and patterns

## 🏗️ Architecture

This project uses:

-   **Next.js App Router** - Modern routing and layouts
-   **Server Components** - Default rendering on server/edge
-   **Client Components** - For interactivity (when needed)
-   **Cloudflare Workers** - Edge deployment platform
-   **OpenNext Adapter** - Transforms Next.js for Cloudflare

For detailed architecture information, see [ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## 🧩 Development Guidelines

### Code Documentation

Every file, component, and function should include:

1. **File-level documentation** - Purpose and usage
2. **Component documentation** - Props, behavior, examples
3. **Function documentation** - Parameters, return values, side effects
4. **Inline comments** - Complex logic explanations

### Code Style

-   Use **TypeScript** for all new code
-   Follow **Next.js conventions** for file structure
-   Use **CSS Modules** for component styles
-   Prefer **Server Components** unless interactivity is needed
-   Write **self-documenting code** with clear naming

See [DEVELOPMENT.md](./docs/DEVELOPMENT.md) for detailed guidelines.

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for local development:

```env
# Add your environment variables here
```

### Cloudflare Configuration

Edit `wrangler.toml` to configure:

-   Worker name
-   Custom domains
-   KV namespaces
-   Durable Objects
-   R2 buckets
-   Environment variables

### Next.js Configuration

Edit `next.config.ts` to configure:

-   Image optimization
-   Redirects and rewrites
-   Headers and security
-   Experimental features

## 🚢 Deployment

### Automatic Deployment

The project is configured for automatic deployment to Cloudflare Workers. See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for details.

### Manual Deployment

```bash
pnpm deploy
```

### CI/CD

Configure your CI/CD pipeline to run `pnpm deploy` on push to main branch.

## 📖 Next.js Features Supported

| Feature                         | Status       | Notes                 |
| ------------------------------- | ------------ | --------------------- |
| App Router                      | ✅ Supported |                       |
| Pages Router                    | ✅ Supported |                       |
| Server Components               | ✅ Supported |                       |
| Client Components               | ✅ Supported |                       |
| Server Actions                  | ✅ Supported |                       |
| Route Handlers                  | ✅ Supported |                       |
| Static Generation               | ✅ Supported |                       |
| Server-Side Rendering           | ✅ Supported |                       |
| Incremental Static Regeneration | ✅ Supported |                       |
| Middleware                      | ✅ Supported |                       |
| Image Optimization              | ✅ Supported | Via Cloudflare Images |
| Partial Prerendering            | ✅ Supported | Experimental          |

## 🤝 Contributing

1. Follow the development guidelines in [DEVELOPMENT.md](./docs/DEVELOPMENT.md)
2. Document all code changes
3. Test locally with `pnpm preview` before deploying
4. Ensure TypeScript types are correct

## 📝 License

[Add your license here]

## 🔗 Resources

-   [Next.js Documentation](https://nextjs.org/docs)
-   [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
-   [OpenNext Cloudflare Adapter](https://opennext.js.org/cloudflare)
-   [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 📧 Support

For questions or issues, please [create an issue](https://github.com/yourusername/bahasadri.com/issues).

---

**Built with ❤️ using Next.js and Cloudflare Workers**
