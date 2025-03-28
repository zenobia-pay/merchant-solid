# ZENOBIA - Luxury Fashion Store

A Gucci-inspired luxury fashion e-commerce store built with SolidJS and Cloudflare Workers.

## Features

- Responsive design inspired by luxury fashion sites
- Product catalog with filtering and sorting
- Product detail pages with color/size selection
- Shopping cart functionality
- Clean and modern user interface

## Tech Stack

- **Frontend**: SolidJS with solid-router for routing
- **Styling**: TailwindCSS for utility-first styling
- **Deployment**: Cloudflare Workers for hosting and edge computing
- **Build Tool**: Vite for fast and efficient bundling

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or pnpm

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd merchant-solid
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
```

3. Start the development server:

```bash
npm run dev
# or
pnpm dev
```

## Development

The site structure consists of:

- `/src/pages` - Main page components
- `/src/components` - Reusable UI components
- `/src/components/layout` - Layout components (Header, Footer)
- `/src/components/products` - Product-related components
- `/src/data` - Mock data for products
- `/src/types` - TypeScript type definitions

## Deployment with Cloudflare Workers

1. Build the project:

```bash
npm run build
```

2. Deploy to Cloudflare Workers:

```bash
npx wrangler publish
```

## License

This project is for demonstration purposes only.

## Acknowledgements

- Design inspiration from [Gucci](https://www.gucci.com)
- Images from [Unsplash](https://unsplash.com)
- Icons from [Heroicons](https://heroicons.com)

```bash
$ npm install # or pnpm install or yarn install
```

### Learn more on the [Solid Website](https://solidjs.com) and come chat with us on our [Discord](https://discord.com/invite/solidjs)

## Available Scripts

In the project directory, you can run:

### `npm run dev` or `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>

### `npm run build`

Builds the app for production to the `dist` folder.<br>
It correctly bundles Solid in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

## Deployment

You can deploy the `dist` folder to any static host provider (netlify, surge, now, etc.)

## This project was created with the [Solid CLI](https://solid-cli.netlify.app)
