function pagination(page, limit, total) {
	const result = {};
	result.total = total;
	result.totalPages = Math.ceil(total / limit);
	result.next = +page === result.totalPages || !result.totalPages ? null : Number(page) + 1;
	result.hasNext = !!result.next;
	result.prev = +page === 1 ? null : Number(page) - 1;
	result.hasPrev = !!result.prev;
	result.perPage = +limit;
	result.current = +page;
	return result;
}


module.exports = {
	pagination,
};