import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

function vercelApiDevPlugin() {
  return {
    name: 'vercel-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        if (!url.pathname.startsWith('/api/')) {
          return next();
        }

        const apiName = url.pathname.replace(/^\/api\//, '').replace(/\.js$/, '');
        const filePath = path.resolve(process.cwd(), `api/${apiName}.js`);

        if (!fs.existsSync(filePath)) {
          return next();
        }

        try {
          if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            const buffers = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const bodyStr = Buffer.concat(buffers).toString('utf-8');
            try {
              req.body = bodyStr ? JSON.parse(bodyStr) : {};
            } catch {
              req.body = bodyStr;
            }
          }

          res.status = function (code) {
            res.statusCode = code;
            return res;
          };
          res.json = function (data) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return res;
          };

          const module = await server.ssrLoadModule(`/api/${apiName}.js`);
          const handler = module.default;
          if (typeof handler === 'function') {
            await handler(req, res);
          } else {
            res.status(500).json({ error: `Handler function not exported from ${filePath}` });
          }
        } catch (err) {
          console.error(`[API Dev Server Error] ${url.pathname}:`, err);
          if (!res.writableEnded) {
            res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
          }
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [
      react(),
      tailwindcss(),
      vercelApiDevPlugin(),
    ],
    optimizeDeps: {
      include: ['qrcode'],
    },
    envPrefix: ['VITE_', 'SUPABASE_'],
  };
});
