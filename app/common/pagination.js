exports.getPagination = (page, size) => {
    const limit = size ? +size : 25;
    const offset = page ? (page - 1) * limit : 0;

    return { limit, offset };
}

exports.getPagingData = (data, page, limit) => {
    const { count: countAll, rows: pagingItems } = data;
    const currentPage = page ? +page : 1;
    const countPages = Math.ceil(countAll / limit);

    return { countAll, pagingItems, countPages, currentPage };
}