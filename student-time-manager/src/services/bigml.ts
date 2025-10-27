export async function listBigML(type: string): Promise<any> {
  const res = await fetch(`/api/bigml/list?type=${encodeURIComponent(type)}`);
  if (!res.ok) throw new Error(`BigML list failed: ${res.status}`);
  return res.json();
}

