module.exports = {
  apps: [
    {
      name: "server",
      script: "src/server.js",
      instances: "max", // "1" for production
      exec_mode: "cluster", // "fork" for production
      watch: process.env.NODE_ENV !== "production",
      env_production: {
        NODE_ENV: "production",
        PORT: 8000,
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 3000,
      },
      max_memory_restart: "750M",
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000,
      error_file: "src/logs/error.log",
      out_file: "src/logs/output.log",
    },
  ],

  deploy: {
    production: {
      user: "SSH_USERNAME",
      host: "SSH_HOSTMACHINE",
      ref: "origin/master",
      repo: "GIT_REPOSITORY",
      path: "DESTINATION_PATH",
      "pre-deploy-local": "",
      "post-deploy":
        "npm install && pm2 reload ecosystem.config.js --env production && curl http://localhost:8000/health",
      "pre-setup": "",
    },
  },
};
