const ItemMaster = require("../models/ItemMaster");

const toNumber = (value) => {
  if (typeof value === "string") return Number(value.replace(/,/g, "").trim());
  return Number(value);
};

const money = (value) => {
  const number = toNumber(value);
  return Number.isFinite(number) ? Math.max(number, 0) : 0;
};

const getGST = (value) => {
  if (value === 0 || value === "0") return 0;
  if (value === "" || value === null || value === undefined) return 18;
  const number = Number(value);
  if (Number.isNaN(number) || number < 0 || number > 100) return 18;
  return number;
};

const normalizeItem = (body) => ({
  name: body.name,
  category: body.category || "",
  unit: body.unit || "Nos",
  rate: money(body.rate ?? body.price),
  price: money(body.rate ?? body.price),
  gstPercent: getGST(body.gstPercent)
});

const parseUploadRows = (body) => {
  if (Array.isArray(body?.items)) return body.items;
  if (!body?.text) return [];
  const lines = String(body.text).split(/\r?\n/).filter(Boolean);
  const delimiter = lines[0]?.includes("\t") ? "\t" : ",";
  const headers = lines.shift()?.split(delimiter).map((value) => value.trim()) || [];
  return lines.map((line) => {
    const values = line.split(delimiter).map((value) => value.trim());
    return headers.reduce((row, header, index) => ({ ...row, [header]: values[index] || "" }), {});
  });
};

const getItems = async (req, res, next) => {
  try {
    const items = await ItemMaster.find().sort({ name: 1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

const createItem = async (req, res, next) => {
  try {
    const item = await ItemMaster.create(normalizeItem(req.body));
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const item = await ItemMaster.findByIdAndUpdate(req.params.id, normalizeItem(req.body), { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const item = await ItemMaster.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch (error) {
    next(error);
  }
};

const uploadItems = async (req, res, next) => {
  try {
    const rows = parseUploadRows(req.body).filter((row) => row.name);
    const items = await ItemMaster.insertMany(rows.map(normalizeItem), { ordered: false });
    res.status(201).json({ count: items.length, items });
  } catch (error) {
    next(error);
  }
};

module.exports = { getItems, createItem, updateItem, deleteItem, uploadItems };
