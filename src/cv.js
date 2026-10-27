const toBlob = async (url) => {
  if (url.startsWith('data:')) {
    const [head, b64] = url.split(',');
    const mime = (head.match(/data:([^;]+)/) || [])[1] || 'application/pdf';
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }
  return (await fetch(url)).blob();
};

// No site publicado, o link comum baixa o PDF normalmente.
// Dentro da prévia do Claude o navegador bloqueia downloads comuns; ali usamos o recurso de download da própria prévia.
export function handleCvClick(event, url, filename) {
  const host = typeof window !== 'undefined' ? window.claude : undefined;
  if (!host || typeof host.use !== 'function') return;
  event.preventDefault();
  (async () => {
    try {
      const downloads = await host.use('downloads');
      if (downloads) {
        await downloads.save({ filename, data: await toBlob(url) });
        return;
      }
    } catch (err) {
      if (err && err.code === 'declined') return;
    }
    window.open(url, '_blank');
  })();
}
