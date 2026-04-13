import { defineConfig } from "tsdown";
import { copyFileSync, mkdirSync, existsSync } from "fs";

export default defineConfig({
  platform: "neutral",
  dts: true,
  async onSuccess() {
    if (!existsSync("dist")) mkdirSync("dist");
    copyFileSync("src/themes/formkite.css", "dist/formkite.css");
  },
});
