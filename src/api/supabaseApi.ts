import { supabase } from '../lib/supabase';

// URL base da API do Supabase
const SUPABASE_URL = 'https://bjhjdrzcaufvhoscobyk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqaGpkcnpjYXVmdmhvc2NvYnlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2NTEyOTksImV4cCI6MjA0NjIyNzI5OX0.yVXTEjYHNDQrwV6dQd05alSJRZYCa9_AX3BnYyoskeU';

// Função para buscar todos os produtos
export async function fetchProductsDirectly() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  
  return response.json();
}

// Função para buscar um produto específico
export async function fetchProductByIdDirectly(id: string) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch product');
  }
  
  const products = await response.json();
  return products[0];
}

// Função para buscar produtos com filtros
export async function searchProducts(query: string) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/products?or=(name.ilike.%25${encodeURIComponent(query)}%25,description.ilike.%25${encodeURIComponent(query)}%25)`, 
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to search products');
  }
  
  return response.json();
}

// Função para buscar produtos com ordenação
export async function fetchProductsSorted(column: string, ascending: boolean = true) {
  const order = ascending ? 'asc' : 'desc';
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/products?order=${column}.${order}`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch sorted products');
  }
  
  return response.json();
}

// Função para buscar produtos com paginação
export async function fetchProductsPaginated(page: number, pageSize: number) {
  const start = page * pageSize;
  const end = start + pageSize - 1;
  
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Range': `${start}-${end}`
      }
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch paginated products');
  }
  
  return {
    data: await response.json(),
    total: response.headers.get('content-range')?.split('/')[1]
  };
}</content></file>
</boltArtifact>

Exemplo de uso:
```typescript
// Buscar todos os produtos
const products = await fetchProductsDirectly();

// Buscar um produto específico
const product = await fetchProductByIdDirectly('123');

// Buscar produtos com filtro de texto
const searchResults = await searchProducts('tênis');

// Buscar produtos ordenados por preço
const sortedProducts = await fetchProductsSorted('price', false); // descendente

// Buscar produtos com paginação
const { data, total } = await fetchProductsPaginated(0, 10); // primeira página, 10 itens por página
```

2. Usando o cliente Supabase (recomendado):
```typescript
<boltArtifact id="supabase-client-api" title="Supabase Client API Access">
<boltAction type="file" filePath="src/api/supabaseClientApi.ts">import { supabase } from '../lib/supabase';

// Função para buscar todos os produtos
export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Função para buscar um produto específico
export async function fetchProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// Função para buscar produtos com filtros
export async function searchProducts(query: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Função para buscar produtos com filtros avançados
export async function searchProductsAdvanced({
  query = '',
  minPrice,
  maxPrice,
  sortBy = 'created_at',
  sortOrder = 'desc',
  page = 0,
  pageSize = 10
}: {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}) {
  let query_builder = supabase
    .from('products')
    .select('*', { count: 'exact' });

  // Aplicar filtro de texto
  if (query) {
    query_builder = query_builder.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
  }

  // Aplicar filtro de preço
  if (minPrice !== undefined) {
    query_builder = query_builder.gte('price', minPrice);
  }
  if (maxPrice !== undefined) {
    query_builder = query_builder.lte('price', maxPrice);
  }

  // Aplicar ordenação
  query_builder = query_builder.order(sortBy, { ascending: sortOrder === 'asc' });

  // Aplicar paginação
  const start = page * pageSize;
  query_builder = query_builder.range(start, start + pageSize - 1);

  const { data, error, count } = await query_builder;

  if (error) throw error;
  return { data, total: count };
}</content></file>
</boltArtifact>

Exemplo de uso do cliente Supabase:
```typescript
// Buscar todos os produtos
const products = await fetchProducts();

// Buscar um produto específico
const product = await fetchProductById('123');

// Buscar produtos com filtro de texto
const searchResults = await searchProducts('tênis');

// Buscar produtos com filtros avançados
const { data, total } = await searchProductsAdvanced({
  query: 'tênis',
  minPrice: 100,
  maxPrice: 500,
  sortBy: 'price',
  sortOrder: 'desc',
  page: 0,
  pageSize: 10
});
```

A segunda abordagem (usando o cliente Supabase) é recomendada porque:
1. Oferece uma API mais limpa e tipada
2. Gerencia automaticamente tokens e autenticação
3. Fornece proteção contra SQL injection
4. Facilita o desenvolvimento com autocompletion
5. Mantém consistência com o resto do código

Você pode usar qualquer uma das funções acima para fazer buscas diretas no Supabase, dependendo da sua necessidad