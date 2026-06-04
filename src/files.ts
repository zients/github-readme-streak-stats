import { mkdir, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export async function writeFileAtomically(filePath: string, content: string): Promise<void> {
  const directory = path.dirname(filePath);
  await mkdir(directory, { recursive: true });
  const tempPath = path.join(directory, `.${path.basename(filePath)}.${process.pid}.tmp`);
  await writeFile(tempPath, content, "utf8");
  try {
    await rename(tempPath, filePath);
  } catch (error) {
    await unlink(tempPath).catch(() => undefined);
    throw error;
  }
}
