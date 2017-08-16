app.directive('loadingDialog', function(){
  return {
    template: '<div class="processingDialog" style="width: 100%; height: 100%; margin: 0em; ' +
    'left: 0em; top: 0em; opacity: 0.2; background: black; position: fixed;">Processing... Please wait...</div>'
  }
})
