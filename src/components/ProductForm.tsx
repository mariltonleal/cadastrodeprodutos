import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Save, Upload } from 'lucide-react';

interface ProductFormProps {
  onSuccess?: () => void;
  initialData?: {
    id?: number;
    name: string;
    description: string;
    price: number;
    images: string[];
  };
}

export default function ProductForm({ onSuccess, initialData }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    images: initialData?.images || [],
  });
  const [previewImages, setPreviewImages] = useState<string[]>(
    initialData?.images || []
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Usuário não autenticado');

      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        
        // Get the public URL for preview
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(data.path);

        return {
          path: data.path,
          url: publicUrl
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages.map(img => img.path)],
      }));
      
      setPreviewImages(prev => [...prev, ...uploadedImages.map(img => img.url)]);
      
      toast.success('Imagens enviadas com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao enviar imagens: ' + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Usuário não autenticado');

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price.toString()),
        images: formData.images,
        user_id: user.id,
      };

      const { error } = initialData?.id
        ? await supabase
            .from('products')
            .update(productData)
            .eq('id', initialData.id)
        : await supabase
            .from('products')
            .insert([productData]);

      if (error) throw error;

      toast.success(
        initialData?.id
          ? 'Produto atualizado com sucesso!'
          : 'Produto cadastrado com sucesso!'
      );
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Erro ao salvar produto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nome do Produto
        </label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Descrição
        </label>
        <textarea
          required
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Preço (R$)
        </label>
        <input
          type="number"
          step="0.01"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Imagens
        </label>
        <div className="mt-1 flex items-center">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Upload className="w-4 h-4 mr-2" />
            Enviar Imagens
          </label>
        </div>
        {previewImages.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {previewImages.map((imageUrl, index) => (
              <img
                key={index}
                src={imageUrl}
                alt={`Produto ${index + 1}`}
                className="h-24 w-24 object-cover rounded-md"
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? (
            'Salvando...'
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {initialData?.id ? 'Atualizar Produto' : 'Cadastrar Produto'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}