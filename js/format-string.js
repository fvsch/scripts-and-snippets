/**
 * Small function to replace one or several placeholders in a string
 * formatted = format (string, data, debug)
 * 
 * string: String
 *     Template with placeholders looking like "{x}", where x can be
 *     1-2 digits or an identifier made of lowercase latin characters, - and _.
 * data: Array or Object
 *     Array of replacement strings, or object with properties
 *     matching the identifiers in the template.
 * debug: String
 *     String to use when a placeholder's identifier didn't match
 *     actual data. Defaults to "".
 * returns: String
 *     Template string modified with replacements.
 *
 * Example usage:
 *     format('Some {0}', ['string'])
 *     format('Some string {0} {1}', ['with', 'replacements'])
 *     format('Some string {x} {y}', {x:'with', y:'replacements'})
 * BAD USAGE:
 *     format('Some {0}', 'string') // -> 'Some s'
 *     format('Some {1}', ['string']) // -> 'Some '
 *     format('{1} {2} {3}', ['One', 'Two', 'Three'], 'FIXME') // -> 'Two Three FIXME'
 */

function format (string, data, debug) {
  var debug = debug || ''
  var pattern = /\{([a-z_-]+|\d{1,2})\}/g
  return string.replace(pattern, function(match, p1) {
    return data[p1] === undefined ? debug : data[p1]
  })
}
