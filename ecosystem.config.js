module.exports = {
  apps: [
    {
      name: 'toolslap-production',
      script: 'server-production.js',
      instances: 'max', // Use all CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 8001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8001
      },
      // Automatic restart configuration
      autorestart: true,
      watch: false, // Set to true in development if needed
      max_memory_restart: '1G',
      
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Advanced configuration
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      
      // Source maps support
      source_map_support: true,
      
      // Environment variables for better performance
      node_args: '--max-old-space-size=2048'
    },
    {
      name: 'toolslap-qwen-ai',
      script: 'qwen-api-server.py',
      interpreter: 'python3',
      instances: 1, // Python server should run single instance
      env: {
        PYTHONPATH: '.',
        PORT: 8002
      },
      env_production: {
        PYTHONPATH: '.',
        PORT: 8002,
        CUDA_VISIBLE_DEVICES: '0' // If GPU available
      },
      
      // AI server specific configuration
      autorestart: true,
      watch: false,
      max_memory_restart: '8G', // AI models need more memory
      
      // Logging
      log_file: './logs/ai-combined.log',
      out_file: './logs/ai-out.log',
      error_file: './logs/ai-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Restart configuration for AI server
      min_uptime: '30s', // AI server needs more time to start
      max_restarts: 5,
      restart_delay: 10000, // 10 second delay between restarts
      
      // Kill timeout for AI server shutdown
      kill_timeout: 30000
    }
  ],
  
  // Deployment configuration
  deploy: {
    production: {
      user: 'node',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:username/toolslap.git',
      path: '/var/www/toolslap',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  },
  
  // Monitoring and logging
  monitoring: {
    http: true,
    https: false,
    port: 9615 // PM2 web monitoring port
  }
};