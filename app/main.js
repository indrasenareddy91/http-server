const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    console.log(data);
    const request = data.toString();
    console.log(request);
    // so to get the path we just need to split the string with space delimeter and it will return an array
    const path = request.split(" ")[1];
    const status = path === "/" ? "200 OK" : "400 Not Found";
    socket.write(`HTTP/1.1 ${status}\r\n\r\n`);
  });
  socket.on("close", (data) => {
    console.log(data);
    socket.end();
    socket.close();
  });
});

server.listen(4221, "localhost");
