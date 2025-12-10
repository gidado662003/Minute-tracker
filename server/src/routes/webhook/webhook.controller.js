function handleWebhook(req, res) {
  res.status(200).json({ message: "Webhook received", data: req.body });
}

module.exports = { handleWebhook };
