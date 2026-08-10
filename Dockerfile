FROM node:24-alpine

ENV NODE_ENV=production \
    PORT=4173

WORKDIR /app

COPY package.json server.mjs index.html styles.css app.js core.mjs ./

RUN chown -R node:node /app
USER node

EXPOSE 4173

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/health/live" >/dev/null || exit 1

CMD ["node", "server.mjs"]
