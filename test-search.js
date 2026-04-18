const cx = "d0e56bc43e260406a";
const apiKey = "AIzaSyAzwBFjf6Yla2Td9ngor9jTFjBiv36IMGU"; // Using YouTube API Key to see if it has access
const query = encodeURIComponent("photosynthesis animated labeled diagram educational");
const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${query}&searchType=image&num=1`;

fetch(url)
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error(err));
