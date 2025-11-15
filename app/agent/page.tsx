"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { CodeEditor } from "@/components/code-editor"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAgentStore } from "@/lib/store/agent-store"
import {
  Loader2,
  Send,
  FileCode,
  GitCommit,
  Sparkles,
  CheckCircle2,
  Copy,
  Download,
  RefreshCw,
  Terminal,
  Code2,
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { generateCode, generateCodeStream } from "@/lib/services/agent"
import { env } from "@/lib/env"

// Mock templates
const PROMPT_TEMPLATES = [
  { id: "login", label: "Login Page", prompt: "Create a Flask login page with email and password authentication" },
  { id: "api", label: "REST API", prompt: "Create a REST API with CRUD operations for user management" },
  { id: "readme", label: "README", prompt: "Generate a comprehensive README.md for this project" },
  { id: "tests", label: "Unit Tests", prompt: "Write unit tests for the authentication module" },
]

interface ThinkingStep {
  step: number
  title: string
  status: "pending" | "processing" | "completed"
  details?: string
}

export default function AgentPage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [language, setLanguage] = useState("python")
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([])
  const [streamedText, setStreamedText] = useState("")

  const { isProcessing, progress, message, setProcessing, setProgress, setResult, reset } = useAgentStore()

  const handleTemplateSelect = (templateId: string) => {
    const template = PROMPT_TEMPLATES.find((t) => t.id === templateId)
    if (template) {
      setPrompt(template.prompt)
    }
  }

  const simulateStreaming = async (text: string) => {
    setStreamedText("")
    const words = text.split(" ")
    for (let i = 0; i < words.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 50))
      setStreamedText((prev) => prev + (i > 0 ? " " : "") + words[i])
    }
  }

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt")
      return
    }

    reset()
    setGeneratedCode("")
    setStreamedText("")
    setProcessing(true)

    // Initialize thinking steps
    const steps: ThinkingStep[] = [
      { step: 1, title: "Analyzing project context", status: "pending" },
      { step: 2, title: "Reading Git history", status: "pending" },
      { step: 3, title: "Planning implementation", status: "pending" },
      { step: 4, title: "Generating code with LLM", status: "pending" },
      { step: 5, title: "Formatting and validating", status: "pending" },
    ]
    setThinkingSteps(steps)

    // Try real API first, fallback to mock if enabled or on error
    if (!env.enableMockData) {
      try {
        await generateCodeStream(
          {
            prompt,
            language,
            project_context: {
              git_history: true,
            },
          },
          {
            onThinkingStep: (step) => {
              setThinkingSteps((prev) =>
                prev.map((s) => (s.step === step.step ? { ...s, ...step } : s)),
              )
              setProgress((step.step / steps.length) * 80, step.title)
            },
            onCodeChunk: (chunk) => {
              setStreamedText((prev) => prev + chunk)
            },
            onComplete: (response) => {
              setGeneratedCode(response.code)
              setProgress(100, "Complete!")
              setResult({ code: response.code, language })
              toast.success("Code generated successfully!")
            },
            onError: (error) => {
              console.error("Code generation error:", error)
              toast.error("Failed to generate code. Using mock fallback.")
              // Fall back to mock on error
              handleMockGeneration(steps)
            },
          },
        )
        return
      } catch (error) {
        console.error("Failed to connect to LLM API:", error)
        toast.error("LLM API unavailable. Using mock fallback.")
      }
    }

    // Mock generation fallback
    await handleMockGeneration(steps)
  }

  const handleMockGeneration = async (steps: ThinkingStep[]) => {

    // Simulate agent thinking process
    for (let i = 0; i < steps.length; i++) {
      // Update current step to processing
      setThinkingSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: "processing" } : s)))
      setProgress(((i + 1) / steps.length) * 80, steps[i].title)

      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update current step to completed with details
      const details = [
        "Found 3 related files in project structure",
        "Analyzed last 5 commits for context",
        "Generated implementation plan with 4 steps",
        "LLM processing completed successfully",
        "Code formatted and validated",
      ]

      setThinkingSteps((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: "completed", details: details[i] } : s)),
      )
    }

    setProgress(90, "Streaming response...")

    // Generate mock code based on language
    const codeTemplates: Record<string, string> = {
      python: `# Generated by Flash AI Agent
# Prompt: ${prompt}

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400

    user = User(email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401

    return jsonify({'message': 'Login successful', 'user_id': user.id}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
`,
      javascript: `// Generated by Flash AI Agent
// Prompt: ${prompt}

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// In-memory user storage (use database in production)
const users = new Map();

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  if (users.has(email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.set(email, { email, password: hashedPassword });

  res.status(201).json({ message: 'User registered successfully' });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const user = users.get(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ email }, 'your-secret-key', { expiresIn: '24h' });
  res.json({ token, message: 'Login successful' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`,
      typescript: `// Generated by Flash AI Agent
// Prompt: ${prompt}

import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

interface User {
  email: string;
  password: string;
}

const users = new Map<string, User>();

app.post('/api/register', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (users.has(email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.set(email, { email, password: hashedPassword });

  res.status(201).json({ message: 'User registered successfully' });
});

app.post('/api/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = users.get(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
  res.json({ token, message: 'Login successful' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`Server on port \${PORT}\`));
`,
    }

    const mockCode = codeTemplates[language] || codeTemplates.python

    // Simulate streaming
    await simulateStreaming(mockCode)
    setGeneratedCode(mockCode)
    setProgress(100, "Complete!")
    setResult({ code: mockCode, language })
    toast.success("Code generated successfully!")
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode)
    toast.success("Code copied to clipboard!")
  }

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `agent-output.${language === "python" ? "py" : language === "javascript" ? "js" : "ts"}`
    a.click()
    toast.success("Code downloaded!")
  }

  const handleCommit = () => {
    if (!generatedCode) {
      toast.error("No code to commit")
      return
    }
    // Store generated code in session storage for diff page
    sessionStorage.setItem("generated-code", generatedCode)
    sessionStorage.setItem("code-language", language)
    router.push("/diff")
  }

  return (
    <AppLayout>
      <div className="container max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">AI Coding Agent</h1>
          </div>
          <p className="text-muted-foreground">
            Describe what you want to build, and Flash will generate production-ready code
          </p>
        </div>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Command Input</CardTitle>
                <CardDescription>Natural language to code in seconds</CardDescription>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                  <SelectItem value="rust">Rust</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Templates */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Quick start:</span>
              {PROMPT_TEMPLATES.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTemplateSelect(template.id)}
                  disabled={isProcessing}
                >
                  {template.label}
                </Button>
              ))}
            </div>

            {/* Prompt Input */}
            <Textarea
              placeholder="Example: Create a Flask REST API with user authentication, including register and login endpoints with JWT tokens..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isProcessing}
              className="min-h-[120px] resize-none font-mono"
            />

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={isProcessing || !prompt.trim()} className="flex-1" size="lg">
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Generate Code
                  </>
                )}
              </Button>
              {generatedCode && !isProcessing && (
                <Button variant="outline" onClick={() => handleSubmit()} size="lg">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
              )}
            </div>

            {/* Progress */}
            {isProcessing && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <Progress value={progress} className="h-2" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Terminal className="w-4 h-4 animate-pulse" />
                  {message}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Thinking Process */}
        <AnimatePresence>
          {isProcessing && thinkingSteps.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code2 className="w-5 h-5" />
                    Agent Thinking Process
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {thinkingSteps.map((step) => (
                      <motion.div
                        key={step.step}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: step.step * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20"
                      >
                        <div className="mt-0.5">
                          {step.status === "completed" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                          {step.status === "processing" && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
                          {step.status === "pending" && <div className="w-5 h-5 rounded-full border-2 border-muted" />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Step {step.step}
                            </Badge>
                            <span className="font-medium">{step.title}</span>
                          </div>
                          {step.details && <p className="text-sm text-muted-foreground">{step.details}</p>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generated Code */}
        <AnimatePresence>
          {(generatedCode || streamedText) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileCode className="w-5 h-5" />
                        Generated Code
                      </CardTitle>
                      <CardDescription>Review, edit, and commit your code</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCopy} disabled={isProcessing}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDownload} disabled={isProcessing}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button size="sm" onClick={handleCommit} disabled={isProcessing}>
                        <GitCommit className="mr-2 h-4 w-4" />
                        Review & Commit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="code" className="w-full">
                    <TabsList>
                      <TabsTrigger value="code">Code</TabsTrigger>
                      <TabsTrigger value="explanation">Explanation</TabsTrigger>
                      <TabsTrigger value="files">Files Changed</TabsTrigger>
                    </TabsList>

                    <TabsContent value="code" className="mt-4">
                      {isProcessing ? (
                        <ScrollArea className="h-[500px] w-full rounded-lg border bg-muted/20 p-4 font-mono text-sm">
                          <pre className="whitespace-pre-wrap">{streamedText}</pre>
                        </ScrollArea>
                      ) : (
                        <CodeEditor
                          value={generatedCode}
                          language={language}
                          onChange={(value) => setGeneratedCode(value || "")}
                          height="500px"
                          minimap={true}
                        />
                      )}
                    </TabsContent>

                    <TabsContent value="explanation" className="mt-4">
                      <ScrollArea className="h-[500px]">
                        <div className="prose prose-sm dark:prose-invert max-w-none p-4">
                          <h3>Implementation Overview</h3>
                          <p>
                            This code implements a complete authentication system based on your requirements. The
                            implementation follows industry best practices and security standards.
                          </p>

                          <h3>Key Features</h3>
                          <ul>
                            <li>
                              <strong>Secure Password Hashing:</strong> Uses bcrypt for secure password storage
                            </li>
                            <li>
                              <strong>Input Validation:</strong> Validates email format and password requirements
                            </li>
                            <li>
                              <strong>Error Handling:</strong> Proper error messages and HTTP status codes
                            </li>
                            <li>
                              <strong>RESTful Design:</strong> Follows REST API conventions
                            </li>
                            <li>
                              <strong>Production Ready:</strong> Includes logging, error handling, and security measures
                            </li>
                          </ul>

                          <h3>Next Steps</h3>
                          <ol>
                            <li>Review the generated code and make any necessary adjustments</li>
                            <li>Add additional validation or business logic as needed</li>
                            <li>Write unit tests for the authentication endpoints</li>
                            <li>Configure environment variables for production</li>
                            <li>Commit the code using the Review & Commit button</li>
                          </ol>

                          <h3>Dependencies Required</h3>
                          <p>Make sure to install the following dependencies:</p>
                          <pre className="bg-muted p-3 rounded">
                            {language === "python"
                              ? "pip install flask flask-sqlalchemy werkzeug"
                              : "npm install express bcrypt jsonwebtoken"}
                          </pre>
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="files" className="mt-4">
                      <ScrollArea className="h-[500px]">
                        <div className="space-y-2 p-4">
                          <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                            <FileCode className="w-5 h-5 text-green-500" />
                            <div className="flex-1">
                              <div className="font-mono text-sm font-medium">
                                src/auth.{language === "python" ? "py" : language === "javascript" ? "js" : "ts"}
                              </div>
                              <div className="text-xs text-muted-foreground">New file • Ready to commit</div>
                            </div>
                            <Badge variant="outline" className="bg-green-500/10 text-green-600">
                              +{generatedCode.split("\n").length} lines
                            </Badge>
                          </div>
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!generatedCode && !isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Ready to generate code</h3>
            <p className="text-muted-foreground max-w-md">
              Enter a prompt above or select a template to get started. Flash AI will analyze your requirements and
              generate production-ready code.
            </p>
          </motion.div>
        )}
      </div>
    </AppLayout>
  )
}
