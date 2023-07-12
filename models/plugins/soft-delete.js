/**
 * @param {mongoose.Schema} schema
 */
const softDeletePlugin = (schema) => {
	schema.add({
		isDeleted: {
			type: Boolean,
			required: true,
			default: false,
		},
		deletedAt: {
			type: Date,
			default: new Date(),
		},
	});

	const typesFindQueryMiddleware = [
		'count',
		'find',
		'findOne',
		'findOneAndDelete',
		'findOneAndRemove',
		'findOneAndUpdate',
		'update',
		'updateOne',
		'updateMany',
	];

	const setDocumentIsDeleted = async (doc) => {
		doc.isDeleted = true;
		doc.deletedAt = new Date();
		doc.$isDeleted(true);
		await doc.save();
	};
	const excludeInFindQueriesIsDeleted = async function(doc, next){
		this.where({ isDeleted: false });
		next();
	};

	const excludeInDeletedInAggregateMiddleware = async function(doc, next) {
		this.pipeline().unshift({ $match: { isDeleted: false } });
		next();
	};

	schema.pre('remove', async function(doc, next){
		await setDocumentIsDeleted(this);
		next();
	});

	typesFindQueryMiddleware.forEach((type) => {
		schema.pre(type, excludeInFindQueriesIsDeleted);
	});

	schema.pre('aggregate', excludeInDeletedInAggregateMiddleware);
};

exports.softDeletePlugin = softDeletePlugin;