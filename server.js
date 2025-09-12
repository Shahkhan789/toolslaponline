const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static('.'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        model_loaded: true,
        server: 'ToolSlap AI Server',
        timestamp: new Date().toISOString()
    });
});

// Simple AI text generation endpoint
app.post('/api/generate', async (req, res) => {
    try {
        const { prompt, max_tokens = 150, temperature = 0.7 } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Simple AI responses for demo purposes
        // In production, this would connect to actual AI models
        const responses = generateResponse(prompt, temperature);
        
        res.json({
            response: responses,
            model: 'ToolSlap-AI-Demo',
            tokens_used: Math.floor(Math.random() * 100) + 50
        });
    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// AI Code generation endpoint
app.post('/api/generate-code', async (req, res) => {
    try {
        const { description, language = 'html', framework = '' } = req.body;
        
        if (!description) {
            return res.status(400).json({ error: 'Description is required' });
        }

        const code = generateWebsiteCode(description, language, framework);
        
        res.json({
            code: code,
            language: language,
            framework: framework,
            generated_at: new Date().toISOString()
        });
    } catch (error) {
        console.error('Code generation error:', error);
        res.status(500).json({ error: 'Failed to generate code' });
    }
});

// Chat endpoint for conversations
app.post('/api/chat', async (req, res) => {
    try {
        const { message, conversation_history = [] } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const response = generateChatResponse(message, conversation_history);
        
        res.json({
            response: response,
            model: 'ToolSlap-Chat-AI',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Chat service unavailable' });
    }
});

// Image analysis endpoint (mock)
app.post('/api/analyze-image', async (req, res) => {
    try {
        const { image_data, analysis_type = 'general' } = req.body;
        
        if (!image_data) {
            return res.status(400).json({ error: 'Image data is required' });
        }

        const analysis = generateImageAnalysis(analysis_type);
        
        res.json({
            analysis: analysis,
            confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
            processing_time: Math.random() * 2000 + 500 // 0.5-2.5 seconds
        });
    } catch (error) {
        console.error('Image analysis error:', error);
        res.status(500).json({ error: 'Image analysis failed' });
    }
});

// Helper function to generate AI responses
function generateResponse(prompt, temperature) {
    const responses = [
        "I understand you're asking about " + prompt.substring(0, 50) + "... Let me help you with that.",
        "That's an interesting question about " + prompt.substring(0, 30) + ". Here's what I think:",
        "Based on your query regarding " + prompt.substring(0, 40) + ", I can provide some insights:",
        "Great question! Let me break down " + prompt.substring(0, 35) + " for you:",
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

// Helper function to generate website code
function generateWebsiteCode(description, language, framework) {
    const title = extractTitle(description);
    const theme = extractTheme(description);
    const features = extractFeatures(description);
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            ${theme === 'dark' ? 'background: #1a1a1a; color: #fff;' : 'background: #f4f4f4;'}
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        header {
            ${theme === 'dark' ? 'background: #2d2d2d;' : 'background: #fff;'}
            padding: 1rem 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: bold;
            color: #3498db;
        }
        
        .nav-links {
            display: flex;
            list-style: none;
            gap: 2rem;
        }
        
        .nav-links a {
            text-decoration: none;
            color: inherit;
            transition: color 0.3s;
        }
        
        .nav-links a:hover {
            color: #3498db;
        }
        
        .hero {
            ${theme === 'dark' ? 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);' : 'background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%);'}
            color: white;
            text-align: center;
            padding: 4rem 0;
        }
        
        .hero h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .hero p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
        }
        
        .btn {
            display: inline-block;
            background: #e74c3c;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 25px;
            transition: background 0.3s;
        }
        
        .btn:hover {
            background: #c0392b;
        }
        
        .features {
            padding: 4rem 0;
            ${theme === 'dark' ? 'background: #2d2d2d;' : 'background: white;'}
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }
        
        .feature-card {
            ${theme === 'dark' ? 'background: #3d3d3d;' : 'background: #f8f9fa;'}
            padding: 2rem;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .feature-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        footer {
            ${theme === 'dark' ? 'background: #1a1a1a;' : 'background: #2c3e50;'}
            color: white;
            text-align: center;
            padding: 2rem 0;
        }
        
        @media (max-width: 768px) {
            .hero h1 { font-size: 2rem; }
            .nav-links { display: none; }
            .features-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <header>
        <nav class="container">
            <div class="logo">${title}</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <section class="hero">
        <div class="container">
            <h1>Welcome to ${title}</h1>
            <p>Discover amazing features and experience something extraordinary</p>
            <a href="#features" class="btn">Get Started</a>
        </div>
    </section>
    
    <section class="features" id="features">
        <div class="container">
            <h2 style="text-align: center; margin-bottom: 1rem;">Features</h2>
            <div class="features-grid">
                ${generateFeatureCards(features, theme)}
            </div>
        </div>
    </section>
    
    <footer>
        <div class="container">
            <p>&copy; 2025 ${title}. Built with ToolSlap AI Website Builder.</p>
        </div>
    </footer>
    
    <script>
        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
        
        // Add some interactivity
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
                this.style.transition = 'transform 0.3s';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    </script>
</body>
</html>`;

    return html;
}

// Helper function to generate chat responses
function generateChatResponse(message, history) {
    const responses = {
        greeting: ["Hello! How can I help you today?", "Hi there! What can I assist you with?", "Greetings! How may I be of service?"],
        help: ["I'm here to help! You can ask me about coding, websites, AI, or general questions.", "I can assist with various topics. What would you like to know?"],
        coding: ["For coding questions, I can help with HTML, CSS, JavaScript, Python, and more!", "What programming language or coding concept would you like help with?"],
        default: ["That's interesting! Tell me more about what you'd like to know.", "I'd be happy to help with that. Can you provide more details?", "Great question! Let me think about that for you."]
    };
    
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
    } else if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
        return responses.help[Math.floor(Math.random() * responses.help.length)];
    } else if (lowerMessage.includes('code') || lowerMessage.includes('programming') || lowerMessage.includes('javascript') || lowerMessage.includes('html')) {
        return responses.coding[Math.floor(Math.random() * responses.coding.length)];
    } else {
        return responses.default[Math.floor(Math.random() * responses.default.length)];
    }
}

// Helper function to generate image analysis
function generateImageAnalysis(type) {
    const analyses = {
        general: "This appears to be a well-composed image with good lighting and clear subjects. The image contains various elements that are clearly visible and well-defined.",
        ocr: "Text detected in the image: [Sample text extraction would appear here based on actual OCR processing]",
        objects: "Detected objects: person (85%), furniture (72%), background elements (68%). The image shows a clear composition with identifiable subjects.",
        face: "Face detection: 1 face detected with high confidence. Facial features are clearly visible with good lighting conditions."
    };
    
    return analyses[type] || analyses.general;
}

// Helper functions for website generation
function extractTitle(description) {
    if (description.includes('portfolio')) return 'My Portfolio';
    if (description.includes('restaurant')) return 'Restaurant Name';
    if (description.includes('business')) return 'Business Solutions';
    if (description.includes('blog')) return 'My Blog';
    if (description.includes('agency')) return 'Creative Agency';
    return 'My Website';
}

function extractTheme(description) {
    return description.toLowerCase().includes('dark') ? 'dark' : 'light';
}

function extractFeatures(description) {
    const features = [];
    if (description.includes('gallery')) features.push('gallery');
    if (description.includes('contact')) features.push('contact');
    if (description.includes('portfolio')) features.push('portfolio');
    if (description.includes('menu')) features.push('menu');
    if (description.includes('service')) features.push('services');
    return features.length > 0 ? features : ['feature1', 'feature2', 'feature3'];
}

function generateFeatureCards(features, theme) {
    const icons = ['🚀', '⭐', '💡', '🎯', '🔥', '✨'];
    const featureNames = {
        gallery: { name: 'Image Gallery', desc: 'Beautiful photo showcase' },
        contact: { name: 'Contact Form', desc: 'Easy way to reach us' },
        portfolio: { name: 'Portfolio Showcase', desc: 'Display your work' },
        menu: { name: 'Menu Display', desc: 'Showcase your offerings' },
        services: { name: 'Our Services', desc: 'What we offer' },
        feature1: { name: 'Amazing Feature', desc: 'Something incredible awaits' },
        feature2: { name: 'Great Quality', desc: 'Top-notch standards' },
        feature3: { name: 'Fast Performance', desc: 'Lightning quick results' }
    };
    
    return features.map((feature, index) => {
        const featureInfo = featureNames[feature] || featureNames.feature1;
        return `
            <div class="feature-card">
                <div class="feature-icon">${icons[index] || '🌟'}</div>
                <h3>${featureInfo.name}</h3>
                <p>${featureInfo.desc}</p>
            </div>
        `;
    }).join('');
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 ToolSlap AI Server running on port ${PORT}`);
    console.log(`🌐 Server URL: http://localhost:${PORT}`);
    console.log(`✅ Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
