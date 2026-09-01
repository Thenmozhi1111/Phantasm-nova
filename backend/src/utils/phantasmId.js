import { customAlphabet } from "nanoid";

const alphabet = "0123456789"; // no ambiguous chars (0/O, 1/I)
const generate = customAlphabet(alphabet, 3);

/** e.g. PHH27-7K4QRT */
export function generatePhantasmId() {
  return `PH27-GCE${generate()}`;
}
