import serverless from "serverless-http";
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
}
