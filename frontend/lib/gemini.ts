import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize with a default value if API key is missing
let genAI: any = null;

if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('Google Generative AI initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Google Generative AI:', error);
  }
} else {
  console.warn('GEMINI_API_KEY is not defined in environment variables');
}

export const getGeminiResponse = async (
  prompt: string,
  context: string = ''
): Promise<string> => {
  // Check if API key is available
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not defined, returning fallback response');
    return "I'm sorry, but the AI assistant is currently unavailable. Please make sure you have configured a valid Gemini API key in your environment variables.";
  }
  
  try {
    console.log('Initializing Gemini model...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
    console.log('Sending request to Gemini API...');
    
    const result = await model.generateContent(fullPrompt);
    console.log('Received response from Gemini API');
    
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Detailed Gemini API Error:', {
      message: error.message,
      stack: error.stack,
      details: error
    });
    
    // Return a user-friendly message instead of throwing an error
    return "I'm sorry, but I encountered an error while processing your request. The AI service might be temporarily unavailable.";
  }
};
