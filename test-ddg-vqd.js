async function run() {
  const query = 'electromagnetic effect animated diagram labeled';
  const q = encodeURIComponent(query);
  const res = await fetch(`https://duckduckgo.com/?q=${q}&t=h_&iar=images&iax=images&ia=images`);
  const text = await res.text();
  const vqdMatch = text.match(/vqd=([\d-]+)/);
  if (!vqdMatch) return console.log('no vqd');
  const vqd = vqdMatch[1];
  const res2 = await fetch(`https://duckduckgo.com/i.js?l=us-en&o=json&q=${q}&vqd=${vqd}&f=,,,&p=1`);
  const json = await res2.json();
  console.log(json.results[0].image);
}
run();
