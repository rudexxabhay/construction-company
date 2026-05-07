const TrustedItem = require("../models/TrustedItem");

const getTrustedItems = async (req, res, next) => {
  try {
    const items = await TrustedItem.find().sort({ order: 1, createdAt: 1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

const createTrustedItem = async (req, res, next) => {
  try {
    const item = await TrustedItem.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

const updateTrustedItem = async (req, res, next) => {
  try {
    const item = await TrustedItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: "Trusted item not found" });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

const deleteTrustedItem = async (req, res, next) => {
  try {
    const item = await TrustedItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Trusted item not found" });
    res.json({ message: "Trusted item deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTrustedItems, createTrustedItem, updateTrustedItem, deleteTrustedItem };
