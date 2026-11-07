import { FileNode } from "../../types/types";

export function downloadAsZip(files: Array<{ path: string; content: string }>, projectName: string = 'project'): void {
  const encoder = new TextEncoder();

  function writeUint32(view: DataView, offset: number, value: number) {
    view.setUint32(offset, value, true);
  }
  function writeUint16(view: DataView, offset: number, value: number) {
    view.setUint16(offset, value, true);
  }

  const localHeaders: ArrayBuffer[] = [];
  const centralEntries: ArrayBuffer[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.path);
    const contentBytes = encoder.encode(file.content);

    const localSize = 30 + nameBytes.byteLength + contentBytes.byteLength;
    const localBuf = new ArrayBuffer(localSize);
    const localView = new DataView(localBuf);
    
    writeUint32(localView, 0, 0x04034b50);
    writeUint16(localView, 4, 20);
    writeUint16(localView, 6, 0);
    writeUint16(localView, 8, 0);
    writeUint16(localView, 10, 0);
    writeUint16(localView, 12, 0);
    writeUint32(localView, 14, 0);
    writeUint32(localView, 18, contentBytes.byteLength);
    writeUint32(localView, 22, contentBytes.byteLength);
    writeUint16(localView, 26, nameBytes.byteLength);
    writeUint16(localView, 28, 0);

    new Uint8Array(localBuf, 30, nameBytes.byteLength).set(nameBytes);
    new Uint8Array(localBuf, 30 + nameBytes.byteLength, contentBytes.byteLength).set(contentBytes);

    localHeaders.push(localBuf);

    const centralSize = 46 + nameBytes.byteLength;
    const centralBuf = new ArrayBuffer(centralSize);
    const centralView = new DataView(centralBuf);
    writeUint32(centralView, 0, 0x02014b50);
    writeUint16(centralView, 4, 20);
    writeUint16(centralView, 6, 20);
    writeUint16(centralView, 8, 0);
    writeUint16(centralView, 10, 0);
    writeUint16(centralView, 12, 0);
    writeUint16(centralView, 14, 0);
    writeUint32(centralView, 16, 0);
    writeUint32(centralView, 20, contentBytes.byteLength);
    writeUint32(centralView, 24, contentBytes.byteLength);
    writeUint16(centralView, 28, nameBytes.byteLength);
    writeUint16(centralView, 30, 0);
    writeUint16(centralView, 32, 0);
    writeUint16(centralView, 34, 0);
    writeUint16(centralView, 36, 0);
    writeUint32(centralView, 38, 0);
    writeUint32(centralView, 42, offset);
    new Uint8Array(centralBuf, 46, nameBytes.byteLength).set(nameBytes);

    centralEntries.push(centralBuf);
    offset += localSize;
  }

  const centralOffset = offset;
  const centralSize = centralEntries.reduce((s, b) => s + b.byteLength, 0);
  const eocdSize = 22;
  const eocdBuf = new ArrayBuffer(eocdSize);
  const eocdView = new DataView(eocdBuf);
  writeUint32(eocdView, 0, 0x06054b50);
  writeUint16(eocdView, 4, 0);
  writeUint16(eocdView, 6, 0);
  writeUint16(eocdView, 8, files.length);
  writeUint16(eocdView, 10, files.length);
  writeUint32(eocdView, 12, centralSize);
  writeUint32(eocdView, 16, centralOffset);
  writeUint16(eocdView, 20, 0);

  const totalSize = localHeaders.reduce((s, b) => s + b.byteLength, 0) +
    centralEntries.reduce((s, b) => s + b.byteLength, 0) + eocdSize;
  const finalBuf = new ArrayBuffer(totalSize);
  const finalArr = new Uint8Array(finalBuf);
  let pos = 0;

  for (const buf of localHeaders) {
    finalArr.set(new Uint8Array(buf), pos);
    pos += buf.byteLength;
  }
  for (const buf of centralEntries) {
    finalArr.set(new Uint8Array(buf), pos);
    pos += buf.byteLength;
  }
  finalArr.set(new Uint8Array(eocdBuf), pos);

  const blob = new Blob([finalBuf], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function flattenTree(nodes: FileNode[]): Array<{ path: string; content: string }> {
  const result: Array<{ path: string; content: string }> = [];

  function walk(list: FileNode[], prefix: string) {
    for (const node of list) {
      const fullPath = prefix ? `${prefix}/${node.name}` : node.name;
      if (node.type === 'file') {
        result.push({ path: fullPath, content: node.content });
      }
      if (node.children) {
        walk(node.children, fullPath);
      }
    }
  }

  walk(nodes, '');
  return result;
}