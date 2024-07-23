const net = require("net");
const fs = require("fs");
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();
    // so to get the path we just need to split the string with space delimeter and it will return an array
    const url = request.split(" ")[1];
    const method = request.split(" ")[0];
    const httpversion = request.split(" ")[2];
    if (url == "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (url.startsWith("/echo/")) {
      const content = url.split("/echo/")[1];
      console.log(content);
      const headers = request.split("\r\n");
      const AcceptEncoding = headers.find((header) =>
        header.startsWith("Accept-Encoding:")
      );
      const AcceptEncodingtype = AcceptEncoding
        ? AcceptEncoding.split(":")
        : null;

      const AcceptEncodingtypes = AcceptEncodingtype[1].split(",");
      var ContentEncoding = "";
      if (AcceptEncodingtypes.includes("gzip")) {
        ContentEncoding = "Content-Encoding: gzip";
      }
      console.log(AcceptEncoding);
      socket.write(
        `HTTP/1.1 200 OK\r\n` +
          `Content-Type: text/plain\r\n` +
          `Content-Length: ${content.length}\r\n` +
          `${ContentEncoding ? ContentEncoding + "\r\n" : ""}` +
          `\r\n` +
          `${content}`
      );
    } else if (url.includes("/user-agent")) {
      const headers = request.split("\r\n");
      const userAgentHeader = headers.find((header) =>
        header.startsWith("User-Agent:")
      );
      const userAgent = userAgentHeader ? userAgentHeader.split(": ")[1] : null;
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`
      );
    } else if (url.startsWith("/files/") && method === "GET") {
      const directory = process.argv[3];
      const filename = url.split("/files/")[1];
      if (fs.existsSync(`${directory}/${filename}`)) {
        const content = fs.readFileSync(`${directory}/${filename}`).toString();
        const res =
          `HTTP/1.1 200 OK\r\n` +
          `Content-Type: application/octet-stream\r\n` +
          `Content-Length: ${content.length}\r\n` +
          `\r\n` + // Blank line between headers and body
          `${content}`;
        socket.write(res);
      } else {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      }
    } else if (url.startsWith("/files/") && method === "POST") {
      const filename = process.argv[3] + "/" + url.substring(7);
      const req = data.toString().split("\r\n");
      const body = req[req.length - 1];
      fs.writeFileSync(filename, body);
      socket.write(`HTTP/1.1 201 Created\r\n\r\n`);
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }

    socket.end();
  });
  socket.on("close", (data) => {
    console.log(data);
    socket.end();
  });
});

server.listen(4221, "localhost");
