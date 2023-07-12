exports.successResponse = (data = null) => ({ success: true, code: 200, data });

/**
 * @param {string | Record<string | number, any>} error
 * @param {?number} errorCode
 * @param {?any} data
 * @param {?string} dataObjName
 * */
exports.errorResponse = (
  error,
  errorCode = 500,
  data = null,
  dataObjName = 'data'
) => ({
  success: false,
  code: errorCode,
  error,
  [dataObjName]: data,
});
