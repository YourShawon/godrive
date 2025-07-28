import App from "./app.js";
import { config } from "@config/index.js";

const app = new App(config.port);

app.listen();
