module.exports = {
  devServer: { disableHostCheck: true },
  publicPath: './',
  lintOnSave:false,
  assetsDir: 'static',
  productionSourceMap: false,
  devServer: {
      proxy: {
          '/api':{
              target:'http://127.0.0.1:8090',
              changeOrigin:true,

          }
      }
  }
}