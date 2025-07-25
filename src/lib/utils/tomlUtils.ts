import fs from "fs";
import * as toml from "toml";

let cachedParsedToml: any = null;

function removeEmptyKeys(obj: any) {
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value === "") {
      delete obj[key];
    } else if (typeof value === "object" && value !== null) {
      removeEmptyKeys(value);
      if (Object.keys(value).length === 0) {
        delete obj[key];
      }
    }
  });
  return obj;
}

// Parse TOML function with cache
export function parseTomlToJson(): any {
  if (cachedParsedToml) return cachedParsedToml;

  try {
    // Read and parse the TOML file
    const content = fs.readFileSync("src/config/config.toml", "utf8");

    if (!content) {
      throw new Error(`File not found: src/config/config.toml`);
    }

    // Parse TOML to JSON
    const tomlContent = toml.parse(content);

    let parsedToml = JSON.stringify(tomlContent, null, 2);
    parsedToml = JSON.parse(parsedToml);

    parsedToml = removeEmptyKeys(parsedToml);

    cachedParsedToml = parsedToml;
    return parsedToml;
  } catch (error) {
    console.error(`Error parsing TOML file: ${error}`);
    throw error;
  }
}

// Trigger reload for when changing .toml files
export function reloadOnTomlChange() {
  return {
    name: "reload-on-toml-change",
    handleHotUpdate({ file, server }: any) {
      if (file.endsWith(".toml")) {
        console.log("TOML file changed, triggering reload...");
        server.ws.send({ type: "full-reload" });
      }
    },
  };
}
