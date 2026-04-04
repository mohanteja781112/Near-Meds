import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import puppeteer from 'puppeteer';
import MedicalReport from '../models/MedicalReport.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isGroq = process.env.OPENAI_API_KEY?.startsWith('gsk_');
const isGrok = process.env.OPENAI_API_KEY?.startsWith('xai-');

const getBaseURL = () => {
  if (isGroq) return 'https://api.groq.com/openai/v1';
  if (isGrok) return 'https://api.xai.com/v1';
  return undefined; 
};

const getDefaultModel = () => {
  if (isGroq) return 'llama-3.3-70b-versatile';
  if (isGrok) return 'grok-beta';
  return 'gpt-4o'; 
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: getBaseURL()
});


export const handleChat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages are required and must be an array.' });
    }

    const systemPrompt = {
      role: 'system',
      content: `You are a calm, highly professional AI medical assistant for "NearMeds".
      
      CRITICAL: You must ALWAYS respond in valid JSON format only.
      
      Response Logic:
      - If the user describes physical symptoms, provides health data, or asks for a report/PDF:
        1. Set "report_ready" to true.
        2. Analyze symptoms carefully.
        3. Fill the "structured_report" object with detailed medical-grade summaries.
      - Otherwise, set "report_ready" to false and "structured_report" to null.
      
      Required JSON Schema:
      {
        "chat_reply": "Friendly response to the user's message here...",
        "report_ready": boolean,
        "structured_report": {
          "patient_summary": "Detailed summary of user symptoms...",
          "possible_conditions": "List of possibilities (always emphasize these are not diagnoses)...",
          "urgency_level": "Low | Moderate | High | Critical",
          "recommendations": "Actionable advice (e.g., rest, hydrate)...",
          "precautions": "What to avoid...",
          "when_to_seek_immediate_care": "Specific red flags...",
          "disclaimer": "This AI-generated report is for information only and is NOT medical advice."
        }
      }
      
      Safety Guidelines:
      - Never give definitive diagnoses.
      - Always recommend professional consultation.
      - If life-threatening (e.g. chest pain), prioritize urgency call instructions in chat_reply.
      
      About NearMeds:
      - Built by: Mohan Teja (Visionary Developer).
      - Purpose: NearMeds is an advanced healthcare emergency assistant designed to save lives by providing instant medical guidance, and resource location (hospitals/pharmacies), symptom analysis and preparing a concise medical report ehich will be helpful for doctors to review easily.
      - Core Utility: It bridges the gap between patient and professional care by offering 24/7 AI-driven support, professional medical report generation, and emergency service integration.`
    };

    const completion = await openai.chat.completions.create({
      model: getDefaultModel(),
      messages: [systemPrompt, ...messages.map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text
      }))],
      max_tokens: 1000,
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);

    res.json(aiResponse);
  } catch (error) {
    console.error('AI API Error:', error);
    const errorMessage = error.response?.data?.error?.message || error.message || 'AI service unavailable';
    res.status(500).json({ error: errorMessage });
  }
};

export const generateReport = async (req, res) => {
  try {
    const { report } = req.body;

    if (!report) {
      return res.status(400).json({ error: 'Report data is required.' });
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Helvetica', sans-serif; color: #1a202c; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0072FF; padding-bottom: 20px; }
        .logo { color: #0072FF; font-size: 24px; font-weight: bold; }
        .report-meta { text-align: right; font-size: 12px; color: #718096; }
        .section { margin-top: 30px; }
        .section-title { font-size: 16px; font-weight: bold; color: #2d3748; border-left: 4px solid #00C6FF; padding-left: 10px; margin-bottom: 10px; }
        .content { font-size: 14px; line-height: 1.6; color: #4a5568; }
        .urgency { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .urgency-low { background: #EBF8FF; color: #3182CE; }
        .urgency-moderate { background: #FEF3C7; color: #92400E; }
        .urgency-high { background: #FEEBC8; color: #C05621; }
        .urgency-critical { background: #FFF5F5; color: #C53030; }
        .disclaimer { margin-top: 50px; padding: 20px; background: #F7FAFC; border: 1px solid #E2E8F0; font-size: 11px; color: #718096; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">NearMeds AI</div>
        <div class="report-meta">
          <div>Report ID: NM-${Date.now().toString().slice(-6)}</div>
          <div>Generated: ${new Date().toLocaleString()}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Patient Symptom Summary</div>
        <div class="content">${report.patient_summary}</div>
      </div>

      <div class="section">
        <div class="section-title">Urgency Level</div>
        <div class="urgency urgency-${report.urgency_level.toLowerCase()}">${report.urgency_level}</div>
      </div>

      <div class="section">
        <div class="section-title">Possible Conditions</div>
        <div class="content">${report.possible_conditions}</div>
      </div>

      <div class="section">
        <div class="section-title">Recommendations & Care</div>
        <div class="content">${report.recommendations}</div>
      </div>

      <div class="section">
        <div class="section-title">Precautions</div>
        <div class="content">${report.precautions}</div>
      </div>

      <div class="section">
        <div class="section-title">When to Seek Immediate Care</div>
        <div class="content">${report.when_to_seek_immediate_care}</div>
      </div>

      <div class="disclaimer">
        <strong>MEDICAL DISCLAIMER:</strong> ${report.disclaimer}
        This tool is intended for personal health awareness and is not a clinical judgment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
      </div>
    </body>
    </html>
    `;

    const browser = await puppeteer.launch({ 
      headless: "new", 
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ 
      format: 'A4', 
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });
    await browser.close();

    console.log(`Generated PDF successfully. Size: ${pdfBuffer.length} bytes`);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=medical-report.pdf');
    res.end(pdfBuffer, 'binary');
  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate medical report. Please try again later.' });
  }
};

export const saveReport = async (req, res) => {
  try {
    const { report } = req.body;
    
    if (!report) {
      return res.status(400).json({ error: 'Report data is required.' });
    }

    const safeString = (val) => {
      if (typeof val === 'string') return val;
      if (!val) return "Not provided";
      return JSON.stringify(val);
    };

    const newReport = await MedicalReport.create({
      userId: req.user.id,
      patient_summary: safeString(report.patient_summary),
      possible_conditions: safeString(report.possible_conditions),
      urgency_level: safeString(report.urgency_level),
      recommendations: safeString(report.recommendations),
      precautions: safeString(report.precautions),
      when_to_seek_immediate_care: safeString(report.when_to_seek_immediate_care),
      disclaimer: safeString(report.disclaimer),
    });

    res.status(201).json({ message: 'Report saved successfully', report: newReport });
  } catch (error) {
    console.error('Save Report Error:', error);
    res.status(500).json({ error: 'Failed to save medical report' });
  }
};
