module.exports = {
  apps: [
    {
      name: "server",
      script: "src/server.js",
      instances: "max",
      exec_mode: "cluster",
      watch: false,
      ignore_watch: ["src/logs/*"],
      env_production: {
        NODE_ENV: "production",
        PORT: 8000,
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 8000,
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
