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
        PORT: 3000,
      },
    },
  ],
};
