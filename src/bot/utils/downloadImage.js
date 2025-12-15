const https = require("https");

async function downloadImageBuffer(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        const data = [];
        res.on("data", (chunk) => data.push(chunk));
        res.on("end", () => resolve(Buffer.concat(data)));
      })
      .on("error", reject);
  });
}

module.exports = downloadImageBuffer;




