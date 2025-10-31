const { Readable } = require('stream');

class DeepSeekProvider {
    static async validateApiKey(key) {
        if (!key || typeof key !== 'string' || !key.startsWith('sk-')) {
            return { success: false, error: 'Invalid DeepSeek API key format. API key should start with "sk-".' };
        }

        try {
            const response = await fetch('https://api.deepseek.com/v1/models', {
                headers: { 
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                return { success: true };
            } else {
                const errorData = await response.json().catch(() => ({}));
                const message = errorData.error?.message || `Validation failed with status: ${response.status}`;
                return { success: false, error: message };
            }
        } catch (error) {
            console.error(`[DeepSeekProvider] Network error during key validation:`, error);
            return { success: false, error: 'A network error occurred during validation.' };
        }
    }
}

/**
 * Creates a DeepSeek STT session
 * Note: DeepSeek doesn't have native real-time STT, so this is a placeholder
 * You might want to use a different STT service or implement a workaround
 * @param {object} opts - Configuration options
 * @param {string} opts.apiKey - DeepSeek API key
 * @param {string} [opts.language='en'] - Language code
 * @param {object} [opts.callbacks] - Event callbacks
 * @returns {Promise<object>} STT session placeholder
 */
async function createSTT({ apiKey, language = "en", callbacks = {}, ...config }) {
  console.warn("[DeepSeek] STT not natively supported. Consider using OpenAI or Gemini for STT.")

  // Return a mock STT session that doesn't actually do anything
  // You might want to fallback to another provider for STT
  return {
    sendRealtimeInput: async (audioData) => {
      console.warn("[DeepSeek] STT sendRealtimeInput called but not implemented")
    },
    close: async () => {
      console.log("[DeepSeek] STT session closed")
    },
  }
}

/**
 * Creates a DeepSeek LLM instance
 * @param {object} opts - Configuration options
 * @param {string} opts.apiKey - DeepSeek API key
 * @param {string} [opts.model='deepseek-chat'] - Model name
 * @param {number} [opts.temperature=0.7] - Temperature
 * @param {number} [opts.maxTokens=4096] - Max tokens
 * @returns {object} LLM instance
 */
function createLLM({ apiKey, model = "deepseek-chat", temperature = 0.7, maxTokens = 4096, ...config }) {
  const baseUrl = 'https://api.deepseek.com/v1';

  return {
    generateContent: async (parts) => {
      const messages = [];
      let systemPrompt = "";
      const userContent = [];

      for (const part of parts) {
        if (typeof part === "string") {
          if (systemPrompt === "" && part.includes("You are")) {
            systemPrompt = part;
          } else {
            userContent.push({ type: "text", text: part });
          }
        } else if (part.inlineData) {
          userContent.push({
            type: "image_url",
            image_url: { url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` }
          });
        }
      }

      if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
      if (userContent.length > 0) messages.push({ role: "user", content: userContent });

      try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: temperature,
            max_tokens: maxTokens,
            stream: false,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`DeepSeek API error: ${response.status} ${errorData.error?.message || response.statusText}`);
        }

        const result = await response.json();
        
        return {
          response: {
            text: () => result.choices[0].message.content
          },
          raw: result
        };
      } catch (error) {
        console.error("DeepSeek API error:", error);
        throw error;
      }
    },

    // For compatibility with chat-style interfaces
    chat: async (messages) => {
      try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: temperature,
            max_tokens: maxTokens,
            stream: false,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`DeepSeek API error: ${response.status} ${errorData.error?.message || response.statusText}`);
        }

        const result = await response.json();
        
        return {
          content: result.choices[0].message.content,
          raw: result
        };
      } catch (error) {
        console.error("DeepSeek chat error:", error);
        throw error;
      }
    },
  }
}

/**
 * Creates a DeepSeek streaming LLM instance
 * @param {object} opts - Configuration options
 * @param {string} opts.apiKey - DeepSeek API key
 * @param {string} [opts.model='deepseek-chat'] - Model name
 * @param {number} [opts.temperature=0.7] - Temperature
 * @param {number} [opts.maxTokens=4096] - Max tokens
 * @returns {object} Streaming LLM instance
 */
function createStreamingLLM({ apiKey, model = "deepseek-chat", temperature = 0.7, maxTokens = 4096, ...config }) {
  const baseUrl = 'https://api.deepseek.com/v1';

  return {
    streamChat: async (messages) => {
      console.log("[DeepSeek Provider] Starting streaming request");

      try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: temperature,
            max_tokens: maxTokens,
            stream: true,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`DeepSeek API error: ${response.status} ${errorData.error?.message || response.statusText}`);
        }

        console.log("[DeepSeek Provider] Got streaming response");

        // Create a ReadableStream to handle the streaming response
        const stream = new ReadableStream({
          async start(controller) {
            try {
              const reader = response.body.getReader();
              const decoder = new TextDecoder();
              let buffer = '';

              while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                  controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
                  controller.close();
                  console.log("[DeepSeek Provider] Streaming completed");
                  break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                  if (line.trim() === '') continue;
                  
                  if (line.startsWith('data: ')) {
                    const data = line.substring(6);
                    
                    if (data === '[DONE]') {
                      controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
                      controller.close();
                      return;
                    }

                    try {
                      const parsed = JSON.parse(data);
                      
                      if (parsed.choices && parsed.choices[0]?.delta?.content) {
                        const sseData = JSON.stringify({
                          choices: [{
                            delta: {
                              content: parsed.choices[0].delta.content
                            }
                          }]
                        });
                        controller.enqueue(new TextEncoder().encode(`data: ${sseData}\n\n`));
                      }
                    } catch (parseError) {
                      console.error('[DeepSeek Provider] Failed to parse SSE data:', parseError);
                    }
                  }
                }
              }
            } catch (error) {
              console.error('[DeepSeek Provider] Streaming error:', error);
              controller.error(error);
            }
          }
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
        
      } catch (error) {
        console.error('[DeepSeek Provider] Request error:', error);
        throw error;
      }
    }
  };
}

module.exports = {
    DeepSeekProvider,
    createSTT,
    createLLM,
    createStreamingLLM
};