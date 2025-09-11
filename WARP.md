# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## 🏗️ Project Architecture

### Overview
ToolSlap is a comprehensive SEO-optimized online tools platform built as a static website with 55+ utility tools. The project follows a client-side processing approach for privacy and performance, with no backend server required.

### Technology Stack
- **Frontend**: Pure HTML5, CSS3, Vanilla JavaScript
- **UI Libraries**: Font Awesome for icons, Tailwind CSS (CDN) for some tools
- **APIs**: Groq API for AI features, YouTube API for transcription tools
- **Deployment**: GitHub Pages with automated deployment via GitHub Actions
- **Design Pattern**: Single-file HTML applications for each tool

### Core Design Principles
1. **Client-Side Processing**: All file processing happens in the browser for privacy
2. **SEO-First**: Every page optimized for search engines with Schema.org markup
3. **No Registration**: Tools work without user accounts or signups
4. **Mobile Responsive**: Built with mobile-first approach
5. **Progressive Enhancement**: Tools work without JavaScript for basic features

### Directory Structure
```
toolslap/
├── index.html                 # Main landing page with tool directory
├── [tool-name].html          # Individual tool pages (55+ tools)
├── tools/                    # Category-organized tool directories
│   ├── image/               # Image processing tools
│   ├── pdf/                 # PDF manipulation tools
│   ├── text/                # Text processing tools
│   └── developer/           # Developer utilities
├── api-config.js            # API configuration (gitignored)
├── api-config.example.js    # API configuration template
├── images/                  # Assets and logos
├── sitemap.xml              # SEO sitemap with all tools
├── robots.txt               # Search engine directives
├── CNAME                    # Custom domain configuration
├── .github/workflows/       # GitHub Actions deployment
└── *.md files               # Documentation and checklists
```

## 🔧 Common Development Commands

### Local Development
```powershell
# Start local server for testing
python -m http.server 8000
# or
npx serve

# View in browser
Start-Process "http://localhost:8000"
```

### API Configuration
```powershell
# Copy API configuration template
Copy-Item api-config.example.js api-config.js

# Edit API keys (never commit this file)
notepad api-config.js
```

### Testing Specific Tools
```powershell
# Test specific tool locally
Start-Process "http://localhost:8000/compress-pdf.html"
Start-Process "http://localhost:8000/bg-remover.html"
```

### Deployment
```powershell
# Deploy to GitHub Pages (automated)
git add .
git commit -m "Update tools and features"
git push origin main
# GitHub Actions automatically deploys to https://toolslap.online

# Check deployment status
gh workflow list
gh run list
```

### SEO and Performance Testing
```powershell
# Test sitemap
Start-Process "http://localhost:8000/sitemap.xml"

# Check page speed (requires PageSpeed Insights CLI or manual testing)
# Test Core Web Vitals at: https://pagespeed.web.dev/
```

## 🏛️ Architecture Details

### Tool Architecture Pattern
Each tool follows a consistent structure:
1. **SEO Meta Tags**: Comprehensive meta tags, Open Graph, Twitter Cards
2. **Schema.org Markup**: SoftwareApplication and WebApplication schemas
3. **Responsive Design**: Mobile-first CSS with consistent styling
4. **File Processing**: Canvas API, File API, Web Workers for heavy processing
5. **Error Handling**: User-friendly error messages and fallbacks
6. **Progress Indicators**: Visual feedback for long-running operations

### API Integration Pattern
Tools with AI features use a centralized API configuration:
```javascript
// API key retrieval pattern
const apiKey = window.getApiKey && window.getApiKey('groq');
if (!apiKey) {
    // Fallback behavior or configuration prompt
}
```

### State Management
- **Local Processing**: No server state, all data in browser memory
- **Local Storage**: Used for API keys and user preferences
- **Session Storage**: Temporary data for tool sessions
- **File Handling**: Drag & drop with FileReader API

### Performance Optimizations
- **Lazy Loading**: Tools load resources only when needed
- **Client-Side Processing**: No server round trips
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Optimized Assets**: Compressed images and minimal external dependencies

## 🎯 Tool Categories & High-Volume Keywords

### Image Tools (High Traffic Priority)
- `png-to-jpg.html` - 40K+ monthly searches
- `jpg-to-png.html` - 25K+ monthly searches  
- `image-resizer.html` - 35K+ monthly searches
- `image-compressor.html` - 30K+ monthly searches
- `bg-remover.html` - AI-powered background removal

### PDF Tools (Highest Traffic)
- `compress-pdf.html` - 40K+ monthly searches
- `merge-pdf.html` - 30K+ monthly searches
- `pdf-to-html-converter.html` - Business-focused
- `pdf-to-csv-converter.html` - Data processing

### Developer Tools (Stable Traffic)
- `json-formatter.html` - 25K+ monthly searches
- `base64-encoder.html` - Consistent traffic
- `hash-generator.html` - MD5, SHA256 generation
- `uuid-generator.html` - Development utilities

### AI-Powered Tools (Emerging)
- `ai-email-responder.html` - Groq API integration
- `youtube-transcribe-ai.html` - YouTube + AI transcription
- `blog-generator.html` - Content generation

## 🔍 SEO Implementation

### Required Elements for New Tools
Every tool must include:
1. **Title**: "[Tool Name] - Free Online [Function] | ToolSlap"
2. **Meta Description**: Under 160 characters with primary keyword
3. **Schema.org Markup**: SoftwareApplication type
4. **Canonical URL**: Prevent duplicate content
5. **Open Graph Tags**: Social media optimization
6. **Breadcrumb Navigation**: With structured data
7. **FAQ Section**: Schema-marked FAQPage (when applicable)

### Internal Linking Strategy
- Tools link to related tools in the same category
- Category pages (`tools/image/`, `tools/pdf/`) organize tools
- Main index.html features top-performing tools prominently
- Breadcrumb navigation maintains site hierarchy

## 🔒 Security & Privacy

### API Key Management
- API keys stored in `api-config.js` (gitignored)
- Template provided in `api-config.example.js`
- Runtime checks for API availability with graceful fallbacks
- Local storage used for user-provided API keys

### File Processing Security
- All processing happens client-side (no file uploads to servers)
- Canvas-based image manipulation for security
- File type validation and size limits
- No data persistence beyond user session

### Privacy Features
- No user tracking or analytics by default (placeholder IDs)
- No file storage or transmission to external servers
- User data stays in browser memory only
- Optional API key storage in localStorage only

## 🚀 Deployment Pipeline

### GitHub Actions Workflow
Located in `.github/workflows/deploy.yml`:
- Triggered on push to main branch
- Deploys entire repository to GitHub Pages
- Custom domain configured via CNAME file
- SSL automatically provided by GitHub

### Domain Configuration
- Production: `toolslap.online` (configured in CNAME)
- GitHub Pages source: root directory
- Custom 404 handling through GitHub Pages

### Monitoring
- Google Search Console for SEO monitoring
- GitHub Actions for deployment status
- PageSpeed Insights for performance tracking

## 🧪 Testing Guidelines

### Browser Compatibility
- Chrome 80+ (primary target)
- Firefox 75+, Safari 13+, Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers

### Tool Testing Checklist
1. **Functionality**: Core feature works without external dependencies
2. **Responsive Design**: Mobile and desktop layouts
3. **Error Handling**: Invalid file types, large files, network errors
4. **Performance**: Large file processing doesn't freeze browser
5. **SEO**: Meta tags, schema markup, sitemap inclusion

### Performance Targets
- Page Load: < 2 seconds
- Core Web Vitals: All green scores
- Mobile-Friendly: 100% Google score
- Lighthouse SEO: 95+ score

## 📊 Analytics & Monitoring

### Key Metrics to Track
- Organic search traffic by tool
- Most popular tools by usage
- Page load performance
- Mobile vs desktop usage
- API usage patterns (for AI tools)

### SEO KPIs
- Keyword rankings for target terms
- Organic click-through rates
- Pages indexed in Google Search Console
- Core Web Vitals performance
- Backlink acquisition rate

## 🎨 Design System

### Color Palette
- Primary Gradient: `#667eea` to `#764ba2`
- Accent Gold: `#FFD700`
- Dark Background: `#1E1E2F` to `#2B2D42`
- Text: `#EAEAEA` on dark, `#333` on light

### UI Components
- Glass-morphism cards with backdrop-filter
- Gradient buttons with hover animations
- Drag & drop upload zones with visual feedback
- Progress indicators with percentage display
- Toast notifications for user feedback

### Typography
- Primary Font: Segoe UI system font stack
- Heading hierarchy: H1 (tool name), H2 (sections), H3 (features)
- Font sizes: Responsive with rem units
- Line height: 1.6 for readability

## 🔧 Troubleshooting

### Common Issues
1. **API Keys Not Working**: Check `api-config.js` format and key validity
2. **Tools Not Loading**: Verify HTTPS context for file APIs
3. **Large File Processing**: Implement Web Workers for heavy operations
4. **Mobile Issues**: Test File API support on target devices
5. **SEO Problems**: Validate schema markup and sitemap

### Debug Commands
```javascript
// Check API configuration
console.log(window.API_CONFIG);
console.log(window.getApiKey('groq'));

// Test file processing
console.log('File API supported:', window.File && window.FileReader);
console.log('Canvas supported:', !!document.createElement('canvas').getContext);
```

## 🚨 Important Notes

### Never Commit
- `api-config.js` - Contains actual API keys
- Local test files or user uploads
- Personal API keys or credentials

### Required for New Tools
- Update `sitemap.xml` with new tool URLs
- Add tool to appropriate category in `tools/` directory
- Include in main `index.html` tool grid if high-value
- Follow SEO optimization checklist in `DEPLOYMENT_CHECKLIST.md`

### User Rules Integration
Based on user preferences:
- Single-file HTML web applications preferred
- Bright blue and white theme using Tailwind CSS
- Font Awesome icons for visual elements
- Groq API integration for AI Story Writer and similar tools
