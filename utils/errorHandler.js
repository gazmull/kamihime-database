module.exports = (res, err) => {
  if(!isNaN(err.code)) {
    if(!err.message) return res.status(err.code);
    res
      .status(err.code)
      .json({ error: err });
  }
  else {
    if(!err.message) return res.status(500);
    res
      .status(500)
      .json({ error: { message: err.message } });
  }
};