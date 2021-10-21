const path = require('path');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

module.exports = {
    mode: process.env.NODE_ENV || "development",
    entry: {
        popup: "./extension/popup.js"
    },
    output: {
        path: path.resolve(__dirname, "dist/")
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
            }
        ]
    },
    plugins: [
        new WasmPackPlugin({
            crateDirectory: path.resolve(__dirname, "."),
            outDir: path.resolve(__dirname, "extension", "pkg")
        }),
        // Have this example work in Edge which doesn't ship `TextEncoder` or
        // `TextDecoder` at this time.
        // new webpack.ProvidePlugin({
        //     TextDecoder: ['text-encoding', 'TextDecoder'],
        //     TextEncoder: ['text-encoding', 'TextEncoder']
        // }),
        new CopyWebpackPlugin({
            patterns: [
                {from: "static", to: "."}
            ]
        })
    ],
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".wasm", ".css"]
    },
    experiments: {
        asyncWebAssembly: true
    }
};
