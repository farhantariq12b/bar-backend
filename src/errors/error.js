/* global errorResponse:readonly */
// Handle any errors that come up

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, _next) => {
	const errCode = err.status ?? 500;
	const errMessage = err.message || 'internal server error';
	res.status(errCode).send(errorResponse(errMessage, errCode));
};

// Handle case where user requests nonexistent endpoint
exports.nullRoute = (req, res) => {
	res.status(404).send(errorResponse('Route not found', 404));
};

// Create an error for the api error handler
exports.newHttpError = (status, message) => {
	// Eliminates problem where a null message would get passed in and the final
	// error message would become 'null' (stringified null)

	const err = new Error(message || 'Internal Server Error');

	err.status = status;
	return err;
};
