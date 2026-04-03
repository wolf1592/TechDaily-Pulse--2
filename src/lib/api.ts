export const fetchArticles = async () => {
  const res = await fetch('/api/articles');
  if (!res.ok) throw new Error('Failed to fetch articles');
  return res.json();
};

export const fetchCategories = async () => {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
};

export const fetchVideos = async () => {
  const res = await fetch('/api/videos');
  if (!res.ok) throw new Error('Failed to fetch videos');
  return res.json();
};

export const fetchSettings = async () => {
  const res = await fetch('/api/settings');
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
};

export const fetchArticleById = async (id: string) => {
  const res = await fetch(`/api/articles/${id}`);
  if (!res.ok) throw new Error('Failed to fetch article');
  return res.json();
};

export const login = async (credentials: any) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
};

export const logout = async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
};
