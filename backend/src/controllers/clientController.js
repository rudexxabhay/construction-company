const Client = require("../models/Client");

const getClients = async (req, res, next) => {
  try {
    res.json(await Client.find().sort({ name: 1 }));
  } catch (error) {
    next(error);
  }
};

const createClient = async (req, res, next) => {
  try {
    res.status(201).json(await Client.create(req.body));
  } catch (error) {
    next(error);
  }
};

const updateClient = async (req, res, next) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.json(client);
  } catch (error) {
    next(error);
  }
};

const deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.json({ message: "Client deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getClients, createClient, updateClient, deleteClient };
