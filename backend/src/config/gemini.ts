import * as dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY not found in environment variables. Please check your .env file.');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
export const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
