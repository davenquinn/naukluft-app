removeLines = (f, niter=1)->
  for i in [0...niter]
    console.log i
    f = f.substring(f.indexOf("\n") + 1)
  return f

export {removeLines}
