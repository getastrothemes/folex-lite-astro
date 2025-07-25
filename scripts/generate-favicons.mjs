import fs from "fs";
import path from "path";
import toml from "toml";
import {
  getNodeImageAdapter,
  loadAndConvertToSvg,
} from "@realfavicongenerator/image-adapter-node";
import faviconGenerator from "@realfavicongenerator/generate-favicon";

// Constants
const CONFIG_FILE_PATH = "./src/config/config.toml";
const FAVICON_DIR = "./public/images/favicons/";
const DEFAULT_TITLE = "Website";
const DEFAULT_FAVICON_IMAGE = "/images/default-favicon.png"; // Fallback image

// Helper: Parse TOML Configuration
function parseTomlToJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    if (!content) throw new Error(`File not found: ${filePath}`);

    const tomlContent = toml.parse(content);

    // Remove empty keys recursively
    const removeEmptyKeys = (obj) => {
      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        if (
          value === "" ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === "object" &&
            value !== null &&
            Object.keys(value).length === 0)
        ) {
          delete obj[key];
        } else if (typeof value === "object" && value !== null) {
          removeEmptyKeys(value);
          if (Object.keys(value).length === 0) delete obj[key];
        }
      });
      return obj;
    };

    return removeEmptyKeys(JSON.parse(JSON.stringify(tomlContent, null, 2)));
  } catch (error) {
    console.error(`Error parsing TOML file: ${filePath}`, error);
    throw error;
  }
}

// Helper: Create Directory if Not Exists
function ensureDirectoryExists(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
    console.log(`Created directory: ${directoryPath}`);
  }
}

// Main: Generate Favicons
async function generateFavicons() {
  try {
    // Parse configuration
    const config = parseTomlToJson(CONFIG_FILE_PATH);
    const title = config?.site?.title || DEFAULT_TITLE;
    const faviconImage = config?.site?.favicon?.image || DEFAULT_FAVICON_IMAGE;

    const faviconImagePath = faviconImage.startsWith("/")
      ? path.join("./src/assets", faviconImage)
      : path.join("./src/assets/", faviconImage);

    // Ensure favicon directory exists
    ensureDirectoryExists(FAVICON_DIR);

    // Load and convert the master icon
    const imageAdapter = await getNodeImageAdapter();
    const masterIcon = {
      icon: await loadAndConvertToSvg(faviconImagePath),
    };

    const faviconSettings = {
      icon: {
        desktop: {
          regularIconTransformation: {
            type: faviconGenerator.IconTransformationType.None,
          },
          darkIconType: "regular",
          darkIconTransformation: {
            type: faviconGenerator.IconTransformationType.None,
          },
        },
        touch: {
          transformation: {
            type: faviconGenerator.IconTransformationType.Background,
            backgroundColor: "#ffffff",
            backgroundRadius: 0,
            imageScale: 0.7,
          },
          appTitle: title,
        },
        webAppManifest: {
          transformation: {
            type: faviconGenerator.IconTransformationType.Background,
            backgroundColor: "#ffffff",
            backgroundRadius: 0,
            imageScale: 0.8,
          },
          backgroundColor: "#ffffff",
          themeColor: "#ffffff",
          name: title,
          shortName: title,
        },
      },
      path: "/images/favicons/",
    };

    // Generate favicon files
    const files = await faviconGenerator.generateFaviconFiles(
      masterIcon,
      faviconSettings,
      imageAdapter,
    );

    // Save files to the favicon directory
    Object.entries(files).forEach(([fileName, fileContents]) => {
      const filePath = path.join(FAVICON_DIR, fileName);
      fs.writeFileSync(filePath, fileContents);
      console.log(`Saved: ${filePath}`);
    });

    console.log("Favicons generated successfully.");
  } catch (error) {
    console.error("Error generating favicons:", error);
  }
}

// Run
generateFavicons();
