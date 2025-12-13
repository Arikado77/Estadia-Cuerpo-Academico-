// ecosystem.config.js
module.exports = {
  apps : [{
    name   : "mi-pagina-web",
    script : "server.js",
    env: {
      // ... otras variables ...
      PG_USER: "doadmin",
      PG_HOST: "dbaas-db-7428696-do-user-29992350-0.k.db.ondigitalocean.com",
      PG_DATABASE: "defaultdb",
      PG_PASSWORD: "TU CONTRASEÑA CORRECTA AQUÍ", // <-- ¡CRÍTICO! Pega la contraseña correcta aquí.
      PG_PORT: 25060
    }
  }]
}