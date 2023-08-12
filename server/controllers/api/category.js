const categories = require('../../models/categories');

exports.createCategory = async (req, res) => {
  await categories.createCategory(req, res).then(result => {
    return res.send({ result });
  });
};

exports.getCategoryBySlug = async (req, res) => {
  const data = {
    slug: req.params.slug,
  };

  await categories.findBySlug(data, req).then(result => {
    return res.send({ result });
  });
};
