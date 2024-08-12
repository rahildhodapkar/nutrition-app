import express from "express";
const router = express.Router();

router.get("/usda", async (req, res) => {
  const { query } = req.query;

  if (typeof query !== "string") {
    return res.status(400).send({ message: "Query must be string" });
  }

  if (!query) {
    return res.status(400).send({ message: "Query is required" });
  }

  const USDA_KEY = process.env.USDA_KEY;

  if (!USDA_KEY) {
    return res.status(500).send({ message: "Server configuration error" });
  }

  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_KEY}&query=${encodeURIComponent(
    query
  )}`;

  try {
    const response = await fetch(url);

    const result = await response.json();

    if (response.ok) {
      res.status(200).send(result);
    } else {
      console.error(`API Error: ${result.message}`);
      res.status(400).send({ message: "Failed to fetch foods" });
    }
  } catch (err) {
    console.error(`Fetch error: ${err}`);
    res.status(500).send({ message: "Internal server error" });
  }
});

export default router;
