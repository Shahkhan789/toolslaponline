#!/usr/bin/env python3
"""
ToolSlap Qwen AI Integration Server
This server provides API endpoints for all AI tools on ToolSlap website.
"""

import os
import sys
import json
import time
import asyncio
import logging
from typing import Dict, List, Optional, Any
from contextlib import asynccontextmanager

import torch
import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, Field

# Add Qwen path to sys.path
qwen_path = r"C:\Users\Saif Pc\Desktop\New folder\Qwen"
if qwen_path not in sys.path:
    sys.path.append(qwen_path)

try:
    from transformers import AutoModelForCausalLM, AutoTokenizer
    from transformers.generation import GenerationConfig
except ImportError as e:
    print(f"Error importing transformers: {e}")
    print("Please install: pip install transformers torch")
    sys.exit(1)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for model
model = None
tokenizer = None
config = None

# Pydantic models for API requests
class ChatRequest(BaseModel):
    message: str
    history: Optional[List[List[str]]] = []
    temperature: Optional[float] = 0.7
    max_length: Optional[int] = 2048

class TextGenerationRequest(BaseModel):
    prompt: str
    task_type: str  # story, content, summary, translation, code, etc.
    language: Optional[str] = "English"
    style: Optional[str] = "professional"
    length: Optional[str] = "medium"

class TranslationRequest(BaseModel):
    text: str
    source_language: str
    target_language: str

class CodeGenerationRequest(BaseModel):
    description: str
    language: str  # html, css, javascript, python, etc.
    framework: Optional[str] = None

class VoiceScriptRequest(BaseModel):
    topic: str
    style: str  # conversational, formal, friendly, etc.
    duration: str  # short, medium, long
    voice_type: Optional[str] = "neutral"

# Model management functions
def load_qwen_model():
    """Load the Qwen model and tokenizer."""
    global model, tokenizer, config
    
    try:
        # Try different possible Qwen model paths
        possible_paths = [
            "Qwen/Qwen-7B-Chat",
            "qwen/Qwen-7B-Chat", 
            r"C:\Users\Saif Pc\Desktop\New folder\Qwen",
            "Qwen/Qwen-14B-Chat"
        ]
        
        model_path = None
        for path in possible_paths:
            try:
                tokenizer = AutoTokenizer.from_pretrained(
                    path, trust_remote_code=True, resume_download=True
                )
                model_path = path
                break
            except Exception:
                continue
        
        if model_path is None:
            raise Exception("Could not find Qwen model. Please ensure it's properly installed.")
        
        logger.info(f"Loading Qwen model from: {model_path}")
        
        # Load model
        device_map = "auto" if torch.cuda.is_available() else "cpu"
        model = AutoModelForCausalLM.from_pretrained(
            model_path,
            device_map=device_map,
            trust_remote_code=True,
            resume_download=True,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
        ).eval()
        
        # Load generation config
        config = GenerationConfig.from_pretrained(
            model_path, trust_remote_code=True, resume_download=True
        )
        
        logger.info("Qwen model loaded successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Error loading Qwen model: {e}")
        return False

def generate_response(prompt: str, history: List = None, temperature: float = 0.7, max_length: int = 2048) -> str:
    """Generate response using Qwen model."""
    global model, tokenizer, config
    
    if model is None or tokenizer is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Set generation parameters
        generation_config = GenerationConfig(
            temperature=temperature,
            max_new_tokens=max_length,
            do_sample=True,
            top_p=0.8,
            top_k=50,
            repetition_penalty=1.1
        )
        
        # Generate response
        if history is None:
            history = []
            
        response, updated_history = model.chat(
            tokenizer, 
            prompt, 
            history=history, 
            generation_config=generation_config
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error generating response: {e}")
        raise HTTPException(status_code=500, detail=f"Generation error: {str(e)}")

# FastAPI app initialization
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup and cleanup on shutdown."""
    logger.info("Starting ToolSlap Qwen API Server...")
    
    # Load model
    success = load_qwen_model()
    if not success:
        logger.error("Failed to load Qwen model. Server will start but AI features will be disabled.")
    
    yield
    
    # Cleanup
    logger.info("Shutting down ToolSlap Qwen API Server...")

app = FastAPI(
    title="ToolSlap Qwen AI API",
    description="AI-powered tools using Qwen language model",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Check if the API server is running and model is loaded."""
    global model
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "timestamp": time.time()
    }

# Chat endpoint
@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """General chat interface using Qwen."""
    try:
        response = generate_response(
            request.message,
            request.history,
            request.temperature,
            request.max_length
        )
        
        return {
            "response": response,
            "status": "success",
            "timestamp": time.time()
        }
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Text generation endpoint
@app.post("/api/generate")
async def generate_text(request: TextGenerationRequest):
    """Generate different types of text content."""
    
    # Create task-specific prompts
    prompts = {
        "story": f"Write a creative {request.length} story about: {request.prompt}. Style: {request.style}. Language: {request.language}.",
        "content": f"Create {request.style} content about: {request.prompt}. Make it {request.length} length. Language: {request.language}.",
        "summary": f"Provide a {request.length} summary of: {request.prompt}. Style: {request.style}. Language: {request.language}.",
        "translation": f"Translate the following text to {request.language}: {request.prompt}",
        "code": f"Generate {request.language} code for: {request.prompt}. Style: clean and well-commented."
    }
    
    prompt = prompts.get(request.task_type, f"Help me with: {request.prompt}")
    
    try:
        response = generate_response(prompt, temperature=0.8, max_length=1024)
        
        return {
            "generated_text": response,
            "task_type": request.task_type,
            "status": "success",
            "timestamp": time.time()
        }
        
    except Exception as e:
        logger.error(f"Text generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Translation endpoint
@app.post("/api/translate")
async def translate_text(request: TranslationRequest):
    """Translate text between languages."""
    
    prompt = f"Translate this text from {request.source_language} to {request.target_language}:\n\n{request.text}\n\nProvide only the translation:"
    
    try:
        translation = generate_response(prompt, temperature=0.3, max_length=512)
        
        return {
            "translation": translation,
            "source_language": request.source_language,
            "target_language": request.target_language,
            "status": "success",
            "timestamp": time.time()
        }
        
    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Code generation endpoint
@app.post("/api/generate-code")
async def generate_code(request: CodeGenerationRequest):
    """Generate code in various programming languages."""
    
    framework_text = f" using {request.framework}" if request.framework else ""
    prompt = f"Generate clean, well-commented {request.language} code{framework_text} for: {request.description}\n\nProvide only the code with appropriate comments:"
    
    try:
        code = generate_response(prompt, temperature=0.5, max_length=1024)
        
        return {
            "code": code,
            "language": request.language,
            "framework": request.framework,
            "status": "success",
            "timestamp": time.time()
        }
        
    except Exception as e:
        logger.error(f"Code generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Voice script generation endpoint
@app.post("/api/voice-script")
async def generate_voice_script(request: VoiceScriptRequest):
    """Generate scripts for text-to-speech conversion."""
    
    duration_guide = {
        "short": "30-60 seconds",
        "medium": "1-3 minutes", 
        "long": "3-5 minutes"
    }
    
    prompt = f"Create a {request.style} voice script about '{request.topic}' that would take approximately {duration_guide.get(request.duration, '1-2 minutes')} to read aloud. Make it natural and engaging for {request.voice_type} voice."
    
    try:
        script = generate_response(prompt, temperature=0.7, max_length=800)
        
        return {
            "script": script,
            "topic": request.topic,
            "style": request.style,
            "duration": request.duration,
            "status": "success",
            "timestamp": time.time()
        }
        
    except Exception as e:
        logger.error(f"Voice script generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Website builder assistant endpoint
@app.post("/api/website-builder")
async def website_builder_assistant(description: str):
    """Generate website code based on description."""
    
    prompt = f"""Create a complete HTML page with embedded CSS and JavaScript based on this description: {description}

Requirements:
- Use modern, responsive design
- Include Tailwind CSS via CDN
- Add appropriate Font Awesome icons
- Make it mobile-friendly
- Include interactive elements where appropriate
- Use clean, semantic HTML

Provide the complete HTML code:"""
    
    try:
        code = generate_response(prompt, temperature=0.6, max_length=2048)
        
        return {
            "html_code": code,
            "description": description,
            "status": "success",
            "timestamp": time.time()
        }
        
    except Exception as e:
        logger.error(f"Website builder error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Start the server
if __name__ == "__main__":
    print("🚀 Starting ToolSlap Qwen API Server...")
    print("📍 Server will be available at: http://localhost:8001")
    print("📖 API Documentation: http://localhost:8001/docs")
    
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8001,
        reload=False,
        log_level="info"
    )
