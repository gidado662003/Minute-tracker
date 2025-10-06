module.exports = {
  apps: [
    {
      name: 'meeting-api',
      script: 'server/src/server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      restart_delay: 1000,
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      watch: false,
      error_file: './logs/meeting-api-error.log',
      out_file: './logs/meeting-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z'
    },
    {
      name: 'client',
      script: 'npm',
      args: 'start',
      cwd: './client',
      instances: 1,
      exec_mode: 'fork',
      restart_delay: 1000,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      watch: false,
      error_file: './logs/client-error.log',
      out_file: './logs/client-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z'
    }
  ]
};
