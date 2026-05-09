/*import serverless from "serverless-http";
import { app, initializeDatabase } from "../app.js";

let dbInitialized = false;
const handler = serverless(app);

const ensureDatabase = async () => {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
};

export default async function (req, res) {
  await ensureDatabase();
  return handler(req, res);
}*/

import serverless from "serverless-http";
import { app, initializeDatabase } from "../app.js";

let initialized = false;

const ensureDatabase = async () => {
  if (!initialized) {
    await initializeDatabase();
    initialized = true;
  }
};

const handler = serverless(app);

export default async function (req, res) {
  await ensureDatabase();
  return handler(req, res);
}