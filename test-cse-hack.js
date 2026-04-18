async function testCse() {
  const cx = 'd0e56bc43e260406a';
  const jsRes = await fetch(`https://cse.google.com/cse.js?cx=${cx}`);
  const js = await jsRes.text();
  const match = js.match(/"cse_token":\s*"([^"]+)"/);
  if (match) {
    const tok = match[1];
    const url = `https://cse.google.com/cse/element/v1?rsz=filtered_cse&num=1&hl=en&source=gcsc&gss=.com&cx=${cx}&q=test+animated+labeled&safe=active&cse_tok=${tok}&callback=test`;
    const res = await fetch(url);
    const text = await res.text();
    console.log(text.substring(0, 500));
  } else {
    console.log("No token found");
  }
}
testCse();
