import { app, initializeDatabase } from "./app.js";

const PORT = process.env.PORT || 5000;
await initializeDatabase();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
