const http = require("http");
const url = require("url");

let students = [];

// email validation
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// send JSON response
function sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {

    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    // GET /students
    if (method === "GET" && path === "/students") {
        return sendResponse(res, 200, { success: true, data: students });
    }

    // GET /students/:id
    if (method === "GET" && path.startsWith("/students/")) {
        const id = path.split("/")[2];

        const student = students.find(s => s.id === id);

        if (!student) {
            return sendResponse(res, 404, { success: false, message: "Student not found" });
        }

        return sendResponse(res, 200, { success: true, data: student });
    }

    // POST /students
    if (method === "POST" && path === "/students") {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {

            const data = JSON.parse(body);

            if (!data.name || !data.email || !data.course || !data.year) {
                return sendResponse(res, 400, { success: false, message: "All fields required" });
            }

            if (!isValidEmail(data.email)) {
                return sendResponse(res, 400, { success: false, message: "Invalid email" });
            }

            if (data.year < 1 || data.year > 4) {
                return sendResponse(res, 400, { success: false, message: "Year must be 1-4" });
            }

            const student = {
                id: Date.now().toString(),
                name: data.name,
                email: data.email,
                course: data.course,
                year: data.year
            };

            students.push(student);

            sendResponse(res, 201, { success: true, data: student });

        });
    }

    // PUT /students/:id
    else if (method === "PUT" && path.startsWith("/students/")) {

        const id = path.split("/")[2];
        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {

            const data = JSON.parse(body);

            const student = students.find(s => s.id === id);

            if (!student) {
                return sendResponse(res, 404, { success: false, message: "Student not found" });
            }

            student.name = data.name || student.name;
            student.email = data.email || student.email;
            student.course = data.course || student.course;
            student.year = data.year || student.year;

            sendResponse(res, 200, { success: true, data: student });

        });
    }

    // DELETE /students/:id
    else if (method === "DELETE" && path.startsWith("/students/")) {

        const id = path.split("/")[2];

        const index = students.findIndex(s => s.id === id);

        if (index === -1) {
            return sendResponse(res, 404, { success: false, message: "Student not found" });
        }

        students.splice(index, 1);

        sendResponse(res, 200, { success: true, message: "Student deleted" });
    }

    else {
        sendResponse(res, 404, { success: false, message: "Route not found" });
    }

});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});