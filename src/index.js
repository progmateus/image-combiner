import { createServer } from "http"
import { parse, fileURLToPath } from "url"
import { threadId, Worker } from "worker_threads"
import { dirname } from "path"
import sharp from "sharp"

const currentFolder = dirname(fileURLToPath(import.meta.url))
const workerFileName = "worker.js"
async function joinImages(images) {

    return new Promise((resolve, reject) => {
        const worker = new Worker(`${currentFolder}/${workerFileName}`);
        worker.postMessage(images)
        worker.once("message", resolve)
        worker.once("error", reject)
        worker.once("exit", code => {
            if (!code !== 0) {
                return reject(new Error(`Thread ${worker.threadId} stopped with exit code ${code}`))
            }
            console.log(`The thread ${threadId} exited`)
        })

    })
}

async function handler(request, response) {
    if (request.url.includes("joinImages")) {
        const { query: { background, img, logo } } = parse(request.url, true)
        const imageBase64 = await joinImages({
            image: img,
            background,
            logo
        })

        response.writeHead(200, {
            "content-Type": "text/html"
        })
        response.end(`<img style="width:100%;height:100%" src=data:image/jpeg;base64,${imageBase64} />`)
        return
    }

    return response.end("ok")
}

createServer(handler)
    .listen(3000, () => console.log("server is running"))