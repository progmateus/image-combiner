import { parentPort, threadId } from "worker_threads";
import sharp from "sharp"
import axios from "axios"


async function downloadfile(url) {
    const response = await axios.get(url, {
        responseType: "arraybuffer"
    })
    return response.data
}

async function onMessage({ image, background, logo }) {
    const firstLayer = await sharp(await downloadfile(image)).toBuffer()

    const logoLayer = await sharp(await downloadfile(logo)).toBuffer()

    const secondLayer = await sharp(await downloadfile(background))
        .composite([
            { input: firstLayer, gravity: sharp.gravity.south, left: 900, top: 600 },
            { input: logoLayer, gravity: sharp.gravity.north, }
        ])
        .toBuffer()

    parentPort.postMessage(secondLayer.toString("base64"))
}

parentPort.on("message", onMessage)