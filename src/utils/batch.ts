import { BatchRequest, BatchResponse } from '../types/ai';
import { AI_LIMITS } from '../constants/ai';

// Batch processing system for AI requests
export const createBatchProcessor = (
  batchSize = AI_LIMITS.BATCH_SIZE,
  processingDelayMs = 100
) => {
  const queue: BatchRequest[] = [];
  const results = new Map<string, BatchResponse>();
  let isProcessing = false;
  
  const addRequest = (request: BatchRequest): Promise<BatchResponse> => {
    // Set initial status
    const response: BatchResponse = {
      id: request.id,
      status: 'pending',
    };
    results.set(request.id, response);
    
    // Add to queue with priority sorting
    queue.push(request);
    queue.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    // Start processing if not already running
    if (!isProcessing) {
      processQueue();
    }
    
    // Return a promise that resolves when the request is completed
    return new Promise((resolve, reject) => {
      const checkResult = () => {
        const result = results.get(request.id);
        if (result?.status === 'completed') {
          resolve(result);
        } else if (result?.status === 'failed') {
          reject(new Error(result.error));
        } else {
          setTimeout(checkResult, 100);
        }
      };
      checkResult();
    });
  };
  
  const processQueue = async (): Promise<void> => {
    if (isProcessing || queue.length === 0) return;
    
    isProcessing = true;
    
    while (queue.length > 0) {
      const batch = queue.splice(0, batchSize);
      
      // Process batch concurrently
      await Promise.allSettled(
        batch.map(async (request) => {
          const response = results.get(request.id)!;
          response.status = 'processing';
          response.startTime = Date.now();
          
          try {
            // This would be implemented by the specific processor
            const result = await processRequest(request);
            
            response.status = 'completed';
            response.result = result;
            response.endTime = Date.now();
          } catch (error) {
            response.status = 'failed';
            response.error = error instanceof Error ? error.message : String(error);
            response.endTime = Date.now();
          }
        })
      );
      
      // Add delay between batches to avoid overwhelming the service
      if (queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, processingDelayMs));
      }
    }
    
    isProcessing = false;
  };
  
  // This would be injected by the AI service
  const processRequest = async (request: BatchRequest): Promise<string> => {
    throw new Error('processRequest function must be injected');
  };
  
  const getStatus = (id: string): BatchResponse | undefined => {
    return results.get(id);
  };
  
  const getAllStatuses = (): BatchResponse[] => {
    return Array.from(results.values());
  };
  
  const clearCompleted = (): void => {
    for (const [id, response] of results.entries()) {
      if (response.status === 'completed' || response.status === 'failed') {
        results.delete(id);
      }
    }
  };
  
  const getQueueSize = (): number => {
    return queue.length;
  };
  
  return {
    addRequest,
    getStatus,
    getAllStatuses,
    clearCompleted,
    getQueueSize,
    setProcessor: (processor: (request: BatchRequest) => Promise<string>) => {
      // Allow injection of the actual processing function
      Object.assign(processRequest, processor);
    },
  };
};

// Global batch processor
export const globalBatchProcessor = createBatchProcessor();
