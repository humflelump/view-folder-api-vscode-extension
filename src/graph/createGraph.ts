import {
  getAllFilesInFolder,
  getAllFoldersInFolder,
} from "../file-helpers/getAllFilesInFolder";
import { readFileContents } from "../file-helpers/readFileContents";
import {
  transformExportPaths,
  transformImportPaths,
} from "../file-helpers/transformImportPaths";
import { parseExports } from "../parser/parseExports";
import { parseImports } from "../parser/parseImports";
import { ExportNode, ImportNode } from "../types";
import { ExportGraph } from "./Graph";

export function createGraph(innerDirectory: string, outerDirectory: string) {
  const allFolders = getAllFoldersInFolder(outerDirectory);
  const allFoldersSet = new Set(allFolders);
  const innerFiles = getAllFilesInFolder(innerDirectory);
  const outerFiles = getAllFilesInFolder(outerDirectory);

  const exps: ExportNode[] = [];
  innerFiles.forEach((file) => {
    const code = readFileContents(file);
    try {
      const parsed = parseExports(code, file);
      exps.push(...parsed.map((n) => transformExportPaths(n, allFoldersSet)));
    } catch (e) {
      console.log(`Failed parsing imports for ${file}: ${e}`);
    }
  });

  const imps: ImportNode[] = [];
  outerFiles.forEach((file) => {
    const code = readFileContents(file);
    try {
      const parsed = parseImports(code, file);
      imps.push(...parsed.map((n) => transformImportPaths(n, allFoldersSet)));
    } catch (e) {
      console.log(`Failed parsing exports for ${file}: ${e}`);
    }
  });

  const graph = new ExportGraph([...exps, ...imps]);
  return graph;
}
