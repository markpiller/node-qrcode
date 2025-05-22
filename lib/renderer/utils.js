function hex2rgba (hex) {
  if (typeof hex === 'number') {
    hex = hex.toString()
  }

  if (typeof hex !== 'string') {
    throw new Error('Color should be defined as hex string')
  }

  let hexCode = hex.slice().replace('#', '').split('')
  if (hexCode.length < 3 || hexCode.length === 5 || hexCode.length > 8) {
    throw new Error('Invalid hex color: ' + hex)
  }

  // Convert from short to long form (fff -> ffffff)
  if (hexCode.length === 3 || hexCode.length === 4) {
    hexCode = Array.prototype.concat.apply([], hexCode.map(function (c) {
      return [c, c]
    }))
  }

  // Add default alpha value
  if (hexCode.length === 6) hexCode.push('F', 'F')

  const hexValue = parseInt(hexCode.join(''), 16)

  return {
    r: (hexValue >> 24) & 255,
    g: (hexValue >> 16) & 255,
    b: (hexValue >> 8) & 255,
    a: hexValue & 255,
    hex: '#' + hexCode.slice(0, 6).join('')
  }
}

exports.getOptions = function getOptions (options) {
  if (!options) options = {}
  if (!options.color) options.color = {}

  const margin = typeof options.margin === 'undefined' ||
    options.margin === null ||
    options.margin < 0
    ? 4
    : options.margin

  const width = options.width && options.width >= 21 ? options.width : undefined
  const scale = options.scale || 4
  const shape = options.shape === 'circle' ? 'circle' : 'square'

  return {
    width: width,
    scale: width ? 4 : scale,
    margin: margin,
    color: {
      dark: hex2rgba(options.color.dark || '#000000ff'),
      light: hex2rgba(options.color.light || '#ffffffff')
    },
    type: options.type,
    rendererOpts: options.rendererOpts || {},
    shape: shape
  }
}

exports.getScale = function getScale (qrSize, opts) {
  return opts.width && opts.width >= qrSize + opts.margin * 2
    ? opts.width / (qrSize + opts.margin * 2)
    : opts.scale
}

exports.getImageWidth = function getImageWidth (qrSize, opts) {
  const scale = exports.getScale(qrSize, opts)
  return Math.floor((qrSize + opts.margin * 2) * scale)
}

exports.qrToImageData = function qrToImageData (imgData, qr, opts) {
  const size = qr.modules.size
  const data = qr.modules.data
  const scale = exports.getScale(size, opts)
  const symbolSize = Math.floor((size + opts.margin * 2) * scale)
  const palette = [opts.color.light, opts.color.dark]
  const modulesCount = size + opts.margin * 2
  const radius = modulesCount / 2
  const center = radius - 0.5

  for (let i = 0; i < symbolSize; i++) {
    const rowMod = Math.floor(i / scale)
    for (let j = 0; j < symbolSize; j++) {
      const posDst = (i * symbolSize + j) * 4
      const colMod = Math.floor(j / scale)
      let pxColor = opts.color.light

      const dist = Math.sqrt(Math.pow(colMod - center, 2) + Math.pow(rowMod - center, 2))
      if (opts.shape !== 'circle' || dist <= radius) {
        const iSrc = rowMod - opts.margin
        const jSrc = colMod - opts.margin
        if (iSrc >= 0 && jSrc >= 0 && iSrc < size && jSrc < size) {
          pxColor = palette[data[iSrc * size + jSrc] ? 1 : 0]
        } else if (opts.shape === 'circle') {
          pxColor = opts.color.dark
        }
      }

      imgData[posDst] = pxColor.r
      imgData[posDst + 1] = pxColor.g
      imgData[posDst + 2] = pxColor.b
      imgData[posDst + 3] = pxColor.a
    }
  }
}
