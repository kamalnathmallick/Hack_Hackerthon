function sendSuccess(res, data, message = "OK") {
  return res.json({ success: true, message, data });
}

function sendError(res, status, message) {
  return res.status(status).json({ success: false, message });
}

module.exports = {
  sendSuccess,
  sendError
};
