module.exports = {
    apps: [
      {
        name: "aiga-api-renual",
        script: "dist/main.js",
        watch: false,
        exec_mode: "cluster",
        instances: 0,
        env: {
          NODE_ENV: "development",
          LOG_LEVEL: "debug",
          PORT: 3000
        },
        env_production: {
          NODE_ENV: "production",
          LOG_LEVEL: "info",
          PORT: 8080
        },
        output: "/home/ubuntu/workspace/logs/aiga-api-renual/out.log",
        error: "/home/ubuntu/workspace/logs/aiga-api-renual/err.log",
        log_date_format: "YYYY-MM-DD HH:mm:ss",
      },
    ]
  }