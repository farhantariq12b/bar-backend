exports.status = (req, res) => {
  res.status(200).json({ status: 'UP' });
};
