import {
  defineConfig,
  minimal2023Preset,
  createAppleSplashScreens,
} from "@vite-pwa/assets-generator/config";

/**
 * @doc Automatic PWA asset pipeline (@vite-pwa/assets-generator).
 * One source logo -> every icon (favicon, maskable, apple-touch) and the full
 * set of iOS splash screens. Regenerate with: `bunx pwa-assets-generator`.
 * No hand-made icon files, no hand-written <link> tags.
 */
export default defineConfig({
  headLinkOptions: { preset: "2023" },
  preset: {
    ...minimal2023Preset,
    appleSplashScreens: createAppleSplashScreens(
      {
        padding: 0.3,
        resizeOptions: { background: "#0a0a0a", fit: "contain" },
        darkResizeOptions: { background: "#0a0a0a", fit: "contain" },
        linkMediaOptions: { log: true, addMediaScreen: true, xhtml: false },
        name: (landscape, size, dark) =>
          `apple-splash-${landscape ? "landscape" : "portrait"}-${
            typeof dark === "boolean" ? (dark ? "dark-" : "light-") : ""
          }${size.width}x${size.height}.png`,
      },
      [
        'iPad Air 9.7"',
        'iPad Pro 11"',
        "iPhone 16 Pro Max",
        "iPhone 16 Pro",
        "iPhone 14 Pro Max",
        "iPhone 14 Pro",
        'iPhone SE 4.7"',
      ],


    ),
  },
  images: ["public/megsy-logo.png"],
});
