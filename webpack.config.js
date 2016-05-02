module.exports = {
  output: {
    filename: 'main.js'
  },
  module: {
    loaders: [
      {
        test: /\.nunjucks$/,
        loader: 'nunjucks-loader'
      }
    ]
  },
};
