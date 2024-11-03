import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
}

interface ProductListProps {
  onEdit: (product: Product) => void;
}

export default function ProductList({ onEdit }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const productsWithImageUrls = data?.map(product => ({
        ...product,
        images: product.images.map(imagePath => 
          supabase.storage.from('product-images').getPublicUrl(imagePath).data.publicUrl
        )
      })) || [];

      setProducts(productsWithImageUrls);
    } catch (error: any) {
      toast.error('Erro ao carregar produtos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      // Primeiro, buscar o produto para obter os caminhos das imagens
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('images')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Excluir as imagens do storage
      if (product && product.images && product.images.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('product-images')
          .remove(product.images);

        if (storageError) {
          console.error('Erro ao excluir imagens:', storageError);
          // Continua com a exclusão do produto mesmo se houver erro ao excluir imagens
        }
      }

      // Excluir o produto
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      toast.success('Produto excluído com sucesso!');
      fetchProducts();
    } catch (error: any) {
      toast.error('Erro ao excluir produto: ' + error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <div>Carregando produtos...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          {product.images[0] && (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4">
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-gray-600 mt-1">{product.description}</p>
            <p className="text-indigo-600 font-semibold mt-2">
              R$ {product.price.toFixed(2)}
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => onEdit(product)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}