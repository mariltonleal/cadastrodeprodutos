import { Request, Response } from 'express';
import { getProducts, getProductById } from '../../api/products';

export default async function handler(req: Request, res: Response) {
  try {
    if (req.method === 'GET') {
      const productId = req.query.id as string;
      
      if (productId) {
        // Get single product
        const result = await getProductById(productId);
        if (!result.success) {
          return res.status(404).json({ error: result.error });
        }
        return res.status(200).json(result.data);
      } else {
        // Get all products
        const result = await getProducts();
        if (!result.success) {
          return res.status(500).json({ error: result.error });
        }
        return res.status(200).json(result.data);
      }
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}