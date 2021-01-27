import path from "path";
import process from "process";
import resolve from "@rollup/plugin-node-resolve";
import html from "@rollup/plugin-html";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import license from "rollup-plugin-license";
import sizes from "rollup-plugin-sizes";
import serve from "rollup-plugin-serve";

const __dirname = path.resolve();
const env = process.env["ENV"];

const extensions = [".ts", ".js"];

const plugins = {
  dev: [
    html({
      title: "Performance Observer Polyfill"
    }),
    env === "dev" ? serve("dist") : null
  ],
  prod: [
    terser({
      output: {
        comments: false
      }
    }),
    license({
      banner: {
        content: {
          file: "LICENSE"
        }
      }
    }),
    sizes()
  ]
};

export default [
  {
    input: "./src/index.ts",
    plugins: [
      resolve({ extensions }),
      typescript({
        target: "es5",
        declaration: false
      }),
      ...plugins[env]
    ],
    output: {
      dir: path.resolve(__dirname, "dist"),
      format: "umd",
      name: "FASTLY"
    }
  },
  {
    input: "./src/index.ts",
    plugins: [
      resolve({ extensions }),
      typescript({
        declaration: true,
        declarationDir: path.resolve(__dirname, "dist", "esm", "types")
      }),
      ...plugins[env]
    ],
    output: {
      dir: path.resolve(__dirname, "dist", "esm"),
      format: "es"
    }
  }
];
