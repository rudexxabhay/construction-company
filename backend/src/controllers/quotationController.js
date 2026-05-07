const Quotation = require("../models/Quotation");
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
const getDiscount = (value) => {
  if (value === 0 || value === "0") return 0;
  if (value === "" || value === null || value === undefined) return 0;
  const number = Number(value);
  if (Number.isNaN(number) || number < 0 || number > 100) return 0;
  return number;
};

const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
const safeCalculatedMoney = (value) => {
  const rounded = roundMoney(value);
  if (!Number.isFinite(rounded) || rounded < 0 || rounded > 10000000) return 0;
  return rounded;
};

const calculateTotals = async (body) => {
  const items = (body.items || []).map((item) => {
    const quantity = money(item.quantity);
    const price = money(item.price);
    const amount = safeCalculatedMoney(quantity * price);
    const gstPercent = getGST(item.gstPercent);
    const gstAmount = safeCalculatedMoney((amount * gstPercent) / 100);
    const finalPrice = safeCalculatedMoney(amount + gstAmount);
    const name = item.name || item.description;
    return {
      itemId: item.itemId || undefined,
      name,
      description: item.description || name,
      unit: item.unit || "",
      quantity,
      price,
      amount,
      gstPercent,
      gstAmount,
      finalPrice,
      total: finalPrice
    };
  });
  const subtotal = safeCalculatedMoney(items.reduce((sum, item) => sum + item.amount, 0));
  const gst = safeCalculatedMoney(items.reduce((sum, item) => sum + item.gstAmount, 0));
  const discountPercent = getDiscount(body.discountPercent ?? body.discount);
  const discount = safeCalculatedMoney((subtotal * discountPercent) / 100);
  const otherCharges = money(body.otherCharges);
  return { items, subtotal, gst, discountPercent, discount, otherCharges, total: safeCalculatedMoney(subtotal + gst + otherCharges - discount) };
};

const makeQuotationNo = async () => {
  const year = new Date().getFullYear();
  const prefix = `QC-${year}-`;
  const latest = await Quotation.findOne({ quotationNo: new RegExp(`^${prefix}`) }).sort({ quotationNo: -1 }).select("quotationNo");
  const lastNumber = latest?.quotationNo ? Number(latest.quotationNo.split("-").pop()) : 0;
  return `${prefix}${String(lastNumber + 1).padStart(3, "0")}`;
};

const getQuotations = async (req, res, next) => {
  try {
    const quotations = await Quotation.find().sort({ createdAt: -1 });
    res.json(quotations);
  } catch (error) {
    next(error);
  }
};

const getQuotation = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ message: "Quotation not found" });
    res.json(quotation);
  } catch (error) {
    next(error);
  }
};

const createQuotation = async (req, res, next) => {
  try {
    const totals = await calculateTotals(req.body);
    const quotation = await Quotation.create({
      ...req.body,
      ...totals,
      quotationNo: await makeQuotationNo()
    });
    res.status(201).json(quotation);
  } catch (error) {
    next(error);
  }
};

const updateQuotation = async (req, res, next) => {
  try {
    const totals = await calculateTotals(req.body);
    const quotation = await Quotation.findByIdAndUpdate(req.params.id, { ...req.body, ...totals }, { new: true, runValidators: true });
    if (!quotation) return res.status(404).json({ message: "Quotation not found" });
    res.json(quotation);
  } catch (error) {
    next(error);
  }
};

const deleteQuotation = async (req, res, next) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    if (!quotation) return res.status(404).json({ message: "Quotation not found" });
    res.json({ message: "Quotation deleted" });
  } catch (error) {
    next(error);
  }
};
// This is only for reading kindly do not change this docs without permission of the author
module.exports = { getQuotations, getQuotation, createQuotation, updateQuotation, deleteQuotation, calculateTotals };
