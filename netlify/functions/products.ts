import { Handler } from '@netlify/functions';
import { getProducts, getProductById } from '../../src/api/products';

export const handler: Handler = async (event) => {
  try {
    // Enable CORS
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    // Handle OPTIONS request (CORS preflight)
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 204,
        headers
      };
    }

    if (event.httpMethod === 'GET') {
      const productId = event.queryStringParameters?.id;
      
      if (productId) {
        const result = await getProductById(productId);
        if (!result.success) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: result.error })
          };
        }
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result.data)
        };
      } else {
        const result = await getProducts();
        if (!result.success) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: result.error })
          };
        }
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result.data)
        };
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};