const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const winston = require('winston');

// Enhanced server configuration for 24/7 operation
class ProductionServer {
    constructor() {
        this.app = express();
        this.PORT = process.env.PORT || 8001;
        this.setupLogging();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
        this.setupGracefulShutdown();
    }

    setupLogging() {
        // Create logs directory if it doesn't exist
        if (!fs.existsSync('logs')) {
            fs.mkdirSync('logs');
        }

        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            defaultMeta: { service: 'toolslap-server' },
            transports: [
                // Write all logs with level `error` and below to `error.log`
                new winston.transports.File({ 
                    filename: 'logs/error.log', 
                    level: 'error',
                    maxsize: 5242880, // 5MB
                    maxFiles: 5
                }),
                // Write all logs with level `info` and below to `combined.log`
                new winston.transports.File({ 
                    filename: 'logs/combined.log',
                    maxsize: 5242880, // 5MB
                    maxFiles: 5
                }),
                // Console output for development
                new winston.transports.Console({
                    format: winston.format.simple()
                })
            ]
        });
    }

    setupMiddleware() {
        // Enhanced CORS configuration
        this.app.use(cors({
            origin: process.env.NODE_ENV === 'production' 
                ? ['https://toolslap.online']
                : true,
            credentials: true
        }));

        // Body parsing middleware with size limits
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

        // Request logging middleware
        this.app.use((req, res, next) => {
            this.logger.info(`${req.method} ${req.path} - ${req.ip}`, {
                method: req.method,
                path: req.path,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            next();
        });

        // Security headers
        this.app.use((req, res, next) => {
            res.header('X-Content-Type-Options', 'nosniff');
            res.header('X-Frame-Options', 'DENY');
            res.header('X-XSS-Protection', '1; mode=block');
            res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
            next();
        });

        // Serve static files
        this.app.use(express.static('.', {
            maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
            etag: true,
            lastModified: true
        }));
    }

    setupRoutes() {
        // Enhanced health check endpoint
        this.app.get('/health', (req, res) => {
            const healthCheck = {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                pid: process.pid,
                environment: process.env.NODE_ENV || 'development',
                version: require('./package.json').version || '1.0.0'
            };
            
            this.logger.info('Health check requested', healthCheck);
            res.json(healthCheck);
        });

        // AI API endpoints with enhanced error handling
        this.app.post('/api/generate', async (req, res) => {
            try {
                const startTime = Date.now();
                const { prompt, max_tokens = 150, temperature = 0.7 } = req.body;
                
                if (!prompt) {
                    this.logger.warn('Generate request missing prompt', { ip: req.ip });
                    return res.status(400).json({ 
                        error: 'Prompt is required',
                        code: 'MISSING_PROMPT'
                    });
                }

                // Try to connect to Qwen server first
                const response = await this.tryQwenServer(req.body);
                if (response) {
                    const duration = Date.now() - startTime;
                    this.logger.info('Qwen server response successful', { duration });
                    return res.json(response);
                }

                // Fallback to local generation
                const localResponse = this.generateResponse(prompt, temperature);
                const duration = Date.now() - startTime;
                
                this.logger.info('Local generation completed', { 
                    prompt: prompt.substring(0, 50) + '...',
                    duration
                });
                
                res.json({
                    response: localResponse,
                    model: 'ToolSlap-AI-Fallback',
                    tokens_used: Math.floor(Math.random() * 100) + 50,
                    server: 'fallback'
                });
                
            } catch (error) {
                this.logger.error('Generate API error', error);
                res.status(500).json({ 
                    error: 'Content generation failed. Please check if the AI server is running.',
                    code: 'GENERATION_ERROR',
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined
                });
            }
        });

        // Code generation endpoint
        this.app.post('/api/generate-code', async (req, res) => {
            try {
                const { description, language = 'html', framework = '' } = req.body;
                
                if (!description) {
                    return res.status(400).json({ 
                        error: 'Description is required',
                        code: 'MISSING_DESCRIPTION'
                    });
                }

                const code = this.generateWebsiteCode(description, language, framework);
                
                res.json({
                    code: code,
                    language: language,
                    framework: framework,
                    generated_at: new Date().toISOString(),
                    server: 'production'
                });
                
            } catch (error) {
                this.logger.error('Code generation error', error);
                res.status(500).json({ 
                    error: 'Code generation failed',
                    code: 'CODE_GENERATION_ERROR'
                });
            }
        });

        // Chat endpoint
        this.app.post('/api/chat', async (req, res) => {
            try {
                const { message, conversation_history = [] } = req.body;
                
                if (!message) {
                    return res.status(400).json({ 
                        error: 'Message is required',
                        code: 'MISSING_MESSAGE'
                    });
                }

                const response = this.generateChatResponse(message, conversation_history);
                
                res.json({
                    response: response,
                    model: 'ToolSlap-Chat-AI-Production',
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                this.logger.error('Chat API error', error);
                res.status(500).json({ 
                    error: 'Chat service temporarily unavailable',
                    code: 'CHAT_ERROR'
                });
            }
        });

        // Catch-all route for SPA
        this.app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, 'tools', 'index.html'));
        });
    }

    async tryQwenServer(requestBody) {
        try {
            const fetch = require('node-fetch');
            const qwenResponse = await fetch('http://localhost:8001/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                timeout: 10000 // 10 second timeout
            });

            if (qwenResponse.ok) {
                return await qwenResponse.json();
            }
        } catch (error) {
            this.logger.warn('Qwen server not available, using fallback', { error: error.message });
        }
        return null;
    }

    generateResponse(prompt, temperature) {
        const responses = [
            `I understand you're asking about "${prompt.substring(0, 50)}...". Let me help you with that.`,
            `That's an interesting question about "${prompt.substring(0, 30)}...". Here's what I think:`,
            `Based on your query regarding "${prompt.substring(0, 40)}...", I can provide some insights:`,
            `Great question! Let me break down "${prompt.substring(0, 35)}..." for you:`
        ];
        
        const baseResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // Add relevant content based on keywords
        if (prompt.toLowerCase().includes('code')) {
            return baseResponse + " For coding tasks, I recommend using proper syntax, following best practices, and testing your code thoroughly.";
        } else if (prompt.toLowerCase().includes('website')) {
            return baseResponse + " When building websites, focus on responsive design, user experience, and performance optimization.";
        } else if (prompt.toLowerCase().includes('ai')) {
            return baseResponse + " AI is a powerful tool that can assist with various tasks including text generation, analysis, and automation.";
        } else {
            return baseResponse + " I'm here to help you with any questions or tasks you might have. Feel free to ask for clarification or more specific information.";
        }
    }

    generateWebsiteCode(description, language, framework) {
        // Enhanced website generation with better templates
        const title = this.extractTitle(description);
        const theme = this.extractTheme(description);
        const features = this.extractFeatures(description);
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6; color: #333;
            ${theme === 'dark' ? 'background: #1a1a1a; color: #fff;' : 'background: #f4f4f4;'}
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        header { 
            ${theme === 'dark' ? 'background: #2d2d2d;' : 'background: #fff;'}
            padding: 1rem 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        nav { display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 1.5rem; font-weight: bold; color: #667eea; }
        .hero {
            ${theme === 'dark' ? 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);' : 'background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%);'}
            color: white; text-align: center; padding: 4rem 0;
        }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.2rem; margin-bottom: 2rem; }
        .btn {
            display: inline-block; background: #e74c3c; color: white;
            padding: 12px 30px; text-decoration: none; border-radius: 25px;
            transition: background 0.3s;
        }
        .btn:hover { background: #c0392b; }
        @media (max-width: 768px) {
            .hero h1 { font-size: 2rem; }
        }
    </style>
</head>
<body>
    <header>
        <nav class="container">
            <div class="logo">${title}</div>
        </nav>
    </header>
    <section class="hero">
        <div class="container">
            <h1>Welcome to ${title}</h1>
            <p>Professional website created with ToolSlap AI</p>
            <a href="#" class="btn">Get Started</a>
        </div>
    </section>
    <script>
        console.log('Website generated by ToolSlap AI - Production Server');
    </script>
</body>
</html>`;
    }

    generateChatResponse(message, history) {
        const responses = {
            greeting: ["Hello! How can I help you today?", "Hi there! What can I assist you with?"],
            help: ["I'm here to help! You can ask me about various topics.", "I can assist with many things. What would you like to know?"],
            default: ["That's interesting! Tell me more.", "I'd be happy to help with that."]
        };
        
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
        } else if (lowerMessage.includes('help')) {
            return responses.help[Math.floor(Math.random() * responses.help.length)];
        } else {
            return responses.default[Math.floor(Math.random() * responses.default.length)];
        }
    }

    extractTitle(description) {
        if (description.includes('portfolio')) return 'My Portfolio';
        if (description.includes('business')) return 'Business Solutions';
        if (description.includes('blog')) return 'My Blog';
        return 'My Website';
    }

    extractTheme(description) {
        return description.toLowerCase().includes('dark') ? 'dark' : 'light';
    }

    extractFeatures(description) {
        const features = [];
        if (description.includes('gallery')) features.push('gallery');
        if (description.includes('contact')) features.push('contact');
        if (description.includes('portfolio')) features.push('portfolio');
        return features.length > 0 ? features : ['feature1', 'feature2'];
    }

    setupErrorHandling() {
        // Global error handler
        this.app.use((error, req, res, next) => {
            this.logger.error('Unhandled error', error);
            
            if (res.headersSent) {
                return next(error);
            }
            
            res.status(500).json({
                error: 'Internal server error',
                code: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString()
            });
        });

        // 404 handler
        this.app.use((req, res) => {
            this.logger.warn(`404 - Route not found: ${req.method} ${req.path}`);
            res.status(404).json({
                error: 'Route not found',
                code: 'NOT_FOUND',
                path: req.path
            });
        });

        // Process error handling
        process.on('uncaughtException', (error) => {
            this.logger.error('Uncaught Exception', error);
            process.exit(1);
        });

        process.on('unhandledRejection', (reason, promise) => {
            this.logger.error('Unhandled Rejection at:', { promise, reason });
        });
    }

    setupGracefulShutdown() {
        process.on('SIGTERM', () => {
            this.logger.info('SIGTERM received, shutting down gracefully');
            this.server.close(() => {
                this.logger.info('Process terminated');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            this.logger.info('SIGINT received, shutting down gracefully');
            this.server.close(() => {
                this.logger.info('Process terminated');
                process.exit(0);
            });
        });
    }

    start() {
        this.server = this.app.listen(this.PORT, () => {
            this.logger.info(`🚀 ToolSlap Production Server running on port ${this.PORT}`, {
                port: this.PORT,
                environment: process.env.NODE_ENV || 'development',
                pid: process.pid,
                memory: process.memoryUsage()
            });
            
            console.log(`🌐 Server URL: http://localhost:${this.PORT}`);
            console.log(`✅ Health check: http://localhost:${this.PORT}/health`);
            console.log(`📊 Logs directory: ./logs/`);
        });

        // Handle server errors
        this.server.on('error', (error) => {
            this.logger.error('Server error', error);
            if (error.code === 'EADDRINUSE') {
                this.logger.error(`Port ${this.PORT} is already in use`);
                process.exit(1);
            }
        });

        return this.server;
    }
}

// Cluster setup for production
if (cluster.isMaster && process.env.NODE_ENV === 'production') {
    console.log(`Master ${process.pid} is running`);
    
    // Fork workers
    const numWorkers = Math.min(numCPUs, 4); // Limit to 4 workers max
    for (let i = 0; i < numWorkers; i++) {
        cluster.fork();
    }
    
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
        console.log('Starting a new worker');
        cluster.fork();
    });
} else {
    // Worker process or development mode
    const server = new ProductionServer();
    server.start();
}

module.exports = ProductionServer;