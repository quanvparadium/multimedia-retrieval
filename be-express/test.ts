// import { promises as fs } from "node:fs";
async function main() {
    const { pdf } = await import('pdf-to-img');
    let counter = 1;
    const document = await pdf("z.pdf", { scale: 3 });
    console.log('oke');
    // for await (const image of document) {
    //     await fs.writeFile(`a/page${counter}.png`, image);
    //     counter++;
    // }
}
main();