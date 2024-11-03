import { supabase } from '../lib/supabase';

export async function getProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the products to include full image URLs
    const productsWithImageUrls = data?.map(product => ({
      ...product,
      images: product.images.map(imagePath => 
        supabase.storage.from('product-images').getPublicUrl(imagePath).data.publicUrl
      )
    })) || [];

    return {
      success: true,
      data: productsWithImageUrls,
      error: null
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error.message
    };
  }
}

export async function getProductById(id: string) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Product not found');

    // Transform the product to include full image URLs
    const productWithImageUrls = {
      ...data,
      images: data.images.map(imagePath => 
        supabase.storage.from('product-images').getPublicUrl(imagePath).data.publicUrl
      )
    };

    return {
      success: true,
      data: productWithImageUrls,
      error: null
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error.message
    };
  }
}