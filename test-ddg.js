async function testDDG() {
  const query = "electromagnetic effect animated labeled diagram";
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
  });
  const html = await res.text();
  const imgMatches = [...html.matchAll(/<img[^>]+src="([^">]+)"/ig)];
  console.log("Found matches:", imgMatches.length);
  imgMatches.slice(0, 5).forEach(m => console.log(m[1]));
}
testDDG();
