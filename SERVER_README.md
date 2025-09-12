# 🚀 ToolSlap AI Server

A lightweight Express.js server that powers ToolSlap's AI features including website generation, chat responses, and image analysis.

## ✨ Features

- **🤖 AI Chat API** - Conversational AI responses
- **🌐 Website Generator** - AI-powered HTML/CSS generation  
- **📸 Image Analysis** - Mock image processing endpoints
- **🔧 Health Monitoring** - Server status and health checks
- **⚡ Fast & Lightweight** - Minimal dependencies, fast startup

## 🚀 Quick Start

### Local Development

1. **Install Node.js** (16.x or higher)
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the server**:
   ```bash
   npm start
   ```
4. **Server runs on**: http://localhost:8001

### Development Mode
```bash
npm run dev  # Uses nodemon for auto-restart
```

## 📡 API Endpoints

### Health Check
```
GET /health
```
Returns server status and model information.

### AI Text Generation
```
POST /api/generate
Content-Type: application/json

{
  "prompt": "Your text prompt here",
  "max_tokens": 150,
  "temperature": 0.7
}
```

### Website Code Generation
```
POST /api/generate-code
Content-Type: application/json

{
  "description": "Create a modern portfolio website",
  "language": "html",
  "framework": "tailwind"
}
```

### Chat Conversation
```
POST /api/chat
Content-Type: application/json

{
  "message": "Hello, how are you?",
  "conversation_history": []
}
```

### Image Analysis
```
POST /api/analyze-image
Content-Type: application/json

{
  "image_data": "base64_image_data",
  "analysis_type": "general"
}
```

## 🌐 Deployment Options

### GitHub Pages (Static Files)
The workflow automatically deploys static files to GitHub Pages.

### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway up
```

### Heroku
```bash
# Install Heroku CLI
# Create app and deploy
heroku create toolslap-ai-server
git push heroku main
```

### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## 🔧 Configuration

### Environment Variables
- `PORT` - Server port (default: 8001)
- `NODE_ENV` - Environment mode

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8001
CMD ["npm", "start"]
```

## 📁 Project Structure

```
├── server.js              # Main server file
├── package.json           # Dependencies and scripts  
├── .github/workflows/     # GitHub Actions
│   └── deploy-server.yml  # Deployment workflow
└── README.md             # This file
```

## 🔒 Security Features

- **CORS enabled** - Cross-origin requests supported
- **Request size limits** - 50MB max payload
- **Error handling** - Comprehensive error responses
- **Input validation** - Required field validation

## 📊 Monitoring

- Health check endpoint: `/health`
- Server logs with timestamps
- Request/response tracking
- Error logging and handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Documentation**: Check API endpoints above
- **Issues**: Report bugs via GitHub Issues
- **Server Status**: Check `/health` endpoint

## 🚀 Production Deployment

For production deployment:

1. **Set environment variables**
2. **Use process manager** (PM2 recommended)
3. **Configure reverse proxy** (Nginx/Apache)
4. **Enable SSL/HTTPS**
5. **Set up monitoring and logging**

### PM2 Deployment
```bash
npm install -g pm2
pm2 start server.js --name "toolslap-server"
pm2 startup
pm2 save
```

---

**🌟 ToolSlap AI Server - Powering the future of AI tools!**
