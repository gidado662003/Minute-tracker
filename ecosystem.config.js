module.exports = {
  apps: [
    {
      name: "meeting-api",
      script: "server/src/server.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
        HOST: "0.0.0.0",
        MAIL_HOST: "syscodescomms.com",
        MAIL_PORT: 587,
        MAIL_USERNAME: "opsapp@syscodescomms.com",
        MAIL_PASSWORD: "Todayisgood12",
        MAIL_ENCRYPTION: "tls",
        MAIL_FROM_ADDRESS: "opsapp@syscodescomms.com",
        MAIL_FROM_NAME: "Syscodes Operations App",
      },
    },
    {
      name: "client",
      script: "npm",
      args: "start",
      cwd: "./client",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        HOST: "0.0.0.0",
        PORT: 3000,
      },
    },
  ],
};
