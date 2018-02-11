module.exports = (res, err) => {
  if(!isNaN(err.code))
    res
      .status(err.code)
      .json({ error: err });
  else
    res
      .status(500)
      .json({ error: { message: err.message } });
};