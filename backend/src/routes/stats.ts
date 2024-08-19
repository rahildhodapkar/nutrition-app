import express from "express";
import { addWeight, getWeights } from "../models/weight";
import { getMacros, upsertMacros } from "../models/macros";

const router = express.Router();

router.get("/stats/getMacros", async (req, res) => {
  const { username } = req.query;

  if (typeof username !== "string" || !username) {
    return res.status(400).send({ message: "Invalid username" });
  }

  try {
    const macros = await getMacros(username);
    if (macros) {
      res.status(200).json(macros);
    } else {
      res.status(404).json({ message: "No entry found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err });
  }
});

router.post("/stats/upsertMacros", async (req, res) => {
  const { macros, username } = req.body;

  if (!username) {
    return res.status(400).send({ message: "Invalid username" });
  }

  if (!macros) {
    return res.status(400).send({ message: "Invalid macros" });
  }

  try {
    const result = await upsertMacros(
      username,
      macros.calories,
      macros.protein,
      macros.fat,
      macros.carbs
    );
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: err });
    }
  }
});

router.get("/stats/getWeights", async (req, res) => {
  const { username } = req.query;

  if (typeof username !== "string" || !username) {
    return res.status(400).send({ message: "Invalid username" });
  }

  try {
    const result = await getWeights(username);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: err });
    }
  }
});

router.post("/stats/addWeight", async (req, res) => {
  const { username, weight } = req.body;

  if (typeof username !== "string" || !username) {
    return res.status(400).send({ message: "Invalid username" });
  }

  if (typeof weight !== "number" || !weight) {
    return res.status(400).send({ message: "Invalid weight" });
  }

  try {
    const result = await addWeight(username, weight);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: err });
    }
  }
});

export default router;
